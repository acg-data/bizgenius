import { v } from "convex/values";
import { action, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Primary model for best accuracy
const PRIMARY_MODEL = "anthropic/claude-3.5-sonnet";
// Fallback for speed/cost
const FALLBACK_MODEL = "openai/gpt-4o-mini";
// Ultra-fast model for instant responses (questions, suggestions)
const FAST_MODEL = "openai/gpt-oss-120b"; // Fast + high quality

// 8-Section generation order (Tony's Tacos template)
const SECTION_ORDER = [
  { id: "market", name: "Market Research", maxTokens: 2500 },
  { id: "customers", name: "Customer Profiles", maxTokens: 2500 },
  { id: "competitors", name: "Competitor Landscape", maxTokens: 2500 },
  { id: "businessPlan", name: "Business Plan", maxTokens: 2500 },
  { id: "goToMarket", name: "Go-To-Market", maxTokens: 2500 },
  { id: "financial", name: "Financial Model", maxTokens: 3000 },
  { id: "pitchDeck", name: "Pitch Deck", maxTokens: 3500 },
  { id: "team", name: "Team & Operations", maxTokens: 2000 },
] as const;

type SectionId = typeof SECTION_ORDER[number]["id"];

interface GenerationContext {
  businessIdea: string;
  answers: Record<string, any>;
  previousSections: Record<string, any>;
}

// Main generation entry point - called by sessions.ts
export const runGeneration = internalAction({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get session data
    const session = await ctx.runQuery(internal.ai.getSessionInternal, {
      sessionId: args.sessionId,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    // Update status to generating
    await ctx.runMutation(internal.sessions.updateSessionStatus, {
      sessionId: args.sessionId,
      status: "generating",
      currentStep: "market",
      progress: 0,
    });

    const context: GenerationContext = {
      businessIdea: session.businessIdea,
      answers: session.answers || {},
      previousSections: {},
    };

    const result: Record<string, any> = {};

    try {
      for (let i = 0; i < SECTION_ORDER.length; i++) {
        const section = SECTION_ORDER[i];
        const progress = Math.round(((i + 1) / SECTION_ORDER.length) * 100);

        // Update progress
        await ctx.runMutation(internal.sessions.updateSessionStatus, {
          sessionId: args.sessionId,
          currentStep: section.id,
          progress: Math.round((i / SECTION_ORDER.length) * 100),
        });

        // Generate section with retry logic
        const sectionResult = await generateSectionWithRetry(
          section.id,
          section.maxTokens,
          context,
          3 // max retries
        );

        // Store result and add to context for next sections
        result[section.id] = sectionResult;
        context.previousSections[section.id] = sectionResult;
      }

      // Mark completed with full result
      await ctx.runMutation(internal.sessions.updateSessionStatus, {
        sessionId: args.sessionId,
        status: "completed",
        progress: 100,
        result: result,
      });
    } catch (error: any) {
      console.error("Generation failed:", error);
      await ctx.runMutation(internal.sessions.updateSessionStatus, {
        sessionId: args.sessionId,
        status: "failed",
        errorMessage: error.message || "Generation failed. Please try again.",
      });
    }
  },
});

// Internal query to get session (used by runGeneration)
export const getSessionInternal = internalQuery({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generationSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

// Generate a single section with retry logic
async function generateSectionWithRetry(
  sectionId: SectionId,
  maxTokens: number,
  context: GenerationContext,
  maxRetries: number
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Use primary model first, fallback on retry
      const model = attempt === 0 ? PRIMARY_MODEL : FALLBACK_MODEL;
      return await generateSection(sectionId, maxTokens, context, model);
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed for ${sectionId}:`, error.message);
      // Exponential backoff: 1s, 2s, 4s
      await sleep(1000 * Math.pow(2, attempt));
    }
  }

  throw lastError || new Error(`Failed to generate ${sectionId} after ${maxRetries} attempts`);
}

// Core generation function
async function generateSection(
  sectionId: SectionId,
  maxTokens: number,
  context: GenerationContext,
  model: string
): Promise<any> {
  const systemPrompt = getSystemPrompt(sectionId);
  const userPrompt = buildUserPrompt(sectionId, context);

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.SITE_URL || "https://bizgenius.app",
      "X-Title": "BizGenius",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from AI model");
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${content.substring(0, 200)}`);
  }
}

// System prompts for each section
function getSystemPrompt(sectionId: SectionId): string {
  const prompts: Record<SectionId, string> = {
    market: `You are an expert market research analyst with deep expertise in TAM/SAM/SOM analysis.
Your job is to provide realistic, data-driven market analysis with specific numbers.
Always respond with valid JSON matching the exact structure requested.
Be specific with numbers and cite realistic market data based on industry benchmarks.`,

    customers: `You are a customer research specialist who creates detailed buyer personas.
Your personas should feel like real people with names, specific demographics, and psychographic details.
Always respond with valid JSON. Include vivid "day in the life" narratives.
Create 3 distinct customer personas that represent different segments.`,

    competitors: `You are a competitive intelligence analyst who creates thorough competitor landscapes.
You analyze positioning, identify gaps, and assess competitive dynamics.
Always respond with valid JSON. Include a 2x2 positioning matrix with realistic competitor placements.
Create a comprehensive SWOT analysis based on the market and competitive context.`,

    businessPlan: `You are a business strategist who creates executable business plans.
Focus on vision, mission, quarterly roadmaps, and operational details.
Always respond with valid JSON. Include realistic supply chain considerations.
Plans should be specific enough to execute, not generic platitudes.`,

    goToMarket: `You are a go-to-market strategist who designs customer acquisition strategies.
Focus on CAC, LTV, channel strategy, and launch phases.
Always respond with valid JSON. Include viral mechanics and referral strategies.
Be specific about budgets, expected ROI, and timeline for each channel.`,

    financial: `You are a financial analyst who creates realistic 5-year financial projections.
Use industry benchmarks for margins, growth rates, and unit economics.
Always respond with valid JSON. Include detailed P&L projections.
Be conservative in Year 1, then show realistic growth trajectory.`,

    pitchDeck: `You are a pitch deck consultant who has helped raise billions in funding.
Create compelling 10-slide investor narratives with speaker notes.
Always respond with valid JSON. Each slide should tell part of the story.
Include visual suggestions for each slide to guide presentation design.`,

    team: `You are an organizational design consultant who plans optimal team structures.
Define founder roles, hiring priorities, and operational partnerships.
Always respond with valid JSON. Include realistic salary ranges.
Prioritize hires as critical, important, or nice-to-have.`,
  };

  return prompts[sectionId];
}

// Build user prompts with context from previous sections
function buildUserPrompt(sectionId: SectionId, context: GenerationContext): string {
  const { businessIdea, answers, previousSections } = context;

  // Format answers into readable context
  let answersContext = "";
  if (Object.keys(answers).length > 0) {
    answersContext = `
ADDITIONAL BUSINESS DETAILS:
${Object.entries(answers).map(([key, value]) => `- ${key}: ${value}`).join("\n")}
`;
  }

  const baseContext = `
BUSINESS IDEA:
${businessIdea}
${answersContext}`;

  const prompts: Record<SectionId, string> = {
    market: `${baseContext}

Analyze the market opportunity for this business idea.

Return JSON with this EXACT structure:
{
  "tam": { "value": "$X.XB", "label": "Description of total addressable market" },
  "sam": { "value": "$X.XB", "label": "Description of serviceable addressable market" },
  "som": { "value": "$X.XM", "label": "Year 1 achievable market share" },
  "trends": [
    { "name": "Trend name", "yoy": "+X%", "direction": "up" },
    { "name": "Trend name", "yoy": "-X%", "direction": "down" }
  ],
  "aiInsight": "A unique, AI-generated insight about this specific market opportunity that isn't obvious",
  "demographics": {
    "primaryAge": "XX-XX",
    "income": "$XXk-$XXXk",
    "urbanDensity": "High/Medium/Low (metro/suburban/rural areas)"
  }
}

Provide at least 4 trends. Be specific with numbers - don't use placeholders.`,

    customers: `${baseContext}

MARKET CONTEXT:
${JSON.stringify(previousSections.market || {}, null, 2)}

Create 3 detailed customer personas for this business.

Return JSON with this EXACT structure:
{
  "profiles": [
    {
      "name": "Alliterative Name (e.g., 'Busy Brian')",
      "avatar": "emoji that represents them (e.g., '👨‍💼')",
      "tagline": "Short descriptor (e.g., 'The Busy Professional')",
      "demographics": {
        "age": "XX-XX",
        "income": "$XXk-$XXXk",
        "location": "Geographic description"
      },
      "psychographics": {
        "values": ["Value 1", "Value 2", "Value 3"],
        "painPoints": ["Pain point 1", "Pain point 2", "Pain point 3"],
        "buyingTriggers": ["Trigger 1", "Trigger 2", "Trigger 3"]
      },
      "dayInLife": "A 2-3 sentence narrative describing a typical day and how they encounter the problem this business solves"
    }
  ],
  "segmentSplit": {
    "Segment Name 1": 45,
    "Segment Name 2": 30,
    "Segment Name 3": 25
  }
}

Create 3 distinct personas. Segment percentages should sum to 100.`,

    competitors: `${baseContext}

MARKET RESEARCH:
${JSON.stringify(previousSections.market || {}, null, 2)}

CUSTOMER PROFILES:
${JSON.stringify(previousSections.customers || {}, null, 2)}

Analyze the competitive landscape for this business.

Return JSON with this EXACT structure:
{
  "positioning": {
    "xAxis": "Dimension 1 (e.g., 'Price Point')",
    "yAxis": "Dimension 2 (e.g., 'Quality/Experience')",
    "players": [
      { "name": "Competitor 1", "x": 0.3, "y": 0.7 },
      { "name": "Competitor 2", "x": 0.6, "y": 0.4 },
      { "name": "Competitor 3", "x": 0.8, "y": 0.8 },
      { "name": "Your Business", "x": 0.5, "y": 0.9, "isYou": true }
    ]
  },
  "list": [
    {
      "name": "Competitor Name",
      "type": "Type (e.g., 'Direct Competitor', 'Substitute')",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "marketShare": "X%"
    }
  ],
  "swot": {
    "strengths": ["Your strength 1", "Your strength 2", "Your strength 3"],
    "weaknesses": ["Your weakness 1", "Your weakness 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
    "threats": ["Threat 1", "Threat 2"]
  },
  "competitiveAdvantage": "One sentence describing your unique competitive edge"
}

X and Y values should be between 0 and 1. Include 3-4 competitors. SWOT should be about the user's business.`,

    businessPlan: `${baseContext}

MARKET:
${JSON.stringify(previousSections.market || {}, null, 2)}

CUSTOMERS:
${JSON.stringify(previousSections.customers || {}, null, 2)}

COMPETITORS:
${JSON.stringify(previousSections.competitors || {}, null, 2)}

Create a comprehensive business plan.

Return JSON with this EXACT structure:
{
  "vision": "Inspiring long-term vision statement (1-2 sentences)",
  "mission": "Clear mission statement describing what you do and for whom",
  "roadmap": [
    {
      "quarter": "Q1 2025",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
      "focus": "Primary focus for this quarter"
    },
    {
      "quarter": "Q2 2025",
      "milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
      "focus": "Primary focus for this quarter"
    },
    {
      "quarter": "Q3 2025",
      "milestones": ["Milestone 1", "Milestone 2"],
      "focus": "Primary focus for this quarter"
    },
    {
      "quarter": "Q4 2025",
      "milestones": ["Milestone 1", "Milestone 2"],
      "focus": "Primary focus for this quarter"
    }
  ],
  "supplyChain": [
    {
      "category": "Category name (e.g., 'Technology', 'Suppliers')",
      "vendors": ["Vendor/Partner 1", "Vendor/Partner 2"],
      "strategy": "Sourcing strategy for this category"
    }
  ],
  "operations": {
    "model": "Operating model description",
    "hours": "Operating hours or availability",
    "locations": ["Location 1", "Location 2"],
    "staffing": "Staffing approach and requirements"
  }
}

Include 4 quarters in the roadmap. Include 2-3 supply chain categories.`,

    goToMarket: `${baseContext}

CUSTOMERS:
${JSON.stringify(previousSections.customers || {}, null, 2)}

COMPETITORS:
${JSON.stringify(previousSections.competitors || {}, null, 2)}

BUSINESS PLAN:
${JSON.stringify(previousSections.businessPlan || {}, null, 2)}

Design a go-to-market strategy.

Return JSON with this EXACT structure:
{
  "metrics": {
    "cac": { "value": "$XX", "breakdown": "How CAC is spent (e.g., 'Social $X + Events $X')" },
    "ltv": { "value": "$XXX", "basis": "Calculation basis (e.g., '2yr avg customer value')" },
    "ltvCacRatio": "X:1"
  },
  "channels": [
    {
      "name": "Channel name",
      "strategy": "How you'll use this channel",
      "budget": "$X,XXX/month",
      "expectedROI": "X:1 or XX%"
    }
  ],
  "launchPhases": [
    {
      "phase": "Phase name (e.g., 'Soft Launch')",
      "duration": "X weeks/months",
      "activities": ["Activity 1", "Activity 2", "Activity 3"],
      "goals": ["Goal 1", "Goal 2"]
    }
  ],
  "viralMechanics": {
    "referralProgram": "Description of referral incentives",
    "socialProof": "How you'll generate and display social proof",
    "communityBuilding": "Community strategy"
  }
}

Include 3-4 channels. Include 3 launch phases (soft launch, public launch, growth).`,

    financial: `${baseContext}

MARKET:
${JSON.stringify(previousSections.market || {}, null, 2)}

BUSINESS PLAN:
${JSON.stringify(previousSections.businessPlan || {}, null, 2)}

GO-TO-MARKET:
${JSON.stringify(previousSections.goToMarket || {}, null, 2)}

Create a 5-year financial model.

Return JSON with this EXACT structure:
{
  "summary": {
    "startupCost": "$XX,XXX",
    "monthlyBurnRate": "$X,XXX",
    "breakEvenMonths": 18,
    "yearOneRevenue": "$XXX,XXX"
  },
  "projections": [
    {
      "period": "Year 1",
      "revenue": 100000,
      "cogs": 30000,
      "grossProfit": 70000,
      "opex": 120000,
      "netProfit": -50000,
      "margin": "-50%"
    },
    {
      "period": "Year 2",
      "revenue": 350000,
      "cogs": 105000,
      "grossProfit": 245000,
      "opex": 200000,
      "netProfit": 45000,
      "margin": "13%"
    },
    {
      "period": "Year 3",
      "revenue": 800000,
      "cogs": 240000,
      "grossProfit": 560000,
      "opex": 400000,
      "netProfit": 160000,
      "margin": "20%"
    },
    {
      "period": "Year 4",
      "revenue": 1500000,
      "cogs": 450000,
      "grossProfit": 1050000,
      "opex": 700000,
      "netProfit": 350000,
      "margin": "23%"
    },
    {
      "period": "Year 5",
      "revenue": 3000000,
      "cogs": 900000,
      "grossProfit": 2100000,
      "opex": 1200000,
      "netProfit": 900000,
      "margin": "30%"
    }
  ],
  "capex": [
    {
      "item": "Item name",
      "cost": 50000,
      "depreciation": "5 years straight-line"
    }
  ],
  "fundingNeeds": {
    "amount": "$XXX,XXX",
    "use": ["Use 1 (XX%)", "Use 2 (XX%)", "Use 3 (XX%)"],
    "runway": "XX months"
  }
}

Revenue numbers should be integers. Provide realistic projections based on the market size.`,

    pitchDeck: `${baseContext}

FULL BUSINESS ANALYSIS:
Market: ${JSON.stringify(previousSections.market || {}, null, 2)}
Customers: ${JSON.stringify(previousSections.customers || {}, null, 2)}
Competitors: ${JSON.stringify(previousSections.competitors || {}, null, 2)}
Business Plan: ${JSON.stringify(previousSections.businessPlan || {}, null, 2)}
Go-To-Market: ${JSON.stringify(previousSections.goToMarket || {}, null, 2)}
Financial: ${JSON.stringify(previousSections.financial || {}, null, 2)}

Create a 10-slide investor pitch deck.

Return JSON with this EXACT structure:
{
  "slides": [
    {
      "number": 1,
      "title": "Title Slide",
      "content": "Company name and one-line pitch",
      "speakerNotes": "Introduction talking points",
      "visualSuggestion": "Logo centered, clean background"
    },
    {
      "number": 2,
      "title": "The Problem",
      "content": "Clear statement of the problem being solved",
      "speakerNotes": "How to present the pain point",
      "visualSuggestion": "Icon or image representing frustration"
    },
    {
      "number": 3,
      "title": "The Solution",
      "content": "How your product solves the problem",
      "speakerNotes": "Key value proposition points",
      "visualSuggestion": "Product screenshot or demo"
    },
    {
      "number": 4,
      "title": "Market Opportunity",
      "content": "TAM/SAM/SOM with market size",
      "speakerNotes": "Market sizing explanation",
      "visualSuggestion": "Concentric circles or bar chart"
    },
    {
      "number": 5,
      "title": "Business Model",
      "content": "How you make money",
      "speakerNotes": "Revenue model explanation",
      "visualSuggestion": "Pricing tiers or revenue flow"
    },
    {
      "number": 6,
      "title": "Traction",
      "content": "Key metrics and milestones achieved",
      "speakerNotes": "Growth story",
      "visualSuggestion": "Up-and-to-the-right chart"
    },
    {
      "number": 7,
      "title": "Competition",
      "content": "Competitive landscape and differentiation",
      "speakerNotes": "Why you win",
      "visualSuggestion": "2x2 positioning matrix"
    },
    {
      "number": 8,
      "title": "Go-To-Market",
      "content": "Customer acquisition strategy",
      "speakerNotes": "Channel strategy",
      "visualSuggestion": "Funnel or channel icons"
    },
    {
      "number": 9,
      "title": "Team",
      "content": "Founding team credentials",
      "speakerNotes": "Why this team wins",
      "visualSuggestion": "Team photos with titles"
    },
    {
      "number": 10,
      "title": "The Ask",
      "content": "Funding amount and use of funds",
      "speakerNotes": "What you'll achieve with this funding",
      "visualSuggestion": "Pie chart of fund allocation"
    }
  ],
  "narrativeArc": "Brief description of the story arc (problem -> solution -> opportunity -> team -> ask)",
  "askAmount": "$XXX,XXX",
  "useOfFunds": ["Engineering (XX%)", "Sales & Marketing (XX%)", "Operations (XX%)"]
}

Each slide should tell part of a compelling narrative. Speaker notes should be 2-3 sentences.`,

    team: `${baseContext}

BUSINESS PLAN:
${JSON.stringify(previousSections.businessPlan || {}, null, 2)}

FINANCIAL:
${JSON.stringify(previousSections.financial || {}, null, 2)}

Plan the team structure and operations.

Return JSON with this EXACT structure:
{
  "founders": [
    {
      "role": "CEO / [Specialty]",
      "responsibilities": ["Responsibility 1", "Responsibility 2", "Responsibility 3"],
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "background": "Brief background description that makes them credible for this role"
    }
  ],
  "hires": [
    {
      "role": "Role title",
      "timeline": "Month X",
      "salary": "$XX,XXX-$XXX,XXX",
      "priority": "critical"
    },
    {
      "role": "Role title",
      "timeline": "Month X",
      "salary": "$XX,XXX-$XXX,XXX",
      "priority": "important"
    },
    {
      "role": "Role title",
      "timeline": "Month X",
      "salary": "$XX,XXX-$XXX,XXX",
      "priority": "nice-to-have"
    }
  ],
  "partners": [
    {
      "type": "Partner type (e.g., 'Accountant', 'Legal')",
      "name": "Firm type or example",
      "service": "What they provide"
    }
  ],
  "advisors": ["Advisor type 1 (e.g., 'Industry Expert')", "Advisor type 2", "Advisor type 3"]
}

Include 1-2 founders. Include 4-6 hires with priorities. Include 3-4 partners.`,
  };

  return prompts[sectionId];
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// SMART QUESTION GENERATOR - Fast AI-powered questions
// ============================================================================

export const generateSmartQuestions = action({
  args: {
    businessIdea: v.string(),
    existingCategories: v.optional(v.array(v.string())),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { businessIdea, existingCategories = [], count = 4 } = args;

    const systemPrompt = `You are a sharp business strategist who asks the MOST IMPORTANT questions to understand a business idea deeply.

Your job is to generate ${count} highly specific, insightful questions that:
1. Are DIRECTLY relevant to THIS specific business idea (not generic)
2. Uncover critical information that will shape the business plan
3. Cover gaps NOT already addressed by these categories: ${existingCategories.join(", ")}
4. Feel like questions a savvy investor or experienced entrepreneur would ask

Each question should have:
- A clear, direct question (not vague)
- Why it matters for THIS business specifically
- Smart multiple-choice options that cover the realistic range of answers
- Allow for custom input when needed

Focus on questions about:
- Unit economics specific to this business model
- Key risks unique to this market
- Regulatory or compliance considerations
- Customer acquisition channels that fit this business
- Timing and market conditions
- Founder/team fit questions
- Technology or operational moats`;

    const userPrompt = `Business idea: "${businessIdea}"

Generate ${count} highly specific questions for THIS business idea. NOT generic questions.

Return JSON with this EXACT structure:
{
  "questions": [
    {
      "id": "unique_snake_case_id",
      "question": "Specific question about THIS business?",
      "why_important": "Why this matters for THIS specific business idea",
      "category": "category_name",
      "mece_dimension": "financial|market|operational|human",
      "options": [
        { "value": "option_1", "label": "First realistic option" },
        { "value": "option_2", "label": "Second realistic option" },
        { "value": "option_3", "label": "Third realistic option" },
        { "value": "other", "label": "Other" }
      ],
      "allow_custom_input": true,
      "example_answer": "Example if free-form input is primary"
    }
  ]
}

Make questions SPECIFIC to "${businessIdea}". Reference the actual business in questions and options.
Include industry-specific terminology where relevant.
Options should reflect realistic scenarios for THIS type of business.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "https://bizgenius.app",
          "X-Title": "BizGenius",
        },
        body: JSON.stringify({
          model: FAST_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8, // Slightly creative for varied questions
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", errorText);
        return { questions: [], error: "Failed to generate questions" };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return { questions: [], error: "Empty response" };
      }

      const parsed = JSON.parse(content);
      return { questions: parsed.questions || [] };
    } catch (error: any) {
      console.error("Smart question generation failed:", error);
      return { questions: [], error: error.message };
    }
  },
});

// Generate AI insight/suggestion based on partial answers
export const generateInsight = action({
  args: {
    businessIdea: v.string(),
    currentQuestion: v.string(),
    partialAnswers: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { businessIdea, currentQuestion, partialAnswers = {} } = args;

    const prompt = `Business idea: "${businessIdea}"
Current question being answered: "${currentQuestion}"
Answers so far: ${JSON.stringify(partialAnswers)}

Provide a brief (1-2 sentence) smart insight or suggestion that helps the user think about this question in the context of their specific business. Be specific and actionable, not generic.

Return JSON: { "insight": "Your brief, specific insight here" }`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "https://bizgenius.app",
          "X-Title": "BizGenius",
        },
        body: JSON.stringify({
          model: FAST_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 200,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        return { insight: null };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content || "{}");
      return { insight: parsed.insight || null };
    } catch (error) {
      return { insight: null };
    }
  },
});
