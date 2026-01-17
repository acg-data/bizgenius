import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Generate a unique session ID
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Create a new generation session
export const createSession = mutation({
  args: {
    idea: v.string(),
    answers: v.optional(v.any()),
    branding: v.optional(v.any()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args.mode;

    const identity = await ctx.auth.getUserIdentity();

    // Find user if authenticated
    let userId = undefined as any;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identity.email!))
        .first();
      if (user) {
        userId = user._id;

        // Check usage limits
        const tier = user.subscriptionTier || "free";
        const limits = getSubscriptionLimits(tier);
        const usedThisMonth = user.analysesUsedThisMonth || 0;

        if (limits.analysesPerMonth !== -1 && usedThisMonth >= limits.analysesPerMonth) {
          throw new Error("Monthly analysis limit reached. Please upgrade your plan.");
        }
      }
    }

    const sessionId = generateSessionId();

    // Create the session
    await ctx.db.insert("generationSessions", {
      sessionId,
      userId,
      businessIdea: args.idea,
      answers: args.answers,
      branding: args.branding,
      status: "pending",
      currentStep: "market",
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Schedule the background generation
    await ctx.scheduler.runAfter(0, internal.ai.runGeneration, { sessionId });

    return { sessionId };
  },
});

// Get session status (for polling/real-time updates)
export const getSessionStatus = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.sessionId) return null;

    const session = await ctx.db
      .query("generationSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) return null;

    return {
      sessionId: session.sessionId,
      status: session.status,
      currentStep: session.currentStep,
      progress: session.progress,
      result: session.result,
      errorMessage: session.errorMessage,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    };
  },
});

// Retry a failed session
export const retrySession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("generationSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "failed") {
      throw new Error("Can only retry failed sessions");
    }

    // Reset the session
    await ctx.db.patch(session._id, {
      status: "pending",
      currentStep: session.currentStep || "market",
      errorMessage: undefined,
      updatedAt: Date.now(),
    });

    // Re-run generation
    await ctx.scheduler.runAfter(0, internal.ai.runGeneration, {
      sessionId: args.sessionId,
    });

    return { success: true };
  },
});

// Save session results to an idea
export const saveSessionToIdea = mutation({
  args: {
    sessionId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in to save ideas");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const session = await ctx.db
      .query("generationSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status !== "completed" || !session.result) {
      throw new Error("Session not completed");
    }

    // Check ideas limit
    const tier = user.subscriptionTier || "free";
    const limits = getSubscriptionLimits(tier);
    const existingIdeas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (limits.maxIdeas !== -1 && existingIdeas.length >= limits.maxIdeas) {
      throw new Error("Maximum ideas limit reached. Please upgrade your plan.");
    }

    const result = session.result;

    // Create the idea with all sections
    const ideaId = await ctx.db.insert("ideas", {
      userId: user._id,
      title: args.title,
      description: args.description || session.businessIdea,
      industry: result.market_research?.industry || undefined,
      targetMarket: result.market_research?.target_market || undefined,
      executiveSummary: result.executive_summary,
      marketResearch: result.market_research,
      businessPlan: result.business_plan,
      financialModel: result.financial_model,
      competitorAnalysis: result.competitor_analysis,
      goToMarket: result.go_to_market,
      teamPlan: result.team_plan,
      riskAssessment: result.risk_assessment,
      actionPlan: result.action_plan,
      pitchDeck: result.pitch_deck,
      localBusinessData: result.local_business_data,
      brandArchetype: result.brand_archetype,
      brandBook: result.brand_book,
      gapAnalysis: result.gap_analysis,
      legalCompliance: result.legal_compliance,
      generatedAt: session.completedAt || Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Link session to idea
    await ctx.db.patch(session._id, { ideaId });

    // Increment user's analysis count
    await ctx.db.patch(user._id, {
      analysesUsedThisMonth: (user.analysesUsedThisMonth || 0) + 1,
      updatedAt: Date.now(),
    });

    return { ideaId };
  },
});

// Internal mutation to update session status (called by AI functions)
export const updateSessionStatus = internalMutation({
  args: {
    sessionId: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    )),
    currentStep: v.optional(v.string()),
    progress: v.optional(v.number()),
    result: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("generationSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.status !== undefined) updates.status = args.status;
    if (args.currentStep !== undefined) updates.currentStep = args.currentStep;
    if (args.progress !== undefined) updates.progress = args.progress;
    if (args.result !== undefined) updates.result = args.result;
    if (args.errorMessage !== undefined) updates.errorMessage = args.errorMessage;
    if (args.status === "completed") updates.completedAt = Date.now();

    await ctx.db.patch(session._id, updates);
  },
});

// Helper function to get subscription limits
function getSubscriptionLimits(tier: string) {
  const limits: Record<string, { analysesPerMonth: number; maxIdeas: number }> = {
    free: { analysesPerMonth: 1, maxIdeas: 2 },
    premium: { analysesPerMonth: 10, maxIdeas: 20 },
    expert: { analysesPerMonth: -1, maxIdeas: -1 },
  };
  return limits[tier] || limits.free;
}
