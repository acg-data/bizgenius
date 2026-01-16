import { v } from "convex/values";
import { action, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  Provider,
  PROVIDER_CONFIGS,
  GenerationRequest,
  GenerationResult,
  getProvider,
  calculateCost,
} from "./providers";

// Provider failover order: Cerebras → Novita → OpenRouter
const PROVIDER_FAILOVER_ORDER: Provider[] = ["openrouter", "novita", "cerebras"];

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  minDelayBetweenCalls: 2000, // 2 seconds minimum between API calls to same provider
  maxRetries: 3,
  exponentialBackoffBase: 1000, // Base delay for exponential backoff (1s)
};

// Track last API call time per provider for rate limiting
const lastCallTime: Record<string, number> = {};

const SECTION_ORDER = [
  { id: "market", name: "Market Research", maxTokens: 2500 },
  { id: "customers", name: "Customer Profiles", maxTokens: 2500 },
  { id: "competitors", name: "Competitor Landscape", maxTokens: 2500 },
  { id: "brandArchetype", name: "Brand Archetype", maxTokens: 2000 },
  { id: "brandBook", name: "Brand Book", maxTokens: 2200 },
  { id: "businessPlan", name: "Business Plan", maxTokens: 2500 },
  { id: "gapAnalysis", name: "Gap Analysis", maxTokens: 2200 },
  { id: "goToMarket", name: "Go-To-Market", maxTokens: 2500 },
  { id: "financial", name: "Financial Model", maxTokens: 3000 },
  { id: "legalCompliance", name: "Legal & Compliance", maxTokens: 2000 },
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
    const totalStartTime = Date.now();
    console.log(`[DEBUG] ========== GENERATION START ==========`);

    // Check authentication state
    console.log(`[AUTH-DEBUG] Checking authentication state...`);
    const identity = await ctx.auth.getUserIdentity();
    console.log(`[AUTH-DEBUG] User identity:`, {
      hasIdentity: !!identity,
      email: identity?.email || 'none',
      tokenPresent: !!identity?.token,
      subject: identity?.subject || 'none',
      timestamp: new Date().toISOString()
    });

    console.log(`[DEBUG] Starting generation for session: ${args.sessionId}`);

    // Get session data
    console.log(`[DEBUG] Looking up session: ${args.sessionId}`);
    const session = await ctx.runQuery(internal.ai.getSessionInternal, {
      sessionId: args.sessionId,
    });
    console.log(`[DEBUG] Session lookup result:`, session ? 'FOUND' : 'NOT FOUND');

    if (!session) {
      console.error(`[DEBUG] Session not found: ${args.sessionId}`);
      throw new Error("Session not found");
    }

    // Update status to generating
    console.log(`[DEBUG] Updating session status to generating`);
    await ctx.runMutation(internal.sessions.updateSessionStatus, {
      sessionId: args.sessionId,
      status: "generating",
      currentStep: "market",
      progress: 0,
    });
    console.log(`[DEBUG] Status update completed`);

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

        console.log(`[DEBUG] ========== STARTING SECTION ${i+1}/${SECTION_ORDER.length}: ${section.id} ==========`);
        console.log(`[DEBUG] Section config: maxTokens=${section.maxTokens}, name=${section.name}`);

        console.log(`[DEBUG] Updating session status to ${section.id}, progress=${progress}`);
        await ctx.runMutation(internal.sessions.updateSessionStatus, {
          sessionId: args.sessionId,
          currentStep: section.id,
          progress: Math.round((i / SECTION_ORDER.length) * 100),
        });
        console.log(`[DEBUG] Status update completed`);

        console.log(`[DEBUG] Calling generateSectionWithRetry for ${section.id}...`);
        const sectionResult = await generateSectionWithRetry(
          section.id,
          section.maxTokens,
          context,
          args.sessionId,
          3
        );

        console.log(`[DEBUG] Section ${section.id} completed successfully`);
        result[section.id] = sectionResult.content;
        context.previousSections[section.id] = sectionResult.content;


        console.log(`[DEBUG] ========== COMPLETED SECTION ${section.id} ==========`);
      }

      // Mark completed with full result
      const totalDuration = Date.now() - totalStartTime;
      console.log(`[DEBUG] ========== ALL SECTIONS COMPLETED IN ${(totalDuration / 1000).toFixed(2)}s ==========`);

      console.log(`[DEBUG] Updating session status to completed`);
      console.log(`[DEBUG] Generation result keys:`, Object.keys(result));
      await ctx.runMutation(internal.sessions.updateSessionStatus, {
        sessionId: args.sessionId,
        status: "completed",
        progress: 100,
        result: result,
      });
      console.log(`[DEBUG] ========== GENERATION COMPLETE ==========`);
    } catch (error: any) {
      console.error(`[DEBUG] ========== GENERATION FAILED ==========`);
      console.error(`[DEBUG] Error:`, error.message);
      console.error(`[DEBUG] Error stack:`, error.stack);
      console.error(`[DEBUG] Error type:`, error.constructor.name);

      const totalDuration = Date.now() - totalStartTime;
      console.log(`[DEBUG] Failed after ${(totalDuration / 1000).toFixed(2)}s`);

      console.log(`[DEBUG] Updating session status to failed`);
      await ctx.runMutation(internal.sessions.updateSessionStatus, {
        sessionId: args.sessionId,
        status: "failed",
        errorMessage: error.message || "Generation failed. Please try again.",
      });
      console.log(`[DEBUG] ========== GENERATION FAILED MARKED ==========`);
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

// Generate a single section with retry logic and rate limit handling
async function generateSectionWithRetry(
  sectionId: SectionId,
  maxTokens: number,
  context: GenerationContext,
  sessionId: string,
  maxRetries: number
): Promise<{ content: any; costInfo: any; provider: string; model: string; duration: number; inputTokens: number; outputTokens: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateSection(sectionId, maxTokens, context, sessionId);
    } catch (error: any) {
      lastError = error;

      // Check if this is a rate limit error
      const isRateLimit = error.message?.includes('RATE_LIMIT_EXCEEDED') ||
                         error.message?.includes('429') ||
                         error.message?.includes('rate limit') ||
                         error.message?.includes('request rate limit');

      if (isRateLimit) {
        // Exponential backoff for rate limits (longer delays)
        const backoffDelay = Math.min(30000, RATE_LIMIT_CONFIG.exponentialBackoffBase * Math.pow(2, attempt));
        console.log(`[RATE-LIMIT-DEBUG] Rate limit detected on attempt ${attempt + 1}, backing off ${backoffDelay}ms`);
        await sleep(backoffDelay);
      } else {
        // Regular retry with shorter delays
        const retryDelay = Math.min(5000, RATE_LIMIT_CONFIG.exponentialBackoffBase * Math.pow(1.5, attempt));
        console.log(`[DEBUG] Attempt ${attempt + 1} failed for ${sectionId}, retrying in ${retryDelay}ms:`, error.message);
        await sleep(retryDelay);
      }
    }
  }

  throw lastError || new Error(`Failed to generate ${sectionId} after ${maxRetries} attempts`);
}

