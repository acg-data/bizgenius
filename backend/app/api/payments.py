from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.core.database import get_db
from app.services.stripe_service import stripe_service
from app.models.models import User, Payment
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        logger.warning("Webhook received without signature")
        raise HTTPException(status_code=400, detail="No signature provided")
    
    try:
        event = stripe_service.handle_webhook(payload, signature)
    except Exception as e:
        logger.error(f"Webhook verification failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    logger.info(f"Processing Stripe webhook: {event.type}")
    
    if event.type == "checkout.session.completed":
        session = event.data.object
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.stripe_subscription_id = subscription_id
            user.subscription_status = "active"
            user.subscription_tier = "pro"
            db.commit()
            logger.info(f"User {user.email} upgraded to pro via checkout")
    
    elif event.type == "customer.subscription.updated":
        subscription = event.data.object
        customer_id = subscription.get("customer")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            status = subscription.get("status")
            user.subscription_status = status
            if status == "active":
                user.subscription_tier = "pro"
            db.commit()
            logger.info(f"User {user.email} subscription updated to {status}")
    
    elif event.type == "customer.subscription.deleted":
        subscription = event.data.object
        customer_id = subscription.get("customer")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = "canceled"
            user.subscription_tier = "free"
            user.stripe_subscription_id = None
            db.commit()
            logger.info(f"User {user.email} subscription canceled")
    
    elif event.type == "invoice.payment_succeeded":
        invoice = event.data.object
        customer_id = invoice.get("customer")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            payment = Payment(
                user_id=user.id,
                amount=invoice.get("amount_paid", 0) / 100,
                currency=invoice.get("currency", "usd"),
                stripe_invoice_id=invoice.get("id"),
                status="succeeded",
                description=f"Subscription payment"
            )
            db.add(payment)
            db.commit()
            logger.info(f"Recorded payment for user {user.email}")
    
    elif event.type == "invoice.payment_failed":
        invoice = event.data.object
        customer_id = invoice.get("customer")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = "past_due"
            db.commit()
            logger.warning(f"Payment failed for user {user.email}")
    
    return {"status": "received"}
