from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime


class IdeaBase(BaseModel):
    title: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Title of the business idea"
    )
    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Detailed description of the business idea"
    )
    industry: Optional[str] = Field(
        None,
        max_length=100,
        description="Industry or sector for the business"
    )
    target_market: Optional[str] = Field(
        None,
        max_length=255,
        description="Target market or customer segment"
    )

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace only")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Description cannot be empty or whitespace only")
        return v.strip()


class IdeaCreate(IdeaBase):
    """Schema for creating a new idea."""
    pass


class IdeaUpdate(BaseModel):
    """Schema for updating an existing idea."""
    title: Optional[str] = Field(None, min_length=3, max_length=500)
    description: Optional[str] = Field(None, min_length=10, max_length=5000)
    industry: Optional[str] = Field(None, max_length=100)
    target_market: Optional[str] = Field(None, max_length=255)


class GenerateOptions(BaseModel):
    """Schema for document generation options."""
    include_business_plan: bool = True
    include_financial_model: bool = True
    include_market_research: bool = True
    include_competitor_analysis: bool = True
    include_pitch_deck: bool = True


class IdeaResponse(IdeaBase):
    id: int
    user_id: int
    business_plan: Optional[Dict[str, Any]] = None
    financial_model: Optional[Dict[str, Any]] = None
    market_research: Optional[Dict[str, Any]] = None
    competitor_analysis: Optional[Dict[str, Any]] = None
    pitch_deck: Optional[Dict[str, Any]] = None
    generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class IdeaWithGeneration(IdeaCreate):
    pass


class BusinessPlanSection(BaseModel):
    title: str
    content: str


class FinancialProjection(BaseModel):
    year: int
    revenue: float
    costs: float
    profit: float


class CompetitorInfo(BaseModel):
    name: str
    strengths: List[str]
    weaknesses: List[str]
    market_share: float
