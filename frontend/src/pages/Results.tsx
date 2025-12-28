import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CommandLineIcon, 
  ArrowDownTrayIcon, 
  ArrowPathIcon, 
  ShareIcon,
  ChevronRightIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  RocketLaunchIcon,
  ShieldExclamationIcon,
  CalendarDaysIcon,
  PresentationChartLineIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const RESULT_KEY = 'myceo_analysis_result';

type TabId = 'summary' | 'market' | 'business' | 'financials' | 'competitors' | 'gtm' | 'team' | 'risks' | 'action' | 'pitch' | 'local';

interface Tab {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  color: string;
}

const baseTabs: Tab[] = [
  { id: 'summary', label: 'Executive Summary', shortLabel: 'Summary', icon: SparklesIcon, color: 'from-violet-500 to-purple-600' },
  { id: 'market', label: 'Market Research', shortLabel: 'Market', icon: ChartBarIcon, color: 'from-blue-500 to-cyan-500' },
  { id: 'competitors', label: 'Competitor Analysis', shortLabel: 'Competitors', icon: BuildingOfficeIcon, color: 'from-orange-500 to-red-500' },
  { id: 'business', label: 'Business Plan', shortLabel: 'Business', icon: DocumentTextIcon, color: 'from-emerald-500 to-teal-500' },
  { id: 'financials', label: 'Financial Model', shortLabel: 'Financials', icon: CurrencyDollarIcon, color: 'from-green-500 to-emerald-500' },
  { id: 'gtm', label: 'Go-to-Market', shortLabel: 'GTM', icon: RocketLaunchIcon, color: 'from-pink-500 to-rose-500' },
  { id: 'team', label: 'Team Plan', shortLabel: 'Team', icon: UserGroupIcon, color: 'from-indigo-500 to-blue-500' },
  { id: 'risks', label: 'Risk Assessment', shortLabel: 'Risks', icon: ShieldExclamationIcon, color: 'from-amber-500 to-orange-500' },
  { id: 'action', label: '90-Day Action Plan', shortLabel: '90 Days', icon: CalendarDaysIcon, color: 'from-cyan-500 to-blue-500' },
  { id: 'pitch', label: 'Pitch Deck', shortLabel: 'Pitch', icon: PresentationChartLineIcon, color: 'from-fuchsia-500 to-pink-500' },
];

const localTab: Tab = { id: 'local', label: 'Local Market', shortLabel: 'Local', icon: MapPinIcon, color: 'from-lime-500 to-green-500' };

const GlassCard = ({ children, className = '', hover = true, gradient = false }: { children: React.ReactNode; className?: string; hover?: boolean; gradient?: boolean }) => (
  <div className={`
    relative overflow-hidden rounded-2xl
    ${gradient ? 'bg-gradient-to-br from-white/80 to-white/60' : 'bg-white/70'}
    backdrop-blur-xl border border-white/20
    shadow-[0_8px_32px_rgba(0,0,0,0.08)]
    ${hover ? 'hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:scale-[1.01] hover:border-white/30' : ''}
    transition-all duration-300 ease-out
    ${className}
  `}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
    <div className="relative z-10">{children}</div>
  </div>
);

const KPICard = ({ label, value, subtext, icon: Icon, color }: { label: string; value: string; subtext?: string; icon: React.ElementType; color: string }) => (
  <GlassCard className="p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900 tracking-tight">{value}</div>
    {subtext && <div className="text-sm text-gray-500 mt-1">{subtext}</div>}
  </GlassCard>
);

