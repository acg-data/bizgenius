/**
 * Test utilities for BizGenius frontend.
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { User, Idea } from '../types';

/**
 * Custom render function that wraps components with necessary providers.
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

/**
 * Test data factories
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  is_active: true,
  is_verified: false,
  subscription_tier: 'free',
  subscription_status: 'inactive',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockIdea = (overrides: Partial<Idea> = {}): Idea => ({
  id: 1,
  title: 'Test Business Idea',
  description: 'A great business idea for testing purposes.',
  industry: 'Technology',
  target_market: 'Small businesses',
  user_id: 1,
  business_plan: null,
  financial_model: null,
  market_research: null,
  competitor_analysis: null,
  pitch_deck: null,
  generated_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockIdeaWithContent = (overrides: Partial<Idea> = {}): Idea => ({
  ...createMockIdea(),
  business_plan: {
    executive_summary: 'Test executive summary',
    company_description: 'Test company description',
    market_analysis: 'Test market analysis',
  },
  financial_model: {
    revenue_projections: [100000, 200000, 300000],
    expense_projections: [50000, 75000, 100000],
  },
  market_research: {
    market_size: '1B',
    growth_rate: '10%',
    trends: ['AI', 'Cloud'],
  },
  competitor_analysis: {
    competitors: [
      { name: 'Competitor A', strengths: ['Strong brand'] },
      { name: 'Competitor B', strengths: ['Low prices'] },
    ],
  },
  pitch_deck: {
    slides: [
      { title: 'Introduction', content: 'Welcome to our company' },
      { title: 'Problem', content: 'The problem we solve' },
    ],
  },
  generated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Wait for async operations
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
