import httpx
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://myceo.app",
            "X-Title": "myCEO"
        }
    
    async def generate_business_plan(self, idea_title: str, idea_description: str, industry: str = None) -> dict:
        prompt = f"""
        Generate a comprehensive business plan for the following idea:
        
        Title: {idea_title}
        Description: {idea_description}
        Industry: {industry or 'General'}
        
        Return a JSON object with the following structure:
        {{
            "executive_summary": "A compelling summary of the business",
            "mission": "Mission statement",
            "vision": "Vision for the future",
            "objectives": ["Objective 1", "Objective 2", "Objective 3"],
            "company_description": "Detailed description of the company",
            "products_services": ["Product/Service 1", "Product/Service 2"],
            "marketing_strategy": "Marketing approach",
            "operations_plan": "How the business will operate",
            "management_team": ["Team member 1", "Team member 2"],
            "swot_analysis": {{
                "strengths": ["Strength 1", "Strength 2"],
                "weaknesses": ["Weakness 1", "Weakness 2"],
                "opportunities": ["Opportunity 1", "Opportunity 2"],
                "threats": ["Threat 1", "Threat 2"]
            }}
        }}
        
        Only return valid JSON, no additional text.
        """
        
        return await self._call_ai(prompt)
    
    async def generate_financial_model(self, idea_title: str, idea_description: str, industry: str = None) -> dict:
        prompt = f"""
        Generate a financial model for the following business idea:
        
        Title: {idea_title}
        Description: {idea_description}
        Industry: {industry or 'General'}
        
        Return a JSON object with the following structure:
        {{
            "assumptions": {{
                "market_size": "Estimated market size",
                "growth_rate": "Annual growth rate percentage",
                "pricing_model": "How you'll price your product/service",
                "customer_acquisition_cost": "Estimated CAC",
                "lifetime_value": "Estimated LTV",
                "operating_margin": "Target operating margin"
            }},
            "projections": [
                {{"year": 1, "revenue": 0, "costs": 0, "profit": 0}},
                {{"year": 2, "revenue": 0, "costs": 0, "profit": 0}},
                {{"year": 3, "revenue": 0, "costs": 0, "profit": 0}},
                {{"year": 4, "revenue": 0, "costs": 0, "profit": 0}},
                {{"year": 5, "revenue": 0, "costs": 0, "profit": 0}}
            ],
            "break_even": {{
                "month": "Month of break-even",
                "customers_needed": "Number of customers needed"
            }},
            "funding_needed": {{
                "amount": "Recommended funding amount",
                "use_of_funds": ["Use 1", "Use 2"]
            }},
            "key_metrics": {{
                "cac": "Customer Acquisition Cost",
                "ltv": "Lifetime Value",
                "ltv_cac_ratio": "LTV/CAC Ratio",
                "burn_rate": "Monthly burn rate",
                "runway": "Months of runway"
            }}
        }}
        
        Only return valid JSON, no additional text.
        """
        
        return await self._call_ai(prompt)
    
    async def generate_market_research(self, idea_title: str, idea_description: str, industry: str = None) -> dict:
        prompt = f"""
        Generate comprehensive market research for the following business idea:
        
        Title: {idea_title}
        Description: {idea_description}
        Industry: {industry or 'General'}
        
        Return a JSON object with the following structure:
        {{
            "market_overview": "Overview of the market",
            "tam": {{
                "value": "Total Addressable Market value",
                "description": "Description of TAM"
            }},
            "sam": {{
                "value": "Serviceable Addressable Market value",
                "description": "Description of SAM"
            }},
            "som": {{
                "value": "Serviceable Obtainable Market value",
                "description": "Description of SOM"
            }},
            "market_trends": ["Trend 1", "Trend 2", "Trend 3"],
            "target_segments": ["Segment 1", "Segment 2"],
            "customer_needs": ["Need 1", "Need 2"],
            "regulatory_considerations": "Any regulatory issues to consider",
            "barriers_to_entry": ["Barrier 1", "Barrier 2"]
        }}
        
        Only return valid JSON, no additional text.
        """
        
        return await self._call_ai(prompt)
    
    async def generate_competitor_analysis(self, idea_title: str, idea_description: str, industry: str = None) -> dict:
        prompt = f"""
        Generate a competitor analysis for the following business idea:
        
        Title: {idea_title}
        Description: {idea_description}
        Industry: {industry or 'General'}
        
        Return a JSON object with the following structure:
        {{
            "competitors": [
                {{
                    "name": "Competitor Name",
                    "description": "Brief description",
                    "strengths": ["Strength 1", "Strength 2"],
                    "weaknesses": ["Weakness 1", "Weakness 2"],
                    "market_position": "Their market position",
                    "pricing": "Their pricing model",
                    "target_audience": "Who they target"
                }}
            ],
            "competitive_advantages": ["Advantage 1", "Advantage 2"],
            "differentiation_strategy": "How you'll differentiate",
            "threats_from_competitors": ["Threat 1", "Threat 2"],
            "recommendations": ["Recommendation 1", "Recommendation 2"]
        }}
        
        Only return valid JSON, no additional text.
        """
        
        return await self._call_ai(prompt)
    
    async def generate_pitch_deck(self, idea_title: str, idea_description: str, industry: str = None) -> dict:
        prompt = f"""
        Generate a pitch deck outline for the following business idea:
        
        Title: {idea_title}
        Description: {idea_description}
        Industry: {industry or 'General'}
        
        Return a JSON object with the following structure:
        {{
            "slides": [
                {{
                    "title": "Slide Title",
                    "content": "Main content/bullet points",
                    "visuals": "Suggested visuals",
                    "speaker_notes": "What to say"
                }}
            ],
            "recommended_length": "Number of slides",
            "key_messages": ["Message 1", "Message 2", "Message 3"],
            "call_to_action": "What investors should do"
        }}
        
        Only return valid JSON, no additional text.
        """
        
        return await self._call_ai(prompt)
    
    def _extract_json(self, content: str) -> dict:
        content = content.strip()
        
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        json_start = content.find('{')
        json_end = content.rfind('}')
        if json_start != -1 and json_end != -1:
            content = content[json_start:json_end + 1]
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            content = content.replace('\n', ' ').replace('\r', '')
            content = ' '.join(content.split())
            return json.loads(content)
    
    async def _call_ai(self, prompt: str) -> dict:
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "minimax/minimax-m2.1",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a business expert. Return ONLY valid JSON with no markdown formatting, no code blocks, and no additional text. Ensure all strings are properly escaped."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.5,
                        "max_tokens": 8000
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                content = result["choices"][0]["message"]["content"]
                return self._extract_json(content)
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            logger.error(f"AI generation error: {e}")
            raise Exception(f"Failed to generate content: {str(e)}")


ai_service = AIService()
