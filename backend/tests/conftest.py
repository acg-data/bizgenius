"""
Pytest fixtures for BizGenius backend tests.
"""
import os
import pytest
from typing import Generator, Dict, Any
from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.models.models import User, Idea, SubscriptionPlan, Payment
from app.api.deps import create_access_token
from app.api.auth import get_password_hash


# Use SQLite for testing (in-memory for speed)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    """Override database dependency for tests."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with database override.
    """
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data() -> Dict[str, str]:
    """Sample user data for registration."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User"
    }


@pytest.fixture
def test_user(db: Session) -> User:
    """Create a test user in the database."""
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("TestPassword123"),
        full_name="Test User",
        is_active=True,
        is_verified=False,
        subscription_tier="free",
        subscription_status="inactive"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_user_token(test_user: User) -> str:
    """Create an access token for the test user."""
    return create_access_token(
        data={"sub": test_user.email, "user_id": test_user.id}
    )


@pytest.fixture
def auth_headers(test_user_token: str) -> Dict[str, str]:
    """Authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {test_user_token}"}


@pytest.fixture
def pro_user(db: Session) -> User:
    """Create a pro tier user."""
    user = User(
        email="prouser@example.com",
        hashed_password=get_password_hash("ProPassword123"),
        full_name="Pro User",
        is_active=True,
        is_verified=True,
        subscription_tier="pro",
        subscription_status="active",
        stripe_customer_id="cus_test123",
        stripe_subscription_id="sub_test123"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def pro_user_token(pro_user: User) -> str:
    """Create an access token for the pro user."""
    return create_access_token(
        data={"sub": pro_user.email, "user_id": pro_user.id}
    )


@pytest.fixture
def pro_auth_headers(pro_user_token: str) -> Dict[str, str]:
    """Authorization headers for pro user."""
    return {"Authorization": f"Bearer {pro_user_token}"}


@pytest.fixture
def test_idea(db: Session, test_user: User) -> Idea:
    """Create a test idea."""
    idea = Idea(
        title="Test Business Idea",
        description="This is a test business idea for automated testing purposes.",
        industry="Technology",
        target_market="Small businesses",
        user_id=test_user.id
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@pytest.fixture
def test_idea_with_content(db: Session, test_user: User) -> Idea:
    """Create a test idea with generated content."""
    idea = Idea(
        title="Test Business Idea with Content",
        description="A comprehensive test business idea with AI-generated content.",
        industry="Technology",
        target_market="Enterprise",
        user_id=test_user.id,
        business_plan={
            "executive_summary": "Test summary",
            "market_analysis": "Test analysis"
        },
        financial_model={
            "revenue_projections": [100000, 200000, 300000],
            "expenses": [50000, 75000, 100000]
        },
        market_research={
            "market_size": "1B",
            "growth_rate": "10%"
        },
        competitor_analysis={
            "competitors": ["Competitor A", "Competitor B"]
        },
        pitch_deck={
            "slides": ["Introduction", "Problem", "Solution"]
        },
        generated_at=datetime.utcnow()
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@pytest.fixture
def subscription_plans(db: Session) -> list[SubscriptionPlan]:
    """Create subscription plans."""
    plans = [
        SubscriptionPlan(
            name="Free",
            description="Free tier",
            price_monthly=0,
            price_yearly=0,
            features={"ideas_per_month": 1},
            is_active=True
        ),
        SubscriptionPlan(
            name="Pro",
            description="Pro tier",
            price_monthly=80,
            price_yearly=768,
            stripe_price_id="price_pro_test",
            features={"ideas_per_month": -1},
            is_active=True
        ),
        SubscriptionPlan(
            name="Daily Coach",
            description="Coach tier",
            price_monthly=15,
            price_yearly=144,
            stripe_price_id="price_coach_test",
            features={"ideas_per_month": -1, "ai_coaching": True},
            is_active=True
        )
    ]
    for plan in plans:
        db.add(plan)
    db.commit()
    return plans


@pytest.fixture
def inactive_user(db: Session) -> User:
    """Create an inactive user."""
    user = User(
        email="inactive@example.com",
        hashed_password=get_password_hash("InactivePassword123"),
        full_name="Inactive User",
        is_active=False,
        is_verified=False,
        subscription_tier="free",
        subscription_status="inactive"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
