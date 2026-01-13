import { v } from 'convex/values';
import { mutation, query, MutationCtx } from './_generated/server';
import { Provider } from './providers';

// Helper function to verify admin access
async function requireAdmin(ctx: MutationCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', identity.email!))
    .first();

  if (!user || !user.isAdmin) {
    throw new Error('Admin access required');
  }
}

// Get current provider settings
export const getProviderSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query('providerSettings').first();

    if (!settings) {
      // Return default settings
      return {
        activeProvider: 'novita' as Provider,
        fallbackOrder: ['novita', 'openrouter', 'cerebras'],
        updatedAt: Date.now(),
      };
    }

    return settings;
  },
});

// Set active provider (admin only)
export const setActiveProvider = mutation({
  args: {
    provider: v.union(
      v.literal('novita'),
      v.literal('cerebras'),
      v.literal('openrouter')
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query('providerSettings').first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        activeProvider: args.provider,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('providerSettings', {
        activeProvider: args.provider,
        fallbackOrder: ['novita', 'openrouter', 'cerebras'],
        updatedAt: Date.now(),
      });
    }

    return { success: true, activeProvider: args.provider };
  },
});

// Set fallback order (admin only)
export const setFallbackOrder = mutation({
  args: {
    order: v.array(
      v.union(
        v.literal('novita'),
        v.literal('cerebras'),
        v.literal('openrouter')
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existing = await ctx.db.query('providerSettings').first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fallbackOrder: args.order,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert('providerSettings', {
        activeProvider: 'novita',
        fallbackOrder: args.order,
        updatedAt: Date.now(),
      });
    }

    return { success: true, fallbackOrder: args.order };
  },
});

// Save generation cost
export const saveGenerationCost = mutation({
  args: {
    sessionId: v.string(),
    provider: v.union(
      v.literal('novita'),
      v.literal('cerebras'),
      v.literal('openrouter')
    ),
    model: v.string(),
    sectionId: v.string(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    cost: v.number(),
    retryCount: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('generationCosts', {
      sessionId: args.sessionId,
      provider: args.provider,
      model: args.model,
      sectionId: args.sectionId,
      inputTokens: args.inputTokens,
      outputTokens: args.outputTokens,
      cost: args.cost,
      retryCount: args.retryCount,
      duration: args.duration,
      timestamp: Date.now(),
    });
  },
});

// Get costs by session
export const getCostsBySession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const costs = await ctx.db
      .query('generationCosts')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .collect();

    const total = costs.reduce((sum, cost) => sum + cost.cost, 0);
    const totalTokens = costs.reduce(
      (sum, cost) => sum + cost.inputTokens + cost.outputTokens,
      0
    );

    return {
      costs,
      totalCost: total,
      totalTokens,
      sectionCount: costs.length,
    };
  },
});

// Get costs by provider (for analytics)
export const getCostsByProvider = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000; // Default last 30 days
    const endDate = args.endDate || Date.now();

    const costs = await ctx.db
      .query('generationCosts')
      .withIndex('by_timestamp')
      .collect();

    const filtered = costs.filter(
      (cost) => cost.timestamp >= startDate && cost.timestamp <= endDate
    );

    const byProvider: Record<string, { count: number; totalCost: number; totalTokens: number }> = {};

    for (const cost of filtered) {
      if (!byProvider[cost.provider]) {
        byProvider[cost.provider] = {
          count: 0,
          totalCost: 0,
          totalTokens: 0,
        };
      }

      byProvider[cost.provider].count++;
      byProvider[cost.provider].totalCost += cost.cost;
      byProvider[cost.provider].totalTokens += cost.inputTokens + cost.outputTokens;
    }

    return {
      byProvider,
      totalCost: Object.values(byProvider).reduce((sum, p) => sum + p.totalCost, 0),
      totalSessions: new Set(filtered.map((c) => c.sessionId)).size,
    };
  },
});

// Get cost trends over time
export const getCostTrends = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const costs = await ctx.db
      .query('generationCosts')
      .withIndex('by_timestamp')
      .collect();

    const filtered = costs.filter((cost) => cost.timestamp >= startDate);

    // Group by day
    const byDay: Record<string, { cost: number; count: number; tokens: number }> = {};

    for (const cost of filtered) {
      const date = new Date(cost.timestamp).toISOString().split('T')[0];

      if (!byDay[date]) {
        byDay[date] = { cost: 0, count: 0, tokens: 0 };
      }

      byDay[date].cost += cost.cost;
      byDay[date].count++;
      byDay[date].tokens += cost.inputTokens + cost.outputTokens;
    }

    // Fill in missing days
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      result.push({
        date,
        cost: byDay[date]?.cost || 0,
        count: byDay[date]?.count || 0,
        tokens: byDay[date]?.tokens || 0,
      });
    }

    return result;
  },
});

// Get recent generations with costs
export const getRecentGenerations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const costs = await ctx.db
      .query('generationCosts')
      .withIndex('by_timestamp')
      .order('desc')
      .take(limit);

    // Group by session
    const bySession: Record<string, any> = {};

    for (const cost of costs) {
      if (!bySession[cost.sessionId]) {
        bySession[cost.sessionId] = {
          sessionId: cost.sessionId,
          provider: cost.provider,
          model: cost.model,
          sections: [],
          totalCost: 0,
          totalTokens: 0,
          timestamp: cost.timestamp,
        };
      }

      bySession[cost.sessionId].sections.push(cost.sectionId);
      bySession[cost.sessionId].totalCost += cost.cost;
      bySession[cost.sessionId].totalTokens += cost.inputTokens + cost.outputTokens;
    }

    return Object.values(bySession);
  },
});