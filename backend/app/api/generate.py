from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.ai_service import ai_service
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class GenerateRequest(BaseModel):
    idea: str


class GenerateResponse(BaseModel):
    executive_summary: dict | None = None
    market_research: dict | None = None
    business_plan: dict | None = None
    financial_model: dict | None = None
    competitor_analysis: dict | None = None
    go_to_market: dict | None = None
    team_plan: dict | None = None
    risk_assessment: dict | None = None
    action_plan: dict | None = None
    pitch_deck: dict | None = None


@router.post("/", response_model=GenerateResponse)
async def generate_business_analysis(request: GenerateRequest):
    if not request.idea or len(request.idea.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a more detailed business idea (at least 10 characters)"
        )
    
    idea_text = request.idea.strip()
    logger.info(f"Starting comprehensive business analysis for idea: {idea_text[:100]}...")
    
    try:
        results = await asyncio.gather(
            ai_service.generate_executive_summary(idea_text),
            ai_service.generate_market_research(idea_text),
            ai_service.generate_business_plan(idea_text),
            ai_service.generate_financial_model(idea_text),
            ai_service.generate_competitor_analysis(idea_text),
            ai_service.generate_go_to_market(idea_text),
            ai_service.generate_team_plan(idea_text),
            ai_service.generate_risk_assessment(idea_text),
            ai_service.generate_action_plan(idea_text),
            ai_service.generate_pitch_deck(idea_text),
            return_exceptions=True
        )
        
        def safe_result(r: any) -> dict | None:
            return r if isinstance(r, dict) else None
        
        executive_summary = safe_result(results[0])
        market_research = safe_result(results[1])
        business_plan = safe_result(results[2])
        financial_model = safe_result(results[3])
        competitor_analysis = safe_result(results[4])
        go_to_market = safe_result(results[5])
        team_plan = safe_result(results[6])
        risk_assessment = safe_result(results[7])
        action_plan = safe_result(results[8])
        pitch_deck = safe_result(results[9])
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Generation {i} failed: {str(result)}")
        
        if all(isinstance(r, Exception) for r in results):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="All AI generations failed. Please try again."
            )
        
        logger.info("Business analysis completed successfully")
        
        return GenerateResponse(
            executive_summary=executive_summary,
            market_research=market_research,
            business_plan=business_plan,
            financial_model=financial_model,
            competitor_analysis=competitor_analysis,
            go_to_market=go_to_market,
            team_plan=team_plan,
            risk_assessment=risk_assessment,
            action_plan=action_plan,
            pitch_deck=pitch_deck
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating business analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating business analysis: {str(e)}"
        )
