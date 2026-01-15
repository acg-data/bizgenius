// Section configuration for navigation
export interface ReportSectionConfig {
  id: string;
  label: string;
  icon: string;
  title: string;
}

// Executive Summary section data
export interface ExecutiveSummaryData {
  location?: string;
  locationDetail?: string;
  businessModel?: string;
  businessModelDetail?: string;
  fundingNeeded?: string;
  fundingStage?: string;
  mission: string;
  vision: string;
  highlights: string[];
  problem?: string;
  solution?: string;
}

// Market Research section data
export interface MarketResearchData {
  tam: { value: string; growth?: string };
  sam: { value: string; description?: string };
  som: { value: string; description?: string };
  trends: Array<{ label: string; value: string; positive?: boolean }>;
  demographics: string[];
  insight?: string;
  opportunity?: string;
}

// Customer Profile (ICP) data
export interface CustomerProfile {
  id: number;
  name: string;
  title: string;
  isPrimary: boolean;
  avgTicket?: string;
  demographics: {
    ageRange?: string;
    profession?: string;
    location?: string;
  };
  behavior: {
    visitTime?: string;
    decisionDriver?: string;
    traits?: string;
  };
  motivation: string;
  colorScheme: 'blue' | 'purple' | 'green' | 'orange';
}

export interface CustomerProfilesData {
  profiles: CustomerProfile[];
}

// Competitor data
export interface Competitor {
  name: string;
  initial: string;
  type: string;
  avgPrice?: string;
  color: string;
  position?: { x: number; y: number };
}

export interface CompetitorLandscapeData {
  competitors: Competitor[];
  yourPosition?: { x: number; y: number };
  strengths: string[];
  weaknesses: string[];
  opportunities?: string[];
  threats?: string[];
}

// Business Plan (Roadmap) data
export interface RoadmapPhase {
  quarter: string;
  title: string;
  status: 'funded' | 'pending' | 'complete';
  color: 'green' | 'blue' | 'purple' | 'orange';
  milestones: string[];
}

export interface SupplyChainVendor {
  category: string;
  vendor: string;
}

export interface BusinessPlanData {
  phases: RoadmapPhase[];
  supplyChain: SupplyChainVendor[];
}

// 90 Day Action Plan data
export interface ActionPlanMonth {
  month: number;
  label: string;
  title: string;
  status: 'complete' | 'pending' | 'in-progress';
  color: 'green' | 'blue' | 'purple';
  milestones: string[];
}

export interface NinetyDayPlanData {
  months: ActionPlanMonth[];
  successMetrics: {
    revenueTarget?: string;
    customerAcquisition?: string;
  };
}

// Go To Market data
export interface MarketingChannel {
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  priority?: string;
}

export interface GoToMarketData {
  cac: string;
  ltv: string;
  channels: MarketingChannel[];
  viralMechanic?: {
    title: string;
    description: string;
  };
}

