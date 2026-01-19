import type { ReactNode } from 'react';
import { TrendingUp, Target } from 'lucide-react';

type MarketSize = {
  value?: string;
  label?: string;
};

type MarketTrend = {
  name?: string;
  direction?: 'up' | 'down';
  yoy?: string;
  description?: string;
};

type MarketData = {
  tam?: MarketSize;
  sam?: MarketSize;
  som?: MarketSize;
  trends?: MarketTrend[];
  aiInsight?: string;
};

type CustomerProfile = {
  avatar?: string;
  name?: string;
  tagline?: string;
  demographics?: {
    age?: string;
    income?: string;
    location?: string;
  };
  psychographics?: {
    buyingTriggers?: string[];
  };
  dayInLife?: string;
};

type CustomerData = {
  segmentSplit?: Record<string, string | number>;
  profiles?: CustomerProfile[];
};

type BusinessPlanData = {
  mission?: string;
  vision?: string;
  operations?: {
    model?: string;
    staffing?: string;
    hours?: string;
    locations?: string[];
  };
  roadmap?: Array<{
    focus?: string;
    quarter?: string;
    milestones?: string[];
    goals?: string[];
  }>;
  supplyChain?: Array<{
    category?: string;
    strategy?: string;
    vendors?: string[];
  }>;
};

type GoToMarketData = {
  cac?: {
    value?: string;
    breakdown?: string;
  };
  ltv?: {
    value?: string;
    basis?: string;
  };
  ltvCacRatio?: string;
  launchPhases?: Array<{
    phase?: string;
    duration?: string;
    activities?: string[];
    goals?: string[];
  }>;
  viralMechanics?: {
    communityBuilding?: string;
    referralProgram?: string;
  };
};

type FinancialData = {
  summary?: {
    breakEvenMonths?: string;
    monthlyBurnRate?: string;
    startupCost?: string;
    yearOneRevenue?: string;
  };
  capex?: Array<{
    item?: string;
    depreciation?: string;
    cost?: number;
  }>;
  projections?: Array<{
    period?: string;
    revenue?: number;
    cogs?: number;
    grossProfit?: number;
    netProfit?: number;
    margin?: string;
  }>;
  fundingNeeds?: {
    amount?: string;
    runway?: string;
    use?: string[];
  };
};

type PitchDeckData = {
  slides?: Array<{
    number?: string | number;
    title?: string;
    content?: string;
    speakerNotes?: string;
    visualSuggestion?: string;
  }>;
  askAmount?: string;
  narrativeArc?: string;
  useOfFunds?: string[];
};

type TeamData = {
  founders?: Array<{
    role?: string;
    background?: string;
    responsibilities?: string[];
    skills?: string[];
  }>;
  hires?: Array<{
    role?: string;
    salary?: string;
    priority?: string;
    timeline?: string;
  }>;
  advisors?: string[];
  partners?: Array<{
    name?: string;
    service?: string;
    type?: string;
  }>;
};

const CARD = 'bg-white rounded-xl border border-gray-100 shadow-sm p-6';