const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(0,0,0,0.05)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const MarketSizeChart = ({ tam, sam, som }: { tam: string; sam: string; som: string }) => {
  const extractNumber = (str: string) => {
    const match = str?.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };
  
  const tamVal = extractNumber(tam);
  const samVal = extractNumber(sam);
  const somVal = extractNumber(som);
  const maxVal = Math.max(tamVal, 1);
  
  return (
    <div className="flex items-end justify-center gap-6 h-48 px-4">
      <div className="flex flex-col items-center">
        <div 
          className="w-20 rounded-t-xl bg-gradient-to-t from-violet-600 to-violet-400 shadow-lg transition-all duration-500"
          style={{ height: `${(tamVal / maxVal) * 140}px`, minHeight: '40px' }}
        />
        <div className="mt-3 text-center">
          <div className="text-lg font-bold text-gray-900">{tam}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">TAM</div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div 
          className="w-20 rounded-t-xl bg-gradient-to-t from-blue-600 to-cyan-400 shadow-lg transition-all duration-500"
          style={{ height: `${(samVal / maxVal) * 140}px`, minHeight: '40px' }}
        />
        <div className="mt-3 text-center">
          <div className="text-lg font-bold text-gray-900">{sam}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">SAM</div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div 
          className="w-20 rounded-t-xl bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg transition-all duration-500"
          style={{ height: `${(somVal / maxVal) * 140}px`, minHeight: '40px' }}
        />
        <div className="mt-3 text-center">
          <div className="text-lg font-bold text-gray-900">{som}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">SOM</div>
        </div>
      </div>
    </div>
  );
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [result, setResult] = useState<any>(null);
  const [_businessIdea, setBusinessIdea] = useState<string>('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      setBusinessIdea(location.state.businessIdea || '');
      setBranding(location.state.branding || null);
    } else {
      const savedResult = localStorage.getItem(RESULT_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
      const savedBranding = localStorage.getItem('myceo_branding');
      if (savedBranding) {
        setBranding(JSON.parse(savedBranding));
      }
    }
  }, [location.state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs = useMemo(() => 
    result?.local_business_data ? [...baseTabs, localTab] : baseTabs,
    [result?.local_business_data]
  );

  const kpiMetrics = useMemo(() => {
    if (!result) return [];
    const metrics: { label: string; value: string; subtext?: string; icon: React.ElementType; color: string }[] = [];
    
    if (result.market_research?.tam?.value) {
      metrics.push({ label: 'TAM', value: result.market_research.tam.value, icon: ChartBarIcon, color: 'from-violet-500 to-purple-600' });
    }
    if (result.financial_model?.break_even?.month) {
      metrics.push({ label: 'Break-even', value: `${result.financial_model.break_even.month} months`, icon: CalendarDaysIcon, color: 'from-emerald-500 to-teal-500' });
    }
    if (result.financial_model?.funding?.total_raise) {
      metrics.push({ label: 'Funding', value: result.financial_model.funding.total_raise, icon: CurrencyDollarIcon, color: 'from-blue-500 to-cyan-500' });
    }
    if (result.team_plan?.founding_team?.roles?.length) {
      metrics.push({ label: 'Team Size', value: `${result.team_plan.founding_team.roles.length} roles`, icon: UserGroupIcon, color: 'from-pink-500 to-rose-500' });
    }
    
    return metrics.slice(0, 4);
  }, [result]);

  const completedSections = useMemo(() => {
    if (!result) return 0;
    let count = 0;
    if (result.executive_summary) count++;
    if (result.market_research) count++;
    if (result.competitor_analysis) count++;
    if (result.business_plan) count++;
    if (result.financial_model) count++;
    if (result.go_to_market) count++;
    if (result.team_plan) count++;
    if (result.risk_assessment) count++;
    if (result.action_plan) count++;
    if (result.pitch_deck) count++;
    return count;
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 font-semibold">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <CommandLineIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg tracking-tight">myCEO</span>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-lg mx-auto px-6 pt-40 pb-16 text-center">
          <GlassCard className="p-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="w-10 h-10 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">No Analysis Found</h1>
            <p className="text-gray-500 mb-8">Generate a business analysis first to view your results.</p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <SparklesIcon className="w-5 h-5" />
              Start New Analysis
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  const generateFinancialsCSV = () => {
    const data = result.financial_model;
    if (!data) return;
    
    const rows: string[][] = [];
    rows.push(['myCEO Financial Model']);
    rows.push([]);
    
    if (data.assumptions) {
      rows.push(['KEY ASSUMPTIONS']);
      Object.entries(data.assumptions).forEach(([key, value]) => {
        rows.push([key.replace(/_/g, ' ').toUpperCase(), String(value)]);
      });
      rows.push([]);
    }
    
    if (data.projections && data.projections.length > 0) {
      rows.push(['5-YEAR FINANCIAL PROJECTIONS']);
      rows.push(['Metric', ...data.projections.map((p: any) => `Year ${p.year}`)]);
      rows.push(['Revenue', ...data.projections.map((p: any) => p.revenue)]);
      rows.push(['Customers', ...data.projections.map((p: any) => p.customers)]);
      rows.push(['Gross Profit', ...data.projections.map((p: any) => p.gross_profit)]);
      rows.push(['EBITDA', ...data.projections.map((p: any) => p.ebitda)]);
      rows.push([]);
    }
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'myceo_financial_model.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSummary = () => {
    const data = result.executive_summary;
    if (!data) return <div className="text-gray-500">Executive summary not available</div>;
    
    return (
      <div className="space-y-6">
        {data.one_liner && (
          <GlassCard className="p-8" gradient>
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-violet-600 uppercase tracking-wider">Your One-Liner Pitch</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">"{data.one_liner}"</p>
          </GlassCard>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.problem_statement && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-red-600">🔥</span>
                </div>
                <h3 className="font-semibold text-gray-900">The Problem</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{data.problem_statement}</p>
            </GlassCard>
          )}
          
          {data.solution_overview && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900">The Solution</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{data.solution_overview}</p>
            </GlassCard>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.value_proposition && (
            <GlassCard className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Value Proposition</h3>
              <p className="text-gray-600 leading-relaxed">{data.value_proposition}</p>
            </GlassCard>
          )}
          
          {data.target_customer && (
            <GlassCard className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Target Customer</h3>
              <p className="text-gray-600 leading-relaxed">{data.target_customer}</p>
            </GlassCard>
          )}
        </div>

        {data.unfair_advantage && (
          <GlassCard className="p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/60">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <span>⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900">Unfair Advantage</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{data.unfair_advantage}</p>
          </GlassCard>
        )}

        {data.why_now && (
          <GlassCard className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/60">
            <h3 className="font-semibold text-gray-900 mb-3">Why Now?</h3>
            <p className="text-gray-700 leading-relaxed">{data.why_now}</p>
          </GlassCard>
        )}

        {data.key_risks && data.key_risks.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Key Risks & Mitigations</h3>
            <div className="space-y-3">
              {data.key_risks.map((risk: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50">
                  <ShieldExclamationIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{risk}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.success_metrics && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Success Metrics Timeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.success_metrics).map(([period, metrics]: [string, any]) => (
                <div key={period} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">
                    {period.replace('_', ' ')}
                  </div>
                  <ul className="text-sm space-y-1">
                    {Array.isArray(metrics) && metrics.map((m: string, idx: number) => (
                      <li key={idx} className="text-gray-600 flex items-start gap-1.5">
                        <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderMarket = () => {
    const data = result.market_research;
    if (!data) return <div className="text-gray-500">Market research not available</div>;
    
    return (
      <div className="space-y-6">
        {data.market_overview && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Market Overview</h3>
            <p className="text-gray-600 leading-relaxed">{data.market_overview}</p>
          </GlassCard>
        )}

        {(data.tam || data.sam || data.som) && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-center">Market Size Analysis</h3>
            <MarketSizeChart 
              tam={data.tam?.value || '$0'} 
              sam={data.sam?.value || '$0'} 
              som={data.som?.value || '$0'} 
            />
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              {data.tam && (
                <div className="text-center">
                  <div className="text-sm text-gray-600">{data.tam.calculation || data.tam.description}</div>
                  {data.tam.growth_rate && (
                    <div className="text-sm font-semibold text-emerald-600 mt-1">{data.tam.growth_rate} CAGR</div>
                  )}
                </div>
              )}
              {data.sam && (
                <div className="text-center">
                  <div className="text-sm text-gray-600">{data.sam.calculation || data.sam.description}</div>
                </div>
              )}
              {data.som && (
                <div className="text-center">
                  <div className="text-sm text-gray-600">{data.som.year_1_target}</div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {data.market_trends && data.market_trends.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Market Trends</h3>
            <div className="space-y-4">
              {data.market_trends.map((trend: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border-l-4 border-blue-500">
                  <div className="font-medium text-gray-900">{trend.trend || trend}</div>
                  {trend.description && <p className="text-gray-600 text-sm mt-1">{trend.description}</p>}
                  {trend.impact && <p className="text-sm text-emerald-600 font-medium mt-2">Impact: {trend.impact}</p>}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.customer_segments && data.customer_segments.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Customer Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.customer_segments.map((segment: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">{segment.segment_name}</div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      segment.priority === 'High' 
                        ? 'bg-violet-100 text-violet-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>{segment.priority}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{segment.size}</div>
                  {segment.pain_points && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pain Points</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {segment.pain_points.map((p: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-400">•</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.regulatory_landscape && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Regulatory Landscape</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600">Risk Level:</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                data.regulatory_landscape.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                data.regulatory_landscape.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>{data.regulatory_landscape.risk_level}</span>
            </div>
            {data.regulatory_landscape.compliance_requirements && (
              <ul className="space-y-2">
                {data.regulatory_landscape.compliance_requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        )}
      </div>
    );
  };

  const renderBusiness = () => {
    const data = result.business_plan;
    if (!data) return <div className="text-gray-500">Business plan not available</div>;
    
    return (
      <div className="space-y-6">
        {data.executive_summary && (
          <GlassCard className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/60">
            <h3 className="font-semibold text-gray-900 mb-3">Executive Summary</h3>
            <p className="text-gray-700 leading-relaxed">{data.executive_summary}</p>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.mission && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Mission</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{data.mission}</p>
            </GlassCard>
          )}
          {data.vision && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <RocketLaunchIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{data.vision}</p>
            </GlassCard>
          )}
        </div>

        {data.business_model && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Business Model</h3>
            {data.business_model.type && (
              <span className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                {data.business_model.type}
              </span>
            )}
            
            {data.business_model.pricing_strategy && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Pricing Strategy</h4>
                <p className="text-sm text-gray-600 mb-4">{data.business_model.pricing_strategy.model}</p>
                {data.business_model.pricing_strategy.tiers && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.business_model.pricing_strategy.tiers.map((tier: any, idx: number) => (
                      <div key={idx} className={`p-5 rounded-xl border ${idx === 1 ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200' : 'bg-gray-50/80 border-gray-100'}`}>
                        <div className="font-semibold text-gray-900">{tier.name}</div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mt-1">{tier.price}</div>
                        <ul className="text-sm mt-3 space-y-1.5">
                          {tier.features?.map((f: string, i: number) => (
                            <li key={i} className="text-gray-600 flex items-start gap-2">
                              <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {data.business_model.unit_economics && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-gray-100">
                {Object.entries(data.business_model.unit_economics).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center p-3 rounded-xl bg-gray-50/80">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                    <div className="font-bold text-gray-900 mt-1">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {data.swot_analysis && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">SWOT Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Strengths
                </div>
                <ul className="text-sm space-y-1.5 text-gray-700">
                  {data.swot_analysis.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-red-50/80 border border-red-100">
                <div className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <ShieldExclamationIcon className="w-5 h-5" />
                  Weaknesses
                </div>
                <ul className="text-sm space-y-1.5 text-gray-700">
                  {data.swot_analysis.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
                <div className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <RocketLaunchIcon className="w-5 h-5" />
                  Opportunities
                </div>
                <ul className="text-sm space-y-1.5 text-gray-700">
                  {data.swot_analysis.opportunities?.map((o: string, idx: number) => (
                    <li key={idx}>• {o}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100">
                <div className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                  <ShieldExclamationIcon className="w-5 h-5" />
                  Threats
                </div>
                <ul className="text-sm space-y-1.5 text-gray-700">
                  {data.swot_analysis.threats?.map((t: string, idx: number) => (
                    <li key={idx}>• {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>
        )}

        {data.product_roadmap && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Product Roadmap</h3>
            <div className="space-y-4">
              {data.product_roadmap.mvp_features && (
                <div>
                  <div className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">MVP Features</div>
                  <div className="flex flex-wrap gap-2">
                    {data.product_roadmap.mvp_features.map((f: string, idx: number) => (
                      <span key={idx} className="bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full text-sm font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.product_roadmap.phase_2 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phase 2</div>
                  <div className="flex flex-wrap gap-2">
                    {data.product_roadmap.phase_2.map((f: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderFinancials = () => {
    const data = result.financial_model;
    if (!data) return <div className="text-gray-500">Financial model not available</div>;
    
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          <button
            onClick={generateFinancialsCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download CSV
          </button>
        </div>

        {data.assumptions && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Key Assumptions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.assumptions).map(([key, value]: [string, any]) => (
                <div key={key} className="p-3 rounded-xl bg-gray-50/80 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                  <div className="font-bold text-gray-900 mt-1">{String(value)}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.projections && data.projections.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">5-Year Financial Projections</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-500">Metric</th>
                    {data.projections.map((p: any, idx: number) => (
                      <th key={idx} className="text-right py-3 px-4 font-semibold text-gray-900">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">Revenue</td>
                    {data.projections.map((p: any, idx: number) => (
                      <td key={idx} className="text-right py-3 px-4 font-semibold text-emerald-600">{p.revenue}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">Customers</td>
                    {data.projections.map((p: any, idx: number) => (
                      <td key={idx} className="text-right py-3 px-4 text-gray-900">{p.customers}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-700">Gross Profit</td>
                    {data.projections.map((p: any, idx: number) => (
                      <td key={idx} className="text-right py-3 px-4 text-gray-900">{p.gross_profit}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-gray-700">EBITDA</td>
                    {data.projections.map((p: any, idx: number) => (
                      <td key={idx} className="text-right py-3 px-4 text-gray-900">{p.ebitda}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {data.break_even && (
          <GlassCard className="p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/60">
            <h3 className="font-semibold text-gray-900 mb-4">Break-Even Analysis</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600">{data.break_even.month}</div>
                <div className="text-sm text-gray-600 mt-1">Months to Break-Even</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{data.break_even.customers_needed}</div>
                <div className="text-sm text-gray-600 mt-1">Customers Needed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{data.break_even.revenue_needed}</div>
                <div className="text-sm text-gray-600 mt-1">Revenue Needed</div>
              </div>
            </div>
          </GlassCard>
        )}

        {data.funding && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Funding Strategy</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {data.funding.total_raise}
              </span>
              <span className="text-gray-500">Total Raise</span>
            </div>
            {data.funding.rounds && (
              <div className="space-y-3">
                {data.funding.rounds.map((round: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80">
                    <div>
                      <div className="font-medium text-gray-900">{round.round}</div>
                      <div className="text-sm text-gray-500">{round.timeline}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{round.amount}</div>
                      <div className="text-sm text-gray-500">{round.use_of_funds}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    );
  };

  const renderCompetitors = () => {
    const data = result.competitor_analysis;
    if (!data) return <div className="text-gray-500">Competitor analysis not available</div>;
    
    return (
      <div className="space-y-6">
        {data.market_position && (
          <GlassCard className="p-6 bg-gradient-to-br from-orange-50/80 to-red-50/60">
            <h3 className="font-semibold text-gray-900 mb-3">Your Market Position</h3>
            <p className="text-gray-700 leading-relaxed">{data.market_position}</p>
          </GlassCard>
        )}

        {data.direct_competitors && data.direct_competitors.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Direct Competitors</h3>
            <div className="space-y-4">
              {data.direct_competitors.map((comp: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{comp.name}</h4>
                      {comp.website && (
                        <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline">
                          {comp.website}
                        </a>
                      )}
                    </div>
                    {comp.funding && (
                      <span className="text-sm font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        {comp.funding}
                      </span>
                    )}
                  </div>
                  {comp.description && <p className="text-gray-600 text-sm mb-3">{comp.description}</p>}
                  <div className="flex flex-wrap gap-2">
                    {comp.strengths?.map((s: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{s}</span>
                    ))}
                    {comp.weaknesses?.map((w: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">{w}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.competitive_advantages && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Competitive Advantages</h3>
            <div className="space-y-3">
              {data.competitive_advantages.map((adv: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{adv}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.market_gaps && data.market_gaps.length > 0 && (
          <GlassCard className="p-6 bg-gradient-to-br from-violet-50/80 to-indigo-50/60">
            <h3 className="font-semibold text-gray-900 mb-4">Market Gaps & Opportunities</h3>
            <div className="space-y-3">
              {data.market_gaps.map((gap: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                  <SparklesIcon className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{gap}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderGTM = () => {
    const data = result.go_to_market;
    if (!data) return <div className="text-gray-500">Go-to-market strategy not available</div>;
    
    return (
      <div className="space-y-6">
        {data.strategy_overview && (
          <GlassCard className="p-6 bg-gradient-to-br from-pink-50/80 to-rose-50/60">
            <h3 className="font-semibold text-gray-900 mb-3">Strategy Overview</h3>
            <p className="text-gray-700 leading-relaxed">{data.strategy_overview}</p>
          </GlassCard>
        )}

        {data.launch_phases && data.launch_phases.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Launch Phases</h3>
            <div className="space-y-4">
              {data.launch_phases.map((phase: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                    <div className="font-semibold text-gray-900">{phase.name}</div>
                    <div className="text-sm text-gray-500 mb-2">{phase.timeline}</div>
                    <p className="text-gray-600 text-sm">{phase.description}</p>
                    {phase.goals && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {phase.goals.map((goal: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-pink-100 text-pink-700">{goal}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.acquisition_channels && data.acquisition_channels.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acquisition Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.acquisition_channels.map((channel: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{channel.channel}</div>
                    {channel.priority && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        channel.priority === 'High' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                      }`}>{channel.priority}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{channel.strategy}</p>
                  {channel.expected_cac && (
                    <div className="text-sm text-emerald-600 font-medium mt-2">CAC: {channel.expected_cac}</div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.first_100_customers && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">First 100 Customers Strategy</h3>
            <p className="text-gray-700 leading-relaxed">{data.first_100_customers}</p>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderTeam = () => {
    const data = result.team_plan;
    if (!data) return <div className="text-gray-500">Team plan not available</div>;
    
    return (
      <div className="space-y-6">
        {data.founding_team && data.founding_team.roles && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Founding Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.founding_team.roles.map((role: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/60 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {role.title?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{role.title}</div>
                      {role.equity && <div className="text-sm text-indigo-600 font-medium">{role.equity} equity</div>}
                    </div>
                  </div>
                  {role.responsibilities && (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {role.responsibilities.map((r: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.hiring_roadmap && data.hiring_roadmap.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Hiring Roadmap</h3>
            <div className="space-y-4">
              {data.hiring_roadmap.map((hire: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-sm font-bold text-violet-600">{hire.timeline}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{hire.role}</div>
                    {hire.salary && <div className="text-sm text-gray-500">{hire.salary}</div>}
                  </div>
                  {hire.priority && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      hire.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{hire.priority}</span>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.culture && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Company Culture</h3>
            {data.culture.values && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.culture.values.map((value: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium">{value}</span>
                ))}
              </div>
            )}
            {data.culture.description && <p className="text-gray-600 leading-relaxed">{data.culture.description}</p>}
          </GlassCard>
        )}
      </div>
    );
  };

  const renderRisks = () => {
    const data = result.risk_assessment;
    if (!data) return <div className="text-gray-500">Risk assessment not available</div>;
    
    return (
      <div className="space-y-6">
        {data.overall_risk_score && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Overall Risk Score</h3>
                <p className="text-gray-500 text-sm">Based on comprehensive analysis</p>
              </div>
              <div className="relative">
                <ProgressRing progress={100 - (data.overall_risk_score || 50)} size={100} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{data.overall_risk_score || 50}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {data.critical_risks && data.critical_risks.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Critical Risks</h3>
            <div className="space-y-4">
              {data.critical_risks.map((risk: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-red-50/60 border border-red-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="font-semibold text-gray-900">{risk.risk}</div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      risk.severity === 'High' ? 'bg-red-100 text-red-700' :
                      risk.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>{risk.severity}</span>
                  </div>
                  {risk.mitigation && (
                    <div className="p-3 rounded-lg bg-white/60 mt-3">
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Mitigation</div>
                      <p className="text-sm text-gray-600">{risk.mitigation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.kill_conditions && data.kill_conditions.length > 0 && (
          <GlassCard className="p-6 bg-gradient-to-br from-red-50/80 to-orange-50/60">
            <h3 className="font-semibold text-gray-900 mb-4">Kill Conditions</h3>
            <p className="text-sm text-gray-600 mb-4">Conditions that should trigger a pivot or shutdown decision</p>
            <div className="space-y-3">
              {data.kill_conditions.map((condition: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/60">
                  <ShieldExclamationIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{condition}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderAction = () => {
    const data = result.action_plan;
    if (!data) return <div className="text-gray-500">Action plan not available</div>;
    
    return (
      <div className="space-y-6">
        {data.weeks && data.weeks.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">90-Day Action Plan</h3>
            <div className="space-y-6">
              {data.weeks.map((week: any, idx: number) => (
                <div key={idx} className="relative pl-8 pb-6 border-l-2 border-cyan-200 last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500" />
                  <div className="font-semibold text-gray-900 mb-2">{week.week}</div>
                  <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                    {week.focus && <p className="text-sm text-violet-600 font-medium mb-2">{week.focus}</p>}
                    {week.tasks && (
                      <ul className="space-y-2">
                        {week.tasks.map((task: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircleIcon className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {week.milestone && (
                      <div className="mt-3 p-2 rounded-lg bg-cyan-50 text-cyan-700 text-sm font-medium">
                        Milestone: {week.milestone}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.resources_needed && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Resources Needed</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.resources_needed).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 rounded-xl bg-gray-50/80 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</div>
                  <div className="font-bold text-gray-900 mt-1">{String(value)}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderPitch = () => {
    const data = result.pitch_deck;
    if (!data) return <div className="text-gray-500">Pitch deck not available</div>;
    
    return (
      <div className="space-y-6">
        {data.slides && data.slides.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Pitch Deck Outline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.slides.map((slide: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-gradient-to-br from-fuchsia-50/80 to-pink-50/60 border border-fuchsia-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="font-semibold text-gray-900">{slide.title}</div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{slide.content}</p>
                  {slide.speaker_notes && (
                    <div className="mt-3 p-2 rounded-lg bg-white/60 text-xs text-gray-500">
                      <span className="font-semibold">Notes:</span> {slide.speaker_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.investor_faqs && data.investor_faqs.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Investor FAQs</h3>
            <div className="space-y-4">
              {data.investor_faqs.map((faq: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="font-medium text-gray-900 mb-2">{faq.question}</div>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderLocalMarket = () => {
    const data = result.local_business_data;
    if (!data) return <div className="text-gray-500">Local market data not available</div>;
    
    return (
      <div className="space-y-6">
        {data.location && (
          <GlassCard className="p-6 bg-gradient-to-br from-lime-50/80 to-green-50/60">
            <div className="flex items-center gap-2 mb-2">
              <MapPinIcon className="w-5 h-5 text-lime-600" />
              <span className="text-sm font-medium text-lime-600 uppercase tracking-wider">Target Location</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.location.city}, {data.location.state}</p>
          </GlassCard>
        )}

        {data.population_data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard 
              label="City Population" 
              value={data.population_data.city_population?.toLocaleString() || '0'}
              icon={UserGroupIcon}
              color="from-lime-500 to-green-500"
            />
            <KPICard 
              label="Metro Area" 
              value={Math.round(data.population_data.metro_population || 0).toLocaleString()}
              icon={BuildingOfficeIcon}
              color="from-emerald-500 to-teal-500"
            />
            <KPICard 
              label="State Population" 
              value={data.population_data.state_population?.toLocaleString() || '0'}
              icon={MapPinIcon}
              color="from-teal-500 to-cyan-500"
            />
          </div>
        )}

        {data.competitors_analyzed && data.competitors_analyzed.length > 0 && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Competitors Analyzed ({data.competitors_analyzed.length})</h3>
            <div className="space-y-4">
              {data.competitors_analyzed.map((comp: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{comp.domain}</div>
                      {comp.title && <div className="text-sm text-gray-600">{comp.title}</div>}
                    </div>
                    {comp.error && <span className="text-xs text-red-500">Error: {comp.error}</span>}
                  </div>
                  {comp.description && <p className="text-sm text-gray-600 mb-3">{comp.description}</p>}
                  <div className="flex flex-wrap gap-2">
                    {comp.prices_found && comp.prices_found.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        ${Math.min(...comp.prices_found)} - ${Math.max(...comp.prices_found)}
                      </span>
                    )}
                    {comp.features?.has_online_booking && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Online Booking</span>
                    )}
                    {comp.features?.shows_reviews && (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Reviews</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {data.competitor_summary && (
          <GlassCard className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Competitor Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {data.competitor_summary.avg_price && (
                <div className="text-center p-4 rounded-xl bg-gray-50/80">
                  <div className="text-2xl font-bold text-gray-900">${data.competitor_summary.avg_price.toFixed(0)}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Avg Price</div>
                </div>
              )}
              <div className="text-center p-4 rounded-xl bg-gray-50/80">
                <div className="text-2xl font-bold text-gray-900">{data.competitor_summary.pct_with_online_booking?.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Online Booking</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50/80">
                <div className="text-2xl font-bold text-gray-900">{data.competitor_summary.pct_showing_reviews?.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Show Reviews</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50/80">
                <div className="text-2xl font-bold text-gray-900">{data.competitor_summary.pct_with_pricing?.toFixed(0)}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Show Pricing</div>
              </div>
            </div>
            {data.competitor_summary.market_gaps && data.competitor_summary.market_gaps.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Market Gaps Identified</h4>
                <div className="space-y-2">
                  {data.competitor_summary.market_gaps.map((gap: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'summary': return renderSummary();
      case 'market': return renderMarket();
      case 'business': return renderBusiness();
      case 'financials': return renderFinancials();
      case 'competitors': return renderCompetitors();
      case 'gtm': return renderGTM();
      case 'team': return renderTeam();
      case 'risks': return renderRisks();
      case 'action': return renderAction();
      case 'pitch': return renderPitch();
      case 'local': return renderLocalMarket();
      default: return null;
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-semibold">
            {branding?.selectedLogo ? (
              <img src={branding.selectedLogo} alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <CommandLineIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-lg tracking-tight">{branding?.companyName || 'myCEO'}</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/80 text-gray-500 text-sm hover:bg-gray-200/80 transition-colors"
            >
              <span>Quick Actions</span>
              <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-xs font-mono">⌘K</kbd>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all text-sm"
            >
              <SparklesIcon className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </nav>

      {showCommandPalette && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCommandPalette(false)} />
          <div className="relative w-full max-w-lg mx-4">
            <GlassCard className="overflow-hidden" hover={false}>
              <div className="p-4 border-b border-gray-100">
                <input 
                  type="text" 
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent text-lg outline-none placeholder-gray-400"
                  autoFocus
                />
              </div>
              <div className="p-2">
                <button 
                  onClick={() => { generateFinancialsCSV(); setShowCommandPalette(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100/80 transition-colors text-left"
                >
                  <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
                  <span>Export Financials as CSV</span>
                </button>
                <button 
                  onClick={() => { navigate('/'); setShowCommandPalette(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100/80 transition-colors text-left"
                >
                  <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                  <span>Start New Analysis</span>
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100/80 transition-colors text-left opacity-50 cursor-not-allowed"
                >
                  <ShareIcon className="w-5 h-5 text-gray-400" />
                  <span>Share Analysis (Coming Soon)</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700">
              <SparklesIcon className="w-3.5 h-3.5" />
              Business Operating System
            </span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              {completedSections}/10 Complete
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                {branding?.companyName || 'Your Business Analysis'}
              </h1>
              <p className="text-gray-500 max-w-xl">
                Your complete business operating system with market research, financial projections, and actionable roadmap.
              </p>
            </div>
          </div>
        </div>

        {kpiMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {kpiMetrics.map((metric, idx) => (
              <KPICard key={idx} {...metric} />
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <GlassCard className="sticky top-24 overflow-hidden p-2" hover={false}>
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-3 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25' 
                          : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-br ${tab.color} text-white shadow-md group-hover:shadow-lg`
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1">{tab.shortLabel}</span>
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          <div className="flex-1 min-w-0">
            <GlassCard className="p-6 md:p-8" hover={false}>
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                {activeTabData && (
                  <>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeTabData.color} flex items-center justify-center shadow-lg`}>
                      <activeTabData.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{activeTabData.label}</h2>
                      <p className="text-gray-500 text-sm">Analysis and insights for your business</p>
                    </div>
                  </>
                )}
              </div>
              {renderContent()}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
