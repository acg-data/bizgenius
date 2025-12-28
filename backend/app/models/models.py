from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """User model representing registered users."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    is_active = Column(Boolean, default=True, server_default="true")
    is_verified = Column(Boolean, default=False, server_default="false")
    subscription_tier = Column(String(50), default="free", server_default="free")
    stripe_customer_id = Column(String(255), index=True)  # Added index for Stripe lookups
    stripe_subscription_id = Column(String(255))
    subscription_status = Column(String(50), default="inactive", server_default="inactive")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    ideas = relationship("Idea", back_populates="owner", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")


class Idea(Base):
    """Business idea model with AI-generated content."""
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    industry = Column(String(100))
    target_market = Column(String(255))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)  # Added index

    # AI-generated content
    business_plan = Column(JSON)
    financial_model = Column(JSON)
    market_research = Column(JSON)
    competitor_analysis = Column(JSON)
    pitch_deck = Column(JSON)

    generated_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    owner = relationship("User", back_populates="ideas")


class SubscriptionPlan(Base):
    """Subscription plan model for different pricing tiers."""
    __tablename__ = "subscription_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price_monthly = Column(Float)
    price_yearly = Column(Float)
    stripe_price_id = Column(String(255))
    features = Column(JSON)
    is_active = Column(Boolean, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Payment(Base):
    """Payment record model for tracking transactions."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="usd", server_default="usd")
    stripe_payment_intent_id = Column(String(255))
    stripe_invoice_id = Column(String(255))
    status = Column(String(50), default="pending", server_default="pending")
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payments")


class GenerationSession(Base):
    """Tracks generation sessions so users can resume if they leave the page."""
    __tablename__ = "generation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), unique=True, index=True, nullable=False)
    business_idea = Column(Text, nullable=False)
    answers = Column(JSON)
    status = Column(String(50), default="pending", server_default="pending")
    current_step = Column(String(50))
    result = Column(JSON)
    error_message = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))


class ConversationHistory(Base):
    """Stores Q&A context per business idea for better AI responses."""
    __tablename__ = "conversation_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("generation_sessions.session_id", ondelete="CASCADE"), index=True)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    extra_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OAuthUser(Base):
    """OAuth user model for Replit Auth."""
    __tablename__ = "oauth_users"

    id = Column(String(255), primary_key=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    provider = Column(String(50), default="replit", server_default="replit")
    welcome_email_sent = Column(Boolean, default=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
