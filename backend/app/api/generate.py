from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.services.ai_service import ai_service
from app.services.local_business_service import local_business_service
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
    local_business_data: dict | None = None


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
        local_data = await local_business_service.analyze_local_business(idea_text)
        
        enriched_idea = idea_text
        if local_data.get("is_local_business") and local_data.get("population_data"):
            pop_data = local_data["population_data"]
            enriched_idea += f"""

LOCAL MARKET DATA (USE THIS FOR TAM/SAM/SOM):
- Location: {pop_data.get('city')}, {pop_data.get('state')}
- City Population: {pop_data.get('city_population', 0):,}
- Metro Area Population: {int(pop_data.get('metro_population', 0)):,}
- State Population: {pop_data.get('state_population', 0):,}
- Estimated Households: {int(pop_data.get('city_population', 75000) / 2.5):,}
- Working Adults (estimated): {int(pop_data.get('city_population', 75000) * 0.65):,}
"""
        
        if local_data.get("competitors_analyzed"):
            enriched_idea += "\n\nCOMPETITOR WEBSITE ANALYSIS:\n"
            for comp in local_data["competitors_analyzed"]:
                if comp.get("error"):
                    continue
                enriched_idea += f"""
- {comp.get('domain', 'Unknown')}:
  Title: {comp.get('title', 'N/A')}
  Description: {comp.get('description', 'N/A')[:200] if comp.get('description') else 'N/A'}
  Prices Found: {comp.get('prices_found', [])}
  Has Online Booking: {comp.get('features', {}).get('has_online_booking', False)}
  Shows Reviews: {comp.get('features', {}).get('shows_reviews', False)}
  Has Pricing Page: {comp.get('features', {}).get('has_pricing_page', False)}
"""
            
            if local_data.get("competitor_summary"):
                summary = local_data["competitor_summary"]
                avg_price = summary.get('avg_price')
                price_range = summary.get('price_range')
                price_str = f"${avg_price:.2f}" if avg_price else "Unknown"
                range_str = f"${price_range.get('min', 0):.2f} - ${price_range.get('max', 0):.2f}" if price_range else "Unknown"
                enriched_idea += f"""
COMPETITOR SUMMARY:
- Number of Competitors Analyzed: {summary.get('count', 0)}
- Average Price: {price_str}
- Price Range: {range_str}
- % with Online Booking: {summary.get('pct_with_online_booking', 0):.0f}%
- % Showing Reviews: {summary.get('pct_showing_reviews', 0):.0f}%
- Market Gaps Identified: {', '.join(summary.get('market_gaps', [])) or 'None identified'}
"""
        
        results = await asyncio.gather(
            ai_service.generate_executive_summary(enriched_idea),
            ai_service.generate_market_research(enriched_idea),
            ai_service.generate_business_plan(enriched_idea),
            ai_service.generate_financial_model(enriched_idea),
            ai_service.generate_competitor_analysis(enriched_idea),
            ai_service.generate_go_to_market(enriched_idea),
            ai_service.generate_team_plan(enriched_idea),
            ai_service.generate_risk_assessment(enriched_idea),
            ai_service.generate_action_plan(enriched_idea),
            ai_service.generate_pitch_deck(enriched_idea),
            return_exceptions=True
        )
        
        def safe_result(r) -> dict | None:
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
            pitch_deck=pitch_deck,
            local_business_data=local_data if local_data.get("is_local_business") else None
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating business analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating business analysis: {str(e)}"
        )
