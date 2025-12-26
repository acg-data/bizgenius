/**
 * Tests for the Zustand store.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, subscriptionPlans } from './index';
import { createMockUser, createMockIdea } from '../test/utils';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      ideas: [],
      currentIdea: null,
      isGenerating: false,
    });
  });

  describe('authentication', () => {
    it('should initialize with null user and not authenticated', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should set user and authenticate', () => {
      const mockUser = createMockUser();

      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set token and authenticate', () => {
      useAuthStore.getState().setToken('test-token');
      const state = useAuthStore.getState();

      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should logout and clear all auth data', () => {
      const mockUser = createMockUser();
      const mockIdea = createMockIdea();

      // Set up authenticated state
      useAuthStore.setState({
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
        ideas: [mockIdea],
        currentIdea: mockIdea,
      });

      // Logout
      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.ideas).toEqual([]);
      expect(state.currentIdea).toBeNull();
    });

    it('should clear authentication when setting user to null', () => {
      useAuthStore.setState({
        user: createMockUser(),
        isAuthenticated: true,
      });

      useAuthStore.getState().setUser(null);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('ideas management', () => {
    it('should set ideas', () => {
      const ideas = [createMockIdea({ id: 1 }), createMockIdea({ id: 2 })];

      useAuthStore.getState().setIdeas(ideas);

      expect(useAuthStore.getState().ideas).toEqual(ideas);
    });

    it('should add idea to beginning of list', () => {
      const existingIdea = createMockIdea({ id: 1 });
      const newIdea = createMockIdea({ id: 2 });

      useAuthStore.setState({ ideas: [existingIdea] });
      useAuthStore.getState().addIdea(newIdea);

      const state = useAuthStore.getState();
      expect(state.ideas).toHaveLength(2);
      expect(state.ideas[0].id).toBe(2); // New idea at beginning
      expect(state.ideas[1].id).toBe(1);
    });

    it('should update idea by id', () => {
      const idea = createMockIdea({ id: 1, title: 'Original Title' });
      useAuthStore.setState({ ideas: [idea] });

      useAuthStore.getState().updateIdea(1, { title: 'Updated Title' });

      expect(useAuthStore.getState().ideas[0].title).toBe('Updated Title');
    });

    it('should update currentIdea when updating matching idea', () => {
      const idea = createMockIdea({ id: 1, title: 'Original' });
      useAuthStore.setState({ ideas: [idea], currentIdea: idea });

      useAuthStore.getState().updateIdea(1, { title: 'Updated' });

      expect(useAuthStore.getState().currentIdea?.title).toBe('Updated');
    });

    it('should not update currentIdea when updating different idea', () => {
      const idea1 = createMockIdea({ id: 1, title: 'Idea 1' });
      const idea2 = createMockIdea({ id: 2, title: 'Idea 2' });
      useAuthStore.setState({ ideas: [idea1, idea2], currentIdea: idea1 });

      useAuthStore.getState().updateIdea(2, { title: 'Updated Idea 2' });

      expect(useAuthStore.getState().currentIdea?.title).toBe('Idea 1');
    });

    it('should remove idea by id', () => {
      const ideas = [createMockIdea({ id: 1 }), createMockIdea({ id: 2 })];
      useAuthStore.setState({ ideas });

      useAuthStore.getState().removeIdea(1);

      const state = useAuthStore.getState();
      expect(state.ideas).toHaveLength(1);
      expect(state.ideas[0].id).toBe(2);
    });

    it('should clear currentIdea when removing matching idea', () => {
      const idea = createMockIdea({ id: 1 });
      useAuthStore.setState({ ideas: [idea], currentIdea: idea });

      useAuthStore.getState().removeIdea(1);

      expect(useAuthStore.getState().currentIdea).toBeNull();
    });

    it('should not clear currentIdea when removing different idea', () => {
      const idea1 = createMockIdea({ id: 1 });
      const idea2 = createMockIdea({ id: 2 });
      useAuthStore.setState({ ideas: [idea1, idea2], currentIdea: idea1 });

      useAuthStore.getState().removeIdea(2);

      expect(useAuthStore.getState().currentIdea?.id).toBe(1);
    });

    it('should set current idea', () => {
      const idea = createMockIdea();

      useAuthStore.getState().setCurrentIdea(idea);

      expect(useAuthStore.getState().currentIdea).toEqual(idea);
    });
  });

  describe('loading states', () => {
    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set generating state', () => {
      useAuthStore.getState().setGenerating(true);
      expect(useAuthStore.getState().isGenerating).toBe(true);

      useAuthStore.getState().setGenerating(false);
      expect(useAuthStore.getState().isGenerating).toBe(false);
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

  it('should have Pro plan marked as popular', () => {
    const proPlan = subscriptionPlans.find((p) => p.name === 'Pro');

    expect(proPlan).toBeDefined();
    expect(proPlan?.is_popular).toBe(true);
  });

  it('should have Daily Coach plan with coaching features', () => {
    const coachPlan = subscriptionPlans.find((p) => p.name === 'Daily Coach');

    expect(coachPlan).toBeDefined();
    expect(coachPlan?.features).toContain('Daily AI business coaching');
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
