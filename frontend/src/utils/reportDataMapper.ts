import { Idea } from '../types';
import {
  ReportData,
  ExecutiveSummaryData,
  MarketResearchData,
  CustomerProfilesData,
  CompetitorLandscapeData,
  BusinessPlanData,
  NinetyDayPlanData,
  GoToMarketData,
  FinancialModelData,
  RiskAssessmentData,
  PitchDeckData,
  TeamOpsData,
  BrandArchetypeData,
  BrandBookData,
  GapAnalysisData,
  LegalComplianceData,
} from '../types/report';

// Color schemes for customer profiles
const colorSchemes: Array<'blue' | 'purple' | 'green' | 'orange'> = ['blue', 'purple', 'green', 'orange'];

// Competitor colors
const competitorColors = ['#0071e3', '#9333ea', '#22c55e', '#f97316', '#ef4444', '#06b6d4'];
const COMPETITOR_DISPLAY_LIMIT = 5;


/**
 * Maps an Idea from the database to the ReportData format for display
 */
export function mapIdeaToReportData(idea: Idea): ReportData {
  return {
    ideaTitle: idea.title,
    ideaIcon: getIndustryIcon(idea.industry),
    generatedAt: idea.generated_at
      ? new Date(idea.generated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date(idea.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
    executiveSummary: mapExecutiveSummary(idea),
    marketResearch: mapMarketResearch(idea),
    customerProfiles: mapCustomerProfiles(idea),
    competitorLandscape: mapCompetitorLandscape(idea),
    businessPlan: mapBusinessPlan(idea),
    ninetyDayPlan: mapNinetyDayPlan(idea),
    goToMarket: mapGoToMarket(idea),
    financialModel: mapFinancialModel(idea),
    riskAssessment: mapRiskAssessment(idea),
    pitchDeck: mapPitchDeck(idea),
    teamOps: mapTeamOps(idea),
    brandArchetype: mapBrandArchetype(idea),
    brandBook: mapBrandBook(idea),
    gapAnalysis: mapGapAnalysis(idea),
    legalCompliance: mapLegalCompliance(idea),
  };
}

function getIndustryIcon(industry?: string): string {
  const iconMap: Record<string, string> = {
    'technology': 'ComputerDesktopIcon',
    'food': 'CakeIcon',
    'restaurant': 'CakeIcon',
    'retail': 'ShoppingBagIcon',
    'healthcare': 'HeartIcon',
    'finance': 'BanknotesIcon',
    'education': 'AcademicCapIcon',
    'real estate': 'BuildingOfficeIcon',
    'consulting': 'BriefcaseIcon',
    'manufacturing': 'CogIcon',
  };
  return iconMap[industry?.toLowerCase() || ''] || 'SparklesIcon';
}

function mapExecutiveSummary(idea: Idea): ExecutiveSummaryData {
  const execSummary = idea.executive_summary || {};
  const businessPlan = idea.business_plan || {};
  const localData = idea.local_business_data || {};

  return {
    location: localData.city || localData.location,
    locationDetail: localData.state || localData.region,
    businessModel: execSummary.business_model || businessPlan.business_model,
    businessModelDetail: execSummary.business_model_detail,
    fundingNeeded: execSummary.funding_needed || businessPlan.funding_needed,
    fundingStage: execSummary.funding_stage || 'Seed',
    mission: execSummary.mission || businessPlan.mission || idea.description,
    vision: execSummary.vision || businessPlan.vision || 'Building the future of ' + (idea.industry || 'business'),
    highlights: execSummary.highlights || execSummary.key_points || [
      'AI-powered business planning',
      'Data-driven market insights',
      'Comprehensive financial projections',
    ],
    problem: execSummary.problem || businessPlan.problem_statement,
    solution: execSummary.solution || businessPlan.solution,
  };
}

function mapMarketResearch(idea: Idea): MarketResearchData {
  const market = idea.market_research || {};

  return {
    tam: {
      value: market.tam?.value || market.total_addressable_market || '$10B',
      growth: market.tam?.growth || market.market_growth_rate,
    },
    sam: {
      value: market.sam?.value || market.serviceable_addressable_market || '$2B',
      description: market.sam?.description,
    },
    som: {
      value: market.som?.value || market.serviceable_obtainable_market || '$100M',
      description: market.som?.description,
    },
    trends: (market.trends || market.market_trends || []).map((trend: any, index: number) => ({
      label: typeof trend === 'string' ? trend : trend.label || trend.name,
      value: typeof trend === 'string' ? '' : trend.value || trend.growth || '',
      positive: typeof trend === 'string' ? true : trend.positive !== false,
    })),
    demographics: market.demographics || market.target_demographics || [],
    insight: market.key_insight || market.insight,
    opportunity: market.opportunity || market.market_opportunity,
  };
}

function mapCustomerProfiles(idea: Idea): CustomerProfilesData {
  const market = idea.market_research || {};
  const segments = market.target_segments || market.customer_segments || market.personas || [];

  if (segments.length === 0) {
    // Generate default profiles based on target market
    return {
      profiles: [{
        id: 1,
        name: 'Primary Customer',
        title: idea.target_market || 'Target Market',
        isPrimary: true,
        motivation: 'Looking for innovative solutions',
        demographics: {},
        behavior: {},
        colorScheme: 'blue',
      }],
    };
  }

  return {
    profiles: segments.map((segment: any, index: number) => ({
      id: index + 1,
      name: segment.name || segment.persona_name || `Segment ${index + 1}`,
      title: segment.title || segment.description || '',
      isPrimary: index === 0 || segment.is_primary,
      avgTicket: segment.avg_ticket || segment.average_order_value,
      demographics: {
        ageRange: segment.age_range || segment.demographics?.age,
        profession: segment.profession || segment.demographics?.profession,
        location: segment.location || segment.demographics?.location,
      },
      behavior: {
        visitTime: segment.visit_time || segment.behavior?.frequency,
        decisionDriver: segment.decision_driver || segment.behavior?.motivation,
        traits: segment.traits || segment.behavior?.traits,
      },
      motivation: segment.motivation || segment.pain_points || '',
      colorScheme: colorSchemes[index % colorSchemes.length],
    })),
  };
}

function mapCompetitorLandscape(idea: Idea): CompetitorLandscapeData {
  const competitors = idea.competitor_analysis || {};
  const competitorList = competitors.competitors || competitors.direct_competitors || [];

  return {
    competitors: competitorList.slice(0, COMPETITOR_DISPLAY_LIMIT).map((comp: any, index: number) => ({
      name: comp.name || `Competitor ${index + 1}`,
      initial: (comp.name || 'C')[0].toUpperCase(),
      type: comp.type || comp.category || 'Direct',
      avgPrice: comp.price_range || comp.avg_price,
      color: competitorColors[index % competitorColors.length],
      position: comp.position || { x: 30 + (index * 15) % 40, y: 30 + (index * 20) % 40 },
    })),

    yourPosition: competitors.your_position || { x: 75, y: 75 },
    strengths: competitors.strengths || competitors.competitive_advantages || [],
    weaknesses: competitors.weaknesses || [],
    opportunities: competitors.opportunities || [],
    threats: competitors.threats || [],
  };
}

function mapBusinessPlan(idea: Idea): BusinessPlanData {
  const plan = idea.business_plan || {};
  const phases = plan.roadmap || plan.phases || plan.milestones || [];

  const defaultPhases = [
    { quarter: 'Q1', title: 'Foundation', status: 'complete' as const, color: 'green' as const, milestones: ['Setup operations', 'Initial hiring'] },
    { quarter: 'Q2', title: 'Growth', status: 'funded' as const, color: 'blue' as const, milestones: ['Scale marketing', 'Expand team'] },
    { quarter: 'Q3', title: 'Expansion', status: 'pending' as const, color: 'purple' as const, milestones: ['New markets', 'Product iterations'] },
    { quarter: 'Q4', title: 'Optimization', status: 'pending' as const, color: 'orange' as const, milestones: ['Profitability focus', 'Process refinement'] },
  ];

  return {
    phases: phases.length > 0 ? phases.map((phase: any, index: number) => ({
      quarter: phase.quarter || phase.timeframe || `Q${index + 1}`,
      title: phase.title || phase.name || `Phase ${index + 1}`,
      status: phase.status || (index === 0 ? 'complete' : 'pending'),
      color: (['green', 'blue', 'purple', 'orange'] as const)[index % 4],
      milestones: phase.milestones || phase.tasks || [],
    })) : defaultPhases,
    supplyChain: (plan.supply_chain || plan.vendors || []).map((vendor: any) => ({
      category: vendor.category || vendor.type,
      vendor: vendor.vendor || vendor.name,
    })),
  };
}

function mapNinetyDayPlan(idea: Idea): NinetyDayPlanData {
  const actionPlan = idea.action_plan || {};
  const months = actionPlan.months || actionPlan.timeline || [];

  const defaultMonths = [
    { month: 1, label: 'Month 1', title: 'Foundation & Setup', status: 'complete' as const, color: 'green' as const, milestones: ['Legal setup', 'Initial marketing', 'First hires'] },
    { month: 2, label: 'Month 2', title: 'Launch & Learn', status: 'in-progress' as const, color: 'blue' as const, milestones: ['Soft launch', 'Customer feedback', 'Iterate product'] },
    { month: 3, label: 'Month 3', title: 'Scale & Optimize', status: 'pending' as const, color: 'purple' as const, milestones: ['Full launch', 'Paid acquisition', 'Revenue targets'] },
  ];

  return {
    months: months.length > 0 ? months.map((month: any, index: number) => ({
      month: month.month || index + 1,
      label: month.label || `Month ${index + 1}`,
      title: month.title || month.focus,
      status: month.status || (index === 0 ? 'complete' : index === 1 ? 'in-progress' : 'pending'),
      color: (['green', 'blue', 'purple'] as const)[index % 3],
      milestones: month.milestones || month.tasks || [],
    })) : defaultMonths,
    successMetrics: {
      revenueTarget: actionPlan.revenue_target || actionPlan.success_metrics?.revenue,
      customerAcquisition: actionPlan.customer_target || actionPlan.success_metrics?.customers,
    },
  };
}

function mapGoToMarket(idea: Idea): GoToMarketData {
  const gtm = idea.go_to_market || {};
  const channels = gtm.channels || gtm.marketing_channels || [];

  const defaultChannels = [
    { name: 'Social Media', description: 'Organic content and paid advertising', icon: 'ChatBubbleLeftRightIcon', iconBgColor: 'bg-blue-100' },
    { name: 'SEO/Content', description: 'Blog posts and search optimization', icon: 'MagnifyingGlassIcon', iconBgColor: 'bg-green-100' },
    { name: 'Partnerships', description: 'Strategic alliances and referrals', icon: 'UsersIcon', iconBgColor: 'bg-purple-100' },
  ];

  return {
    cac: gtm.cac || gtm.customer_acquisition_cost || '$50',
    ltv: gtm.ltv || gtm.customer_lifetime_value || '$500',
    channels: channels.length > 0 ? channels.map((channel: any) => ({
      name: channel.name || channel.channel,
      description: channel.description || channel.strategy,
      icon: getChannelIcon(channel.name || channel.channel),
      iconBgColor: channel.color || 'bg-blue-100',
      priority: channel.priority,
    })) : defaultChannels,
    viralMechanic: gtm.viral_mechanic ? {
      title: gtm.viral_mechanic.title || 'Referral Program',
      description: gtm.viral_mechanic.description,
    } : undefined,
  };
}

function getChannelIcon(channelName: string): string {
  const name = channelName?.toLowerCase() || '';
  if (name.includes('social')) return 'ChatBubbleLeftRightIcon';
  if (name.includes('seo') || name.includes('search')) return 'MagnifyingGlassIcon';
  if (name.includes('email')) return 'EnvelopeIcon';
  if (name.includes('partner')) return 'UsersIcon';
  if (name.includes('paid') || name.includes('ads')) return 'CurrencyDollarIcon';
  if (name.includes('content')) return 'DocumentTextIcon';
  return 'MegaphoneIcon';
}

function mapFinancialModel(idea: Idea): FinancialModelData {
  const finance = idea.financial_model || {};
  const isLocked = finance.locked === true;

  if (isLocked) {
    return {
      metrics: [],
      projections: [],
      startupCosts: [],
      totalCapital: '',
      isLocked: true,
    };
  }

  const metrics = finance.key_metrics || finance.metrics || [];
  const projections = finance.projections || finance.financial_projections || [];
  const startupCosts = finance.startup_costs || finance.initial_investment || [];

  return {
    metrics: metrics.map((m: any) => ({
      label: m.label || m.name,
      value: m.value,
      highlight: m.highlight,
    })),
    projections: projections.map((p: any) => ({
      metric: p.metric || p.name,
      year1: p.year1 || p.year_1,
      year2: p.year2 || p.year_2,
      year3: p.year3 || p.year_3,
      isHighlight: p.is_highlight || p.metric?.toLowerCase().includes('revenue'),
      isNegative: p.is_negative || p.metric?.toLowerCase().includes('cost'),
    })),
    startupCosts: startupCosts.map((c: any) => ({
      item: c.item || c.category,
      amount: c.amount || c.cost,
    })),
    totalCapital: finance.total_capital || finance.total_funding_needed || '$100,000',
    isLocked: false,
  };
}

function mapRiskAssessment(idea: Idea): RiskAssessmentData {
  const riskData = idea.risk_assessment || {};
  const risks = riskData.risks || [];

  const defaultRisks = [
    {
      category: 'Market Risk',
      icon: 'ChartBarIcon',
      iconColor: 'text-orange-600',
      severity: 'medium' as const,
      items: ['Market adoption uncertainty', 'Competitor response'],
      mitigation: 'Continuous market research and agile pivoting',
    },
    {
      category: 'Financial Risk',
      icon: 'BanknotesIcon',
      iconColor: 'text-red-600',
      severity: 'high' as const,
      items: ['Cash flow management', 'Funding gaps'],
      mitigation: 'Conservative financial planning and multiple funding sources',
    },
    {
      category: 'Operational Risk',
      icon: 'CogIcon',
      iconColor: 'text-blue-600',
      severity: 'low' as const,
      items: ['Scaling challenges', 'Team retention'],
      mitigation: 'Strong processes and competitive compensation',
    },
  ];

  return {
    risks: risks.length > 0 ? risks.map((risk: any) => ({
      category: risk.category || risk.type,
      icon: getRiskIcon(risk.category || risk.type),
      iconColor: getSeverityColor(risk.severity),
      severity: risk.severity || 'medium',
      items: risk.items || risk.factors || [],
      mitigation: risk.mitigation || risk.mitigation_strategy,
    })) : defaultRisks,
    framework: riskData.framework,
  };
}

function getRiskIcon(category: string): string {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('market')) return 'ChartBarIcon';
  if (cat.includes('financial') || cat.includes('finance')) return 'BanknotesIcon';
  if (cat.includes('operational') || cat.includes('operation')) return 'CogIcon';
  if (cat.includes('legal') || cat.includes('regulatory')) return 'ScaleIcon';
  if (cat.includes('technology') || cat.includes('tech')) return 'ComputerDesktopIcon';
  return 'ShieldExclamationIcon';
}

function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-orange-600';
    case 'low': return 'text-green-600';
    default: return 'text-gray-600';
  }
}

