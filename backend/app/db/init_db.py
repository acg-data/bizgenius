import logging
from sqlalchemy import inspect

from app.core.database import engine, Base, SessionLocal
from app.models.models import User, Idea, SubscriptionPlan, Payment

logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Initialize the database by creating all tables.
    This is called during application startup.
    """
    logger.info("Initializing database...")

    # Import all models to ensure they are registered with SQLAlchemy
    # This is necessary for Base.metadata to know about all tables

    try:
        # Create all tables that don't exist
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # Seed initial data if needed
        await seed_subscription_plans()

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


async def seed_subscription_plans() -> None:
    """
    Seed the database with default subscription plans if they don't exist.
    """
    db = SessionLocal()
    try:
        # Check if plans already exist
        existing_plans = db.query(SubscriptionPlan).count()
        if existing_plans > 0:
            logger.info(f"Subscription plans already exist ({existing_plans} plans)")
            return

        # Create default subscription plans
        plans = [
            SubscriptionPlan(
                name="Free",
                description="Get started with basic business planning",
                price_monthly=0,
                price_yearly=0,
                stripe_price_id=None,
                features={
                    "ideas_per_month": 1,
                    "business_plan": True,
                    "financial_model": False,
                    "market_research": False,
                    "competitor_analysis": False,
                    "pitch_deck": False,
                    "ai_coaching": False,
                    "support": "community"
                },
                is_active=True
            ),
            SubscriptionPlan(
                name="Pro",
                description="Full access to all business planning tools",
                price_monthly=80,
                price_yearly=768,
                stripe_price_id="price_pro_monthly",
                features={
                    "ideas_per_month": -1,  # unlimited
                    "business_plan": True,
                    "financial_model": True,
                    "market_research": True,
                    "competitor_analysis": True,
                    "pitch_deck": True,
                    "ai_coaching": False,
                    "support": "priority"
                },
                is_active=True
            ),
            SubscriptionPlan(
                name="Daily Coach",
                description="Pro features plus daily AI coaching sessions",
                price_monthly=15,
                price_yearly=144,
                stripe_price_id="price_coach_monthly",
                features={
                    "ideas_per_month": -1,  # unlimited
                    "business_plan": True,
                    "financial_model": True,
                    "market_research": True,
                    "competitor_analysis": True,
                    "pitch_deck": True,
                    "ai_coaching": True,
                    "coaching_sessions_per_day": 1,
                    "expert_calls": True,
                    "support": "dedicated"
                },
                is_active=True
            )
        ]

        for plan in plans:
            db.add(plan)

        db.commit()
        logger.info(f"Seeded {len(plans)} subscription plans")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding subscription plans: {e}")
        raise
    finally:
        db.close()


def check_database_health() -> dict:
    """
    Check database connectivity and return health status.
    Used by the health check endpoint.
    """
    try:
        db = SessionLocal()
        # Execute a simple query to test connectivity
        db.execute("SELECT 1")
        db.close()
        return {"database": "healthy", "connected": True}
    except Exception as e:
        return {"database": "unhealthy", "connected": False, "error": str(e)}
