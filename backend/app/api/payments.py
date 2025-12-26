from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.stripe_service import stripe_service
from app.models.models import User, Payment

router = APIRouter()


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        return {"error": "No signature provided"}
    
    try:
        event = stripe_service.handle_webhook(payload, signature)
    except Exception as e:
        return {"error": str(e)}, 400
    
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
    
    elif event.type == "customer.subscription.deleted":
        subscription = event.data.object
        customer_id = subscription.get("customer")
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = "canceled"
            user.subscription_tier = "free"
            user.stripe_subscription_id = None
            db.commit()
    
    return {"status": "received"}
