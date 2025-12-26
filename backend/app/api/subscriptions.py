from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.config import settings
from app.models.models import User
from app.api.deps import get_current_user
from app.services.stripe_service import stripe_service

router = APIRouter()


class SubscriptionRequest(BaseModel):
    plan_type: str  # "pro" or "coach"


@router.post("/create-checkout-session")
async def create_checkout_session(
    request: SubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.stripe_customer_id:
        customer = stripe_service.create_customer(
            email=current_user.email,
            name=current_user.full_name
        )
        current_user.stripe_customer_id = customer.id
        db.commit()
    
    price_id = settings.STRIPE_PRICE_ID_PRO if request.plan_type == "pro" else settings.STRIPE_PRICE_ID_COACH
    
    session = stripe_service.create_checkout_session(
        customer_id=current_user.stripe_customer_id,
        price_id=price_id,
        success_url=f"{settings.CORS_ORIGINS[0]}/dashboard?success=true",
        cancel_url=f"{settings.CORS_ORIGINS[0]}/pricing?canceled=true",
        customer_email=current_user.email
    )
    
    return {"checkout_url": session.url, "session_id": session.id}


@router.post("/create-portal-session")
async def create_portal_session(
    current_user: User = Depends(get_current_user)
):
    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No subscription found"
        )
    
    session = stripe_service.create_portal_session(
        customer_id=current_user.stripe_customer_id,
        return_url=settings.CORS_ORIGINS[0]
    )
    
    return {"portal_url": session.url}


@router.get("/status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    return {
        "tier": current_user.subscription_tier,
        "status": current_user.subscription_status,
        "customer_id": current_user.stripe_customer_id
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.stripe_subscription_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription"
        )
    
    stripe_service.cancel_subscription(current_user.stripe_subscription_id)
    
    current_user.subscription_tier = "free"
    current_user.subscription_status = "canceled"
    db.commit()
    
    return {"message": "Subscription canceled successfully"}
