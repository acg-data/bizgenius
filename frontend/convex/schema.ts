import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table with subscription management
  users: defineTable({
    // Basic profile
    email: v.string(),
    name: v.optional(v.string()),
    fullName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),

    // Account status
    isActive: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),

    // Subscription (Stripe integration)
    subscriptionTier: v.optional(v.union(v.literal("free"), v.literal("premium"), v.literal("expert"))),
    subscriptionStatus: v.optional(v.union(v.literal("inactive"), v.literal("active"), v.literal("canceled"), v.literal("past_due"))),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    subscriptionExpiresAt: v.optional(v.number()),

    // Usage tracking
    analysesUsedThisMonth: v.optional(v.number()),
    lastAnalysisResetAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  // Business Ideas with all 11 analysis sections
  ideas: defineTable({
    userId: v.id("users"),

    // Basic info
    title: v.string(),
    description: v.string(),
    industry: v.optional(v.string()),
    targetMarket: v.optional(v.string()),
    location: v.optional(v.string()),

    // All 15 analysis sections (stored as JSON objects)
    executiveSummary: v.optional(v.any()),
    marketResearch: v.optional(v.any()),
    businessPlan: v.optional(v.any()),
    financialModel: v.optional(v.any()),
    competitorAnalysis: v.optional(v.any()),
    goToMarket: v.optional(v.any()),
    teamPlan: v.optional(v.any()),
    riskAssessment: v.optional(v.any()),
    actionPlan: v.optional(v.any()),
    pitchDeck: v.optional(v.any()),
    localBusinessData: v.optional(v.any()),
    // New branddeck sections
    brandArchetype: v.optional(v.any()),
    brandBook: v.optional(v.any()),
    gapAnalysis: v.optional(v.any()),
    legalCompliance: v.optional(v.any()),

    // Metadata
    generatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Generation Sessions for tracking AI generation progress
  generationSessions: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.id("users")),

    // Input data
    businessIdea: v.string(),
    answers: v.optional(v.any()),
    branding: v.optional(v.any()),

    // Status tracking
    status: v.union(
      v.literal("pending"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    currentStep: v.optional(v.string()),
    progress: v.optional(v.number()),

    // Results
    result: v.optional(v.any()),
    errorMessage: v.optional(v.string()),

    // Linked idea (if saved)
    ideaId: v.optional(v.id("ideas")),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Payments tracking for Stripe
  payments: defineTable({
    userId: v.id("users"),

    // Payment details
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("refunded")
    ),

    // Stripe identifiers
    stripePaymentIntentId: v.optional(v.string()),
    stripeInvoiceId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),

    // Plan info
    planName: v.optional(v.string()),
    billingPeriod: v.optional(v.union(v.literal("monthly"), v.literal("yearly"))),

    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_stripe_payment", ["stripePaymentIntentId"]),

  // Subscription Plans (static reference)
  subscriptionPlans: defineTable({
    name: v.string(),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("expert")),
    description: v.string(),
    priceMonthly: v.number(),
    priceYearly: v.number(),
    features: v.array(v.string()),
    stripePriceIdMonthly: v.optional(v.string()),
    stripePriceIdYearly: v.optional(v.string()),
    isPopular: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_tier", ["tier"]),

  // Conversation history for chat features
  conversationHistory: defineTable({
    userId: v.id("users"),
    ideaId: v.optional(v.id("ideas")),
    sessionId: v.optional(v.string()),

    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    metadata: v.optional(v.any()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_idea", ["ideaId"]),

  // Generation Cost Tracking
  generationCosts: defineTable({
    sessionId: v.string(),
    provider: v.union(v.literal("novita"), v.literal("cerebras"), v.literal("openrouter")),
    model: v.string(),
    sectionId: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(),
    retryCount: v.optional(v.number()),
    duration: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_provider", ["provider", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  // Admin Provider Settings
  providerSettings: defineTable({
    activeProvider: v.union(v.literal("novita"), v.literal("cerebras"), v.literal("openrouter")),
    fallbackOrder: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }),
});