function mapPitchDeck(idea: Idea): PitchDeckData {
  const pitch = idea.pitch_deck || {};
  const isLocked = pitch.locked === true;

  if (isLocked) {
    return {
      slides: [],
      keyMessages: [],
      isLocked: true,
    };
  }

  const slides = pitch.slides || [];

  return {
    slides: slides.map((slide: any) => ({
      title: slide.title,
      content: slide.content || slide.body,
      visuals: slide.visuals || slide.visual_suggestion,
      speakerNotes: slide.speaker_notes || slide.notes,
    })),
    keyMessages: pitch.key_messages || pitch.talking_points || [],
    callToAction: pitch.call_to_action || pitch.cta,
    isLocked: false,
  };
}

function mapTeamOps(idea: Idea): TeamOpsData {
  const team = idea.team_plan || {};
  const members = team.members || team.team_members || [];
  const openPositions = team.open_positions || team.hiring_plan || [];
  const partners = team.partners || team.key_partners || [];

  return {
    members: members.map((member: any) => ({
      name: member.name,
      role: member.role || member.title,
      background: member.background || member.bio,
      isOwner: member.is_owner || member.is_founder,
      salary: member.salary,
      avatarUrl: member.avatar_url || member.image,
    })),
    openPositions: openPositions.map((pos: any) => ({
      title: pos.title || pos.role,
      timing: pos.timing || pos.hire_date,
      pay: pos.pay || pos.salary_range,
    })),
    partners: typeof partners[0] === 'string' ? partners : partners.map((p: any) => p.name || p),
  };
}

