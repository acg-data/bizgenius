export interface User {
  _id: string;
  email: string;
  full_name?: string;
  profile_image_url?: string;
  is_active: boolean;
  is_verified: boolean;

  subscription_tier: "free" | "premium" | "expert";
  subscription_status: "inactive" | "active" | "canceled" | "past_due";

  // Stripe payment gateway
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;

  created_at: number;
  updated_at: number;
}

export interface Idea {
  _id: string;
  title: string;
  description: string;
  industry?: string;
  target_market?: string;
  userId: string;

  // ALL 11 SECTIONS AS FIELDS
  executive_summary?: any;
  market_research?: any;
  business_plan?: any;
  financial_model?: any;
  competitor_analysis?: any;
  go_to_market?: any;
  team_plan?: any;
  risk_assessment?: any;
  action_plan?: any;
  pitch_deck?: any;
  local_business_data?: any;
// New branddeck sections
  brandArchetype?: any;
  brandBook?: any;
  gapAnalysis?: any;
  legalCompliance?: any;

  generated_at?: number;
  created_at: number;
  updated_at: number;
}

export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  stripe_checkout_session_id?: string;
  status: string;
  description?: string;
  createdAt: number;
}

export interface GenerationSession {
  _id: string;
  sessionId: string;
  businessIdea: string;
  answers?: any;
  status: "pending" | "generating" | "completed" | "failed";
  currentStep?: string;
  progress?: number;
  result?: any;
  errorMessage?: string;
  userId?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface SubscriptionPlan {
  id: number;
  name: "Free" | "Premium" | "Expert";
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_popular?: boolean;
}

export interface UsageLimits {
  analyses_used: number;
  analyses_limit: number;
  ideas_used: number;
  ideas_limit: number;
  can_create: boolean;
  can_save: boolean;
}
