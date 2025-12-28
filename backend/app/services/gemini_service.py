import os
import json
import logging
import asyncio
from typing import Any
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

AI_INTEGRATIONS_GEMINI_API_KEY = os.environ.get("AI_INTEGRATIONS_GEMINI_API_KEY")
AI_INTEGRATIONS_GEMINI_BASE_URL = os.environ.get("AI_INTEGRATIONS_GEMINI_BASE_URL")

def is_rate_limit_error(exception: BaseException) -> bool:
    error_msg = str(exception)
    return (
        "429" in error_msg 
        or "RATELIMIT_EXCEEDED" in error_msg
        or "quota" in error_msg.lower() 
        or "rate limit" in error_msg.lower()
        or (hasattr(exception, 'status') and exception.status == 429)
    )


class GeminiService:
    def __init__(self):
        if AI_INTEGRATIONS_GEMINI_API_KEY and AI_INTEGRATIONS_GEMINI_BASE_URL:
            self.client = genai.Client(
                api_key=AI_INTEGRATIONS_GEMINI_API_KEY,
                http_options={
                    'api_version': '',
                    'base_url': AI_INTEGRATIONS_GEMINI_BASE_URL
                }
            )
            self.enabled = True
            logger.info("Gemini service initialized with Replit AI Integrations")
        else:
            self.client = None
            self.enabled = False
            logger.warning("Gemini service disabled - missing API key or base URL")
    
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
    
    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=60),
        retry=retry_if_exception(is_rate_limit_error),
        reraise=True
    )
    def _generate_sync(self, prompt: str, system_prompt: str = "", model: str = "gemini-2.5-flash") -> str:
        if not self.client:
            raise Exception("Gemini client not initialized")
        
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        
        response = self.client.models.generate_content(
            model=model,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                temperature=0.5,
                max_output_tokens=8192
            )
        )
        return response.text or ""
    
    async def generate(self, prompt: str, system_prompt: str = "", model: str = "gemini-2.5-flash") -> dict:
        if not self.enabled:
            raise Exception("Gemini service not available")
        
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, self._generate_sync, prompt, system_prompt, model)
        return self._extract_json(text)
    
    async def generate_text(self, prompt: str, system_prompt: str = "", model: str = "gemini-2.5-flash") -> str:
        if not self.enabled:
            raise Exception("Gemini service not available")
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._generate_sync, prompt, system_prompt, model)
    
    def extract_context_summary(self, result: dict, section_type: str) -> str:
        if section_type == "market_research":
            tam = result.get("tam", {})
            sam = result.get("sam", {})
            som = result.get("som", {})
            return f"""
MARKET CONTEXT (from prior analysis):
- TAM: {tam.get('value', 'N/A')} ({tam.get('growth_rate', 'N/A')} CAGR)
- SAM: {sam.get('value', 'N/A')}
- SOM: {som.get('value', 'N/A')} (Year 1 target: {som.get('year_1_target', 'N/A')})
- Market Overview: {result.get('market_overview', 'N/A')[:300]}...
"""
        
        elif section_type == "competitor_discovery":
            direct = result.get("direct_competitors", [])[:3]
            insights = result.get("competitive_insights", {})
            competitors_summary = ", ".join([c.get("name", "Unknown") for c in direct])
            return f"""
COMPETITOR CONTEXT (from prior analysis):
- Key Direct Competitors: {competitors_summary}
- Market Saturation: {insights.get('market_saturation', 'N/A')}
- Common Complaints: {', '.join(insights.get('common_complaints', [])[:3])}
- Market Gaps: {', '.join([g.get('gap', '') for g in result.get('market_gaps', [])[:2]])}
"""
        
        elif section_type == "executive_summary":
            return f"""
EXECUTIVE CONTEXT (from prior analysis):
- One-liner: {result.get('one_liner', 'N/A')}
- Value Proposition: {result.get('value_proposition', 'N/A')}
- Target Customer: {result.get('target_customer', 'N/A')[:200]}...
- Business Model: {result.get('business_model', 'N/A')[:200]}...
- Unfair Advantage: {result.get('unfair_advantage', 'N/A')}
"""
        
        elif section_type == "business_plan":
            return f"""
BUSINESS PLAN CONTEXT (from prior analysis):
- Mission: {result.get('mission_statement', 'N/A')[:150]}...
- Vision: {result.get('vision_statement', 'N/A')[:150]}...
- Pricing Strategy: {result.get('pricing_strategy', {}).get('model', 'N/A')}
"""
        
        elif section_type == "financial_model":
            projections = result.get("five_year_projections", [])
            year1 = projections[0] if projections else {}
            return f"""
FINANCIAL CONTEXT (from prior analysis):
- Year 1 Revenue: {year1.get('revenue', 'N/A')}
- Year 1 Expenses: {year1.get('expenses', 'N/A')}
- Break-even: {result.get('break_even_analysis', {}).get('break_even_timeline', 'N/A')}
- Funding Needed: {result.get('funding_strategy', {}).get('total_needed', 'N/A')}
"""
        
        return ""
    
    async def generate_market_research(self, idea: str, local_context: str = "") -> dict:
        system_prompt = "You are a world-class market research analyst. Provide institutional-quality market intelligence. Return ONLY valid JSON."
        
        prompt = f"""
Analyze this business idea and provide detailed market research.

BUSINESS IDEA: {idea}
{local_context}

Return a JSON object with this EXACT structure:
{{
    "market_overview": "Comprehensive overview of the market landscape",
    "tam": {{
        "value": "$X billion",
        "calculation": "How this was calculated",
        "growth_rate": "X% CAGR",
        "key_drivers": ["Driver 1", "Driver 2", "Driver 3"]
    }},
    "sam": {{
        "value": "$X billion", 
        "calculation": "Specific segment focus",
        "penetration_strategy": "How to capture this market"
    }},
    "som": {{
        "value": "$X million",
        "year_1_target": "Realistic first-year target",
        "assumptions": ["Assumption 1", "Assumption 2"]
    }},
    "market_trends": [
        {{
            "trend": "Trend name",
            "description": "What's happening",
            "impact": "How it affects this business",
            "timeline": "When this peaks"
        }}
    ],
    "customer_segments": [
        {{
            "segment": "Segment name",
            "size": "Market size",
            "needs": ["Need 1", "Need 2"],
            "willingness_to_pay": "Price sensitivity",
            "acquisition_cost": "Estimated CAC"
        }}
    ],
    "regulatory_landscape": {{
        "key_regulations": ["Regulation 1", "Regulation 2"],
        "compliance_requirements": ["Requirement 1", "Requirement 2"],
        "barriers_to_entry": ["Barrier 1", "Barrier 2"]
    }}
}}

Be specific with real numbers and calculations.
Only return valid JSON, no additional text.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_competitor_discovery(self, idea: str, location: dict | None = None) -> dict:
        system_prompt = "You are a competitive intelligence researcher. Find REAL competitors. Return ONLY valid JSON."
        
        location_context = ""
        if location:
            location_context = f"LOCATION: This is a LOCAL business in {location.get('city', '')}, {location.get('state', '')}. Find REAL local competitors."
        
        prompt = f"""
