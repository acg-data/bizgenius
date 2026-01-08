import { useQuery, useMutation, useAction } from "../lib/convex";
import { api } from "../convex/_generated/api";

// Simple HTTP wrapper for branding endpoints (stubs for now)
const httpApi = {
  async post(endpoint: string, data: any): Promise<{ data: any }> {
    // Stub implementations for branding features
    if (endpoint === '/branding/company-names') {
      // Generate simple name variations based on the idea
      const words = data.business_idea?.split(' ').slice(0, 3) || ['My', 'Business'];
      const suffixes = ['AI', 'Labs', 'Co', 'HQ', 'Pro'];
      const names = suffixes.map((suffix, i) =>
        `${words[i % words.length]}${suffix}`
      );
      return { data: { names } };
    }

    if (endpoint === '/branding/logo-variations') {
      // Return placeholder logo URLs
      return { data: { logos: [null, null, null, null] } };
    }

    if (endpoint === '/branding/color-palettes') {
      // Return predefined color palettes
      return {
        data: {
          palettes: [
            ['#1D1D1F', '#F5F5F7', '#0066CC', '#34C759', '#FF9500'],
            ['#2C3E50', '#ECF0F1', '#3498DB', '#2ECC71', '#E74C3C'],
            ['#1A1A2E', '#EEEEF0', '#4A90D9', '#50C878', '#FF6B6B'],
          ],
        },
      };
    }

    if (endpoint === '/branding/random-palette') {
      const lockedColors = data.locked_colors || [];
      const palette = lockedColors.map((c: string | null) =>
        c || `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
      );
      return { data: { palette } };
    }

    throw new Error(`Unknown endpoint: ${endpoint}`);
  },
};

export const sessionService = {
  create: (idea: string, answers: any) =>
    useMutation(api.sessions.createSession),

  getStatus: (sessionId: string) =>
    useQuery(api.sessions.getSessionStatus, { sessionId }),

  saveToIdea: (sessionId: string, title: string, description: string) =>
    useMutation(api.sessions.saveSessionToIdea),

  retry: (sessionId: string) =>
    useMutation(api.sessions.retrySession),
};

export const ideaService = {
  getAll: () => useQuery(api.ideas.listIdeas),

  getOne: (id: string) => useQuery(api.ideas.getIdea, { id }),

  create: (data: { title: string; description: string; industry?: string; targetMarket?: string }) =>
    useMutation(api.ideas.createIdea),

  delete: (id: string) => useMutation(api.ideas.deleteIdea),

  update: (id: string, updates: { title?: string; description?: string; industry?: string; target_market?: string }) =>
    useMutation(api.ideas.updateIdea),
};

export const authService = {
  login: () => window.location.href = "/api/auth/login",

  logout: () => window.location.href = "/api/auth/logout",
};

// Stripe payment service
export const stripeService = {
  createCheckout: (tier: "premium" | "expert", billing: "monthly" | "yearly", successUrl?: string, cancelUrl?: string) =>
    useAction(api.stripe.createCheckoutSession),

  createPortal: (returnUrl?: string) =>
    useAction(api.stripe.createPortalSession),

  getStatus: () =>
    useQuery(api.stripe.getSubscriptionStatus),
};

// Alias for backwards compatibility
export const subscriptionService = {
  ...stripeService,
};

export default {
  sessionService,
  ideaService,
  authService,
  subscriptionService,
  stripeService,
  // HTTP wrapper for branding endpoints
  post: httpApi.post,
};
