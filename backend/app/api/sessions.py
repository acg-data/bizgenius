from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db_session
from app.models.models import GenerationSession, ConversationHistory
from app.services.ai_service import ai_service
from app.services.local_business_service import local_business_service
import asyncio
import logging
import secrets
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)


class CreateSessionRequest(BaseModel):
    idea: str
    answers: dict | None = None


class CreateSessionResponse(BaseModel):
    session_id: str
    status: str


class SessionStatusResponse(BaseModel):
    session_id: str
    status: str
    current_step: str | None = None
    result: dict | None = None
    error_message: str | None = None


async def run_generation_in_background(session_id: str, idea: str, answers: dict | None):
    """Background task to run the full generation."""
    with get_db_session() as db:
        try:
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            
            if not session:
                return
            
            session.status = "generating"
            session.current_step = "market"
            db.commit()
            
            local_data = await local_business_service.analyze_local_business(idea)
            
            enriched_idea = idea
            
            if answers:
                enriched_idea += "\n\nFOUNDER'S RESPONSES TO DISCOVERY QUESTIONS:\n"
                for q_id, answer_data in answers.items():
                    if isinstance(answer_data, dict):
                        question = answer_data.get("question", "")
                        answer = answer_data.get("answer", "")
                        if question and answer:
                            enriched_idea += f"Q: {question}\nA: {answer}\n\n"
                    elif isinstance(answer_data, str) and answer_data.strip():
                        enriched_idea += f"- {answer_data.strip()}\n"
            
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
            
            location = local_data.get("location") if local_data.get("is_local_business") else None
            
            session.current_step = "competitors"
            db.commit()
            
            results = await asyncio.gather(
                ai_service.generate_executive_summary(enriched_idea),
                ai_service.generate_market_research(enriched_idea),
                ai_service.generate_business_plan(enriched_idea),
                ai_service.generate_financial_model(enriched_idea),
                ai_service.generate_competitor_analysis(enriched_idea),
                ai_service.discover_competitors_with_gemini(enriched_idea, location),
                ai_service.generate_go_to_market(enriched_idea),
                ai_service.generate_team_plan(enriched_idea),
                ai_service.generate_risk_assessment(enriched_idea),
                ai_service.generate_action_plan(enriched_idea),
                ai_service.generate_pitch_deck(enriched_idea),
                return_exceptions=True
            )
            
            def safe_result(r) -> dict | None:
                return r if isinstance(r, dict) else None
            
            final_result = {
                "executive_summary": safe_result(results[0]),
                "market_research": safe_result(results[1]),
                "business_plan": safe_result(results[2]),
                "financial_model": safe_result(results[3]),
                "competitor_analysis": safe_result(results[4]),
                "competitor_discovery": safe_result(results[5]),
                "go_to_market": safe_result(results[6]),
                "team_plan": safe_result(results[7]),
                "risk_assessment": safe_result(results[8]),
                "action_plan": safe_result(results[9]),
                "pitch_deck": safe_result(results[10]),
                "local_business_data": local_data if local_data.get("is_local_business") else None
            }
            
            session.result = final_result
            session.status = "completed"
            session.completed_at = datetime.utcnow()
            db.commit()
            
            logger.info(f"Session {session_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Session {session_id} failed: {str(e)}")
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            if session:
                session.status = "failed"
                session.error_message = str(e)
                db.commit()


@router.post("/create", response_model=CreateSessionResponse)
async def create_session(request: CreateSessionRequest, background_tasks: BackgroundTasks):
    """Create a new generation session and start background generation."""
    if not request.idea or len(request.idea.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a more detailed business idea (at least 10 characters)"
        )
    
    session_id = secrets.token_urlsafe(32)
    
    with get_db_session() as db:
        new_session = GenerationSession(
            session_id=session_id,
            business_idea=request.idea.strip(),
            answers=request.answers,
            status="pending"
        )
        db.add(new_session)
        db.commit()
    
    background_tasks.add_task(
        run_generation_in_background, 
        session_id, 
        request.idea.strip(), 
        request.answers
    )
    
    return CreateSessionResponse(session_id=session_id, status="pending")


@router.get("/status/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(session_id: str):
    """Get the current status of a generation session."""
    with get_db_session() as db:
        session = db.query(GenerationSession).filter(
            GenerationSession.session_id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        return SessionStatusResponse(
            session_id=session.session_id,
            status=session.status,
            current_step=session.current_step,
            result=session.result,
            error_message=session.error_message
        )


@router.post("/retry/{session_id}", response_model=CreateSessionResponse)
async def retry_session(session_id: str, background_tasks: BackgroundTasks):
    """Retry a failed session."""
    with get_db_session() as db:
        session = db.query(GenerationSession).filter(
            GenerationSession.session_id == session_id
        ).first()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        session.status = "pending"
        session.error_message = None
        session.result = None
        db.commit()
        
        background_tasks.add_task(
            run_generation_in_background,
            session_id,
            session.business_idea,
            session.answers
        )
        
        return CreateSessionResponse(session_id=session_id, status="pending")