// Financial Model data
export interface FinancialMetric {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface FinancialProjection {
  metric: string;
  year1: string;
  year2: string;
  year3: string;
  isHighlight?: boolean;
  isNegative?: boolean;
}

export interface StartupCost {
  item: string;
  amount: string;
}

export interface FinancialModelData {
  metrics: FinancialMetric[];
  projections: FinancialProjection[];
  startupCosts: StartupCost[];
  totalCapital: string;
  isLocked?: boolean;
}

// Risk Assessment data
export interface Risk {
  category: string;
  icon: string;
  iconColor: string;
  severity: 'high' | 'medium' | 'low';
  items: string[];
  mitigation: string;
}

export interface RiskAssessmentData {
  risks: Risk[];
  framework?: {
    monitoring?: string;
    responseTime?: string;
    insurance?: string;
  };
}

// Pitch Deck data
export interface PitchDeckData {
  slides: Array<{
    title: string;
    content: string;
    visuals?: string;
    speakerNotes?: string;
  }>;
  keyMessages: string[];
  callToAction?: string;
  isLocked?: boolean;
}

// Team & Ops data
export interface TeamMember {
  name: string;
  role: string;
  background?: string;
  isOwner?: boolean;
  salary?: string;
  avatarUrl?: string;
}

export interface TeamOpsData {
  members: TeamMember[];
  openPositions?: Array<{
    title: string;
    timing: string;
    pay: string;
  }>;
  partners: string[];
}

// Complete Report Data structure

// Brand Archetype data
export interface Archetype {
  name: string;
  rank: number;
  definition: string;
  humanNeed: string;
  personalityTraits: string[];
}

export interface BrandArchetypeData {
  primaryArchetype: Archetype;
  secondaryArchetypes: Archetype[];
  emotionalBenefits: string[];
  coreInsight: string;
}

// Brand Book data
export interface ColorPaletteItem {
  hex: string;
  name: string;
}

export interface BrandBookData {
  mission?: string;
  vision?: string;
  coreValues?: string[];
  colorPalette?: {
    primary: ColorPaletteItem;
    secondary: ColorPaletteItem;
    accent: ColorPaletteItem;
    light: ColorPaletteItem;
    dark: ColorPaletteItem;
  };
  typography?: {
    heading: string;
    body: string;
    accent: string;
  };
  brandVoice?: string[];
}

// Gap Analysis data
export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PorterForce {
  name: string;
  intensity: "High" | "Medium" | "Low";
  factors: string[];
}

export interface GapAnalysisData {
  competitiveMetrics?: Array<{ label: string; value: string }>;
  swot?: SWOT;
  portersFiveForces?: PorterForce[];
  strategicGaps?: string[];
}

// Legal Compliance data
export interface RiskMatrixItem {
  category: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  mitigation: string;
}

export interface PESTELFactor {
  category: string;
  factors: string[];
}

export interface ComplianceStatusItem {
  name: string;
  status: "Compliant" | "In Progress" | "Not Started";
  progress: number;
}

export interface KeyRegulation {
  domain: string;
  requirements: string[];
}

export interface LegalComplianceData {
  riskMatrix?: RiskMatrixItem[];
  pestel?: PESTELFactor[];
  complianceStatus?: ComplianceStatusItem[];
  keyRegulations?: KeyRegulation[];
}
export interface ReportData {
  ideaTitle: string;
  ideaIcon?: string;
  generatedAt: string;
  executiveSummary: ExecutiveSummaryData;
  marketResearch: MarketResearchData;
  customerProfiles: CustomerProfilesData;
  competitorLandscape: CompetitorLandscapeData;
  businessPlan: BusinessPlanData;
  ninetyDayPlan: NinetyDayPlanData;
  goToMarket: GoToMarketData;
  financialModel: FinancialModelData;
  riskAssessment: RiskAssessmentData;
  pitchDeck: PitchDeckData;
  teamOps: TeamOpsData;
  brandArchetype?: BrandArchetypeData;
  brandBook?: BrandBookData;
  gapAnalysis?: GapAnalysisData;
  legalCompliance?: LegalComplianceData;
}

// Report sections configuration
export const REPORT_SECTIONS: ReportSectionConfig[] = [
  { id: 'executive-summary', label: 'Executive Summary', icon: 'SparklesIcon', title: 'Business Overview' },
  { id: 'market', label: 'Market Research', icon: 'MagnifyingGlassIcon', title: 'Market Analysis' },
  { id: 'customer', label: 'Customer Profiles', icon: 'UsersIcon', title: 'Target Personas' },
  { id: 'competitor', label: 'Competitor Landscape', icon: 'ViewfinderCircleIcon', title: 'Competitive Analysis' },
  { id: 'plan', label: 'Business Plan', icon: 'DocumentTextIcon', title: 'Operational Roadmap' },
  { id: '90day-plan', label: '90 Day Action Plan', icon: 'ClipboardDocumentCheckIcon', title: 'Execution Roadmap (90 Days)' },
  { id: 'gtm', label: 'Go To Market', icon: 'MegaphoneIcon', title: 'Marketing Strategy & CAC' },
  { id: 'finance', label: 'Financial Model', icon: 'ArrowTrendingUpIcon', title: 'Financial Projections' },
  { id: 'risk-assessment', label: 'Risk Assessment', icon: 'ShieldExclamationIcon', title: 'Risk Analysis & Mitigation' },
  { id: 'pitch', label: 'Pitch Deck', icon: 'PresentationChartBarIcon', title: 'Investor Slide Deck' },
  { id: 'brand-archetype', label: 'Brand Archetype', icon: 'SparklesIcon', title: 'Brand Personality' },
  { id: 'brand-book', label: 'Brand Book', icon: 'SwatchIcon', title: 'Brand Guidelines' },
  { id: 'gap-analysis', label: 'Gap Analysis', icon: 'ScaleIcon', title: 'Strategic Analysis' },
  { id: 'legal-compliance', label: 'Legal & Compliance', icon: 'ShieldCheckIcon', title: 'Regulatory Requirements' },
  { id: 'team', label: 'Team & Ops', icon: 'UserGroupIcon', title: 'Organizational Structure' },
];
