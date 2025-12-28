import httpx
import json
import logging
import asyncio
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
    
    async def discover_competitors_with_gemini(self, idea: str, location: dict | None = None) -> dict:
        """Use Gemini Flash to discover direct and indirect competitors with real sources."""
        location_context = ""
        if location:
            location_context = f"""
            LOCATION CONTEXT: This is a LOCAL business in {location.get('city', '')}, {location.get('state', '')}.
            Focus on finding REAL local competitors in this specific area.
            Include their actual business names, addresses, websites, and Google/Yelp review information.
            """
        
        prompt = f"""
        You are a competitive intelligence researcher. Find REAL competitors for this business idea.

        BUSINESS IDEA: {idea}
        {location_context}

        IMPORTANT: Provide REAL businesses that actually exist. Include verifiable information with sources.

        Return a JSON object with this EXACT structure:
        {{
            "direct_competitors": [
                {{
                    "name": "Actual Business Name",
                    "type": "direct",
                    "website": "https://their-actual-website.com",
                    "description": "What they do and how they compete directly",
                    "location": "City, State (if local) or 'National/Online'",
                    "competitive_advantage": "What makes them strong",
                    "weaknesses": "Where they fall short",
                    "pricing": "Their pricing model or range if known",
                    "reviews_summary": "Summary of customer reviews if available",
                    "review_rating": "X.X/5 stars (source: Google/Yelp)",
                    "sources": [
                        {{"type": "website", "url": "https://their-website.com"}},
                        {{"type": "google_reviews", "url": "https://www.google.com/maps/place/BUSINESS+NAME"}},
                        {{"type": "yelp", "url": "https://www.yelp.com/biz/business-name-city"}}
                    ]
                }}
            ],
            "indirect_competitors": [
                {{
                    "name": "Actual Business Name",
                    "type": "indirect",
                    "website": "https://their-actual-website.com",
                    "description": "What they do and how they indirectly compete",
                    "location": "City, State or 'National/Online'",
                    "how_they_compete": "How customers might choose them instead",
                    "competitive_advantage": "What makes them strong",
                    "weaknesses": "Where they fall short",
                    "sources": [
                        {{"type": "website", "url": "https://their-website.com"}}
                    ]
                }}
            ],
            "market_gaps": [
                {{
                    "gap": "Specific unmet need in the market",
                    "evidence": "Why this gap exists based on competitor analysis",
                    "opportunity": "How the new business can exploit this"
                }}
            ],
            "competitive_insights": {{
                "total_competitors_found": 0,
                "market_saturation": "Low/Medium/High",
                "average_rating": "X.X/5",
                "common_complaints": ["Complaint 1", "Complaint 2"],
                "underserved_segments": ["Segment 1", "Segment 2"]
            }}
        }}

        Find 5-10 DIRECT competitors and 3-5 INDIRECT competitors.
        All sources must be real, verifiable URLs.
        Only return valid JSON, no additional text.
        """
        try:
            result = await self._call_ai_gemini(prompt)
            
            if not isinstance(result, dict):
                result = {"direct_competitors": [], "indirect_competitors": [], "market_gaps": []}
            if "direct_competitors" not in result:
                result["direct_competitors"] = []
            if "indirect_competitors" not in result:
                result["indirect_competitors"] = []
            if "market_gaps" not in result:
                result["market_gaps"] = []
            if "competitive_insights" not in result:
                result["competitive_insights"] = {
                    "total_competitors_found": len(result.get("direct_competitors", [])) + len(result.get("indirect_competitors", [])),
                    "market_saturation": "Unknown",
                    "average_rating": "N/A",
                    "common_complaints": [],
                    "underserved_segments": []
                }
            
            return result
        except Exception as e:
            logger.error(f"Competitor discovery failed: {e}")
            return {
                "direct_competitors": [],
                "indirect_competitors": [],
                "market_gaps": [],
                "competitive_insights": {
                    "total_competitors_found": 0,
                    "market_saturation": "Unknown",
                    "average_rating": "N/A",
                    "common_complaints": [],
                    "underserved_segments": []
                },
                "error": str(e)
            }
    
    async def _call_ai_gemini(self, prompt: str) -> dict:
        """Use Gemini Flash for competitor discovery - fast and grounded."""
        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "google/gemini-2.0-flash-001",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a competitive intelligence researcher. Return ONLY valid JSON with real business information and verifiable sources. Be accurate and factual."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.3,
                        "max_tokens": 8000
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                content = result["choices"][0]["message"]["content"]
                return self._extract_json(content)
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error (Gemini): {e}")
            raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            logger.error(f"AI generation error (Gemini): {e}")
            raise Exception(f"Failed to generate content: {str(e)}")
    
    async def generate_executive_summary(self, idea: str) -> dict:
        prompt = f"""
        You are a McKinsey-level business strategist. Analyze this business idea and create a hyper-detailed executive summary that would impress a Y Combinator partner.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "one_liner": "A powerful, memorable one-line pitch (under 15 words)",
            "problem_statement": "Clear articulation of the problem being solved and why it matters NOW",
            "solution_overview": "How this business uniquely solves the problem",
            "target_customer": "Specific description of the ideal customer (demographics, psychographics, pain points)",
            "value_proposition": "The unique value this delivers that competitors cannot",
            "business_model": "How the business makes money (revenue streams, pricing strategy)",
            "market_opportunity": "Why this is a $1B+ opportunity with supporting logic",
            "traction_potential": "What early traction would look like in first 90 days",
            "unfair_advantage": "What makes this defensible (network effects, data moats, expertise, etc.)",
            "key_risks": ["Risk 1 with mitigation", "Risk 2 with mitigation", "Risk 3 with mitigation"],
            "success_metrics": {{
                "month_1": ["Metric 1", "Metric 2"],
                "month_3": ["Metric 1", "Metric 2"],
                "month_6": ["Metric 1", "Metric 2"],
                "year_1": ["Metric 1", "Metric 2"]
            }},
            "why_now": "The timing advantage - market trends making this the right moment"
        }}

        Be specific, actionable, and data-driven. No generic advice.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_market_research(self, idea: str) -> dict:
        prompt = f"""
        You are a world-class market research analyst. Provide institutional-quality market intelligence for this business.

        BUSINESS IDEA: {idea}

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
                    "impact": "How this benefits/threatens the business",
                    "timeframe": "When this peaks"
                }}
            ],
            "customer_segments": [
                {{
                    "segment_name": "Name",
                    "size": "Market size",
                    "pain_points": ["Pain 1", "Pain 2"],
                    "willingness_to_pay": "Price sensitivity",
                    "acquisition_channels": ["Channel 1", "Channel 2"],
                    "priority": "High/Medium/Low"
                }}
            ],
            "regulatory_landscape": {{
                "current_regulations": ["Regulation 1", "Regulation 2"],
                "upcoming_changes": ["Change 1"],
                "compliance_requirements": ["Requirement 1"],
                "risk_level": "Low/Medium/High"
            }},
            "market_timing": {{
                "readiness_score": "1-10 rating",
                "catalysts": ["What's driving adoption now"],
                "headwinds": ["What could slow growth"],
                "window_of_opportunity": "Timeline for market entry"
            }}
        }}

        Use realistic market data and logical estimates. Be specific with numbers.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_business_plan(self, idea: str) -> dict:
        prompt = f"""
        You are a serial entrepreneur who has built multiple successful companies. Create a battle-tested business plan.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "executive_summary": "Compelling 2-3 sentence summary",
            "mission": "Purpose-driven mission statement",
            "vision": "Ambitious 10-year vision",
            "core_values": ["Value 1", "Value 2", "Value 3"],
            "business_model": {{
                "type": "SaaS/Marketplace/E-commerce/etc.",
                "revenue_streams": [
                    {{
                        "stream": "Revenue type",
                        "description": "How it works",
                        "percentage_of_revenue": "X%",
                        "margin": "X%"
                    }}
                ],
                "pricing_strategy": {{
                    "model": "Freemium/Subscription/Usage-based/etc.",
                    "tiers": [
                        {{"name": "Tier name", "price": "$X/month", "features": ["F1", "F2"], "target_customer": "Who"}}
                    ],
                    "pricing_psychology": "Why this pricing works"
                }},
                "unit_economics": {{
                    "cac": "$X",
                    "ltv": "$X",
                    "ltv_cac_ratio": "X:1",
                    "payback_period": "X months",
                    "gross_margin": "X%"
                }}
            }},
            "product_roadmap": {{
                "mvp_features": ["Feature 1", "Feature 2", "Feature 3"],
                "phase_2": ["Feature 4", "Feature 5"],
                "phase_3": ["Feature 6", "Feature 7"],
                "moat_features": ["Defensibility feature 1", "Defensibility feature 2"]
            }},
            "go_to_market": {{
                "launch_strategy": "How to launch",
                "initial_channels": [
                    {{
                        "channel": "Channel name",
                        "strategy": "Specific tactics",
                        "expected_cac": "$X",
                        "priority": "High/Medium/Low"
                    }}
                ],
                "partnerships": ["Potential partner 1", "Potential partner 2"],
                "first_100_customers": "Specific strategy to get first 100 customers"
            }},
            "operations": {{
                "tech_stack": ["Technology 1", "Technology 2"],
                "key_processes": ["Process 1", "Process 2"],
                "tools_needed": ["Tool 1", "Tool 2"],
                "automation_opportunities": ["Automation 1", "Automation 2"]
            }},
            "swot_analysis": {{
                "strengths": ["Strength 1", "Strength 2", "Strength 3"],
                "weaknesses": ["Weakness 1", "Weakness 2"],
                "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
                "threats": ["Threat 1", "Threat 2"]
            }}
        }}

        Be specific and actionable. No generic advice.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_financial_model(self, idea: str) -> dict:
        prompt = f"""
        You are a CFO who has taken companies from $0 to IPO. Build a sophisticated financial model.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "assumptions": {{
                "market_size": "$X billion TAM",
                "target_market_share": "X% in 5 years",
                "avg_revenue_per_user": "$X/month",
                "customer_growth_rate": "X% monthly",
                "churn_rate": "X% monthly",
                "gross_margin": "X%",
                "operating_margin_target": "X%"
            }},
            "projections": [
                {{
                    "year": 1,
                    "revenue": 0,
                    "customers": 0,
                    "arr": 0,
                    "mrr": 0,
                    "cogs": 0,
                    "gross_profit": 0,
                    "operating_expenses": 0,
                    "ebitda": 0,
                    "burn_rate": 0,
                    "headcount": 0
                }},
                {{
                    "year": 2,
                    "revenue": 0,
                    "customers": 0,
                    "arr": 0,
                    "mrr": 0,
                    "cogs": 0,
                    "gross_profit": 0,
                    "operating_expenses": 0,
                    "ebitda": 0,
                    "burn_rate": 0,
                    "headcount": 0
                }},
                {{
                    "year": 3,
                    "revenue": 0,
                    "customers": 0,
                    "arr": 0,
                    "mrr": 0,
                    "cogs": 0,
                    "gross_profit": 0,
                    "operating_expenses": 0,
                    "ebitda": 0,
                    "burn_rate": 0,
                    "headcount": 0
                }},
                {{
                    "year": 4,
                    "revenue": 0,
                    "customers": 0,
                    "arr": 0,
                    "mrr": 0,
                    "cogs": 0,
                    "gross_profit": 0,
                    "operating_expenses": 0,
                    "ebitda": 0,
                    "burn_rate": 0,
                    "headcount": 0
                }},
                {{
                    "year": 5,
                    "revenue": 0,
                    "customers": 0,
                    "arr": 0,
                    "mrr": 0,
                    "cogs": 0,
                    "gross_profit": 0,
                    "operating_expenses": 0,
                    "ebitda": 0,
                    "burn_rate": 0,
                    "headcount": 0
                }}
            ],
            "break_even": {{
                "month": 0,
                "revenue_needed": 0,
                "customers_needed": 0,
                "assumptions": "Key assumptions for break-even"
            }},
            "funding_strategy": {{
                "pre_seed": {{
                    "amount": "$X",
                    "timing": "When",
                    "use_of_funds": ["Use 1", "Use 2", "Use 3"],
                    "milestones_to_hit": ["Milestone 1", "Milestone 2"]
                }},
                "seed": {{
                    "amount": "$X",
                    "timing": "When",
                    "use_of_funds": ["Use 1", "Use 2"],
                    "milestones_to_hit": ["Milestone 1", "Milestone 2"]
                }},
                "series_a": {{
                    "amount": "$X",
                    "timing": "When",
                    "metrics_needed": ["Metric 1", "Metric 2"]
                }}
            }},
            "key_metrics": {{
                "north_star_metric": "The one metric that matters most",
                "leading_indicators": ["Indicator 1", "Indicator 2"],
                "lagging_indicators": ["Indicator 1", "Indicator 2"],
                "health_metrics": ["Metric 1", "Metric 2"]
            }},
            "scenario_analysis": {{
                "best_case": {{
                    "year_5_revenue": 0,
                    "assumptions": "What has to go right"
                }},
                "base_case": {{
                    "year_5_revenue": 0,
                    "assumptions": "Realistic expectations"
                }},
                "worst_case": {{
                    "year_5_revenue": 0,
                    "assumptions": "What could go wrong"
                }}
            }}
        }}

        Use realistic numbers based on industry benchmarks. Fill in actual numeric values.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_competitor_analysis(self, idea: str) -> dict:
        prompt = f"""
        You are a competitive intelligence expert. Provide institutional-grade competitor analysis.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "competitive_landscape": "Overview of the competitive environment",
            "competitors": [
                {{
                    "name": "Competitor Name",
                    "type": "Direct/Indirect/Potential",
                    "description": "What they do",
                    "founded": "Year",
                    "funding": "$X raised",
                    "estimated_revenue": "$X ARR",
                    "team_size": "X employees",
                    "strengths": ["Strength 1", "Strength 2"],
                    "weaknesses": ["Weakness 1", "Weakness 2"],
                    "pricing": "Their pricing model",
                    "target_market": "Who they target",
                    "market_share": "Estimated %",
                    "threat_level": "High/Medium/Low"
                }}
            ],
            "competitive_matrix": {{
                "criteria": ["Price", "Features", "UX", "Support", "Integration"],
                "your_position": [1, 1, 1, 1, 1],
                "competitor_1": [1, 1, 1, 1, 1],
                "competitor_2": [1, 1, 1, 1, 1],
                "competitor_3": [1, 1, 1, 1, 1]
            }},
            "differentiation": {{
                "primary_differentiator": "Main thing that sets you apart",
                "secondary_differentiators": ["Differentiator 1", "Differentiator 2"],
                "positioning_statement": "How to position against competitors",
                "messaging_angles": ["Angle 1", "Angle 2", "Angle 3"]
            }},
            "competitive_moats": {{
                "current_moats": ["Moat 1"],
                "moats_to_build": ["Moat 1", "Moat 2"],
                "timeline": "How long to build defensibility"
            }},
            "battle_cards": [
                {{
                    "competitor": "Competitor name",
                    "when_you_win": "Situations where you win",
                    "when_they_win": "Situations where they win",
                    "key_objections": ["Objection 1"],
                    "counter_points": ["Counter 1"]
                }}
            ],
            "market_gaps": ["Gap 1", "Gap 2", "Gap 3"],
            "disruption_opportunities": ["Opportunity 1", "Opportunity 2"]
        }}

        Be specific with competitor names and realistic data.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_go_to_market(self, idea: str) -> dict:
        prompt = f"""
        You are a growth expert who has scaled multiple startups. Create a comprehensive go-to-market strategy.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "strategy_overview": "High-level GTM approach",
            "launch_phases": [
                {{
                    "phase": "Phase 1: MVP Launch",
                    "duration": "Weeks 1-4",
                    "goals": ["Goal 1", "Goal 2"],
                    "tactics": ["Tactic 1", "Tactic 2"],
                    "success_metrics": ["Metric 1", "Metric 2"],
                    "budget": "$X"
                }},
                {{
                    "phase": "Phase 2: Early Traction",
                    "duration": "Months 2-3",
                    "goals": ["Goal 1", "Goal 2"],
                    "tactics": ["Tactic 1", "Tactic 2"],
                    "success_metrics": ["Metric 1", "Metric 2"],
                    "budget": "$X"
                }},
                {{
                    "phase": "Phase 3: Scale",
                    "duration": "Months 4-12",
                    "goals": ["Goal 1", "Goal 2"],
                    "tactics": ["Tactic 1", "Tactic 2"],
                    "success_metrics": ["Metric 1", "Metric 2"],
                    "budget": "$X"
                }}
            ],
            "acquisition_channels": [
                {{
                    "channel": "Channel name",
                    "type": "Paid/Organic/Viral",
                    "expected_cac": "$X",
                    "volume_potential": "High/Medium/Low",
                    "time_to_results": "X weeks",
                    "specific_tactics": ["Tactic 1", "Tactic 2"],
                    "tools_needed": ["Tool 1"],
                    "priority": 1
                }}
            ],
            "content_strategy": {{
                "pillars": ["Pillar 1", "Pillar 2", "Pillar 3"],
                "content_types": ["Type 1", "Type 2"],
                "distribution_channels": ["Channel 1", "Channel 2"],
                "posting_frequency": "X times per week",
                "seo_keywords": ["Keyword 1", "Keyword 2", "Keyword 3"]
            }},
            "partnership_strategy": {{
                "partner_types": ["Type 1", "Type 2"],
                "target_partners": ["Partner 1", "Partner 2"],
                "value_proposition": "What you offer partners",
                "deal_structure": "How partnerships work"
            }},
            "first_100_customers": {{
                "strategy": "Detailed approach",
                "week_1_actions": ["Action 1", "Action 2", "Action 3"],
                "week_2_actions": ["Action 1", "Action 2"],
                "week_3_actions": ["Action 1", "Action 2"],
                "week_4_actions": ["Action 1", "Action 2"],
                "expected_conversion_rate": "X%"
            }},
            "viral_loops": [
                {{
                    "mechanism": "How virality works",
                    "viral_coefficient": "Expected K-factor",
                    "implementation": "How to build it"
                }}
            ],
            "pricing_experiments": ["Experiment 1", "Experiment 2"],
            "launch_checklist": [
                {{"item": "Task 1", "owner": "Role", "deadline": "When", "status": "pending"}},
                {{"item": "Task 2", "owner": "Role", "deadline": "When", "status": "pending"}}
            ]
        }}

        Be extremely specific and actionable. Include real tactics that work.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_team_plan(self, idea: str) -> dict:
        prompt = f"""
        You are an expert startup advisor who has helped build founding teams. Create a comprehensive team-building plan.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "founding_team": {{
                "ideal_composition": ["Role 1", "Role 2"],
                "critical_skills": ["Skill 1", "Skill 2", "Skill 3"],
                "founder_archetypes": ["Archetype 1", "Archetype 2"],
                "equity_split_guidance": "How to think about equity"
            }},
            "hiring_roadmap": [
                {{
                    "phase": "Phase 1: Pre-funding",
                    "timeline": "Months 1-6",
                    "hires": [
                        {{
                            "role": "Role title",
                            "priority": "Critical/Important/Nice-to-have",
                            "salary_range": "$X-$Y",
                            "equity_range": "X-Y%",
                            "key_responsibilities": ["Resp 1", "Resp 2"],
                            "must_have_skills": ["Skill 1", "Skill 2"],
                            "where_to_find": ["Source 1", "Source 2"]
                        }}
                    ],
                    "total_headcount": 0,
                    "monthly_burn": "$X"
                }},
                {{
                    "phase": "Phase 2: Post-seed",
                    "timeline": "Months 7-18",
                    "hires": [
                        {{
                            "role": "Role title",
                            "priority": "Critical/Important/Nice-to-have",
                            "salary_range": "$X-$Y",
                            "equity_range": "X-Y%",
                            "key_responsibilities": ["Resp 1"],
                            "must_have_skills": ["Skill 1"],
                            "where_to_find": ["Source 1"]
                        }}
                    ],
                    "total_headcount": 0,
                    "monthly_burn": "$X"
                }},
                {{
                    "phase": "Phase 3: Series A",
                    "timeline": "Months 19-36",
                    "hires": [
                        {{
                            "role": "Role title",
                            "priority": "Critical/Important/Nice-to-have",
                            "salary_range": "$X-$Y",
                            "equity_range": "X-Y%",
                            "key_responsibilities": ["Resp 1"],
                            "must_have_skills": ["Skill 1"],
                            "where_to_find": ["Source 1"]
                        }}
                    ],
                    "total_headcount": 0,
                    "monthly_burn": "$X"
                }}
            ],
            "org_structure": {{
                "initial": "Flat structure description",
                "at_10_people": "Structure description",
                "at_50_people": "Structure description"
            }},
            "culture": {{
                "core_values": ["Value 1", "Value 2", "Value 3"],
                "working_style": "Remote/Hybrid/In-office and why",
                "communication_tools": ["Tool 1", "Tool 2"],
                "rituals": ["Weekly standup", "Monthly all-hands"]
            }},
            "advisors_needed": [
                {{
                    "area": "Area of expertise",
                    "why_needed": "What they bring",
                    "ideal_profile": "Who to look for",
                    "compensation": "X% equity"
                }}
            ],
            "contractor_strategy": {{
                "roles_to_outsource": ["Role 1", "Role 2"],
                "platforms_to_use": ["Platform 1", "Platform 2"],
                "budget_allocation": "$X/month"
            }}
        }}

        Be specific with compensation and realistic hiring timelines.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_risk_assessment(self, idea: str) -> dict:
        prompt = f"""
        You are a risk management expert. Provide a comprehensive risk assessment with mitigation strategies.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "risk_overview": "High-level risk assessment",
            "risk_score": {{
                "overall": 1,
                "market_risk": 1,
                "execution_risk": 1,
                "financial_risk": 1,
                "competitive_risk": 1,
                "regulatory_risk": 1
            }},
            "critical_risks": [
                {{
                    "risk": "Risk description",
                    "category": "Market/Execution/Financial/Competitive/Regulatory",
                    "probability": "High/Medium/Low",
                    "impact": "High/Medium/Low",
                    "risk_score": 1,
                    "mitigation_strategy": "How to mitigate",
                    "contingency_plan": "What to do if it happens",
                    "early_warning_signs": ["Sign 1", "Sign 2"],
                    "owner": "Who should monitor this"
                }}
            ],
            "assumptions_to_validate": [
                {{
                    "assumption": "What we're assuming",
                    "validation_method": "How to test it",
                    "timeline": "When to validate",
                    "pivot_trigger": "What would make us pivot"
                }}
            ],
            "kill_conditions": [
                {{
                    "condition": "When to shut down",
                    "metrics": "What metrics indicate this",
                    "timeline": "How long to wait before deciding"
                }}
            ],
            "insurance_needs": ["Insurance type 1", "Insurance type 2"],
            "legal_risks": {{
                "intellectual_property": "IP considerations",
                "liability": "Liability exposure",
                "compliance": "Compliance requirements",
                "contracts_needed": ["Contract 1", "Contract 2"]
            }},
            "scenario_planning": {{
                "recession_impact": "How recession affects business",
                "competitor_response": "How competitors might respond",
                "tech_disruption": "Technology risks",
                "regulatory_change": "Potential regulatory impacts"
            }}
        }}

        Be thorough and realistic about risks. Don't sugarcoat.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_action_plan(self, idea: str) -> dict:
        prompt = f"""
        You are a startup execution expert. Create a detailed 90-day action plan to launch this business.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "overview": "What success looks like in 90 days",
            "week_by_week": [
                {{
                    "week": 1,
                    "theme": "Week theme",
                    "goals": ["Goal 1", "Goal 2"],
                    "tasks": [
                        {{
                            "task": "Specific task",
                            "category": "Product/Marketing/Sales/Operations/Legal",
                            "time_estimate": "X hours",
                            "priority": "P1/P2/P3",
                            "deliverable": "What's produced"
                        }}
                    ],
                    "milestone": "What's achieved by end of week"
                }},
                {{
                    "week": 2,
                    "theme": "Week theme",
                    "goals": ["Goal 1", "Goal 2"],
                    "tasks": [
                        {{
                            "task": "Specific task",
                            "category": "Product/Marketing/Sales/Operations/Legal",
                            "time_estimate": "X hours",
                            "priority": "P1/P2/P3",
                            "deliverable": "What's produced"
                        }}
                    ],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 3,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 4,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 5,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 6,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 7,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 8,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 9,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 10,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 11,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }},
                {{
                    "week": 12,
                    "theme": "Week theme",
                    "goals": ["Goal 1"],
                    "tasks": [{{"task": "Task", "category": "Product", "time_estimate": "X hours", "priority": "P1", "deliverable": "Output"}}],
                    "milestone": "What's achieved"
                }}
            ],
            "key_milestones": {{
                "day_30": ["Milestone 1", "Milestone 2"],
                "day_60": ["Milestone 1", "Milestone 2"],
                "day_90": ["Milestone 1", "Milestone 2"]
            }},
            "quick_wins": [
                {{
                    "action": "Quick win action",
                    "impact": "Why it matters",
                    "time_required": "X hours",
                    "when": "Day X"
                }}
            ],
            "resources_needed": {{
                "tools": [
                    {{
                        "tool": "Tool name",
                        "purpose": "What for",
                        "cost": "$X/month",
                        "priority": "Must-have/Nice-to-have"
                    }}
                ],
                "budget": {{
                    "month_1": "$X",
                    "month_2": "$X",
                    "month_3": "$X",
                    "breakdown": {{
                        "product": "$X",
                        "marketing": "$X",
                        "operations": "$X",
                        "legal": "$X"
                    }}
                }},
                "time_commitment": "X hours per week"
            }},
            "dependencies": ["Dependency 1", "Dependency 2"],
            "blockers_to_watch": ["Potential blocker 1", "Potential blocker 2"]
        }}

        Be extremely specific and actionable. Every task should be something the founder can execute.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_pitch_deck(self, idea: str) -> dict:
        prompt = f"""
        You are a pitch deck expert who has helped raise over $1B in venture capital. Create an investor-ready pitch deck outline.

        BUSINESS IDEA: {idea}

        Return a JSON object with this EXACT structure:
        {{
            "deck_strategy": "Overall narrative approach",
            "slides": [
                {{
                    "slide_number": 1,
                    "title": "Cover",
                    "purpose": "First impression",
                    "content": {{
                        "headline": "Compelling company description",
                        "tagline": "One-liner",
                        "visual": "Logo + minimal design"
                    }},
                    "speaker_notes": "What to say",
                    "time": "30 seconds"
                }},
                {{
                    "slide_number": 2,
                    "title": "The Problem",
                    "purpose": "Create urgency",
                    "content": {{
                        "headline": "Problem statement",
                        "key_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
                        "stat": "Compelling statistic",
                        "visual": "Suggested visual"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1 minute"
                }},
                {{
                    "slide_number": 3,
                    "title": "The Solution",
                    "purpose": "Show the answer",
                    "content": {{
                        "headline": "Solution statement",
                        "key_points": ["Benefit 1", "Benefit 2", "Benefit 3"],
                        "demo_suggestion": "What to show",
                        "visual": "Product screenshot or mockup"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1-2 minutes"
                }},
                {{
                    "slide_number": 4,
                    "title": "Market Opportunity",
                    "purpose": "Show the size",
                    "content": {{
                        "tam": "$X",
                        "sam": "$X",
                        "som": "$X",
                        "growth_rate": "X%",
                        "visual": "Market size visualization"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1 minute"
                }},
                {{
                    "slide_number": 5,
                    "title": "Business Model",
                    "purpose": "How you make money",
                    "content": {{
                        "revenue_streams": ["Stream 1", "Stream 2"],
                        "pricing": "Pricing structure",
                        "unit_economics": "LTV/CAC",
                        "visual": "Revenue model diagram"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1 minute"
                }},
                {{
                    "slide_number": 6,
                    "title": "Traction",
                    "purpose": "Prove momentum",
                    "content": {{
                        "metrics": ["Metric 1", "Metric 2"],
                        "growth_rate": "X% MoM",
                        "notable_customers": ["Customer 1"],
                        "visual": "Growth chart"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1 minute"
                }},
                {{
                    "slide_number": 7,
                    "title": "Competition",
                    "purpose": "Show awareness",
                    "content": {{
                        "positioning": "Your unique position",
                        "differentiators": ["Diff 1", "Diff 2"],
                        "visual": "Competitive matrix"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1 minute"
                }},
                {{
                    "slide_number": 8,
                    "title": "Team",
                    "purpose": "Why you can win",
                    "content": {{
                        "founders": ["Founder 1 bio", "Founder 2 bio"],
                        "relevant_experience": "Why you're uniquely qualified",
                        "advisors": ["Advisor 1"],
                        "visual": "Team photos"
                    }},
                    "speaker_notes": "What to say",
                    "time": "1 minute"
                }},
                {{
                    "slide_number": 9,
                    "title": "The Ask",
                    "purpose": "What you need",
                    "content": {{
                        "amount": "$X",
                        "use_of_funds": ["Use 1 - X%", "Use 2 - X%", "Use 3 - X%"],
                        "milestones": ["What you'll achieve"],
                        "visual": "Pie chart of use of funds"
                    }},
                    "speaker_notes": "What to say",
                    "time": "30 seconds"
                }},
                {{
                    "slide_number": 10,
                    "title": "Vision",
                    "purpose": "End with inspiration",
                    "content": {{
                        "vision_statement": "Where this goes",
                        "call_to_action": "Next steps",
                        "contact": "How to reach you"
                    }},
                    "speaker_notes": "What to say",
                    "time": "30 seconds"
                }}
            ],
            "appendix_slides": [
                "Detailed financials",
                "Product roadmap",
                "Customer testimonials",
                "Technical architecture"
            ],
            "investor_faqs": [
                {{
                    "question": "Common question 1",
                    "answer": "Prepared answer"
                }},
                {{
                    "question": "Common question 2",
                    "answer": "Prepared answer"
                }},
                {{
                    "question": "Common question 3",
                    "answer": "Prepared answer"
                }}
            ],
            "presentation_tips": ["Tip 1", "Tip 2", "Tip 3"]
        }}

        Make the content compelling and investor-ready.
        Only return valid JSON, no additional text.
        """
        return await self._call_ai(prompt)
    
    async def generate_discovery_questions(self, idea: str, previous_answers: dict | None = None, exclude_categories: list | None = None) -> dict:
        context_section = ""
        if previous_answers and len(previous_answers) > 0:
            context_section = "\n\nPREVIOUS ANSWERS (use these to ask smarter follow-up questions, DO NOT repeat these topics):\n"
            for q_id, answer_data in previous_answers.items():
                if isinstance(answer_data, dict):
                    context_section += f"- {answer_data.get('question', '')}: {answer_data.get('answer', '')}\n"
        
        exclude_section = ""
        if exclude_categories:
            exclude_section = f"\n\nDO NOT ask about these categories (already covered): {', '.join(exclude_categories)}\n"
        
        prompt = f"""
        You are a brilliant startup advisor using the MECE (Mutually Exclusive, Collectively Exhaustive) framework. Your questions should cover ALL critical business dimensions without overlap.

        BUSINESS IDEA: {idea}
        {context_section}
        {exclude_section}

        MECE FRAMEWORK - Cover these 4 dimensions (pick the most relevant questions for THIS specific business):
        
        1. GEOGRAPHIC DIMENSION (ASK THIS FIRST if location is unclear):
           - CRITICAL: If the business name or idea could apply to multiple locations, ALWAYS ask "Where will this business operate?" as the FIRST question
           - Service area: Which city/region will you serve?
           - Local requirements: Any location-specific regulations, licenses, or needs?
           - Physical presence: Storefront, home-based, fully remote?
           
        2. FINANCIAL DIMENSION (Mutually Exclusive):
           - Funding needs: How much capital to start? Bootstrap vs investors?
           - Revenue expectations: First-year revenue target?
           - Pricing model: Subscription vs one-time? Premium vs value?
           
        3. HUMAN DIMENSION (Mutually Exclusive):
           - Founder expertise: Your background and key skills?
           - Team needs: Solo founder or need co-founders/hires?
           - Knowledge gaps: What skills do you need to acquire or hire?
           
        4. MARKET DIMENSION (Mutually Exclusive):
           - Target customers: B2B or B2C? Who is the ideal first customer?
           - Competitive positioning: Premium, value, or disruptor?
           - Differentiation: What makes you 10x better than alternatives?

        QUESTION DESIGN RULES:
        1. IF the business idea does NOT mention a specific city/state/country, the FIRST question MUST ask about location
        2. NEVER ask generic questions - tailor every question to THIS specific business
        3. Options should reflect real industry knowledge (actual price points, realistic timelines)
        4. Make options SPECIFIC: "$5K-15K (bootstrapped)" not just "Small budget"
        5. Always include "Other (please specify)" and "I don't know" as final options
        6. Each question should unlock strategic insights, not just collect data

        Return a JSON object with this EXACT structure:
        {{
            "analysis": "2-sentence analysis of the idea's potential and key strategic questions to answer",
            "questions": [
                {{
                    "id": "q1",
                    "question": "Specific, contextual question text",
                    "why_important": "Strategic reason why this matters for success",
                    "category": "funding|investment|pricing|location|local_needs|expertise|team|target_customer|competition|differentiation|timeline|business_model",
                    "mece_dimension": "financial|geographic|human|market",
                    "options": [
                        {{"value": "opt_1", "label": "Specific option with context"}},
                        {{"value": "opt_2", "label": "Another realistic option"}},
                        {{"value": "opt_3", "label": "Third smart option"}},
                        {{"value": "opt_4", "label": "Fourth option if needed"}},
                        {{"value": "other", "label": "Other (please specify)"}},
                        {{"value": "unknown", "label": "I don't know"}}
                    ],
                    "allow_custom_input": true
                }}
            ]
        }}

        Generate 4-5 HIGH-QUALITY questions that cover different MECE dimensions.
        Prioritize: funding needs, local requirements, founder expertise, and target customers.
        Only return valid JSON, no additional text.
        """
        result = await self._call_ai_fast(prompt)
        
        if "questions" in result:
            for question in result["questions"]:
                if "options" in question and isinstance(question["options"], list):
                    has_other = any(opt.get("value") == "other" for opt in question["options"] if isinstance(opt, dict))
                    has_unknown = any(opt.get("value") == "unknown" for opt in question["options"] if isinstance(opt, dict))
                    
                    if not has_other:
                        question["options"].append({"value": "other", "label": "Other (please specify)"})
                    if not has_unknown:
                        question["options"].append({"value": "unknown", "label": "I don't know"})
        
        return result

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
    
    async def _call_ai_fast(self, prompt: str) -> dict:
        """Use Gemini Flash for faster responses on simpler tasks like question generation."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json={
                        "model": "google/gemini-2.0-flash-001",
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a startup advisor. Return ONLY valid JSON with no markdown formatting or code blocks. Be specific and actionable."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    }
                )
                
                response.raise_for_status()
                result = response.json()
                
                content = result["choices"][0]["message"]["content"]
                return self._extract_json(content)
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error (fast): {e}")
            raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
        except Exception as e:
            logger.error(f"AI generation error (fast): {e}")
            raise Exception(f"Failed to generate content: {str(e)}")
    
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
                                "content": "You are a world-class business strategist and startup advisor with experience at McKinsey, YC, and top VC firms. Return ONLY valid JSON with no markdown formatting, no code blocks, and no additional text. Ensure all strings are properly escaped. Be specific, data-driven, and actionable."
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.5,
                        "max_tokens": 16000
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