// Get active provider (first check settings, otherwise use default)
async function _getActiveProvider(): Promise<Provider> {
  // For now, return first provider in failover order
  // In the future, this will check the providerSettings table
  return PROVIDER_FAILOVER_ORDER[0];
}

// Enhanced generation function with provider abstraction and failover
async function generateSection(
  sectionId: SectionId,
  maxTokens: number,
  context: GenerationContext,
  sessionId: string,
): Promise<{ content: any; costInfo: any; provider: string; model: string; duration: number; inputTokens: number; outputTokens: number }> {
  const systemPrompt = getSystemPrompt(sectionId);
  const userPrompt = buildUserPrompt(sectionId, context);

  console.log(`[DEBUG] Building request for ${sectionId} (maxTokens: ${maxTokens})`);
  console.log(`[DEBUG] System prompt length: ${systemPrompt.length} chars`);
  console.log(`[DEBUG] User prompt length: ${userPrompt.length} chars`);

  const request: GenerationRequest = {
    model: "",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    maxTokens: maxTokens,
    response_format: { type: "json_object" },
  };

  // Try each provider in failover order
  for (const provider of PROVIDER_FAILOVER_ORDER) {
    try {
      // Rate limiting: Check if we need to wait before calling this provider
      const timeSinceLastCall = Date.now() - (lastCallTime[provider] || 0);
      const minDelay = RATE_LIMIT_CONFIG.minDelayBetweenCalls;

      if (timeSinceLastCall < minDelay) {
        const delayNeeded = minDelay - timeSinceLastCall;
        console.log(`[RATE-LIMIT-DEBUG] Sleeping ${delayNeeded}ms before ${provider} call to avoid rate limits`);
        await sleep(delayNeeded);
      }

      console.log(`[DEBUG] Attempting ${sectionId} with ${provider}...`);
      const providerInstance = getProvider(provider);
      const config = PROVIDER_CONFIGS[provider];

      request.model = config.models.primary;
      console.log(`[DEBUG] Using model: ${request.model}`);

      const startTime = Date.now();
      const result: GenerationResult = await providerInstance.generate(request, provider);
      const duration = Date.now() - startTime;

      // Update last call time for rate limiting
      lastCallTime[provider] = Date.now();

      console.log(`[DEBUG] ${provider} API call took ${duration}ms`);

      if (result.success && result.content) {
        console.log(`[DEBUG] ${provider} returned content, parsing JSON...`);

        let parsedContent;
        try {
          // Try direct JSON parse first
          parsedContent = JSON.parse(result.content);
          console.log(`[DEBUG] Successfully parsed JSON directly from ${provider}`);
        } catch (parseError) {
          console.log(`[DEBUG] Direct JSON parse failed for ${provider}, attempting fallback parsing...`);

          // Fallback 1: Some providers return JSON in markdown code blocks
          const jsonMatch = result.content.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            try {
              parsedContent = JSON.parse(jsonMatch[1]);
              console.log(`[DEBUG] Successfully parsed JSON from markdown block`);
            } catch (fallbackError) {
              console.log(`[DEBUG] Markdown fallback failed, trying other approaches...`);
            }
          }

          // Fallback 2: Some providers return JSON without code blocks but with extra text
          if (!parsedContent) {
            // Try to extract JSON from the response by finding JSON-like structures
            const jsonStart = result.content.indexOf('{');
            const jsonEnd = result.content.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              const potentialJson = result.content.substring(jsonStart, jsonEnd + 1);
              try {
                parsedContent = JSON.parse(potentialJson);
                console.log(`[DEBUG] Successfully parsed JSON from extracted content`);
              } catch (extractError) {
                console.log(`[DEBUG] JSON extraction failed, trying regex approach...`);
              }
            }
          }

          // Fallback 3: Try to find and parse any valid JSON in the response
          if (!parsedContent) {
            const jsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
            const matches = result.content.match(jsonRegex);
            if (matches) {
              for (const match of matches) {
                try {
                  parsedContent = JSON.parse(match);
                  console.log(`[DEBUG] Successfully parsed JSON using regex:`, match.substring(0, 50) + '...');
                  break;
                } catch (regexError) {
                  continue;
                }
              }
            }
          }

          // If all parsing attempts failed
          if (!parsedContent) {
            console.error(`[DEBUG] All JSON parsing attempts failed for ${provider}`);
            console.error(`[DEBUG] Response preview:`, result.content.substring(0, 300));
            throw new Error(`Failed to parse ${provider} response as JSON: ${result.content.substring(0, 200)}`);
          }
        }

        const costInfo = calculateCost(
          provider,
          request.model,
          result.inputTokens || 0,
          result.outputTokens || 0
        );

        console.log(`[DEBUG] ✓ ${sectionId} generated with ${provider} ($${costInfo.totalCost})`);
        return {
          content: parsedContent,
          costInfo,
          provider,
          model: request.model,
          duration,
          inputTokens: result.inputTokens || 0,
          outputTokens: result.outputTokens || 0
        };
      } else {
        console.log(`[DEBUG] ${provider} call failed - no success or content`);
      }
    } catch (error: any) {
      // Handle rate limiting with exponential backoff
      if (error.message?.includes('RATE_LIMIT_EXCEEDED') ||
          error.message?.includes('429') ||
          error.message?.includes('rate limit')) {
        console.log(`[RATE-LIMIT-DEBUG] ${provider} rate limit detected, implementing exponential backoff`);
        // Rate limiting is handled by the retry logic, continue to next provider
      }

      console.error(`[DEBUG] ✗ ${sectionId} failed with ${provider}:`, error.message);
      // Continue to next provider
    }
  }

  console.error(`[DEBUG] All providers failed for ${sectionId}`);
  throw new Error(`Failed to generate ${sectionId} with all providers`);
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

    brandArchetype: `You are a brand strategist specializing in archetype-driven brand identity systems.
Define a clear archetype and voice system that fits the business and target market.
Always respond with valid JSON. Be specific and consistent with tone and messaging.`,

    brandBook: `You are a creative director assembling a concise but concrete brand book.
Define name, mission, vision, values, positioning, and visual guidelines.
Always respond with valid JSON and provide realistic, usable design guidance.`,

    businessPlan: `You are a business strategist who creates executable business plans.
Focus on vision, mission, quarterly roadmaps, and operational details.
Always respond with valid JSON. Include realistic supply chain considerations.
Plans should be specific enough to execute, not generic platitudes.`,

    gapAnalysis: `You are an operations strategist identifying gaps between current and desired state.
Focus on execution gaps, risks, and practical remediation steps.
Always respond with valid JSON. Use clear priority and impact labels.`,

    legalCompliance: `You are a compliance analyst focused on early-stage business risk.
Identify legal, regulatory, IP, and data-handling considerations.
Always respond with valid JSON and prioritize concrete actions.`,

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

    brandArchetype: `${baseContext}

MARKET CONTEXT:
${JSON.stringify(previousSections.market || {}, null, 2)}

CUSTOMER CONTEXT:
${JSON.stringify(previousSections.customers || {}, null, 2)}

Define a clear brand archetype and messaging system for this business.

Return JSON with this EXACT structure:
{
  "archetype": "The Sage",
  "description": "Brief explanation of why this archetype fits",
  "tone": ["insightful", "clear", "authoritative"],
  "voiceAttributes": [
    { "trait": "Analytical", "description": "How this shows up in messaging" },
    { "trait": "Supportive", "description": "How this shows up in messaging" }
  ],
  "brandPromise": "One sentence promise to customers",
  "taglineIdeas": ["Tagline 1", "Tagline 2", "Tagline 3"]
}

Keep tone and archetype consistent with the market and personas.`,

    brandBook: `${baseContext}

BRAND ARCHETYPE:
${JSON.stringify(previousSections.brandArchetype || {}, null, 2)}

Define a concise brand book with mission, vision, values, and visuals.

Return JSON with this EXACT structure:
{
  "brandName": "Brand name",
  "mission": "One sentence mission",
  "vision": "One sentence vision",
  "values": ["Value 1", "Value 2", "Value 3"],
  "positioning": {
    "targetAudience": "Primary target audience",
    "marketCategory": "Category definition",
    "differentiator": "Primary differentiator"
  },
  "visualGuidelines": {
    "primaryColors": ["#1E3A8A", "#9333EA"],
    "secondaryColors": ["#F3F4F6", "#111827"],
    "fontPairing": ["Inter", "Playfair Display"],
    "logoNotes": "Short guidance for logo direction"
  }
}

Make visual guidance practical and usable.`,

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

    gapAnalysis: `${baseContext}

BUSINESS PLAN:
${JSON.stringify(previousSections.businessPlan || {}, null, 2)}

Identify gaps between current and desired state for execution.

Return JSON with this EXACT structure:
{
  "currentState": "Short summary of current position",
  "desiredState": "Short summary of target state",
  "gaps": [
    {
      "gap": "Gap description",
      "impact": "High",
      "priority": "Critical",
      "solution": "Concrete remediation step",
      "timeline": "0-3 months"
    }
  ],
  "topRisks": ["Risk 1", "Risk 2"],
  "assumptionsToValidate": ["Assumption 1", "Assumption 2"]
}

Make gaps specific and actionable.`,

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