const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`${CARD} ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = 'mb-6' }: { children: ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h2>
);

const DotList = ({
  items = [],
  dotClassName = 'bg-blue-500',
  className = 'text-gray-700',
}: {
  items?: string[];
  dotClassName?: string;
  className?: string;
}) => (
  <ul className={`text-sm space-y-1 ${className}`}>
    {items.map((item, idx) => (
      <li key={idx} className="flex items-start gap-2">
        <span className={`w-1.5 h-1.5 ${dotClassName} rounded-full mt-2 flex-shrink-0`} />
        {item}
      </li>
    ))}
  </ul>
);

// Market Section Component
const MarketSection = ({ data }: { data: MarketData }) => {
  const sizeCards = [
    {
      key: 'tam',
      label: 'TAM',
      value: data.tam?.value || '5.2B',
      size: 'w-32 h-32',
      circleClass: 'bg-blue-100 border-blue-200',
      valueClass: 'text-2xl font-bold text-blue-900',
      labelClass: 'text-xs text-blue-700 font-medium',
      title: 'Total Addressable Market',
      description: data.tam?.label || 'Global market for AI-powered cost tools',
    },
    {
      key: 'sam',
      label: 'SAM',
      value: data.sam?.value || '1.8B',
      size: 'w-24 h-24',
      circleClass: 'bg-green-100 border-green-200',
      valueClass: 'text-xl font-bold text-green-900',
      labelClass: 'text-xs text-green-700 font-medium',
      title: 'Serviceable Addressable Market',
      description: data.sam?.label || 'North American freelancers and SMBs',
    },
    {
      key: 'som',
      label: 'SOM',
      value: data.som?.value || '18M',
      size: 'w-16 h-16',
      circleClass: 'bg-purple-100 border-purple-200',
      valueClass: 'text-lg font-bold text-purple-900',
      labelClass: 'text-xs text-purple-700 font-medium',
      title: 'Serviceable Obtainable Market',
      description: data.som?.label || 'Year 1 achievable market capture',
    },
  ];

  const trends = data.trends?.slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* TAM/SAM/SOM Visualization */}
      <Card>
        <CardTitle>Market Size Analysis</CardTitle>

        <div className="flex justify-center items-center space-x-8">
          {sizeCards.map((size) => (
            <div key={size.key} className="relative">
              <div className={`${size.size} ${size.circleClass} rounded-full flex items-center justify-center border-4`}>
                <div className="text-center">
                  <div className={size.valueClass}>${size.value}</div>
                  <div className={size.labelClass}>{size.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {sizeCards.map((size) => (
            <div key={`${size.key}-desc`}>
              <h4 className="font-medium text-gray-900">{size.title}</h4>
              <p className="text-sm text-gray-600">{size.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Market Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trends.map((trend, idx) => (
          <Card key={idx}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{trend.name}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <TrendingUp size={12} className={trend.direction === 'up' ? 'rotate-0' : 'rotate-180'} />
                {trend.yoy}
              </span>
            </div>
            <p className="text-sm text-gray-600">{trend.description || 'Market trend analysis'}</p>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">AI Market Insights</h3>
            <p className="text-blue-800 leading-relaxed">{data.aiInsight}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Customer Section Component
const CustomerSection = ({ data }: { data: CustomerData }) => {
  const segments = Object.entries(data.segmentSplit || {});
  const profiles = data.profiles || [];

  return (
    <div className="space-y-6">
      {/* Customer Segments */}
      <Card>
        <CardTitle>Customer Segments</CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map(([segment, percentage]) => (
            <div key={segment} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{String(percentage)}%</span>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{segment.replace(/([A-Z])/g, ' $1').trim()}</h4>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer Personas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Customer Personas</h2>

        {profiles.map((profile, idx) => (
          <Card key={idx}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {profile.avatar || 'ðŸ‘¤'}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {profile.tagline}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Age: {profile.demographics?.age}</p>
                      <p>Income: {profile.demographics?.income}</p>
                      <p>Location: {profile.demographics?.location}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Buying Triggers</h4>
                    <DotList
                      items={profile.psychographics?.buyingTriggers?.slice(0, 3)}
                      className="text-gray-600"
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Day in the Life</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.dayInLife}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Business Plan Section Component
const BusinessPlanSection = ({ data }: { data: BusinessPlanData }) => {
  const operations = data.operations || {};
  const roadmap = data.roadmap || [];
  const supplyChain = data.supplyChain || [];
  const missionVision = [
    {
      title: 'Mission',
      icon: Target,
      iconClass: 'text-green-600',
      iconBg: 'bg-green-100',
      text: data.mission,
    },
    {
      title: 'Vision',
      icon: TrendingUp,
      iconClass: 'text-purple-600',
      iconBg: 'bg-purple-100',
      text: data.vision,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missionVision.map((item) => (
          <Card key={item.title}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                <item.icon size={16} className={item.iconClass} />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{item.text}</p>
          </Card>
        ))}
      </div>

      {/* Operations */}
      <Card>
        <CardTitle>Operations</CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Business Model', text: operations.model },
            { title: 'Staffing', text: operations.staffing },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-medium text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Hours & Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 text-sm mb-1">Operating Hours</p>
              <p className="text-gray-700 text-sm">{operations.hours}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 text-sm mb-1">Key Locations</p>
              <ul className="text-gray-700 text-sm space-y-1">
                {operations.locations?.map((location, idx) => (
                  <li key={idx}>â€¢ {location}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Strategic Roadmap */}
      <Card>
        <CardTitle>Strategic Roadmap</CardTitle>

        <div className="space-y-4">
          {roadmap.map((phase, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{phase.focus}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {phase.quarter}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Milestones</h4>
                  <DotList items={phase.milestones} />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Key Metrics</h4>
                  <div className="text-sm text-gray-700">
                    <p>â€¢ Goals: {phase.goals?.[0] || 'Achieve key milestones'}</p>
                    <p>â€¢ Timeline: {phase.quarter}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Supply Chain */}
      <Card>
        <CardTitle>Supply Chain Strategy</CardTitle>

        <div className="space-y-6">
          {supplyChain.map((category, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{category.category}</h3>
              <p className="text-gray-700 text-sm mb-3">{category.strategy}</p>

              <div>
                <h4 className="font-medium text-gray-900 text-sm mb-2">Key Vendors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {category.vendors?.map((vendor, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{vendor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Go-to-Market Section Component
const GoToMarketSection = ({ data }: { data: GoToMarketData }) => {
  const metrics = [
    {
      title: 'Customer Acquisition Cost',
      value: data.cac?.value || '$65',
      subtitle: data.cac?.breakdown || 'Digital ads + content',
      valueClass: 'text-blue-600',
    },
    {
      title: 'Customer Lifetime Value',
      value: data.ltv?.value || '$216',
      subtitle: data.ltv?.basis || '12-month subscription',
      valueClass: 'text-green-600',
    },
    {
      title: 'LTV:CAC Ratio',
      value: data.ltvCacRatio || '3.3:1',
      subtitle: 'Healthy unit economics',
      valueClass: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Customer Acquisition Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">{metric.title}</h3>
            <div className={`text-3xl font-bold ${metric.valueClass} mb-1`}>{metric.value}</div>
            <p className="text-sm text-gray-600">{metric.subtitle}</p>
          </Card>
        ))}
      </div>

      {/* Launch Phases */}
      <Card>
        <CardTitle>Launch Strategy</CardTitle>

        <div className="space-y-6">
          {data.launchPhases?.map((phase, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{phase.phase}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {phase.duration}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Key Activities</h4>
                  <DotList items={phase.activities} />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Success Metrics</h4>
                  <DotList items={phase.goals} dotClassName="bg-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Viral Mechanics */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
        <CardTitle className="text-purple-900 mb-4">Viral Mechanics</CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.viralMechanics && (
            <>
              <div>
                <h3 className="font-medium text-purple-900 mb-2">Community Building</h3>
                <p className="text-purple-800 text-sm leading-relaxed">{data.viralMechanics.communityBuilding}</p>
              </div>

              <div>
                <h3 className="font-medium text-purple-900 mb-2">Referral Program</h3>
                <p className="text-purple-800 text-sm leading-relaxed">{data.viralMechanics.referralProgram}</p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

// Financial Section Component
const FinancialSection = ({ data }: { data: FinancialData }) => {
  const summary = data.summary || {};
  const summaryCards = [
    { title: 'Break-even', value: `${summary.breakEvenMonths || '22'} months`, color: 'text-green-600', subtitle: 'Time to profitability' },
    { title: 'Monthly Burn', value: summary.monthlyBurnRate || '$18,500', color: 'text-red-600', subtitle: 'Operating expenses' },
    { title: 'Startup Cost', value: summary.startupCost || '$125,000', color: 'text-blue-600', subtitle: 'Initial investment' },
    { title: 'Year 1 Revenue', value: summary.yearOneRevenue || '$165,000', color: 'text-purple-600', subtitle: 'First year target' },
  ];

  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
            <div className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</div>
            <p className="text-sm text-gray-600">{card.subtitle}</p>
          </Card>
        ))}
      </div>

      {/* CapEx Breakdown */}
      <Card>
        <CardTitle>Capital Expenditures</CardTitle>

        <div className="space-y-4">
          {data.capex?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.item}</h3>
                <p className="text-sm text-gray-600">Depreciation: {item.depreciation}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">${item.cost?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 5-Year Projections */}
      <Card>
        <CardTitle>5-Year Financial Projections</CardTitle>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">COGS</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Gross Profit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Net Profit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.projections?.map((year, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{year.period}</td>
                  <td className="py-3 px-4 text-right text-gray-700">${year.revenue?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-gray-700">${year.cogs?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-green-600">${year.grossProfit?.toLocaleString()}</td>
                  <td className={`py-3 px-4 text-right ${year.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(year.netProfit)?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">{year.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Funding Requirements */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <CardTitle className="text-green-900 mb-4">Funding Requirements</CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Amount Needed</h3>
            <div className="text-2xl font-bold text-green-600 mb-1">{data.fundingNeeds?.amount || '$450,000'}</div>
            <p className="text-sm text-green-700">{data.fundingNeeds?.runway || '18-month runway'}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-green-900 mb-2">Use of Funds</h3>
            {data.fundingNeeds?.use?.map((use, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-800">{use}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Pitch Deck Section Component
const PitchDeckSection = ({ data }: { data: PitchDeckData }) => {
  const slides = data.slides || [];

  return (
    <div className="space-y-6">
      {/* Pitch Deck Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Investor Pitch Deck</h2>
            <p className="text-gray-600 text-sm">10-slide presentation with speaker notes</p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {slides.length || 10} slides
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Ask: {data.askAmount || '$450,000'}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Narrative Arc</h3>
          <p className="text-gray-700 leading-relaxed">{data.narrativeArc}</p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Use of Funds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.useOfFunds?.map((use, idx) => (
              <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">{use}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Slide Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Slide-by-Slide Breakdown</h2>

        {slides.map((slide, idx) => (
          <Card key={idx}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                {slide.number}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900">{slide.title}</h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    Slide {slide.number}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">{slide.content}</p>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Speaker Notes</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{slide.speakerNotes}</p>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Visual Suggestion</h4>
                  <p className="text-gray-700 text-sm">{slide.visualSuggestion}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Team Section Component
const TeamSection = ({ data }: { data: TeamData }) => {
  const founders = data.founders || [];
  const hires = data.hires || [];
  const advisors = data.advisors || [];
  const partners = data.partners || [];

  return (
    <div className="space-y-6">
      {/* Founders */}
      <Card>
        <CardTitle>Founding Team</CardTitle>

        {founders.map((founder, idx) => (
          <div key={idx} className="mb-6 last:mb-0">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {founder.role?.split(' ').map((word) => word[0]).join('') || 'FT'}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{founder.role}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Founder
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{founder.background}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Responsibilities</h4>
                    <DotList items={founder.responsibilities} />
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {founder.skills?.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {idx < founders.length - 1 && (
              <div className="border-b border-gray-200 my-6"></div>
            )}
          </div>
        ))}
      </Card>

      {/* Hiring Plan */}
      <Card>
        <CardTitle>Hiring Plan</CardTitle>

        <div className="space-y-4">
          {hires.map((role, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{role.role}</h3>
                <p className="text-sm text-gray-600">Salary: {role.salary} | Priority: {role.priority}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  role.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {role.priority}
                </span>
                <p className="text-sm text-gray-600 mt-1">{role.timeline}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Advisors & Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advisors */}
        <Card>
          <CardTitle>Advisors</CardTitle>

          <div className="space-y-4">
            {advisors.map((advisor, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-900">{advisor}</h3>
                <p className="text-sm text-purple-700 mt-1">Strategic guidance and network</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Partners */}
        <Card>
          <CardTitle>Strategic Partners</CardTitle>

          <div className="space-y-4">
            {partners.map((partner, idx) => (
              <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900">{partner.name}</h3>
                <p className="text-sm text-green-700">{partner.service}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {partner.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const EmptySection = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Section Coming Soon</h3>
      <p className="text-gray-600">This section is under development.</p>
    </div>
  </div>
);

const sectionMap: Record<string, (props: { data: unknown }) => JSX.Element> = {
  market: ({ data }) => <MarketSection data={data as MarketData} />,
  customers: ({ data }) => <CustomerSection data={data as CustomerData} />,
  businessPlan: ({ data }) => <BusinessPlanSection data={data as BusinessPlanData} />,
  goToMarket: ({ data }) => <GoToMarketSection data={data as GoToMarketData} />,
  financial: ({ data }) => <FinancialSection data={data as FinancialData} />,
  pitchDeck: ({ data }) => <PitchDeckSection data={data as PitchDeckData} />,
  team: ({ data }) => <TeamSection data={data as TeamData} />,
};

// Section Renderer Component
const SectionRenderer = ({ sectionId, data }: { sectionId: string; data: unknown }) => {
  if (sectionId === 'competitors') {
    // User already created this component
    return <div>Competitor analysis component goes here</div>;
  }

  const Section = sectionMap[sectionId];
  return Section ? <Section data={data} /> : <EmptySection />;
};

export default SectionRenderer;
