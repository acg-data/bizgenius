import os
import base64
import logging
import json
from typing import List, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

AI_INTEGRATIONS_GEMINI_API_KEY = os.environ.get("AI_INTEGRATIONS_GEMINI_API_KEY")
AI_INTEGRATIONS_GEMINI_BASE_URL = os.environ.get("AI_INTEGRATIONS_GEMINI_BASE_URL")


def get_gemini_client():
    if not AI_INTEGRATIONS_GEMINI_BASE_URL or not AI_INTEGRATIONS_GEMINI_API_KEY:
        logger.warning("Gemini AI Integrations not configured")
        return None
    
    return genai.Client(
        api_key=AI_INTEGRATIONS_GEMINI_API_KEY,
        http_options={
            'api_version': '',
            'base_url': AI_INTEGRATIONS_GEMINI_BASE_URL   
        }
    )


def is_rate_limit_error(exception: BaseException) -> bool:
    error_msg = str(exception)
    return (
        "429" in error_msg 
        or "RATELIMIT_EXCEEDED" in error_msg
        or "quota" in error_msg.lower() 
        or "rate limit" in error_msg.lower()
        or (hasattr(exception, 'status') and getattr(exception, 'status', None) == 429)
    )


class BrandingService:
    
    def suggest_company_names(self, business_idea: str, count: int = 5) -> List[str]:
        client = get_gemini_client()
        if not client:
            return self._fallback_names(business_idea)
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"""Generate {count} creative, memorable company name suggestions for this business:

Business idea: {business_idea}

Requirements:
- Names should be short (1-3 words max)
- Easy to pronounce and remember
- Professional and modern
- Available as a .com domain (avoid common words)
- Mix of styles: some playful, some professional

Return ONLY a JSON array of strings with the names, nothing else.
Example: ["BrandOne", "NextLevel", "SwiftCo"]""",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            names = json.loads(response.text or "[]")
            return names[:count] if isinstance(names, list) else []
            
        except Exception as e:
            logger.error(f"Failed to generate company names: {e}")
            return self._fallback_names(business_idea)
    
    def _fallback_names(self, business_idea: str) -> List[str]:
        words = business_idea.split()[:2]
        base = "".join(w.capitalize() for w in words if len(w) > 2)[:10]
        return [
            f"{base}Co",
            f"{base}Hub",
            f"{base}Pro",
            f"The{base}",
            f"{base}Lab"
        ]
    
    def suggest_color_palettes(self, business_idea: str, industry: str = "", count: int = 3) -> List[List[str]]:
        client = get_gemini_client()
        if not client:
            return self._fallback_palettes()
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"""Generate {count} professional color palettes for this business:

Business idea: {business_idea}
Industry/Vibe: {industry or 'modern, professional'}

Each palette should have exactly 5 colors.
Consider color psychology and industry standards.
Include a primary color, secondary color, accent, and neutral tones.

Return ONLY a JSON array of arrays, where each inner array contains 5 hex color codes.
Example: [["#1D1D1F", "#F5F5F7", "#0066CC", "#34C759", "#FF9500"], ["#2D3748", "#EDF2F7", "#4299E1", "#48BB78", "#ED8936"]]""",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            palettes = json.loads(response.text or "[]")
            return palettes[:count] if isinstance(palettes, list) else self._fallback_palettes()
            
        except Exception as e:
            logger.error(f"Failed to generate color palettes: {e}")
            return self._fallback_palettes()
    
    def _fallback_palettes(self) -> List[List[str]]:
        return [
            ["#1D1D1F", "#F5F5F7", "#0066CC", "#34C759", "#FF9500"],
            ["#2D3748", "#EDF2F7", "#4299E1", "#48BB78", "#ED8936"],
            ["#1A202C", "#F7FAFC", "#805AD5", "#38B2AC", "#E53E3E"]
        ]
    
    def generate_random_palette(self, locked_colors: Optional[List[Optional[str]]] = None) -> List[str]:
        import random
        
        hue_ranges = [
            (0, 30),
            (30, 60),
            (180, 220),
            (260, 300),
            (100, 140)
        ]
        
        palette = []
        for i in range(5):
            if locked_colors and i < len(locked_colors) and locked_colors[i]:
                palette.append(locked_colors[i])
            else:
                h = random.randint(*random.choice(hue_ranges))
                s = random.randint(40, 80)
                l = random.randint(30, 70) if i < 3 else random.randint(85, 95)
                
                palette.append(self._hsl_to_hex(h, s, l))
        
        return palette
    
    def _hsl_to_hex(self, h: int, s: int, l: int) -> str:
        s = s / 100
        l = l / 100
        
        c = (1 - abs(2 * l - 1)) * s
        x = c * (1 - abs((h / 60) % 2 - 1))
        m = l - c / 2
        
        if h < 60:
            r, g, b = c, x, 0
        elif h < 120:
            r, g, b = x, c, 0
        elif h < 180:
            r, g, b = 0, c, x
        elif h < 240:
            r, g, b = 0, x, c
        elif h < 300:
            r, g, b = x, 0, c
        else:
            r, g, b = c, 0, x
        
        r_val = int((r + m) * 255)
        g_val = int((g + m) * 255)
        b_val = int((b + m) * 255)
        
        return f"#{r_val:02x}{g_val:02x}{b_val:02x}"
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception(is_rate_limit_error),
        reraise=True
    )
    def generate_logo(self, company_name: str, business_idea: str, style: str = "modern") -> Optional[str]:
        client = get_gemini_client()
        if not client:
            logger.warning("Gemini client not available for logo generation")
            return None
        
        prompt = f"""Create a professional, minimal logo for a company called "{company_name}".

Business: {business_idea}
Style: {style}, clean, vector-style, suitable for business use

Requirements:
- Simple, memorable design
- Works well at small sizes
- Professional and modern aesthetic
- Single iconic symbol or lettermark
- Clean white or transparent-feeling background
- No text in the logo, just the symbol/icon"""

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"]
                )
            )
            
            if not response.candidates:
                logger.error("No candidates in logo generation response")
                return None
            
            candidate = response.candidates[0]
            if not candidate.content or not candidate.content.parts:
                logger.error("No content parts in logo generation response")
                return None
            
            for part in candidate.content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    mime_type = part.inline_data.mime_type or "image/png"
                    image_data = part.inline_data.data
                    
                    if isinstance(image_data, bytes):
                        image_data_str = base64.b64encode(image_data).decode('utf-8')
                    else:
                        image_data_str = str(image_data)
                    
                    return f"data:{mime_type};base64,{image_data_str}"
            
            logger.error("No image data found in response")
            return None
            
        except Exception as e:
            logger.error(f"Failed to generate logo: {e}")
            raise
    
    def generate_logo_variations(self, company_name: str, business_idea: str, count: int = 4) -> List[Optional[str]]:
        styles = ["modern minimalist", "bold geometric", "elegant classic", "playful creative"][:count]
        logos = []
        
        for style in styles:
            try:
                logo = self.generate_logo(company_name, business_idea, style)
                logos.append(logo)
            except Exception as e:
                logger.error(f"Failed to generate {style} logo: {e}")
                logos.append(None)
        
        return logos


branding_service = BrandingService()
