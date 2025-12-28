from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.branding_service import branding_service

router = APIRouter()
logger = logging.getLogger(__name__)


class CompanyNameRequest(BaseModel):
    business_idea: str
    count: int = 5


class CompanyNameResponse(BaseModel):
    names: List[str]


class ColorPaletteRequest(BaseModel):
    business_idea: str
    industry: str = ""
    count: int = 3


class ColorPaletteResponse(BaseModel):
    palettes: List[List[str]]


class RandomPaletteRequest(BaseModel):
    locked_colors: Optional[List[Optional[str]]] = None


class RandomPaletteResponse(BaseModel):
    palette: List[str]


class LogoRequest(BaseModel):
    company_name: str
    business_idea: str
    style: str = "modern"


class LogoResponse(BaseModel):
    logo: Optional[str]


class LogoVariationsRequest(BaseModel):
    company_name: str
    business_idea: str
    count: int = 4


class LogoVariationsResponse(BaseModel):
    logos: List[Optional[str]]


@router.post("/company-names", response_model=CompanyNameResponse)
async def suggest_company_names(request: CompanyNameRequest):
    try:
        names = branding_service.suggest_company_names(
            business_idea=request.business_idea,
            count=request.count
        )
        return CompanyNameResponse(names=names)
    except Exception as e:
        logger.error(f"Error suggesting company names: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate company name suggestions")


@router.post("/color-palettes", response_model=ColorPaletteResponse)
async def suggest_color_palettes(request: ColorPaletteRequest):
    try:
        palettes = branding_service.suggest_color_palettes(
            business_idea=request.business_idea,
            industry=request.industry,
            count=request.count
        )
        return ColorPaletteResponse(palettes=palettes)
    except Exception as e:
        logger.error(f"Error suggesting color palettes: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate color palette suggestions")


@router.post("/random-palette", response_model=RandomPaletteResponse)
async def generate_random_palette(request: RandomPaletteRequest):
    try:
        palette = branding_service.generate_random_palette(
            locked_colors=request.locked_colors
        )
        return RandomPaletteResponse(palette=palette)
    except Exception as e:
        logger.error(f"Error generating random palette: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate random palette")


@router.post("/logo", response_model=LogoResponse)
async def generate_logo(request: LogoRequest):
    try:
        logo = branding_service.generate_logo(
            company_name=request.company_name,
            business_idea=request.business_idea,
            style=request.style
        )
        return LogoResponse(logo=logo)
    except Exception as e:
        logger.error(f"Error generating logo: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate logo")


@router.post("/logo-variations", response_model=LogoVariationsResponse)
async def generate_logo_variations(request: LogoVariationsRequest):
    try:
        logos = branding_service.generate_logo_variations(
            company_name=request.company_name,
            business_idea=request.business_idea,
            count=request.count
        )
        return LogoVariationsResponse(logos=logos)
    except Exception as e:
        logger.error(f"Error generating logo variations: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate logo variations")
