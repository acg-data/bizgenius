// =============================================================================
// BizGenius Generation Output Types
// 8-Section Business Plan Structure (Tony's Tacos Template)
// =============================================================================

// -----------------------------------------------------------------------------
// Section 1: Market Research
// -----------------------------------------------------------------------------
export interface MarketMetric {
  value: string;
  label: string;
}

export interface MarketTrend {
  name: string;
  yoy: string;
  direction: "up" | "down";
}

export interface MarketDemographics {
  primaryAge: string;
  income: string;
  urbanDensity: string;
}

export interface MarketResearch {
  tam: MarketMetric;
  sam: MarketMetric;
  som: MarketMetric;
  trends: MarketTrend[];
  aiInsight: string;
  demographics: MarketDemographics;
}

// -----------------------------------------------------------------------------
// Section 2: Customer Profiles (ICP)
// -----------------------------------------------------------------------------
export interface CustomerDemographics {
  age: string;
  income: string;
  location: string;
}

export interface CustomerPsychographics {
  values: string[];
  painPoints: string[];
  buyingTriggers: string[];
}

export interface CustomerProfile {
  name: string;
  avatar: string;
  tagline: string;
  demographics: CustomerDemographics;
  psychographics: CustomerPsychographics;
  dayInLife: string;
}

export interface CustomerProfiles {
  profiles: CustomerProfile[];
  segmentSplit: Record<string, number>;
}

// -----------------------------------------------------------------------------
// Section 3: Competitor Landscape
// -----------------------------------------------------------------------------
export interface PositioningPlayer {
  name: string;
  x: number;
  y: number;
  isYou?: boolean;
}

export interface PositioningMatrix {
  xAxis: string;
  yAxis: string;
  players: PositioningPlayer[];
}

export interface Competitor {
  name: string;
  type: string;
  strengths: string[];
  weaknesses: string[];
  marketShare: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorLandscape {
  positioning: PositioningMatrix;
  list: Competitor[];
  swot: SWOT;
  competitiveAdvantage: string;
}

// -----------------------------------------------------------------------------
// Section 4: Business Plan
// -----------------------------------------------------------------------------
export interface RoadmapQuarter {
  quarter: string;
  milestones: string[];
  focus: string;
}

export interface SupplyChainCategory {
  category: string;
  vendors: string[];
  strategy: string;
}

export interface Operations {
  model: string;
  hours: string;
  locations: string[];
  staffing: string;
}

export interface BusinessPlan {
  vision: string;
  mission: string;
  roadmap: RoadmapQuarter[];
  supplyChain: SupplyChainCategory[];
  operations: Operations;
}

// -----------------------------------------------------------------------------
// Section 5: Go-To-Market
// -----------------------------------------------------------------------------
export interface CACMetric {
  value: string;
  breakdown: string;
}

export interface LTVMetric {
  value: string;
  basis: string;
}

export interface GTMMetrics {
  cac: CACMetric;
  ltv: LTVMetric;
  ltvCacRatio: string;
}

export interface MarketingChannel {
  name: string;
  strategy: string;
  budget: string;
  expectedROI: string;
}

export interface LaunchPhase {
  phase: string;
  duration: string;
  activities: string[];
  goals: string[];
}

export interface ViralMechanics {
  referralProgram: string;
  socialProof: string;
  communityBuilding: string;
}

export interface GoToMarket {
  metrics: GTMMetrics;
  channels: MarketingChannel[];
  launchPhases: LaunchPhase[];
  viralMechanics: ViralMechanics;
}

// -----------------------------------------------------------------------------
// Section 6: Financial Model
// -----------------------------------------------------------------------------
export interface FinancialSummary {
  startupCost: string;
  monthlyBurnRate: string;
  breakEvenMonths: number;
  yearOneRevenue: string;
}

export interface FinancialProjection {
  period: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
  margin: string;
}

export interface CapExItem {
  item: string;
  cost: number;
  depreciation: string;
}

export interface FundingNeeds {
  amount: string;
  use: string[];
  runway: string;
}

export interface FinancialModel {
  summary: FinancialSummary;
  projections: FinancialProjection[];
  capex: CapExItem[];
  fundingNeeds: FundingNeeds;
}

// -----------------------------------------------------------------------------
// Section 7: Pitch Deck
// -----------------------------------------------------------------------------
export interface PitchSlide {
  number: number;
  title: string;
  content: string;
  speakerNotes: string;
  visualSuggestion: string;
}

export interface PitchDeck {
  slides: PitchSlide[];
  narrativeArc: string;
  askAmount: string;
  useOfFunds: string[];
}

// -----------------------------------------------------------------------------
// Section 8: Team & Operations
// -----------------------------------------------------------------------------
export interface Founder {
  role: string;
  responsibilities: string[];
  skills: string[];
  background: string;
}

export interface HiringPlan {
  role: string;
  timeline: string;
  salary: string;
  priority: "critical" | "important" | "nice-to-have";
}

export interface Partner {
  type: string;
  name: string;
  service: string;
}

export interface TeamOperations {
  founders: Founder[];
  hires: HiringPlan[];
  partners: Partner[];
  advisors: string[];
}

// -----------------------------------------------------------------------------
// Complete Generation Result
// -----------------------------------------------------------------------------
export interface GenerationResult {
  market: MarketResearch;
  customers: CustomerProfiles;
  competitors: CompetitorLandscape;
  businessPlan: BusinessPlan;
  goToMarket: GoToMarket;
  financial: FinancialModel;
  pitchDeck: PitchDeck;
  team: TeamOperations;
}

// -----------------------------------------------------------------------------
// Generation Steps (for progress tracking)
// -----------------------------------------------------------------------------
export const GENERATION_STEPS = [
  { key: "market", label: "Market Research", icon: "chart" },
  { key: "customers", label: "Customer Profiles", icon: "users" },
  { key: "competitors", label: "Competitor Landscape", icon: "target" },
  { key: "businessPlan", label: "Business Plan", icon: "briefcase" },
  { key: "goToMarket", label: "Go-To-Market", icon: "rocket" },
  { key: "financial", label: "Financial Model", icon: "dollar" },
  { key: "pitchDeck", label: "Pitch Deck", icon: "presentation" },
  { key: "team", label: "Team & Operations", icon: "people" },
] as const;

export type GenerationStepKey = typeof GENERATION_STEPS[number]["key"];
