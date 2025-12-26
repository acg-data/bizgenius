export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
}

export interface Idea {
  id: number;
  title: string;
  description: string;
  industry?: string;
  target_market?: string;
  user_id: number;
  business_plan?: BusinessPlan;
  financial_model?: FinancialModel;
  market_research?: MarketResearch;
  competitor_analysis?: CompetitorAnalysis;
  pitch_deck?: PitchDeck;
  generated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessPlan {
  executive_summary: string;
  mission: string;
  vision: string;
  objectives: string[];
  company_description: string;
  products_services: string[];
  marketing_strategy: string;
  operations_plan: string;
  management_team: string[];
  swot_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export interface FinancialModel {
  assumptions: {
    market_size: string;
    growth_rate: string;
    pricing_model: string;
    customer_acquisition_cost: string;
    lifetime_value: string;
    operating_margin: string;
  };
  projections: Array<{
    year: number;
    revenue: number;
    costs: number;
    profit: number;
  }>;
  break_even: {
    month: string;
    customers_needed: number;
  };
  funding_needed: {
    amount: string;
    use_of_funds: string[];
  };
  key_metrics: {
    cac: string;
    ltv: string;
    ltv_cac_ratio: string;
    burn_rate: string;
    runway: string;
  };
}

export interface MarketResearch {
  market_overview: string;
  tam: { value: string; description: string };
  sam: { value: string; description: string };
  som: { value: string; description: string };
  market_trends: string[];
  target_segments: string[];
  customer_needs: string[];
  regulatory_considerations: string;
  barriers_to_entry: string[];
}

export interface CompetitorAnalysis {
  competitors: Array<{
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    market_position: string;
    pricing: string;
    target_audience: string;
  }>;
  competitive_advantages: string[];
  differentiation_strategy: string;
  threats_from_competitors: string[];
  recommendations: string[];
}

export interface PitchDeck {
  slides: Array<{
    title: string;
    content: string;
    visuals: string;
    speaker_notes: string;
  }>;
  recommended_length: string;
  key_messages: string[];
  call_to_action: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface IdeaState {
  ideas: Idea[];
  currentIdea: Idea | null;
  isLoading: boolean;
  isGenerating: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_popular?: boolean;
}
