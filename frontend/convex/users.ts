import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get current user profile
export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return null;
    }

    // Check if we need to reset monthly usage
    const now = Date.now();
    const lastReset = user.lastAnalysisResetAt || user.createdAt;
    const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);

    // Reset usage if it's been more than 30 days
    if (daysSinceReset >= 30) {
      // This is a query, can't mutate. Return with reset values
      return formatUser(user, true);
    }

    return formatUser(user, false);
  },
});

// Format user for frontend consumption
function formatUser(user: any, resetUsage: boolean = false) {
  return {
    _id: user._id,
    email: user.email,
    full_name: user.fullName || user.name,
    profile_image_url: user.profileImageUrl,
    is_active: user.isActive ?? true,
    is_verified: user.isVerified ?? false,
    subscription_tier: user.subscriptionTier || "free",
    subscription_status: user.subscriptionStatus || "inactive",
    stripe_customer_id: user.stripeCustomerId,
    stripe_subscription_id: user.stripeSubscriptionId,
    analyses_used_this_month: resetUsage ? 0 : (user.analysesUsedThisMonth || 0),
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}

// Create or update user on login
export const upsertUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        name: args.name || existingUser.name,
        fullName: args.name || existingUser.fullName,
        profileImageUrl: args.profileImageUrl || existingUser.profileImageUrl,
        updatedAt: Date.now(),
      });
      return { userId: existingUser._id, isNew: false };
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      fullName: args.name,
      profileImageUrl: args.profileImageUrl,
      isActive: true,
      isVerified: false,
      subscriptionTier: "free",
      subscriptionStatus: "inactive",
      analysesUsedThisMonth: 0,
      lastAnalysisResetAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, isNew: true };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
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

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
      updates.fullName = args.name;
    }
    if (args.profileImageUrl !== undefined) {
      updates.profileImageUrl = args.profileImageUrl;
    }

    await ctx.db.patch(user._id, updates);

    return { success: true };
  },
});

// Check usage limits for current user
export const checkUsageLimits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        analyses_used: 0,
        analyses_limit: 1,
        ideas_used: 0,
        ideas_limit: 2,
        can_create: true,
        can_save: true,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return {
        analyses_used: 0,
        analyses_limit: 1,
        ideas_used: 0,
        ideas_limit: 2,
        can_create: true,
        can_save: true,
      };
    }

    const tier = user.subscriptionTier || "free";
    const limits = getSubscriptionLimits(tier);

    // Check if monthly reset is needed
    const now = Date.now();
    const lastReset = user.lastAnalysisResetAt || user.createdAt;
    const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
    const analysesUsed = daysSinceReset >= 30 ? 0 : (user.analysesUsedThisMonth || 0);

    // Count ideas
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const ideasUsed = ideas.length;

    const canCreate = limits.analysesPerMonth === -1 || analysesUsed < limits.analysesPerMonth;
    const canSave = limits.maxIdeas === -1 || ideasUsed < limits.maxIdeas;

    return {
      analyses_used: analysesUsed,
      analyses_limit: limits.analysesPerMonth,
      ideas_used: ideasUsed,
      ideas_limit: limits.maxIdeas,
      can_create: canCreate,
      can_save: canSave,
    };
  },
});

// Internal mutation to update subscription
export const updateSubscription = internalMutation({
  args: {
    email: v.string(),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("expert")),
    status: v.union(v.literal("inactive"), v.literal("active"), v.literal("canceled"), v.literal("past_due")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status,
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      subscriptionExpiresAt: args.expiresAt,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to reset monthly usage
export const resetMonthlyUsage = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      analysesUsedThisMonth: 0,
      lastAnalysisResetAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to increment usage
export const incrementUsage = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    await ctx.db.patch(args.userId, {
      analysesUsedThisMonth: (user.analysesUsedThisMonth || 0) + 1,
      updatedAt: Date.now(),
    });
  },
});

// Helper function to get subscription limits
function getSubscriptionLimits(tier: string) {
  const limits: Record<string, { analysesPerMonth: number; maxIdeas: number; hasExport: boolean }> = {
    free: { analysesPerMonth: 1, maxIdeas: 2, hasExport: false },
    premium: { analysesPerMonth: 10, maxIdeas: 20, hasExport: true },
    expert: { analysesPerMonth: -1, maxIdeas: -1, hasExport: true },
  };
  return limits[tier] || limits.free;
}

// Delete user account
export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Delete all user's ideas
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const idea of ideas) {
      await ctx.db.delete(idea._id);
    }

    // Delete all user's sessions
    const sessions = await ctx.db
      .query("generationSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});
