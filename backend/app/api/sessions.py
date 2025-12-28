from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db_session
from app.models.models import GenerationSession, ConversationHistory
from app.services.gemini_service import gemini_service
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


def update_session_step(db, session_id: str, step: str, partial_result: dict | None = None):
    """Helper to update session progress."""
    session = db.query(GenerationSession).filter(
        GenerationSession.session_id == session_id
    ).first()
    if session:
        session.current_step = step
        if partial_result and session.result:
            session.result = {**session.result, **partial_result}
        elif partial_result:
            session.result = partial_result
        db.commit()


async def run_generation_in_background(session_id: str, idea: str, answers: dict | None):
    """Background task using phased generation with Gemini for better context management."""
    with get_db_session() as db:
        try:
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            
            if not session:
                return
            
            session.status = "generating"
            session.current_step = "market"
            session.result = {}
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
            
            local_context = ""
            if local_data.get("is_local_business") and local_data.get("population_data"):
                pop_data = local_data["population_data"]
                local_context = f"""
LOCAL MARKET DATA:
- Location: {pop_data.get('city')}, {pop_data.get('state')}
- City Population: {pop_data.get('city_population', 0):,}
- Metro Population: {int(pop_data.get('metro_population', 0)):,}
- Households: {int(pop_data.get('city_population', 75000) / 2.5):,}
"""
                enriched_idea += local_context
            
            location = local_data.get("location") if local_data.get("is_local_business") else None
            
            final_result = {
                "local_business_data": local_data if local_data.get("is_local_business") else None
            }
            context = ""
            
            logger.info(f"Session {session_id}: Phase 1 - Market Foundations")
            update_session_step(db, session_id, "market")
            
            phase1_results = await asyncio.gather(
                gemini_service.generate_market_research(enriched_idea, local_context),
                gemini_service.generate_competitor_discovery(enriched_idea, location),
                return_exceptions=True
            )
            
            market_research = phase1_results[0] if isinstance(phase1_results[0], dict) else {}
            competitor_discovery = phase1_results[1] if isinstance(phase1_results[1], dict) else {}
            
            final_result["market_research"] = market_research
            final_result["competitor_discovery"] = competitor_discovery
            update_session_step(db, session_id, "icp", final_result)
            
            context = gemini_service.extract_context_summary(market_research, "market_research")
            context += gemini_service.extract_context_summary(competitor_discovery, "competitor_discovery")
            
            logger.info(f"Session {session_id}: Phase 2 - Strategic Core")
            update_session_step(db, session_id, "executive")
            
            executive_summary = await gemini_service.generate_executive_summary(enriched_idea, context)
            final_result["executive_summary"] = executive_summary
            update_session_step(db, session_id, "business", final_result)
            
            context += gemini_service.extract_context_summary(executive_summary, "executive_summary")
            
            business_plan = await gemini_service.generate_business_plan(enriched_idea, context)
            final_result["business_plan"] = business_plan
            update_session_step(db, session_id, "financial", final_result)
            
            context += gemini_service.extract_context_summary(business_plan, "business_plan")
            
            phase2b_results = await asyncio.gather(
                gemini_service.generate_financial_model(enriched_idea, context),
                gemini_service.generate_competitor_analysis(enriched_idea, context),
                return_exceptions=True
            )
            
            financial_model = phase2b_results[0] if isinstance(phase2b_results[0], dict) else {}
            competitor_analysis = phase2b_results[1] if isinstance(phase2b_results[1], dict) else {}
            
            final_result["financial_model"] = financial_model
            final_result["competitor_analysis"] = competitor_analysis
            update_session_step(db, session_id, "gtm", final_result)
            
            context += gemini_service.extract_context_summary(financial_model, "financial_model")
            
            logger.info(f"Session {session_id}: Phase 3 - Execution Plans")
            
            phase3a_results = await asyncio.gather(
                gemini_service.generate_go_to_market(enriched_idea, context),
                gemini_service.generate_team_plan(enriched_idea, context),
                return_exceptions=True
            )
            
            go_to_market = phase3a_results[0] if isinstance(phase3a_results[0], dict) else {}
            team_plan = phase3a_results[1] if isinstance(phase3a_results[1], dict) else {}
            
            final_result["go_to_market"] = go_to_market
            final_result["team_plan"] = team_plan
            update_session_step(db, session_id, "risk", final_result)
            
            phase3b_results = await asyncio.gather(
                gemini_service.generate_risk_assessment(enriched_idea, context),
                gemini_service.generate_action_plan(enriched_idea, context),
                return_exceptions=True
            )
            
            risk_assessment = phase3b_results[0] if isinstance(phase3b_results[0], dict) else {}
            action_plan = phase3b_results[1] if isinstance(phase3b_results[1], dict) else {}
            
            final_result["risk_assessment"] = risk_assessment
            final_result["action_plan"] = action_plan
            update_session_step(db, session_id, "pitch", final_result)
            
            logger.info(f"Session {session_id}: Phase 4 - Pitch Deck")
            
            pitch_deck = await gemini_service.generate_pitch_deck(enriched_idea, context)
            final_result["pitch_deck"] = pitch_deck
            
            session = db.query(GenerationSession).filter(
                GenerationSession.session_id == session_id
            ).first()
            if session:
                session.result = final_result
                session.status = "completed"
                session.completed_at = datetime.utcnow()
                db.commit()
            
            logger.info(f"Session {session_id} completed successfully with phased generation")
            
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
