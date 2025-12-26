import stripe
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    
    @staticmethod
    def create_customer(email: str, name: str = None) -> stripe.Customer:
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"source": "bizgenius"}
            )
            return customer
        except Exception as e:
            logger.error(f"Error creating Stripe customer: {e}")
            raise
    
    @staticmethod
    def create_checkout_session(
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        customer_email: str = None
    ) -> stripe.Checkout.Session:
        try:
            session = stripe.Checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1
                }],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=customer_email,
                allow_promotion_codes=True
            )
            return session
        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            raise
    
    @staticmethod
    def create_portal_session(customer_id: str, return_url: str) -> stripe.BillingPortal.Session:
        try:
            session = stripe.BillingPortal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return session
        except Exception as e:
            logger.error(f"Error creating portal session: {e}")
            raise
    
    @staticmethod
    def cancel_subscription(subscription_id: str) -> stripe.Subscription:
        try:
            subscription = stripe.Subscription.cancel(subscription_id)
            return subscription
        except Exception as e:
            logger.error(f"Error canceling subscription: {e}")
            raise
    
    @staticmethod
    def get_subscription(subscription_id: str) -> stripe.Subscription:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription
        except Exception as e:
            logger.error(f"Error retrieving subscription: {e}")
            raise
    
    @staticmethod
    def handle_webhook(payload: bytes, signature: str) -> stripe.Event:
        try:
            event = stripe.Webhook.construct_event(
                payload,
                signature,
                settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except Exception as e:
            logger.error(f"Webhook verification failed: {e}")
            raise
    
    @staticmethod
    def get_customer_by_id(customer_id: str) -> stripe.Customer:
        try:
            customer = stripe.Customer.retrieve(customer_id)
            return customer
        except Exception as e:
            logger.error(f"Error retrieving customer: {e}")
            raise


stripe_service = StripeService()
