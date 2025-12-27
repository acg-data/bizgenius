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

    # Security - Uses SESSION_SECRET from Replit secrets (aliased as SECRET_KEY)
    SECRET_KEY: str = ""
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
        import os
        # Check for SESSION_SECRET as fallback (Replit uses this name)
        if not v:
            v = os.getenv("SESSION_SECRET", "")
        if not v or v == "your-secret-key-change-in-production":
            # Generate a secure random key for development
            return secrets.token_urlsafe(32)
        return v

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        # Production validation - only warn, don't fail for optional services
        if self.ENVIRONMENT == "production":
            if self.DEBUG:
                raise ValueError("DEBUG must be False in production")
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
