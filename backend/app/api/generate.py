from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.ai_service import ai_service
import asyncio

router = APIRouter()


class GenerateRequest(BaseModel):
    idea: str


class GenerateResponse(BaseModel):
    market_research: dict | None = None
    business_plan: dict | None = None
    financial_model: dict | None = None
    competitor_analysis: dict | None = None
    pitch_deck: dict | None = None


@router.post("/", response_model=GenerateResponse)
async def generate_business_analysis(request: GenerateRequest):
    if not request.idea or len(request.idea.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a more detailed business idea (at least 10 characters)"
        )
    
    idea_text = request.idea.strip()
    
    try:
        market_research, business_plan, financial_model, competitor_analysis, pitch_deck = await asyncio.gather(
            ai_service.generate_market_research(idea_text, idea_text),
            ai_service.generate_business_plan(idea_text, idea_text),
            ai_service.generate_financial_model(idea_text, idea_text),
            ai_service.generate_competitor_analysis(idea_text, idea_text),
            ai_service.generate_pitch_deck(idea_text, idea_text),
        )
        
        return GenerateResponse(
            market_research=market_research,
            business_plan=business_plan,
            financial_model=financial_model,
            competitor_analysis=competitor_analysis,
            pitch_deck=pitch_deck
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating business analysis: {str(e)}"
        )
