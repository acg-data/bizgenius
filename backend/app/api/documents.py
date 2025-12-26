from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import User, Idea
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/export/{idea_id}")
async def export_documents(
    idea_id: int,
    format: str = "json",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.user_id == current_user.id).first()
    if not idea:
        return {"error": "Idea not found"}
    
    export_data = {
        "title": idea.title,
        "description": idea.description,
        "business_plan": idea.business_plan,
        "financial_model": idea.financial_model,
        "market_research": idea.market_research,
        "competitor_analysis": idea.competitor_analysis,
        "pitch_deck": idea.pitch_deck
    }
    
    if format == "json":
        return export_data
    elif format == "text":
        text_output = f"# {idea.title}\n\n## Description\n{idea.description}\n\n"
        if idea.business_plan:
            text_output += f"## Business Plan\n{idea.business_plan}\n\n"
        if idea.financial_model:
            text_output += f"## Financial Model\n{idea.financial_model}\n\n"
        return {"content": text_output}
    
    return export_data
