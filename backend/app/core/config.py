import secrets
from pydantic_settings import BaseSettings
from pydantic import field_validator, model_validator
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BizGenius"
    DEBUG: bool = False  # Default to False for security
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"  # development, staging, production

    # Security - No defaults for secrets, must be set via environment
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI Service
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Stripe - Required for production
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_PRICE_ID_PRO: str = "price_pro_monthly"
    STRIPE_PRICE_ID_COACH: str = "price_coach_monthly"

    # Database (Supabase)
    DATABASE_URL: str

    # CORS - Default to localhost for development
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AI_RATE_LIMIT_PER_HOUR: int = 10

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or v == "your-secret-key-change-in-production":
            # Generate a secure random key for development
            # In production, this MUST be set via environment variable
            import os
            if os.getenv("ENVIRONMENT", "development") == "production":
                raise ValueError("SECRET_KEY must be set in production")
            return secrets.token_urlsafe(32)
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters")
        return v

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            errors = []
            if not self.STRIPE_SECRET_KEY:
                errors.append("STRIPE_SECRET_KEY is required in production")
            if not self.STRIPE_WEBHOOK_SECRET:
                errors.append("STRIPE_WEBHOOK_SECRET is required in production")
            if not self.OPENROUTER_API_KEY:
                errors.append("OPENROUTER_API_KEY is required in production")
            if self.DEBUG:
                errors.append("DEBUG must be False in production")
            if errors:
                raise ValueError(f"Production configuration errors: {', '.join(errors)}")
        return self

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
