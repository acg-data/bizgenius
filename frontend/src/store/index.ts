import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  isGenerating: boolean;
  currentSessionId: string | null;
  error: string | null;
  
  // Actions
  setGenerating: (isGenerating: boolean) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AppState>()(
  persist(
    (set) => ({
      isGenerating: false,
      currentSessionId: null,
      error: null,
      
      setGenerating: (isGenerating) => set({ isGenerating }),
      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'bizgenius-ui-state',
      partialize: (state) => ({
        isGenerating: state.isGenerating,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);

export const subscriptionPlans = [
  {
    id: 1,
    name: 'Free',
    description: 'Perfect for trying out BizGenius',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      '1 analysis per month',
      '2 saved ideas',
      'Unlocked: Executive Summary, Market Research, Business Plan',
      'Locked: Financial Model, Pitch Deck',
      'Export to PDF (watermarked)'
    ]
  },
  {
    id: 2,
    name: 'Premium',
    description: 'For serious entrepreneurs',
    price_monthly: 29,
    price_yearly: 290,
    features: [
      '10 analyses per month',
      '20 saved ideas',
      'All 11 sections unlocked',
      'Export to PDF, CSV',
      'No watermark',
      'Priority support (48hr response)'
    ],
    is_popular: true
  },
  {
    id: 3,
    name: 'Expert',
    description: 'For scaling businesses and fundraising',
    price_monthly: 99,
    price_yearly: 990,
    features: [
      'Unlimited analyses',
      'Unlimited saved ideas',
      'All 11 sections unlocked',
      'Export to PDF, CSV, PPT',
      'No watermark',
      'Priority support (24hr response)',
      'Custom branding priority'
    ]
  }
];
