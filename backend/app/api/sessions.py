from fastapi import APIRouter, HTTPException, status, BackgroundTasks, Header, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db_session
from app.models.models import GenerationSession, ConversationHistory, User
from app.services.gemini_service import gemini_service
from app.services.local_business_service import local_business_service
from app.api.deps import decode_token
import asyncio
import logging
import secrets
from datetime import datetime
from typing import Optional

router = APIRouter()
logger = logging.getLogger(__name__)

PREMIUM_SECTIONS = ["financial_model", "pitch_deck"]


def normalize_financial_model(data: dict | None) -> dict | None:
    """Transform financial model keys from Gemini output to frontend expected format."""
    if not data:
        return data
    
    normalized = {}
    
    if "five_year_projections" in data:
        projections = data["five_year_projections"]
        normalized["projections"] = projections
    elif "projections" in data:
        normalized["projections"] = data["projections"]
    
    if "break_even_analysis" in data:
        be = data["break_even_analysis"]
        normalized["break_even"] = {
            "month": be.get("break_even_timeline", "N/A"),
            "customers_needed": be.get("customers_needed", "N/A"),
            "revenue_needed": be.get("break_even_revenue", "N/A")
        }
    elif "break_even" in data:
        normalized["break_even"] = data["break_even"]
    
    if "funding_strategy" in data:
        fs = data["funding_strategy"]
        normalized["funding"] = {
            "total_raise": fs.get("total_needed", "N/A"),
            "stages": fs.get("stages", []),
            "runway_months": fs.get("runway_months", 0)
        }
    elif "funding" in data:
        normalized["funding"] = data["funding"]
    
    if "scenario_analysis" in data:
        normalized["scenario_analysis"] = data["scenario_analysis"]
    
    if "assumptions" in data:
        normalized["assumptions"] = data["assumptions"]
    
    for key, value in data.items():
        if key not in normalized and key not in ["five_year_projections", "break_even_analysis", "funding_strategy"]:
            normalized[key] = value
    
    return normalized


def normalize_result(result: dict | None) -> dict | None:
    """Normalize all sections in the result to match frontend expectations."""
    if not result:
        return result
    
    normalized = result.copy()
    
    if "financial_model" in normalized and normalized["financial_model"]:
        if not normalized["financial_model"].get("locked"):
            normalized["financial_model"] = normalize_financial_model(normalized["financial_model"])
    
    return normalized


class CreateSessionRequest(BaseModel):
    idea: str
    answers: dict | None = None


class CreateSessionResponse(BaseModel):
    session_id: str
    status: str


class SessionStatusResponse(BaseModel):
    session_id: str
    status: str
    current_step: str | None = None
    result: dict | None = None
    error_message: str | None = None


def update_session_step(db, session_id: str, step: str, partial_result: dict | None = None):
    """Helper to update session progress."""
    session = db.query(GenerationSession).filter(
        GenerationSession.session_id == session_id
    ).first()
    if session:
        session.current_step = step
        if partial_result and session.result:
            session.result = {**session.result, **partial_result}
        elif partial_result:
            session.result = partial_result
        db.commit()


