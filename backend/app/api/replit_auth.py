from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import httpx
import os
import secrets
import logging
from datetime import datetime
from typing import Optional
from app.core.database import get_db_session
from app.models.models import OAuthUser
from app.services.email_service import email_service

try:
    import jwt
except ImportError:
    jwt = None

router = APIRouter()
logger = logging.getLogger(__name__)

REPL_ID = os.environ.get("REPL_ID", "")
ISSUER_URL = os.environ.get("ISSUER_URL", "https://replit.com/oidc")


class UserResponse(BaseModel):
    id: str
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_authenticated: bool = True


def generate_code_verifier():
    return secrets.token_urlsafe(64)


def generate_code_challenge(verifier: str):
    import hashlib
    import base64
    digest = hashlib.sha256(verifier.encode()).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b'=').decode()


@router.get("/login")
async def login(request: Request):
    """Start the OAuth login flow."""
    if not REPL_ID:
        raise HTTPException(status_code=500, detail="REPL_ID not configured")
    
    code_verifier = generate_code_verifier()
    code_challenge = generate_code_challenge(code_verifier)
    state = secrets.token_urlsafe(32)
    
    base_url = str(request.base_url).rstrip('/')
    redirect_uri = f"{base_url}/api/auth/callback"
    
    response = RedirectResponse(
        url=f"{ISSUER_URL}/auth?"
        f"client_id={REPL_ID}&"
        f"response_type=code&"
        f"redirect_uri={redirect_uri}&"
        f"scope=openid profile email offline_access&"
        f"code_challenge={code_challenge}&"
        f"code_challenge_method=S256&"
        f"state={state}&"
        f"prompt=login consent"
    )
    
    response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=600
    )
    response.set_cookie(
        key="code_verifier",
        value=code_verifier,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=600
    )
    
    return response


@router.get("/callback")
async def callback(request: Request, background_tasks: BackgroundTasks, code: str = None, state: str = None, error: str = None):
    """Handle the OAuth callback."""
    if error:
        logger.error(f"OAuth error: {error}")
        return RedirectResponse(url="/?auth_error=true")
    
    stored_state = request.cookies.get("oauth_state")
    code_verifier = request.cookies.get("code_verifier")
    
    if not stored_state or stored_state != state:
        logger.error("State mismatch in OAuth callback")
        return RedirectResponse(url="/?auth_error=true")
    
    base_url = str(request.base_url).rstrip('/')
    redirect_uri = f"{base_url}/api/auth/callback"
    
    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                f"{ISSUER_URL}/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": REPL_ID,
                    "code_verifier": code_verifier,
                }
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.text}")
                return RedirectResponse(url="/?auth_error=true")
            
            tokens = token_response.json()
            id_token = tokens.get("id_token")
            
            claims = jwt.decode(id_token, options={"verify_signature": False})
            
            user_id = claims.get("sub")
            email = claims.get("email")
            first_name = claims.get("first_name")
            last_name = claims.get("last_name")
            profile_image_url = claims.get("profile_image_url")
            
            with get_db_session() as db:
                user = db.query(OAuthUser).filter(OAuthUser.id == user_id).first()
                
                is_new_user = False
                if not user:
                    is_new_user = True
                    user = OAuthUser(
                        id=str(user_id) if user_id else "",
                        email=email or None,
                        first_name=first_name or None,
                        last_name=last_name or None,
                        profile_image_url=profile_image_url or None
                    )
                    db.add(user)
                else:
                    user.email = email or None
                    user.first_name = first_name or None
                    user.last_name = last_name or None
                    user.profile_image_url = profile_image_url or None
                
                db.commit()
            
            response = RedirectResponse(url="/")
            response.set_cookie(
                key="session_token",
                value=id_token,
                httponly=True,
                secure=True,
                samesite="lax",
                max_age=86400 * 7
            )
            response.delete_cookie("oauth_state")
            response.delete_cookie("code_verifier")
            
            if is_new_user and email:
                response.set_cookie(key="new_user", value="true", max_age=60)
                background_tasks.add_task(
                    email_service.send_welcome_email,
                    email,
                    first_name
                )
            
            return response
            
    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        return RedirectResponse(url="/?auth_error=true")


@router.get("/logout")
async def logout(request: Request):
    """Log out the user."""
    response = RedirectResponse(url="/")
    response.delete_cookie("session_token")
    
    end_session_url = f"{ISSUER_URL}/session/end?client_id={REPL_ID}"
    return RedirectResponse(url=end_session_url)


@router.get("/user", response_model=Optional[UserResponse])
async def get_current_user(request: Request):
    """Get the current authenticated user."""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        return None
    
    try:
        claims = jwt.decode(session_token, options={"verify_signature": False})
        
        exp = claims.get("exp", 0)
        if exp < datetime.utcnow().timestamp():
            return None
        
        return UserResponse(
            id=claims.get("sub"),
            email=claims.get("email"),
            first_name=claims.get("first_name"),
            last_name=claims.get("last_name"),
            profile_image_url=claims.get("profile_image_url")
        )
    except jwt.DecodeError:
        return None


def get_optional_user(request: Request) -> Optional[UserResponse]:
    """Dependency to get current user if logged in."""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        return None
    
    try:
        claims = jwt.decode(session_token, options={"verify_signature": False})
        
        exp = claims.get("exp", 0)
        if exp < datetime.utcnow().timestamp():
            return None
        
        return UserResponse(
            id=claims.get("sub"),
            email=claims.get("email"),
            first_name=claims.get("first_name"),
            last_name=claims.get("last_name"),
            profile_image_url=claims.get("profile_image_url")
        )
    except jwt.DecodeError:
        return None
