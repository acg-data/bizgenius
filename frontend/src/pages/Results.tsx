import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '../lib/convex';
import { api } from '../convex/_generated/api';
import { useAuth } from '../hooks/useAuth';
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
  BanknotesIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
  LockClosedIcon,
  PaintBrushIcon,
  SwatchIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { canAccessSection } from '../convex/lib/limits';
import type { GenerationResult } from '../types/generation';
import { GENERATION_STEPS } from '../types/generation';

import {
  MarketSection,
  CustomersSection,
  CompetitorsSection,
  BusinessPlanSection,
  GoToMarketSection,
  FinancialSection,
  PitchDeckSection,
  TeamSection,
} from '../components/results';

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  market: ChartBarIcon,
  customers: UsersIcon,
  competitors: BuildingOfficeIcon,
  brandArchetype: PaintBrushIcon,
  brandBook: SwatchIcon,
  businessPlan: BriefcaseIcon,
  gapAnalysis: ScaleIcon,
  goToMarket: RocketLaunchIcon,
  financial: BanknotesIcon,
  legalCompliance: ShieldCheckIcon,
  pitchDeck: PresentationChartBarIcon,
  team: UserGroupIcon,
};

const sectionColors: Record<string, string> = {
  market: 'text-blue-600',
  customers: 'text-green-600',
  competitors: 'text-orange-600',
  brandArchetype: 'text-indigo-600',
  brandBook: 'text-fuchsia-600',
  businessPlan: 'text-purple-600',
  gapAnalysis: 'text-slate-600',
  goToMarket: 'text-cyan-600',
  financial: 'text-emerald-600',
  legalCompliance: 'text-red-600',
  pitchDeck: 'text-pink-600',
  team: 'text-violet-600',
};