async def run_generation_in_background(session_id: str, idea: str, answers: dict | None):
    """Background task using phased generation with Gemini for better context management."""
    with get_db_session() as db:
        try:
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            
            if not session:
                return
            
            session.status = "generating"
            session.current_step = "market"
            session.result = {}
            db.commit()
            
            local_data = await local_business_service.analyze_local_business(idea)
            
            enriched_idea = idea
            
            if answers:
                enriched_idea += "\n\nFOUNDER'S RESPONSES TO DISCOVERY QUESTIONS:\n"
                for q_id, answer_data in answers.items():
                    if isinstance(answer_data, dict):
                        question = answer_data.get("question", "")
                        answer = answer_data.get("answer", "")
                        if question and answer:
                            enriched_idea += f"Q: {question}\nA: {answer}\n\n"
                    elif isinstance(answer_data, str) and answer_data.strip():
                        enriched_idea += f"- {answer_data.strip()}\n"
            
            local_context = ""
            if local_data.get("is_local_business") and local_data.get("population_data"):
                pop_data = local_data["population_data"]
                local_context = f"""
LOCAL MARKET DATA:
- Location: {pop_data.get('city')}, {pop_data.get('state')}
- City Population: {pop_data.get('city_population', 0):,}
- Metro Population: {int(pop_data.get('metro_population', 0)):,}
- Households: {int(pop_data.get('city_population', 75000) / 2.5):,}
"""
                enriched_idea += local_context
            
            location = local_data.get("location") if local_data.get("is_local_business") else None
            
            final_result = {
                "local_business_data": local_data if local_data.get("is_local_business") else None
            }
            context = ""
            
            logger.info(f"Session {session_id}: Phase 1 - Market Foundations")
            update_session_step(db, session_id, "market")
            
            phase1_results = await asyncio.gather(
                gemini_service.generate_market_research(enriched_idea, local_context),
                gemini_service.generate_competitor_discovery(enriched_idea, location),
                return_exceptions=True
            )
            
            market_research = phase1_results[0] if isinstance(phase1_results[0], dict) else {}
            competitor_discovery = phase1_results[1] if isinstance(phase1_results[1], dict) else {}
            
            final_result["market_research"] = market_research
            final_result["competitor_discovery"] = competitor_discovery
            update_session_step(db, session_id, "icp", final_result)
            
            context = gemini_service.extract_context_summary(market_research, "market_research")
            context += gemini_service.extract_context_summary(competitor_discovery, "competitor_discovery")
            
            logger.info(f"Session {session_id}: Phase 2 - Strategic Core")
            update_session_step(db, session_id, "executive")
            
            executive_summary = await gemini_service.generate_executive_summary(enriched_idea, context)
            final_result["executive_summary"] = executive_summary
            update_session_step(db, session_id, "business", final_result)
            
            context += gemini_service.extract_context_summary(executive_summary, "executive_summary")
            
            business_plan = await gemini_service.generate_business_plan(enriched_idea, context)
            final_result["business_plan"] = business_plan
            update_session_step(db, session_id, "financial", final_result)
            
            context += gemini_service.extract_context_summary(business_plan, "business_plan")
            
            phase2b_results = await asyncio.gather(
                gemini_service.generate_financial_model(enriched_idea, context),
                gemini_service.generate_competitor_analysis(enriched_idea, context),
                return_exceptions=True
            )
            
            financial_model = phase2b_results[0] if isinstance(phase2b_results[0], dict) else {}
            competitor_analysis = phase2b_results[1] if isinstance(phase2b_results[1], dict) else {}
            
            final_result["financial_model"] = financial_model
            final_result["competitor_analysis"] = competitor_analysis
            update_session_step(db, session_id, "gtm", final_result)
            
            context += gemini_service.extract_context_summary(financial_model, "financial_model")
            
            logger.info(f"Session {session_id}: Phase 3 - Execution Plans")
            
            phase3a_results = await asyncio.gather(
                gemini_service.generate_go_to_market(enriched_idea, context),
                gemini_service.generate_team_plan(enriched_idea, context),
                return_exceptions=True
            )
            
            go_to_market = phase3a_results[0] if isinstance(phase3a_results[0], dict) else {}
            team_plan = phase3a_results[1] if isinstance(phase3a_results[1], dict) else {}
            
            final_result["go_to_market"] = go_to_market
            final_result["team_plan"] = team_plan
            update_session_step(db, session_id, "risk", final_result)
            
            phase3b_results = await asyncio.gather(
                gemini_service.generate_risk_assessment(enriched_idea, context),
                gemini_service.generate_action_plan(enriched_idea, context),
                return_exceptions=True
            )
            
            risk_assessment = phase3b_results[0] if isinstance(phase3b_results[0], dict) else {}
            action_plan = phase3b_results[1] if isinstance(phase3b_results[1], dict) else {}
            
            final_result["risk_assessment"] = risk_assessment
            final_result["action_plan"] = action_plan
            update_session_step(db, session_id, "pitch", final_result)
            
            logger.info(f"Session {session_id}: Phase 4 - Pitch Deck")
            
            pitch_deck = await gemini_service.generate_pitch_deck(enriched_idea, context)
            final_result["pitch_deck"] = pitch_deck
            
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            if session:
                session.result = final_result
                session.status = "completed"
                session.completed_at = datetime.utcnow()
                db.commit()
            
            logger.info(f"Session {session_id} completed successfully with phased generation")
            
        except Exception as e:
            logger.error(f"Session {session_id} failed: {str(e)}")
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            if session:
                session.status = "failed"
                session.error_message = str(e)
                db.commit()


