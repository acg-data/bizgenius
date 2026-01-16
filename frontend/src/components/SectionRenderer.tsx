import React from 'react';
import { TrendingUp, Users, Target, Rocket, DollarSign, Presentation, UserCheck } from 'lucide-react';

// Market Section Component
const MarketSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* TAM/SAM/SOM Visualization */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Market Size Analysis</h2>

        <div className="flex justify-center items-center space-x-8">
          {/* TAM Circle */}
          <div className="relative">
            <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">${data.tam?.value || '5.2B'}</div>
                <div className="text-xs text-blue-700 font-medium">TAM</div>
              </div>
            </div>
          </div>

          {/* SAM Circle */}
          <div className="relative">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-200">
              <div className="text-center">
                <div className="text-xl font-bold text-green-900">${data.sam?.value || '1.8B'}</div>
                <div className="text-xs text-green-700 font-medium">SAM</div>
              </div>
            </div>
          </div>

          {/* SOM Circle */}
          <div className="relative">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center border-4 border-purple-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-900">${data.som?.value || '18M'}</div>
                <div className="text-xs text-purple-700 font-medium">SOM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <h4 className="font-medium text-gray-900">Total Addressable Market</h4>
            <p className="text-sm text-gray-600">{data.tam?.label || 'Global market for AI-powered cost tools'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Serviceable Addressable Market</h4>
            <p className="text-sm text-gray-600">{data.sam?.label || 'North American freelancers and SMBs'}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Serviceable Obtainable Market</h4>
            <p className="text-sm text-gray-600">{data.som?.label || 'Year 1 achievable market capture'}</p>
          </div>
        </div>
      </div>

      {/* Market Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.trends?.slice(0, 4).map((trend, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">AI Market Insights</h3>
            <p className="text-blue-800 leading-relaxed">{data.aiInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Section Component
const CustomerSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* Customer Segments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Customer Segments</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(data.segmentSplit || {}).map(([segment, percentage]) => (
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
      </div>

      {/* Customer Personas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Customer Personas</h2>

        {data.profiles?.map((profile, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {profile.avatar || '👤'}
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
                    <ul className="text-sm text-gray-600 space-y-1">
                      {profile.psychographics?.buyingTriggers?.slice(0, 3).map((trigger, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {trigger}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Day in the Life</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.dayInLife}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Business Plan Section Component
const BusinessPlanSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Target size={16} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Mission</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{data.mission}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Vision</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{data.vision}</p>
        </div>
      </div>

      {/* Operations */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Operations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Business Model</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{data.operations?.model}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3">Staffing</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{data.operations?.staffing}</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Hours & Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 text-sm mb-1">Operating Hours</p>
              <p className="text-gray-700 text-sm">{data.operations?.hours}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 text-sm mb-1">Key Locations</p>
              <ul className="text-gray-700 text-sm space-y-1">
                {data.operations?.locations?.map((location, idx) => (
                  <li key={idx}>• {location}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Roadmap */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Strategic Roadmap</h2>

        <div className="space-y-4">
          {data.roadmap?.map((phase, idx) => (
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
                  <ul className="text-sm text-gray-700 space-y-1">
                    {phase.milestones?.map((milestone, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Key Metrics</h4>
                  <div className="text-sm text-gray-700">
                    <p>• Goals: {phase.goals?.[0] || 'Achieve key milestones'}</p>
                    <p>• Timeline: {phase.quarter}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supply Chain */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Supply Chain Strategy</h2>

        <div className="space-y-6">
          {data.supplyChain?.map((category, idx) => (
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
      </div>
    </div>
  );
};

// Go-to-Market Section Component
const GoToMarketSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* Customer Acquisition Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Customer Acquisition Cost</h3>
          <div className="text-3xl font-bold text-blue-600 mb-1">{data.cac?.value || '$65'}</div>
          <p className="text-sm text-gray-600">{data.cac?.breakdown || 'Digital ads + content'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Customer Lifetime Value</h3>
          <div className="text-3xl font-bold text-green-600 mb-1">{data.ltv?.value || '$216'}</div>
          <p className="text-sm text-gray-600">{data.ltv?.basis || '12-month subscription'}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">LTV:CAC Ratio</h3>
          <div className="text-3xl font-bold text-purple-600 mb-1">{data.ltvCacRatio || '3.3:1'}</div>
          <p className="text-sm text-gray-600">Healthy unit economics</p>
        </div>
      </div>

      {/* Launch Phases */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Launch Strategy</h2>

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
                  <ul className="text-sm text-gray-700 space-y-1">
                    {phase.activities?.map((activity, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Success Metrics</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {phase.goals?.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viral Mechanics */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-purple-900 mb-4">Viral Mechanics</h2>

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
      </div>
    </div>
  );
};

// Financial Section Component
const FinancialSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Break-even</h3>
          <div className="text-2xl font-bold text-green-600 mb-1">{data.summary?.breakEvenMonths || '22'} months</div>
          <p className="text-sm text-gray-600">Time to profitability</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Monthly Burn</h3>
          <div className="text-2xl font-bold text-red-600 mb-1">{data.summary?.monthlyBurnRate || '$18,500'}</div>
          <p className="text-sm text-gray-600">Operating expenses</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Startup Cost</h3>
          <div className="text-2xl font-bold text-blue-600 mb-1">{data.summary?.startupCost || '$125,000'}</div>
          <p className="text-sm text-gray-600">Initial investment</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Year 1 Revenue</h3>
          <div className="text-2xl font-bold text-purple-600 mb-1">{data.summary?.yearOneRevenue || '$165,000'}</div>
          <p className="text-sm text-gray-600">First year target</p>
        </div>
      </div>

      {/* CapEx Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Capital Expenditures</h2>

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
      </div>

      {/* 5-Year Projections */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">5-Year Financial Projections</h2>

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
      </div>

      {/* Funding Requirements */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-green-900 mb-4">Funding Requirements</h2>

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
      </div>
    </div>
  );
};

// Pitch Deck Section Component
const PitchDeckSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* Pitch Deck Overview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Investor Pitch Deck</h2>
            <p className="text-gray-600 text-sm">10-slide presentation with speaker notes</p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {data.slides?.length || 10} slides
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
      </div>

      {/* Slide Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Slide-by-Slide Breakdown</h2>

        {data.slides?.map((slide, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Section Component
const TeamSection = ({ data, tier }) => {
  return (
    <div className="space-y-6">
      {/* Founders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Founding Team</h2>

        {data.founders?.map((founder, idx) => (
          <div key={idx} className="mb-6 last:mb-0">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {founder.role?.split(' ').map(word => word[0]).join('') || 'FT'}
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
                    <ul className="text-sm text-gray-700 space-y-1">
                      {founder.responsibilities?.map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          {resp}
                        </li>
                      ))}
                    </ul>
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

            {idx < (data.founders?.length || 0) - 1 && (
              <div className="border-b border-gray-200 my-6"></div>
            )}
          </div>
        ))}
      </div>

      {/* Hiring Plan */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Hiring Plan</h2>

        <div className="space-y-4">
          {data.hires?.map((role, idx) => (
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
      </div>

      {/* Advisors & Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Advisors */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Advisors</h2>

          <div className="space-y-4">
            {data.advisors?.map((advisor, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-medium text-purple-900">{advisor}</h3>
                <p className="text-sm text-purple-700 mt-1">Strategic guidance and network</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Strategic Partners</h2>

          <div className="space-y-4">
            {data.partners?.map((partner, idx) => (
              <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900">{partner.name}</h3>
                <p className="text-sm text-green-700">{partner.service}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  {partner.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Renderer Component
const SectionRenderer = ({ sectionId, data, tier }) => {
  switch (sectionId) {
    case 'market':
      return <MarketSection data={data} tier={tier} />;
    case 'customers':
      return <CustomerSection data={data} tier={tier} />;
    case 'competitors':
      // User already created this component
      return <div>Competitor analysis component goes here</div>;
    case 'businessPlan':
      return <BusinessPlanSection data={data} tier={tier} />;
    case 'goToMarket':
      return <GoToMarketSection data={data} tier={tier} />;
    case 'financial':
      return <FinancialSection data={data} tier={tier} />;
    case 'pitchDeck':
      return <PitchDeckSection data={data} tier={tier} />;
    case 'team':
      return <TeamSection data={data} tier={tier} />;
    default:
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section Coming Soon</h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        </div>
      );
  }
};

export default SectionRenderer;