export default function Results() {
  // Safe window access for SSR compatibility
  const getUrlParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  };

  const urlParams = getUrlParams();
  const sessionId = urlParams.get('sessionId') || (typeof window !== 'undefined' ? localStorage.getItem('myceo_session_id') : null);

  // Get tier from URL parameter, fallback to user subscription
  const urlTier = urlParams.get('tier');
  const { user } = useAuth();
  const tier = (urlTier && ['free', 'premium', 'expert'].includes(urlTier)) ? urlTier : (user?.subscription_tier || "free");

  const session = useQuery(
    api.sessions.getSessionStatus,
    sessionId ? { sessionId } : "skip"
  );
  const isLoading = sessionId ? session === undefined : false;

  const saveIdea = useMutation(api.sessions.saveSessionToIdea);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('market');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = GENERATION_STEPS.map(s => s.key);
      for (const sectionKey of sections) {
        const element = document.getElementById(sectionKey);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(sectionKey);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSave = async () => {
    if (!session?.result || !sessionId) return;

    try {
      const idea = localStorage.getItem('myceo_business_idea') || '';
      await saveIdea({
        sessionId,
        title: idea.substring(0, 50),
        description: idea.substring(0, 200)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save idea:", error);
      alert("Failed to save idea. Please try again.");
    }
  };

  const scrollToSection = (sectionKey: string) => {
    const element = document.getElementById(sectionKey);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (!session || session.status !== "completed") {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg p-12 text-center max-w-md">
          <SparklesIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Complete</h1>
          <p className="text-gray-600 mb-6">Your business analysis is still being generated. Please check back in a few minutes.</p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Check Progress
          </Link>
        </div>
      </div>
    );
  }

  const result: GenerationResult = session.result;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen font-sans antialiased">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-gray-900">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
            <span className="text-lg tracking-tight">myCEO</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                saved
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <BookmarkIcon className="w-5 h-5" />
                  Save
                </>
              )}
            </button>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              tier === 'free' ? 'bg-gray-100 text-gray-700' :
              tier === 'premium' ? 'bg-blue-100 text-blue-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
            </span>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white/60 backdrop-blur-sm border-r border-gray-200 p-4 hidden lg:block overflow-y-auto">
        <div className="space-y-1">
            {GENERATION_STEPS.map((step) => {
            const Icon = sectionIcons[step.key] || Squares2X2Icon;
            const isActive = activeSection === step.key;
            const isLocked = !canAccessSection(tier, step.key);
            const iconColor = sectionColors[step.key] || 'text-gray-400';

            return (
              <button
                key={step.key}
                onClick={() => scrollToSection(step.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? iconColor : 'text-gray-400'}`} />
                <span className="font-medium text-sm">{step.label}</span>
                {isLocked && (
                  <LockClosedIcon className="w-4 h-4 text-gray-400 ml-auto" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Business Analysis</h1>
            <p className="text-lg text-gray-600">Complete 12-section analysis for your business idea</p>
          </div>

          {/* Section Components */}
          <div className="space-y-16">
            {/* Market Research */}
            <MarketSection data={result?.market} />

            {/* Customer Profiles */}
            <CustomersSection data={result?.customers} />

            {/* Competitor Landscape */}
            <CompetitorsSection data={result?.competitors} />

            {/* Business Plan - May be locked for free tier */}
            {canAccessSection(tier, "businessPlan") ? (
              <BusinessPlanSection data={result?.businessPlan} />
            ) : (
              <LockedSection
                title="Business Strategy"
                description="Get mission, vision, operations plan, and strategic roadmap"
                icon={BriefcaseIcon}
              />
            )}

            {/* Go-to-Market - May be locked for free tier */}
            {canAccessSection(tier, "goToMarket") ? (
              <GoToMarketSection data={result?.goToMarket} />
            ) : (
              <LockedSection
                title="Go-to-Market Strategy"
                description="Get launch plan, customer acquisition channels, and viral mechanics"
                icon={RocketLaunchIcon}
              />
            )}

            {/* Financial Model - May be locked for free tier */}
            {canAccessSection(tier, "financial") ? (
              <FinancialSection data={result?.financial} />
            ) : (
              <LockedSection
                title="Financial Model"
                description="Get 5-year projections, P&L statements, and funding requirements"
                icon={BanknotesIcon}
              />
            )}

            {/* Pitch Deck - May be locked for expert tier only */}
            {canAccessSection(tier, "pitchDeck") ? (
              <PitchDeckSection data={result?.pitchDeck} />
            ) : (
              <LockedSection
                title="Pitch Deck"
                description="Get investor-ready 10-slide presentation with speaker notes"
                icon={PresentationChartBarIcon}
              />
            )}

            {/* Team & Advisors - May be locked for expert tier only */}
            {canAccessSection(tier, "team") ? (
              <TeamSection data={result?.team} />
            ) : (
              <LockedSection
                title="Team & Advisors"
                description="Get hiring plan, founder profiles, and strategic partners"
                icon={UserGroupIcon}
              />
            )}


          </div>

          {/* Footer CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Take Action?</h3>
            <p className="text-blue-100 mb-6">Save this analysis and start building your business today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSave}
                disabled={saved}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <BookmarkIcon className="w-5 h-5" />
                {saved ? 'Saved to Ideas!' : 'Save to My Ideas'}
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-400 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-2 lg:hidden">
        <div className="flex justify-around">
          {GENERATION_STEPS.slice(0, 4).map((step) => {
            const Icon = sectionIcons[step.key];
            const isActive = activeSection === step.key;

            return (
              <button
                key={step.key}
                onClick={() => scrollToSection(step.key)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{step.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function LockedSection({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <section className="scroll-mt-20">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <LockClosedIcon className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2 flex items-center justify-center gap-2">
          <Icon className="w-7 h-7" />
          {title}
        </h2>
        <p className="text-gray-500 mb-6">{description}</p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
        >
          Upgrade to Unlock
        </Link>
      </div>
    </section>
  );
}
