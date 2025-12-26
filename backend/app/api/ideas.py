from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.models import User, Idea
from app.schemas.ideas import IdeaCreate, IdeaResponse, IdeaUpdate, GenerateOptions
from app.schemas.auth import MessageResponse
from app.api.deps import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/", response_model=IdeaResponse)
async def create_idea(
    idea_data: IdeaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    idea = Idea(
        title=idea_data.title,
        description=idea_data.description,
        industry=idea_data.industry,
        target_market=idea_data.target_market,
        user_id=current_user.id
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    
    return IdeaResponse.model_validate(idea)


@router.get("/", response_model=List[IdeaResponse])
async def get_ideas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ideas = db.query(Idea).filter(Idea.user_id == current_user.id).all()
    return [IdeaResponse.model_validate(idea) for idea in ideas]


@router.get("/{idea_id}", response_model=IdeaResponse)
async def get_idea(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    return IdeaResponse.model_validate(idea)


@router.patch("/{idea_id}", response_model=IdeaResponse)
async def update_idea(
    idea_id: int,
    idea_data: IdeaUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )

    # Update only provided fields
    update_data = idea_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(idea, field, value)

    db.commit()
    db.refresh(idea)
    return IdeaResponse.model_validate(idea)


@router.delete("/{idea_id}", response_model=MessageResponse)
async def delete_idea(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an idea."""
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )
    db.delete(idea)
    db.commit()
    return MessageResponse(message="Idea deleted successfully")


@router.post("/{idea_id}/generate", response_model=IdeaResponse)
async def generate_business_documents(
    idea_id: int,
    options: GenerateOptions = GenerateOptions(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered business documents for an idea.
    Uses the GenerateOptions schema to specify which documents to generate.
    """
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == current_user.id).first()
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found"
        )

    try:
        if options.include_business_plan:
            idea.business_plan = await ai_service.generate_business_plan(
                idea.title, idea.description, idea.industry
            )

        if options.include_financial_model:
            idea.financial_model = await ai_service.generate_financial_model(
                idea.title, idea.description, idea.industry
            )

        if options.include_market_research:
            idea.market_research = await ai_service.generate_market_research(
                idea.title, idea.description, idea.industry
            )

        if options.include_competitor_analysis:
            idea.competitor_analysis = await ai_service.generate_competitor_analysis(
                idea.title, idea.description, idea.industry
            )

        if options.include_pitch_deck:
            idea.pitch_deck = await ai_service.generate_pitch_deck(
                idea.title, idea.description, idea.industry
            )

        idea.generated_at = datetime.utcnow()
        db.commit()
        db.refresh(idea)

        return IdeaResponse.model_validate(idea)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating documents. Please try again later."
        )
