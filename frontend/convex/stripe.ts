import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Stripe API URLs
const STRIPE_API_URL = "https://api.stripe.com/v1";

// Create a Stripe Checkout Session
export const createCheckoutSession = action({
  args: {
    tier: v.union(v.literal("premium"), v.literal("expert")),
    billing: v.union(v.literal("monthly"), v.literal("yearly")),
    successUrl: v.optional(v.string()),
    cancelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    // Get user from database
    const user = await ctx.runQuery(internal.stripe.getUserByEmail, {
      email: identity.email!,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    // Get the appropriate price ID
    const priceId = getStripePriceId(args.tier, args.billing);
    if (!priceId) {
      throw new Error("Invalid plan selected");
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      // Create new Stripe customer
      const customerResponse = await fetch(`${STRIPE_API_URL}/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: user.email,
          name: user.fullName || user.name || "",
          "metadata[userId]": user._id,
        }),
      });

      if (!customerResponse.ok) {
        const error = await customerResponse.text();
        console.error("Failed to create Stripe customer:", error);
        throw new Error("Failed to create customer");
      }

      const customer = await customerResponse.json();
      customerId = customer.id;

      // Save customer ID to user
      await ctx.runMutation(internal.stripe.updateUserStripeCustomer, {
        userId: user._id,
        stripeCustomerId: customerId,
      });
    }

    // Create Checkout Session
    const siteUrl = process.env.SITE_URL || "http://localhost:5000";
    const checkoutParams = new URLSearchParams({
      customer: customerId,
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: args.successUrl || `${siteUrl}/dashboard?checkout=success`,
      cancel_url: args.cancelUrl || `${siteUrl}/pricing`,
      "metadata[userId]": user._id,
      "metadata[tier]": args.tier,
      "metadata[billing]": args.billing,
      "subscription_data[metadata][userId]": user._id,
      "subscription_data[metadata][tier]": args.tier,
      allow_promotion_codes: "true",
    });

    const sessionResponse = await fetch(`${STRIPE_API_URL}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: checkoutParams,
    });

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      console.error("Failed to create checkout session:", error);
      throw new Error("Failed to create checkout session");
    }

    const session = await sessionResponse.json();

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  },
});

// Create a Stripe Billing Portal Session
export const createPortalSession = action({
  args: {
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Must be logged in");
    }

    const user = await ctx.runQuery(internal.stripe.getUserByEmail, {
      email: identity.email!,
    });

    if (!user?.stripeCustomerId) {
      throw new Error("No subscription found");
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    const siteUrl = process.env.SITE_URL || "http://localhost:5000";

    const portalResponse = await fetch(`${STRIPE_API_URL}/billing_portal/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: user.stripeCustomerId,
        return_url: args.returnUrl || `${siteUrl}/billing`,
      }),
    });

    if (!portalResponse.ok) {
      const error = await portalResponse.text();
      console.error("Failed to create portal session:", error);
      throw new Error("Failed to create portal session");
    }

    const portal = await portalResponse.json();

    return {
      portalUrl: portal.url,
    };
  },
});

// Get current subscription status
export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isSubscribed: false,
        tier: "free" as const,
        status: "inactive" as const,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return {
        isSubscribed: false,
        tier: "free" as const,
        status: "inactive" as const,
      };
    }

    const tier = user.subscriptionTier || "free";
    const status = user.subscriptionStatus || "inactive";
    const isSubscribed = tier !== "free" && status === "active";

    return {
      isSubscribed,
      tier,
      status,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      expiresAt: user.subscriptionExpiresAt,
    };
  },
});

// Internal query to get user by email
export const getUserByEmail = internalQuery({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Internal mutation to update Stripe customer ID
export const updateUserStripeCustomer = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      stripeCustomerId: args.stripeCustomerId,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to update subscription (called by webhook)
export const updateSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    tier: v.union(v.literal("free"), v.literal("premium"), v.literal("expert")),
    status: v.union(v.literal("inactive"), v.literal("active"), v.literal("canceled"), v.literal("past_due")),
    stripeSubscriptionId: v.optional(v.string()),
    stripePriceId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!user) {
      console.error("User not found for Stripe customer:", args.stripeCustomerId);
      return;
    }

    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripePriceId: args.stripePriceId,
      subscriptionExpiresAt: args.expiresAt,
      updatedAt: Date.now(),
    });
  },
});

// Internal query to get user by Stripe customer ID
export const getUserByStripeCustomer = internalQuery({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();
  },
});

// Helper to get Stripe price ID based on tier and billing
function getStripePriceId(tier: "premium" | "expert", billing: "monthly" | "yearly"): string | undefined {
  const priceIds: Record<string, Record<string, string | undefined>> = {
    premium: {
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
    },
    expert: {
      monthly: process.env.STRIPE_EXPERT_MONTHLY_PRICE_ID,
      yearly: process.env.STRIPE_EXPERT_YEARLY_PRICE_ID,
    },
  };

  return priceIds[tier]?.[billing];
}

// Helper to map Stripe price ID to tier
export function mapPriceIdToTier(priceId: string): "premium" | "expert" | "free" {
  const premiumMonthly = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID;
  const premiumYearly = process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID;
  const expertMonthly = process.env.STRIPE_EXPERT_MONTHLY_PRICE_ID;
  const expertYearly = process.env.STRIPE_EXPERT_YEARLY_PRICE_ID;

  if (priceId === premiumMonthly || priceId === premiumYearly) {
    return "premium";
  }
  if (priceId === expertMonthly || priceId === expertYearly) {
    return "expert";
  }
  return "free";
}
