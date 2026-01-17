export const SUBSCRIPTION_LIMITS = {
  free: {
    analysesPerMonth: 1,
    // Free tier: 3 sections (market, customers, competitors)
    sectionsUnlocked: ["market", "customers", "competitors"],
    maxIdeas: 2,
    hasExport: false,
  },
  premium: {
    analysesPerMonth: 10,
    // Premium tier: 7 sections (adds businessPlan, goToMarket, financial, riskAssessment, team)
    sectionsUnlocked: ["market", "customers", "competitors", "businessPlan", "goToMarket", "financial", "riskAssessment", "team"],
    maxIdeas: 20,
    hasExport: true,
  },
  expert: {
    analysesPerMonth: -1, // unlimited
    sectionsUnlocked: ["all"], // All sections
    maxIdeas: -1, // unlimited
    hasExport: true,
    prioritySupport: true,
    customBranding: true,
  },
} as const;

export function getLimitsForUser(tier: "free" | "premium" | "expert") {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
}

export function canAccessSection(
  tier: "free" | "premium" | "expert",
  section: string
): boolean {
  const limits = getLimitsForUser(tier);
  const sections = limits.sectionsUnlocked as readonly string[];
  if (sections.includes("all")) return true;
  return sections.includes(section);
}

export function redactPremiumSections(result: any, tier: "free" | "premium" | "expert") {
  if (tier !== "free") return result;

  const PREMIUM_SECTIONS = [
    "financial",
    "pitchDeck",
  ];

  const redacted = { ...result };
  for (const section of PREMIUM_SECTIONS) {
    if (redacted[section]) {
      redacted[section] = {
        locked: true,
        message: "Upgrade to Premium to unlock this section",
        preview: getSectionPreview(section, redacted[section]),
      };
    }
  }
  return redacted;
}

function getSectionPreview(section: string, data: any): any {
  if (section === "financial") {
    const projections = data?.projections || [];
    return {
      available_years: projections.length || 5,
      has_break_even: !!data?.summary?.breakEvenMonths,
      has_funding_strategy: !!data?.fundingNeeds,
    };
  } else if (section === "pitchDeck") {
    const slides = data?.slides || [];
    return {
      total_slides: slides.length || 10,
      slide_titles: slides.slice(0, 3).map((s: any) => s?.title || "Slide"),
    };
  }
  return {};
}
