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
  _id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  is_active: true,
  is_verified: false,
  subscription_tier: 'free',
  subscription_status: 'inactive',
  created_at: Date.now(),
  updated_at: Date.now(),
  ...overrides,
});

export const createMockIdea = (overrides: Partial<Idea> = {}): Idea => ({
  _id: '1',
  title: 'Test Business Idea',
  description: 'A great business idea for testing purposes.',
  industry: 'Technology',
  target_market: 'Small businesses',
  userId: '1',
  business_plan: undefined,
  financial_model: undefined,
  market_research: undefined,
  competitor_analysis: undefined,
  pitch_deck: undefined,
  generated_at: undefined,
  created_at: Date.now(),
  updated_at: Date.now(),
  ...overrides,
});

export const createMockIdeaWithContent = (overrides: Partial<Idea> = {}): Idea => ({
  ...createMockIdea(),
  business_plan: {
    executive_summary: 'Test executive summary',
    mission: 'Test mission',
    vision: 'Test vision',
    objectives: ['Objective 1'],
    company_description: 'Test company description',
    products_services: ['Product 1'],
    marketing_strategy: 'Test strategy',
    operations: 'Test operations',
    financial_summary: 'Test summary',
    milestones: ['Milestone 1'],
  } as any,
  financial_model: {
    assumptions: {} as any,
    projections: [],
    break_even_analysis: {} as any,
    funding_requirements: {} as any,
    scenarios: {} as any,
  } as any,
  market_research: {
    tam: {} as any,
    sam: {} as any,
    som: {} as any,
    customer_segments: [],
    market_trends: [],
    regulatory_landscape: {} as any,
  } as any,
  competitor_analysis: {
    competitors: [],
    competitive_advantages: [],
    differentiation_strategy: 'Test',
    threats_from_competitors: [],
    recommendations: [],
  } as any,
  pitch_deck: {
    slides: [],
    recommended_length: '10 slides',
    key_messages: [],
    call_to_action: 'Test CTA',
  } as any,
  generated_at: Date.now(),
  ...overrides,
});

/**
 * Wait for async operations
 */
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