export default mapIdeaToReportData;

function mapBrandArchetype(idea: Idea): BrandArchetypeData | undefined {
  const archetype = (idea as any).brandArchetype;
  if (!archetype) return undefined;

  return {
    primaryArchetype: archetype.primaryArchetype || {
      name: 'Creator',
      rank: 1,
      definition: 'Innovator who brings new ideas to life',
      humanNeed: 'Self-expression and innovation',
      personalityTraits: ['Creative', 'Innovative', 'Visionary'],
    },
    secondaryArchetypes: archetype.secondaryArchetypes || [],
    emotionalBenefits: archetype.emotionalBenefits || [],
    coreInsight: archetype.coreInsight || '',
  };
}

function mapBrandBook(idea: Idea): BrandBookData | undefined {
  const brandBook = (idea as any).brandBook;
  if (!brandBook) return undefined;

  return {
    mission: brandBook.mission,
    vision: brandBook.vision,
    coreValues: brandBook.coreValues || [],
    colorPalette: brandBook.colorPalette,
    typography: brandBook.typography,
    brandVoice: brandBook.brandVoice || [],
  };
}

function mapGapAnalysis(idea: Idea): GapAnalysisData | undefined {
  const gapAnalysis = (idea as any).gapAnalysis;
  if (!gapAnalysis) return undefined;

  return {
    competitiveMetrics: gapAnalysis.competitiveMetrics || [],
    swot: gapAnalysis.swot,
    portersFiveForces: gapAnalysis.portersFiveForces || [],
    strategicGaps: gapAnalysis.strategicGaps || [],
  };
}

function mapLegalCompliance(idea: Idea): LegalComplianceData | undefined {
  const legalCompliance = (idea as any).legalCompliance;
  if (!legalCompliance) return undefined;

  return {
    riskMatrix: legalCompliance.riskMatrix || [],
    pestel: legalCompliance.pestel || [],
    complianceStatus: legalCompliance.complianceStatus || [],
    keyRegulations: legalCompliance.keyRegulations || [],
  };
}