Find REAL competitors for this business.

BUSINESS IDEA: {idea}
{location_context}

Return a JSON object:
{{
    "direct_competitors": [
        {{
            "name": "Business Name",
            "type": "direct",
            "website": "https://example.com",
            "description": "What they do",
            "competitive_advantage": "Their strength",
            "weaknesses": "Where they fall short",
            "pricing": "Price range",
            "review_rating": "X.X/5 stars"
        }}
    ],
    "indirect_competitors": [
        {{
            "name": "Business Name",
            "type": "indirect",
            "description": "What they do",
            "how_they_compete": "Why customers might choose them"
        }}
    ],
    "market_gaps": [
        {{
            "gap": "Unmet need",
            "evidence": "Why it exists",
            "opportunity": "How to exploit"
        }}
    ],
    "competitive_insights": {{
        "total_competitors_found": 0,
        "market_saturation": "Low/Medium/High",
        "common_complaints": ["Complaint 1"],
        "underserved_segments": ["Segment 1"]
    }}
}}

Find 5-10 direct and 3-5 indirect competitors.
Only return valid JSON.
"""
        try:
            return await self.generate(prompt, system_prompt)
        except Exception as e:
            logger.error(f"Competitor discovery failed: {e}")
            return {
                "direct_competitors": [],
                "indirect_competitors": [],
                "market_gaps": [],
                "competitive_insights": {"total_competitors_found": 0, "market_saturation": "Unknown"}
            }
    
    async def generate_executive_summary(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a McKinsey-level business strategist. Return ONLY valid JSON."
        
        prompt = f"""