Include 3-4 channels. Include 3 launch phases (soft launch, public launch, growth).` ,

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

    legalCompliance: `${baseContext}

BUSINESS PLAN:
${JSON.stringify(previousSections.businessPlan || {}, null, 2)}

Identify legal and compliance considerations for this business.

Return JSON with this EXACT structure:
{
  "regulatoryRisks": [
    {
      "area": "Data privacy",
      "risk": "Risk description",
      "mitigation": "Mitigation action"
    }
  ],
  "requiredPolicies": ["Terms of Service", "Privacy Policy"],
  "recommendedActions": [
    { "action": "Consult legal counsel", "priority": "High" }
  ],
  "ipConsiderations": ["Trademark the brand name"],
  "dataHandlingNotes": "Short summary"
}

Keep actions specific and practical.`,

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
    companyContext: v.optional(v.any()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { businessIdea, existingCategories = [], count = 4 } = args;
    void args.companyContext;
    void args.mode;


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
      // Use provider abstraction with failover
      const request: GenerationRequest = {
        model: "", // Will be set by provider
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        maxTokens: 2000,
        response_format: { type: "json_object" },
      };

      let generatedQuestions = [];
      let lastError: Error | null = null;

      // Try each provider in failover order
      for (const provider of PROVIDER_FAILOVER_ORDER) {
        try {
          const providerInstance = getProvider(provider);
          const config = PROVIDER_CONFIGS[provider];

          request.model = config.models.fast;

          const result = await providerInstance.generate(request, provider);

          if (result.success && result.content) {
            const parsed = JSON.parse(result.content);
            generatedQuestions = parsed.questions || [];
            console.log(`✓ Generated ${generatedQuestions.length} questions with ${provider}`);
            break;
          }
        } catch (error: any) {
          lastError = error;
          console.error(`✗ Question generation failed with ${provider}:`, error.message);
        }
      }

      if (generatedQuestions.length === 0) {
        return { questions: [], error: lastError?.message || "Failed to generate questions" };
      }

      return { questions: generatedQuestions };
    } catch (error: any) {
      console.error("Smart question generation failed:", error);
      return { questions: [], error: error.message };
    }
  },
});

// Public wrapper for generation (for testing)
export const runGenerationPublic = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`[DEBUG] Starting generation for session: ${args.sessionId}`);

      // Call the internal generation function
      await ctx.runAction(internal.ai.runGeneration, args);

      console.log(`[DEBUG] Generation completed successfully for session: ${args.sessionId}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[DEBUG] Generation failed for session ${args.sessionId}:`, error.message);
      console.error(`[DEBUG] Full error:`, error);
      throw error;
    }
  },
});

// Public version of full generation (bypasses internal action limitations)
export const runFullGeneration = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const totalStartTime = Date.now();
    console.log(`[DEBUG] ========== STARTING PUBLIC FULL GENERATION ==========`);

    // Get session data (use internal API)
    const session = await ctx.runQuery(internal.ai.getSessionInternal, {
      sessionId: args.sessionId,
    });

    if (!session) {
      console.error(`[DEBUG] Session not found: ${args.sessionId}`);
      throw new Error("Session not found");
    }

    console.log(`[DEBUG] Session found, status: ${session.status}, progress: ${session.progress}`);
    console.log(`[DEBUG] Business idea:`, session.businessIdea?.substring(0, 100) + '...');

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

        console.log(`[DEBUG] ========== SECTION ${i+1}/${SECTION_ORDER.length}: ${section.id} ==========`);

        // Add progressive delays between sections to prevent rate limiting
        // Section 1: 0s, Section 2: 2s, Section 3: 4s, etc. (exponential but reasonable)
        if (i > 0) {
          const sectionDelay = Math.min(8000, i * 2000); // Max 8s delay, 2s per section
          console.log(`[RATE-LIMIT-DEBUG] Delaying ${sectionDelay}ms before section ${i+1} to prevent rate limits`);
          await sleep(sectionDelay);
        }

        await ctx.runMutation(internal.sessions.updateSessionStatus, {
          sessionId: args.sessionId,
          status: "generating",
          currentStep: section.id,
          progress: progress,
        });
        console.log(`[DEBUG] Updated session status to ${section.id}, progress=${progress}`);

        const sectionResult = await generateSectionWithRetry(
          section.id,
          section.maxTokens,
          context,
          args.sessionId,
          RATE_LIMIT_CONFIG.maxRetries
        );

        console.log(`[DEBUG] Section ${section.id} completed successfully`);

        // Extract content and save cost data
        result[section.id] = sectionResult.content;

        // Save cost tracking data
        await ctx.runMutation((internal as any).admin.saveGenerationCost, {
          sessionId: args.sessionId,
          provider: sectionResult.provider,
          model: sectionResult.model,
          sectionId: section.id,
          inputTokens: sectionResult.inputTokens,
          outputTokens: sectionResult.outputTokens,
          cost: sectionResult.costInfo.totalCost,
          retryCount: 0,
          duration: sectionResult.duration,
        });

        console.log(`[DEBUG] Saved cost data: $${sectionResult.costInfo.totalCost} (${sectionResult.provider})`);
        context.previousSections[section.id] = sectionResult.content;

        // Cost tracking is handled within generateSection now
        console.log(`[DEBUG] ========== COMPLETED SECTION ${section.id} ==========`);
      }

      // Mark completed with full result
      const totalDuration = Date.now() - totalStartTime;
      console.log(`[DEBUG] ========== ALL SECTIONS COMPLETED IN ${(totalDuration / 1000).toFixed(2)}s ==========`);

       console.log(`[DEBUG] Updating session status to completed`);
       console.log(`[DEBUG] Generation result keys:`, Object.keys(result));
        await ctx.runMutation(internal.sessions.updateSessionStatus, {
          sessionId: args.sessionId,
          status: "completed",
          progress: 100,
          result: result,
      });
      console.log(`[DEBUG] ========== GENERATION COMPLETE ==========`);

      console.log(`[DEBUG] Full generation completed successfully`);
      return { success: true, sessionId: args.sessionId, duration: totalDuration };

    } catch (error: any) {
      console.error(`[DEBUG] ========== GENERATION FAILED ==========`);
      console.error(`[DEBUG] Error:`, error.message);
      console.error(`[DEBUG] Error type:`, error.constructor.name);
      console.error(`[DEBUG] Error stack:`, error.stack);

      const totalDuration = Date.now() - totalStartTime;
      console.error(`[DEBUG] Failed after ${(totalDuration / 1000).toFixed(2)}s`);

      console.log(`[DEBUG] Updating session status to failed`);
      await ctx.runMutation(internal.sessions.updateSessionStatus, {
        sessionId: args.sessionId,
        status: "failed",
        errorMessage: error.message || "Generation failed. Please try again.",
      });
      console.log(`[DEBUG] ========== GENERATION FAILED MARKED ==========`);

      throw error;
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
      const request: GenerationRequest = {
        model: "", // Will be set by provider
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        maxTokens: 200,
        response_format: { type: "json_object" },
      };

      // Try each provider in failover order
      for (const provider of PROVIDER_FAILOVER_ORDER) {
        try {
          const providerInstance = getProvider(provider);
          const config = PROVIDER_CONFIGS[provider];

          request.model = config.models.fast;

          const result = await providerInstance.generate(request, provider);

          if (result.success && result.content) {
            const parsed = JSON.parse(result.content || "{}");
            return { insight: parsed.insight || null };
          }
        } catch (error) {
          console.error(`✗ Insight generation failed with ${provider}`);
        }
      }

      return { insight: null };
    } catch (error) {
      return { insight: null };
    }
  },
});