@router.post("/create", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest, background_tasks: BackgroundTasks):
    """Create a new generation session and start background generation."""
    if not request.idea or len(request.idea.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a more detailed business idea (at least 10 characters)"
        )
    
    session_id = secrets.token_urlsafe(32)
    
    with get_db_session() as db:
        new_session = GenerationSession(
            session_id=session_id,
            business_idea=request.idea.strip(),
            answers=request.answers,
            status="pending"
        )
        db.add(new_session)
        db.commit()
    
    background_tasks.add_task(
        run_generation_in_background, 
        session_id, 
        request.idea.strip(), 
        request.answers
    )
    
    return CreateSessionResponse(session_id=session_id, status="pending")


def get_user_from_token(authorization: Optional[str], db) -> Optional[User]:
    """Extract user from Bearer token if valid."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.replace("Bearer ", "")
        token_data = decode_token(token)
        if not token_data or not token_data.email:
            return None
        return db.query(User).filter(User.email == token_data.email).first()
    except Exception:
        return None


def redact_premium_sections(result: dict | None, is_subscribed: bool) -> dict | None:
    """Remove or mark premium sections as locked for non-subscribers."""
    if not result or is_subscribed:
        return result
    
    redacted = result.copy()
    for section in PREMIUM_SECTIONS:
        if section in redacted and redacted[section]:
            redacted[section] = {
                "locked": True,
                "message": "Upgrade to Pro to unlock this section",
                "preview": _get_section_preview(section, redacted[section])
            }
    return redacted


def _get_section_preview(section: str, data: dict) -> dict:
    """Create a teaser preview of locked content."""
    if section == "financial_model":
        projections = data.get("five_year_projections", []) or data.get("projections", [])
        return {
            "available_years": len(projections) if projections else 5,
            "has_break_even": "break_even_analysis" in data or "break_even" in data,
            "has_funding_strategy": "funding_strategy" in data or "funding" in data
        }
    elif section == "pitch_deck":
        slides = data.get("slides", [])
        return {
            "total_slides": len(slides) if slides else 10,
            "slide_titles": [s.get("title", "") for s in slides[:3]] if slides else ["Problem", "Solution", "Market"]
        }
    return {}


@router.get("/status/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(
    session_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get the current status of a generation session."""
    with get_db_session() as db:
        session = db.query(GenerationSession).filter(
            GenerationSession.session_id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        user = get_user_from_token(authorization, db)
        is_subscribed = user and user.subscription_tier == "pro" and user.subscription_status == "active"
        
        result = normalize_result(session.result)
        result = redact_premium_sections(result, is_subscribed)
        
        return SessionStatusResponse(
            session_id=session.session_id,
            status=session.status,
            current_step=session.current_step,
            result=result,
            error_message=session.error_message
        )


class AttachUserRequest(BaseModel):
    session_id: str


class AttachUserResponse(BaseModel):
    success: bool
    message: str


@router.post("/attach-user", response_model=AttachUserResponse)
async def attach_user_to_session(
    request: AttachUserRequest,
    authorization: str = Header(...)
):
    """Link a generation session to the authenticated user."""
    with get_db_session() as db:
        user = get_user_from_token(authorization, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing authentication"
            )
        
        session = db.query(GenerationSession).filter(
            GenerationSession.session_id == request.session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        if session.user_id and session.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Session belongs to another user"
            )
        
        session.user_id = user.id
        db.commit()
        
        return AttachUserResponse(
            success=True,
            message="Session linked to your account"
        )


@router.get("/user-sessions")
async def get_user_sessions(authorization: str = Header(...)):
    """Get all sessions for the authenticated user."""
    with get_db_session() as db:
        user = get_user_from_token(authorization, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing authentication"
            )
        
        sessions = db.query(GenerationSession).filter(
            GenerationSession.user_id == user.id
        ).order_by(GenerationSession.created_at.desc()).limit(10).all()
        
        return [{
            "session_id": s.session_id,
            "business_idea": s.business_idea[:100] + "..." if len(s.business_idea) > 100 else s.business_idea,
            "status": s.status,
            "created_at": s.created_at.isoformat() if s.created_at else None
        } for s in sessions]


@router.post("/retry/{session_id}", response_model=CreateSessionResponse)
async def retry_session(session_id: str, background_tasks: BackgroundTasks):
    """Retry a failed session."""
    with get_db_session() as db:
        session = db.query(GenerationSession).filter(
            GenerationSession.session_id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session.status = "pending"
        session.error_message = None
        session.result = None
        db.commit()
        
        background_tasks.add_task(
            run_generation_in_background,
            session_id,
            session.business_idea,
            session.answers
        )
        
        return CreateSessionResponse(session_id=session_id, status="pending")