Create a hyper-detailed executive summary for this business.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "one_liner": "Powerful pitch under 15 words",
    "problem_statement": "The problem being solved",
    "solution_overview": "How this solves it uniquely",
    "target_customer": "Specific customer description",
    "value_proposition": "Unique value competitors can't match",
    "business_model": "How the business makes money",
    "market_opportunity": "Why this is a $1B+ opportunity",
    "traction_potential": "First 90 days milestones",
    "unfair_advantage": "What makes this defensible",
    "key_risks": ["Risk 1 with mitigation", "Risk 2 with mitigation"],
    "success_metrics": {{
        "month_1": ["Metric 1"],
        "month_3": ["Metric 1"],
        "year_1": ["Metric 1"]
    }},
    "why_now": "Timing advantage"
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_business_plan(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a startup strategist. Return ONLY valid JSON."
        
        prompt = f"""
Create a detailed business plan.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "mission_statement": "Why this exists",
    "vision_statement": "Where this goes in 5 years",
    "core_values": ["Value 1", "Value 2", "Value 3"],
    "pricing_strategy": {{
        "model": "Pricing model",
        "tiers": [
            {{"name": "Tier", "price": "$X", "features": ["Feature"]}}
        ],
        "rationale": "Why this pricing works"
    }},
    "unit_economics": {{
        "cac": "$X",
        "ltv": "$X",
        "ltv_cac_ratio": "X:1",
        "payback_period": "X months",
        "gross_margin": "X%"
    }},
    "swot_analysis": {{
        "strengths": ["Strength 1"],
        "weaknesses": ["Weakness 1"],
        "opportunities": ["Opportunity 1"],
        "threats": ["Threat 1"]
    }},
    "product_roadmap": [
        {{"phase": "MVP", "timeline": "Month 1-3", "features": ["Feature 1"]}}
    ]
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_financial_model(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a CFO-level financial analyst. Return ONLY valid JSON."
        
        prompt = f"""
Create detailed financial projections.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "five_year_projections": [
        {{
            "year": 1,
            "revenue": "$X",
            "expenses": "$X",
            "net_income": "$X",
            "headcount": 0,
            "key_milestones": ["Milestone 1"]
        }}
    ],
    "break_even_analysis": {{
        "break_even_timeline": "X months",
        "break_even_revenue": "$X/month",
        "key_assumptions": ["Assumption 1"]
    }},
    "funding_strategy": {{
        "total_needed": "$X",
        "stages": [
            {{"stage": "Pre-seed", "amount": "$X", "use_of_funds": "What it's for"}}
        ],
        "runway_months": 0
    }},
    "scenario_analysis": {{
        "best_case": {{"year_1_revenue": "$X", "assumptions": ["Assumption"]}},
        "base_case": {{"year_1_revenue": "$X", "assumptions": ["Assumption"]}},
        "worst_case": {{"year_1_revenue": "$X", "assumptions": ["Assumption"]}}
    }}
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_competitor_analysis(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a competitive strategist. Return ONLY valid JSON."
        
        prompt = f"""
Provide strategic competitor analysis.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "competitive_landscape": "Overview of competition",
    "differentiation_strategy": {{
        "primary_differentiator": "Main advantage",
        "secondary_differentiators": ["Advantage 1"],
        "positioning_statement": "How to position"
    }},
    "competitive_moats": [
        {{"moat_type": "Type", "description": "What it is", "defensibility": "How defensible"}}
    ],
    "battle_cards": [
        {{
            "competitor": "Name",
            "their_pitch": "What they say",
            "our_counter": "What we say",
            "win_rate_expectation": "X%"
        }}
    ]
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_go_to_market(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a growth marketing expert. Return ONLY valid JSON."
        
        prompt = f"""
Create a go-to-market strategy.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "launch_phases": [
        {{"phase": "Phase 1", "timeline": "Week 1-4", "objectives": ["Objective"], "tactics": ["Tactic"]}}
    ],
    "acquisition_channels": [
        {{"channel": "Channel", "strategy": "How to use", "estimated_cac": "$X", "priority": "High/Medium/Low"}}
    ],
    "first_100_customers": {{
        "target_profile": "Who they are",
        "outreach_strategy": "How to reach them",
        "conversion_tactics": ["Tactic 1"],
        "timeline": "X weeks"
    }},
    "viral_loops": [
        {{"mechanism": "How it works", "viral_coefficient": "X", "implementation": "How to build"}}
    ]
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_team_plan(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are an HR strategist. Return ONLY valid JSON."
        
        prompt = f"""
Create a team and hiring plan.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "founding_team": [
        {{"role": "CEO", "responsibilities": ["Responsibility"], "skills_needed": ["Skill"], "equity_range": "X-X%"}}
    ],
    "hiring_roadmap": [
        {{"quarter": "Q1 Year 1", "hires": [{{"role": "Role", "salary_range": "$X-X", "priority": "Critical"}}]}}
    ],
    "culture_pillars": ["Pillar 1", "Pillar 2"],
    "advisors_needed": [
        {{"expertise": "Area", "value": "What they bring", "compensation": "X% equity"}}
    ]
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_risk_assessment(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a risk management expert. Return ONLY valid JSON."
        
        prompt = f"""
Assess risks for this business.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "risk_score": {{
        "overall": 0,
        "market_risk": 0,
        "execution_risk": 0,
        "financial_risk": 0,
        "competitive_risk": 0
    }},
    "critical_risks": [
        {{"risk": "Risk description", "probability": "High/Medium/Low", "impact": "High/Medium/Low", "mitigation": "How to handle"}}
    ],
    "kill_conditions": ["Condition that means pivot or stop"],
    "contingency_plans": [
        {{"scenario": "What could happen", "response": "What to do", "trigger": "When to act"}}
    ]
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_action_plan(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a startup execution coach. Return ONLY valid JSON."
        
        prompt = f"""
Create a 90-day action plan.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "week_by_week": [
        {{"week": 1, "theme": "Focus area", "tasks": ["Task 1", "Task 2"], "deliverables": ["Deliverable 1"]}}
    ],
    "milestones": [
        {{"day": 30, "milestone": "What's achieved", "success_criteria": "How to measure"}}
    ],
    "resources_needed": [
        {{"resource": "What's needed", "cost": "$X", "when_needed": "Week X"}}
    ],
    "quick_wins": ["Win 1", "Win 2"]
}}

Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)
    
    async def generate_pitch_deck(self, idea: str, context: str = "") -> dict:
        system_prompt = "You are a pitch deck expert. Return ONLY valid JSON."
        
        prompt = f"""
Create pitch deck content.

BUSINESS IDEA: {idea}
{context}

Return JSON:
{{
    "slides": [
        {{"slide_number": 1, "title": "Title", "content": {{"main_point": "Key message"}}, "speaker_notes": "What to say"}}
    ],
    "investor_faqs": [
        {{"question": "Common question", "answer": "Prepared answer"}}
    ],
    "presentation_tips": ["Tip 1", "Tip 2"]
}}

Create 10-12 slides covering: Title, Problem, Solution, Market, Business Model, Traction, Team, Competition, Financials, Ask.
Only return valid JSON.
"""
        return await self.generate(prompt, system_prompt)


gemini_service = GeminiService()
