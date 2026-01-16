import React, { useState, useEffect } from 'react';
import { api } from '../convex/_generated/api';
import { useQuery } from '../lib/convex';
import SectionRenderer from './SectionRenderer';
import {
  TrendingUp,
  Users,
  GitCompare,
  Target,
  Rocket,
  DollarSign,
  Presentation,
  UserCheck,
  ChevronDown,
  Download
} from 'lucide-react';

// Business Plan Sections Configuration
const businessPlanSections = [
  {
    id: 'market',
    label: 'Market Analysis',
    icon: TrendingUp,
    description: 'TAM/SAM/SOM analysis and market trends',
    tier: 'free'
  },
  {
    id: 'customers',
    label: 'Customer Profiles',
    icon: Users,
    description: 'Detailed customer personas and segments',
    tier: 'free'
  },
  {
    id: 'competitors',
    label: 'Competitor Analysis',
    icon: GitCompare,
    description: 'SWOT analysis and positioning matrix',
    tier: 'free'
  },
  {
    id: 'businessPlan',
    label: 'Business Strategy',
    icon: Target,
    description: 'Mission, vision, operations, and roadmap',
    tier: 'pro'
  },
  {
    id: 'goToMarket',
    label: 'Go-to-Market',
    icon: Rocket,
    description: 'Launch strategy and customer acquisition',
    tier: 'pro'
  },
  {
    id: 'financial',
    label: 'Financial Model',
    icon: DollarSign,
    description: 'Projections, funding, and unit economics',
    tier: 'pro'
  },
  {
    id: 'pitchDeck',
    label: 'Pitch Deck',
    icon: Presentation,
    description: 'Investor presentation slides',
    tier: 'expert'
  },
  {
    id: 'team',
    label: 'Team & Advisors',
    icon: UserCheck,
    description: 'Founders, hiring plan, and advisors',
    tier: 'expert'
  }
];

// Tier Configuration
const TIER_CONFIG = {
  free: {
    maxSections: 3,
    badge: "Free Plan",
    color: "bg-gray-100 text-gray-700",
    features: ["Basic viewing", "Limited export"],
    watermark: true
  },
  pro: {
    maxSections: 6,
    badge: "Pro Plan",
    color: "bg-blue-100 text-blue-700",
    features: ["Full sections", "Advanced export", "Priority support"],
    watermark: false
  },
  expert: {
    maxSections: 8,
    badge: "Expert Plan",
    color: "bg-purple-100 text-purple-700",
    features: ["All sections", "Custom branding", "White-label export", "API access"],
    watermark: false
  }
};

// Sidebar Navigation Component
const SidebarNavigation = ({ sections, tier, activeSection, onSectionChange }) => {
  const config = TIER_CONFIG[tier];

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Mac Window Dots */}
      <div className="p-4 flex gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
      </div>

      {/* Company Switcher */}
      <div className="px-4 mb-8">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          <span className="font-medium text-gray-700">BizGenius</span>
          <ChevronDown size={16} className="ml-auto text-gray-400" />
        </button>
      </div>

      {/* Tier Badge */}
      <div className="px-4 mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.badge}
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-1">
        {sections.map((section, idx) => {
          const isLocked = section.tier === 'expert' && tier !== 'expert';
          const isProLocked = section.tier === 'pro' && !['pro', 'expert'].includes(tier);

          return (
            <div
              key={section.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-600"
                  : isLocked || isProLocked
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => !isLocked && !isProLocked && onSectionChange(section.id)}
            >
              <section.icon size={18} className={activeSection === section.id ? "text-blue-600" : "text-gray-400"} />
              <span>{section.label}</span>
              {isLocked && (
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  Expert
                </span>
              )}
              {isProLocked && !isLocked && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  Pro
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

// Progress Indicator Component
const ProgressIndicator = ({ completedSections, totalSections }) => {
  const progress = (completedSections / totalSections) * 100;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-blue-900">Business Plan Progress</span>
          <span className="text-blue-700">{completedSections}/{totalSections} sections</span>
        </div>
        <div className="w-full bg-blue-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// PDF Export Button
const PDFExportButton = ({ tier, businessPlan, availableSections }) => {
  const handleExport = () => {
    // Placeholder for PDF export functionality
    console.log('Exporting PDF for tier:', tier);
    console.log('Available sections:', availableSections.length);
    console.log('Business plan data:', businessPlan);
    alert(`PDF Export functionality for ${tier} tier would be implemented here`);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Download size={16} />
      Export PDF
    </button>
  );
};

// Main Business Plan Dashboard Component
const BusinessPlanDashboard = () => {
  // Parse tier from URL parameters
  const [tier, setTier] = useState('free');
  const [activeSection, setActiveSection] = useState('market');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlTier = urlParams.get('tier');
    if (urlTier && ['free', 'pro', 'expert'].includes(urlTier)) {
      setTier(urlTier);
    }
  }, []);

  // Get business plan data
  const sessionId = 'current-session-id'; // This would come from your routing/state
  const { data: session, isLoading } = useQuery(api.sessions.getSessionStatus, { sessionId });

  const config = TIER_CONFIG[tier];
  const availableSections = businessPlanSections.slice(0, config.maxSections);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans flex justify-center items-center">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-xl overflow-hidden flex border border-gray-200 min-h-[800px]">

        {/* Sidebar */}
        <SidebarNavigation
          sections={businessPlanSections}
          tier={tier}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content */}
        <div className="flex-1 bg-gray-50/50 flex flex-col">

          {/* Header */}
          <div className="p-8 pb-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Business Plan Analysis</h1>
                <p className="text-gray-500 text-sm">Comprehensive analysis generated by AI</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-green-700 shadow-sm`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Complete
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                  {config.badge}
                </span>
              </div>
            </div>

            {/* Progress and Export */}
            <div className="flex justify-between items-center">
              <ProgressIndicator
                completedSections={config.maxSections}
                totalSections={8}
              />
              <PDFExportButton
                tier={tier}
                businessPlan={session?.result || {}}
                availableSections={availableSections}
              />
            </div>
          </div>

          {/* Section Content */}
          <div className="flex-1 p-8 pt-0 overflow-y-auto">
            <SectionRenderer
              sectionId={activeSection}
              data={session?.result?.[activeSection] || {}}
              tier={tier}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanDashboard;