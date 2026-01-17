import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canAccessSection } from "./lib/limits";

// List all ideas for the current user
export const listIdeas = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return [];
    }

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    // Map to frontend expected format
    return ideas.map((idea) => ({
      _id: idea._id,
      title: idea.title,
      description: idea.description,
      industry: idea.industry,
      target_market: idea.targetMarket,
      created_at: idea.createdAt,
      updated_at: idea.updatedAt,
      generated_at: idea.generatedAt,
    }));
  },
});

// Get a single idea by ID with tier-based section access
export const getIdea = query({
  args: {
    id: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const idea = await ctx.db.get(args.id);

    if (!idea) {
      throw new Error("Idea not found");
    }

    // Verify ownership
    if (idea.userId.toString() !== user._id.toString()) {
      throw new Error("Access denied");
    }

    const tier = user.subscriptionTier || "free";

    // Build result with tier-based access
    const result: any = {
      _id: idea._id,
      title: idea.title,
      description: idea.description,
      industry: idea.industry,
      target_market: idea.targetMarket,
      location: idea.location,
      created_at: idea.createdAt,
      updated_at: idea.updatedAt,
      generated_at: idea.generatedAt,

      // Always accessible sections
      executive_summary: idea.executiveSummary,
      market_research: idea.marketResearch,
      business_plan: idea.businessPlan,
      competitor_analysis: idea.competitorAnalysis,
      go_to_market: idea.goToMarket,
      team_plan: idea.teamPlan,
      risk_assessment: idea.riskAssessment,
      action_plan: idea.actionPlan,
      local_business_data: idea.localBusinessData,
    };

    // Premium sections - apply tier restrictions
    if (canAccessSection(tier, "financial_model")) {
      result.financial_model = idea.financialModel;
    } else {
      result.financial_model = {
        locked: true,
        message: "Upgrade to Premium to unlock Financial Model",
        preview: {
          available_years: 5,
          has_break_even: true,
          has_funding_strategy: true,
        },
      };
    }

    if (canAccessSection(tier, "pitch_deck")) {
      result.pitch_deck = idea.pitchDeck;
    } else {
      result.pitch_deck = {
        locked: true,
        message: "Upgrade to Premium to unlock Pitch Deck",
        preview: {
          total_slides: 10,
          slide_titles: ["Title Slide", "Problem", "Solution"],
        },
      };
    }

    return result;
  },
});

// Create a new idea manually (without generation)
export const createIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    industry: v.optional(v.string()),
    targetMarket: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check ideas limit
    const tier = user.subscriptionTier || "free";
    const maxIdeas = tier === "free" ? 2 : tier === "premium" ? 20 : -1;

    const existingIdeas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (maxIdeas !== -1 && existingIdeas.length >= maxIdeas) {
      throw new Error("Maximum ideas limit reached. Please upgrade your plan.");
    }

    const ideaId = await ctx.db.insert("ideas", {
      userId: user._id,
      title: args.title,
      description: args.description,
      industry: args.industry,
      targetMarket: args.targetMarket,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { ideaId };
  },
});

// Update an existing idea
export const updateIdea = mutation({
  args: {
    id: v.id("ideas"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    targetMarket: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const idea = await ctx.db.get(args.id);

    if (!idea) {
      throw new Error("Idea not found");
    }

    if (idea.userId.toString() !== user._id.toString()) {
      throw new Error("Access denied");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.industry !== undefined) updates.industry = args.industry;
    if (args.targetMarket !== undefined) updates.targetMarket = args.targetMarket;

    await ctx.db.patch(args.id, updates);

    return { success: true };
  },
});

// Delete an idea
export const deleteIdea = mutation({
  args: {
    id: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const idea = await ctx.db.get(args.id);

    if (!idea) {
      throw new Error("Idea not found");
    }

    if (idea.userId.toString() !== user._id.toString()) {
      throw new Error("Access denied");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Get idea count for user
export const getIdeaCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { count: 0, limit: 2 };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return { count: 0, limit: 2 };
    }

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const tier = user.subscriptionTier || "free";
    const limit = tier === "free" ? 2 : tier === "premium" ? 20 : -1;

    return {
      count: ideas.length,
      limit,
      canCreate: limit === -1 || ideas.length < limit,
    };
  },
});
