/**
 * Tests for the Zustand store.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, subscriptionPlans } from './index';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      isGenerating: false,
      currentSessionId: null,
      error: null,
    });
  });

  describe('generation state', () => {
    it('should initialize with isGenerating false', () => {
      const state = useAuthStore.getState();

      expect(state.isGenerating).toBe(false);
    });

    it('should set generating state', () => {
      useAuthStore.getState().setGenerating(true);
      expect(useAuthStore.getState().isGenerating).toBe(true);

      useAuthStore.getState().setGenerating(false);
      expect(useAuthStore.getState().isGenerating).toBe(false);
    });
  });

  describe('session management', () => {
    it('should initialize with null session id', () => {
      const state = useAuthStore.getState();

      expect(state.currentSessionId).toBeNull();
    });

    it('should set current session id', () => {
      useAuthStore.getState().setCurrentSessionId('session-123');

      expect(useAuthStore.getState().currentSessionId).toBe('session-123');
    });

    it('should clear session id', () => {
      useAuthStore.setState({ currentSessionId: 'session-123' });
      useAuthStore.getState().setCurrentSessionId(null);

      expect(useAuthStore.getState().currentSessionId).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should initialize with null error', () => {
      const state = useAuthStore.getState();

      expect(state.error).toBeNull();
    });

    it('should set error', () => {
      useAuthStore.getState().setError('Something went wrong');

      expect(useAuthStore.getState().error).toBe('Something went wrong');
    });

    it('should clear error', () => {
      useAuthStore.setState({ error: 'Something went wrong' });
      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});

describe('subscriptionPlans', () => {
  it('should have three plans', () => {
    expect(subscriptionPlans).toHaveLength(3);
  });

  it('should have Free plan with price 0', () => {
    const freePlan = subscriptionPlans.find((p) => p.name === 'Free');

    expect(freePlan).toBeDefined();
    expect(freePlan?.price_monthly).toBe(0);
    expect(freePlan?.price_yearly).toBe(0);
  });

  it('should have Premium plan marked as popular', () => {
    const premiumPlan = subscriptionPlans.find((p) => p.name === 'Premium');

    expect(premiumPlan).toBeDefined();
    expect(premiumPlan?.is_popular).toBe(true);
  });

  it('should have Expert plan with unlimited features', () => {
    const expertPlan = subscriptionPlans.find((p) => p.name === 'Expert');

    expect(expertPlan).toBeDefined();
    expect(expertPlan?.features).toContain('Unlimited analyses');
  });

  it('should have all plans with required fields', () => {
    subscriptionPlans.forEach((plan) => {
      expect(plan.id).toBeDefined();
      expect(plan.name).toBeDefined();
      expect(plan.description).toBeDefined();
      expect(plan.price_monthly).toBeDefined();
      expect(plan.price_yearly).toBeDefined();
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    });
  });
});
