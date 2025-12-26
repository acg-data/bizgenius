import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Idea, AuthState, IdeaState, SubscriptionPlan } from '../types';

interface AppState extends AuthState, IdeaState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  setIdeas: (ideas: Idea[]) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (id: number, updates: Partial<Idea>) => void;
  removeIdea: (id: number) => void;
  setCurrentIdea: (idea: Idea | null) => void;
  setLoading: (isLoading: boolean) => void;
  setGenerating: (isGenerating: boolean) => void;
}

export const useAuthStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      ideas: [],
      currentIdea: null,
      isGenerating: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        ideas: [],
        currentIdea: null
      }),

      setIdeas: (ideas) => set({ ideas }),
      addIdea: (idea) => set((state) => ({ ideas: [idea, ...state.ideas] })),
      updateIdea: (id, updates) => set((state) => ({
        ideas: state.ideas.map((i) => i.id === id ? { ...i, ...updates } : i),
        currentIdea: state.currentIdea?.id === id
          ? { ...state.currentIdea, ...updates }
          : state.currentIdea
      })),
      removeIdea: (id) => set((state) => ({
        ideas: state.ideas.filter((i) => i.id !== id),
        currentIdea: state.currentIdea?.id === id ? null : state.currentIdea
      })),
      setCurrentIdea: (idea) => set({ currentIdea: idea }),
      setLoading: (isLoading) => set({ isLoading }),
      setGenerating: (isGenerating) => set({ isGenerating }),
    }),
    {
      name: 'bizgenius-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Free',
    description: 'Perfect for trying out BizGenius',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      '1 idea generation per month',
      'Basic business plan',
      'Community support',
      'Export to PDF'
    ]
  },
  {
    id: 2,
    name: 'Pro',
    description: 'For serious entrepreneurs',
    price_monthly: 80,
    price_yearly: 800,
    features: [
      'Unlimited idea generations',
      'Full business plan & financial model',
      'Market research & competitor analysis',
      'Pitch deck generation',
      'Export to PDF, PPTX, Excel',
      'Priority support',
      'API access'
    ],
    is_popular: true
  },
  {
    id: 3,
    name: 'Daily Coach',
    description: 'AI-powered daily guidance',
    price_monthly: 15,
    price_yearly: 150,
    features: [
      'All Pro features',
      'Daily AI business coaching',
      'Action item tracking',
      'Weekly progress reports',
      'Slack/Discord integration',
      '1-on-1 weekly call with expert'
    ]
  }
];
