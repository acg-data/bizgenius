import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const RESULT_KEY = 'myceo_analysis_result';

type TabId = 'summary' | 'market' | 'business' | 'financials' | 'competitors' | 'gtm' | 'team' | 'risks' | 'action' | 'pitch' | 'local';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const baseTabs: Tab[] = [
  { id: 'market', label: 'Market Research', icon: '📊' },
  { id: 'competitors', label: 'Competitors', icon: '⚔️' },
  { id: 'summary', label: 'Executive Summary', icon: '📋' },
  { id: 'business', label: 'Business Plan', icon: '🏢' },
  { id: 'financials', label: 'Financials', icon: '💰' },
  { id: 'gtm', label: 'Go-to-Market', icon: '🚀' },
  { id: 'team', label: 'Team Plan', icon: '👥' },
  { id: 'risks', label: 'Risks', icon: '⚠️' },
  { id: 'action', label: '90-Day Plan', icon: '📅' },
  { id: 'pitch', label: 'Pitch Deck', icon: '🎯' },
];

const localTab: Tab = { id: 'local', label: 'Local Market', icon: '📍' };

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('market');
  const [result, setResult] = useState<any>(null);
  const [businessIdea, setBusinessIdea] = useState<string>('');

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
      setBusinessIdea(location.state.businessIdea || '');
    } else {
      const savedResult = localStorage.getItem(RESULT_KEY);
      if (savedResult) {
        setResult(JSON.parse(savedResult));
      }
    }
  }, [location.state]);

  if (!result) {
    return (
      <div className="bg-[#F2F0E9] text-ink font-sans antialiased min-h-screen">
        <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b-2 border-ink px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-manilla border-2 border-ink flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
                <span className="font-black text-xl">M</span>
              </div>
              <span className="font-black text-xl tracking-tighter">myCEO</span>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-paper border-2 border-ink shadow-brutal p-8 md:p-12 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-4">No Analysis Found</h1>
            <p className="text-gray-600 mb-8">Generate a business analysis first to view results.</p>
            <Link 
              to="/"
              className="bg-cyan text-ink font-black px-6 py-4 border-2 border-ink shadow-brutal inline-block hover:bg-cyan-hover transition-all"
            >
              START NEW ANALYSIS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderSummary = () => {
    const data = result.executive_summary;
    if (!data) return <div className="text-gray-500">Executive summary not available</div>;
    
    return (
      <div className="space-y-6">
        {data.one_liner && (
          <div className="bg-cyan/20 border-2 border-ink p-6">
            <h3 className="font-black text-sm text-gray-500 mb-2">YOUR ONE-LINER PITCH</h3>
            <p className="text-2xl font-black">"{data.one_liner}"</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.problem_statement && (
            <div className="bg-white border-2 border-ink p-6">
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <span className="text-red-500">🔥</span> The Problem
              </h3>
              <p className="text-gray-700">{data.problem_statement}</p>
            </div>
          )}
          
          {data.solution_overview && (
            <div className="bg-white border-2 border-ink p-6">
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <span className="text-green-500">💡</span> The Solution
              </h3>
              <p className="text-gray-700">{data.solution_overview}</p>
            </div>
          )}
        </div>

        {data.value_proposition && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Value Proposition</h3>
            <p className="text-gray-700">{data.value_proposition}</p>
          </div>
        )}

        {data.target_customer && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Target Customer</h3>
            <p className="text-gray-700">{data.target_customer}</p>
          </div>
        )}

        {data.business_model && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Business Model</h3>
            <p className="text-gray-700">{data.business_model}</p>
          </div>
        )}

        {data.unfair_advantage && (
          <div className="bg-manilla border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Unfair Advantage</h3>
            <p className="text-gray-700">{data.unfair_advantage}</p>
          </div>
        )}

        {data.why_now && (
          <div className="bg-cyan/10 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Why Now?</h3>
            <p className="text-gray-700">{data.why_now}</p>
          </div>
        )}

        {data.key_risks && data.key_risks.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Key Risks & Mitigations</h3>
            <ul className="space-y-2">
              {data.key_risks.map((risk: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">⚠️</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.success_metrics && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Success Metrics Timeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.success_metrics).map(([period, metrics]: [string, any]) => (
                <div key={period} className="bg-gray-50 border border-ink p-3">
                  <div className="font-black text-sm text-gray-500 mb-2">{period.replace('_', ' ').toUpperCase()}</div>
                  <ul className="text-sm space-y-1">
                    {Array.isArray(metrics) && metrics.map((m: string, idx: number) => (
                      <li key={idx} className="text-gray-700">• {m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
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
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Market Overview</h3>
            <p className="text-gray-700">{data.market_overview}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.tam && (
            <div className="bg-cyan/20 border-2 border-ink p-6 text-center">
              <div className="font-black text-xs text-gray-500 mb-1">TAM</div>
              <div className="text-3xl font-black">{data.tam.value}</div>
              <div className="text-sm text-gray-600 mt-2">{data.tam.calculation || data.tam.description}</div>
              {data.tam.growth_rate && (
                <div className="text-sm font-bold text-green-600 mt-1">{data.tam.growth_rate} CAGR</div>
              )}
              {data.tam.key_drivers && (
                <div className="text-xs text-gray-500 mt-2">
                  Drivers: {data.tam.key_drivers.slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          )}
          {data.sam && (
            <div className="bg-cyan/10 border-2 border-ink p-6 text-center">
              <div className="font-black text-xs text-gray-500 mb-1">SAM</div>
              <div className="text-3xl font-black">{data.sam.value}</div>
              <div className="text-sm text-gray-600 mt-2">{data.sam.calculation || data.sam.description}</div>
              {data.sam.penetration_strategy && (
                <div className="text-xs text-gray-500 mt-2">{data.sam.penetration_strategy}</div>
              )}
            </div>
          )}
          {data.som && (
            <div className="bg-white border-2 border-ink p-6 text-center">
              <div className="font-black text-xs text-gray-500 mb-1">SOM</div>
              <div className="text-3xl font-black">{data.som.value}</div>
              <div className="text-sm text-gray-600 mt-2">{data.som.year_1_target}</div>
              {data.som.assumptions && (
                <div className="text-xs text-gray-500 mt-2">
                  {data.som.assumptions.slice(0, 1).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {data.market_trends && data.market_trends.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Market Trends</h3>
            <div className="space-y-4">
              {data.market_trends.map((trend: any, idx: number) => (
                <div key={idx} className="border-l-4 border-cyan pl-4">
                  <div className="font-black">{trend.trend || trend}</div>
                  {trend.description && <p className="text-gray-600 text-sm mt-1">{trend.description}</p>}
                  {trend.impact && <p className="text-sm text-green-600 mt-1">Impact: {trend.impact}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.customer_segments && data.customer_segments.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Customer Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.customer_segments.map((segment: any, idx: number) => (
                <div key={idx} className="bg-gray-50 border border-ink p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-black">{segment.segment_name}</div>
                    <span className={`text-xs font-bold px-2 py-1 ${
                      segment.priority === 'High' ? 'bg-cyan text-ink' : 'bg-gray-200'
                    }`}>{segment.priority}</span>
                  </div>
                  <div className="text-sm text-gray-600">{segment.size}</div>
                  {segment.pain_points && (
                    <div className="mt-2">
                      <div className="text-xs font-bold text-gray-500">Pain Points:</div>
                      <ul className="text-sm">
                        {segment.pain_points.map((p: string, i: number) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.regulatory_landscape && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Regulatory Landscape</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">Risk Level:</span>
              <span className={`font-bold px-2 py-1 text-sm ${
                data.regulatory_landscape.risk_level === 'High' ? 'bg-red-100 text-red-700' :
                data.regulatory_landscape.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>{data.regulatory_landscape.risk_level}</span>
            </div>
            {data.regulatory_landscape.compliance_requirements && (
              <ul className="text-sm space-y-1">
                {data.regulatory_landscape.compliance_requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>📋</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
          <div className="bg-cyan/10 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Executive Summary</h3>
            <p className="text-gray-700">{data.executive_summary}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.mission && (
            <div className="bg-white border-2 border-ink p-6">
              <h3 className="font-black text-lg mb-3">Mission</h3>
              <p className="text-gray-700">{data.mission}</p>
            </div>
          )}
          {data.vision && (
            <div className="bg-white border-2 border-ink p-6">
              <h3 className="font-black text-lg mb-3">Vision</h3>
              <p className="text-gray-700">{data.vision}</p>
            </div>
          )}
        </div>

        {data.business_model && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Business Model</h3>
            {data.business_model.type && (
              <div className="inline-block bg-cyan text-ink font-bold px-3 py-1 mb-4">{data.business_model.type}</div>
            )}
            
            {data.business_model.pricing_strategy && (
              <div className="mb-4">
                <h4 className="font-bold mb-2">Pricing Strategy</h4>
                <p className="text-sm text-gray-600 mb-3">{data.business_model.pricing_strategy.model}</p>
                {data.business_model.pricing_strategy.tiers && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.business_model.pricing_strategy.tiers.map((tier: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 border border-ink p-3">
                        <div className="font-black">{tier.name}</div>
                        <div className="text-xl font-black text-cyan">{tier.price}</div>
                        <ul className="text-sm mt-2">
                          {tier.features?.map((f: string, i: number) => (
                            <li key={i} className="text-gray-600">✓ {f}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {data.business_model.unit_economics && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {Object.entries(data.business_model.unit_economics).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center p-2 bg-gray-50 border border-ink">
                    <div className="text-xs font-bold text-gray-500">{key.toUpperCase().replace('_', ' ')}</div>
                    <div className="font-black">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {data.product_roadmap && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Product Roadmap</h3>
            <div className="space-y-4">
              {data.product_roadmap.mvp_features && (
                <div>
                  <div className="font-bold text-sm text-gray-500 mb-2">MVP FEATURES</div>
                  <div className="flex flex-wrap gap-2">
                    {data.product_roadmap.mvp_features.map((f: string, idx: number) => (
                      <span key={idx} className="bg-cyan/20 px-3 py-1 text-sm font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.product_roadmap.phase_2 && (
                <div>
                  <div className="font-bold text-sm text-gray-500 mb-2">PHASE 2</div>
                  <div className="flex flex-wrap gap-2">
                    {data.product_roadmap.phase_2.map((f: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 text-sm font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {data.swot_analysis && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">SWOT Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 border border-green-200">
                <div className="font-black text-green-700 mb-2">Strengths</div>
                <ul className="text-sm space-y-1">
                  {data.swot_analysis.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>✓ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 p-4 border border-red-200">
                <div className="font-black text-red-700 mb-2">Weaknesses</div>
                <ul className="text-sm space-y-1">
                  {data.swot_analysis.weaknesses?.map((w: string, idx: number) => (
                    <li key={idx}>• {w}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 p-4 border border-blue-200">
                <div className="font-black text-blue-700 mb-2">Opportunities</div>
                <ul className="text-sm space-y-1">
                  {data.swot_analysis.opportunities?.map((o: string, idx: number) => (
                    <li key={idx}>↗ {o}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 p-4 border border-orange-200">
                <div className="font-black text-orange-700 mb-2">Threats</div>
                <ul className="text-sm space-y-1">
                  {data.swot_analysis.threats?.map((t: string, idx: number) => (
                    <li key={idx}>⚠ {t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinancials = () => {
    const data = result.financial_model;
    if (!data) return <div className="text-gray-500">Financial model not available</div>;
    
    return (
      <div className="space-y-6">
        {data.assumptions && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Key Assumptions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.assumptions).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-gray-50 p-3 border border-ink">
                  <div className="text-xs font-bold text-gray-500">{key.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="font-black mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projections && data.projections.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">5-Year Financial Projections</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink text-white">
                    <th className="p-2 text-left">Metric</th>
                    {data.projections.map((p: any) => (
                      <th key={p.year} className="p-2 text-right">Year {p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-bold">Revenue</td>
                    {data.projections.map((p: any) => (
                      <td key={p.year} className="p-2 text-right font-bold text-green-600">
                        ${typeof p.revenue === 'number' ? p.revenue.toLocaleString() : p.revenue}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2 font-bold">Customers</td>
                    {data.projections.map((p: any) => (
                      <td key={p.year} className="p-2 text-right">
                        {typeof p.customers === 'number' ? p.customers.toLocaleString() : p.customers}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-bold">Gross Profit</td>
                    {data.projections.map((p: any) => (
                      <td key={p.year} className="p-2 text-right">
                        ${typeof p.gross_profit === 'number' ? p.gross_profit.toLocaleString() : p.gross_profit}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b bg-gray-50">
                    <td className="p-2 font-bold">EBITDA</td>
                    {data.projections.map((p: any) => (
                      <td key={p.year} className={`p-2 text-right font-bold ${p.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${typeof p.ebitda === 'number' ? p.ebitda.toLocaleString() : p.ebitda}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-bold">Headcount</td>
                    {data.projections.map((p: any) => (
                      <td key={p.year} className="p-2 text-right">{p.headcount}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.break_even && (
          <div className="bg-cyan/20 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Break-Even Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black">Month {data.break_even.month}</div>
                <div className="text-sm text-gray-600">Time to Break-Even</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">{data.break_even.customers_needed}</div>
                <div className="text-sm text-gray-600">Customers Needed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black">${data.break_even.revenue_needed?.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Revenue Needed</div>
              </div>
            </div>
          </div>
        )}

        {data.funding_strategy && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Funding Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.funding_strategy.pre_seed && (
                <div className="bg-gray-50 border border-ink p-4">
                  <div className="font-black text-cyan">Pre-Seed</div>
                  <div className="text-2xl font-black">{data.funding_strategy.pre_seed.amount}</div>
                  <div className="text-sm text-gray-600 mt-2">{data.funding_strategy.pre_seed.timing}</div>
                  <ul className="text-sm mt-2">
                    {data.funding_strategy.pre_seed.use_of_funds?.map((u: string, idx: number) => (
                      <li key={idx}>• {u}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.funding_strategy.seed && (
                <div className="bg-gray-50 border border-ink p-4">
                  <div className="font-black text-cyan">Seed</div>
                  <div className="text-2xl font-black">{data.funding_strategy.seed.amount}</div>
                  <div className="text-sm text-gray-600 mt-2">{data.funding_strategy.seed.timing}</div>
                </div>
              )}
              {data.funding_strategy.series_a && (
                <div className="bg-gray-50 border border-ink p-4">
                  <div className="font-black text-cyan">Series A</div>
                  <div className="text-2xl font-black">{data.funding_strategy.series_a.amount}</div>
                  <div className="text-sm text-gray-600 mt-2">{data.funding_strategy.series_a.timing}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {data.scenario_analysis && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Scenario Analysis (Year 5)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 p-4 text-center">
                <div className="font-black text-green-700">Best Case</div>
                <div className="text-2xl font-black">${data.scenario_analysis.best_case?.year_5_revenue?.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-2">{data.scenario_analysis.best_case?.assumptions}</div>
              </div>
              <div className="bg-gray-50 border border-ink p-4 text-center">
                <div className="font-black">Base Case</div>
                <div className="text-2xl font-black">${data.scenario_analysis.base_case?.year_5_revenue?.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-2">{data.scenario_analysis.base_case?.assumptions}</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-4 text-center">
                <div className="font-black text-red-700">Worst Case</div>
                <div className="text-2xl font-black">${data.scenario_analysis.worst_case?.year_5_revenue?.toLocaleString()}</div>
                <div className="text-sm text-gray-600 mt-2">{data.scenario_analysis.worst_case?.assumptions}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompetitors = () => {
    const data = result.competitor_analysis;
    if (!data) return <div className="text-gray-500">Competitor analysis not available</div>;
    
    return (
      <div className="space-y-6">
        {data.competitive_landscape && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Competitive Landscape</h3>
            <p className="text-gray-700">{data.competitive_landscape}</p>
          </div>
        )}

        {data.competitors && data.competitors.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Key Competitors</h3>
            <div className="space-y-4">
              {data.competitors.map((comp: any, idx: number) => (
                <div key={idx} className="border-2 border-ink p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-black text-lg">{comp.name}</div>
                      <span className={`text-xs font-bold px-2 py-1 ${
                        comp.type === 'Direct' ? 'bg-red-100 text-red-700' : 
                        comp.type === 'Indirect' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100'
                      }`}>{comp.type}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 ${
                      comp.threat_level === 'High' ? 'bg-red-500 text-white' : 
                      comp.threat_level === 'Medium' ? 'bg-yellow-400 text-ink' :
                      'bg-green-100 text-green-700'
                    }`}>Threat: {comp.threat_level}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{comp.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {comp.funding && <div><span className="font-bold">Funding:</span> {comp.funding}</div>}
                    {comp.estimated_revenue && <div><span className="font-bold">Revenue:</span> {comp.estimated_revenue}</div>}
                    {comp.team_size && <div><span className="font-bold">Team:</span> {comp.team_size}</div>}
                    {comp.market_share && <div><span className="font-bold">Share:</span> {comp.market_share}</div>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-xs font-bold text-green-600">Strengths</div>
                      <ul className="text-sm">
                        {comp.strengths?.map((s: string, i: number) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-600">Weaknesses</div>
                      <ul className="text-sm">
                        {comp.weaknesses?.map((w: string, i: number) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.differentiation && (
          <div className="bg-cyan/10 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Your Differentiation</h3>
            <div className="font-bold text-lg mb-2">{data.differentiation.primary_differentiator}</div>
            {data.differentiation.positioning_statement && (
              <p className="text-gray-700 italic">"{data.differentiation.positioning_statement}"</p>
            )}
          </div>
        )}

        {data.market_gaps && data.market_gaps.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Market Gaps to Exploit</h3>
            <div className="flex flex-wrap gap-2">
              {data.market_gaps.map((gap: string, idx: number) => (
                <span key={idx} className="bg-cyan text-ink px-3 py-1 font-bold">{gap}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGTM = () => {
    const data = result.go_to_market;
    if (!data) return <div className="text-gray-500">Go-to-market plan not available</div>;
    
    return (
      <div className="space-y-6">
        {data.strategy_overview && (
          <div className="bg-cyan/10 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Strategy Overview</h3>
            <p className="text-gray-700">{data.strategy_overview}</p>
          </div>
        )}

        {data.launch_phases && data.launch_phases.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Launch Phases</h3>
            <div className="space-y-4">
              {data.launch_phases.map((phase: any, idx: number) => (
                <div key={idx} className="border-l-4 border-cyan pl-4">
                  <div className="font-black">{phase.phase}</div>
                  <div className="text-sm text-gray-500">{phase.duration}</div>
                  <div className="mt-2">
                    <span className="text-xs font-bold">Goals:</span>
                    <ul className="text-sm">
                      {phase.goals?.map((g: string, i: number) => (
                        <li key={i}>• {g}</li>
                      ))}
                    </ul>
                  </div>
                  {phase.budget && (
                    <div className="text-sm font-bold text-cyan mt-2">Budget: {phase.budget}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.first_100_customers && (
          <div className="bg-manilla border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">First 100 Customers Strategy</h3>
            <p className="text-gray-700 mb-4">{data.first_100_customers.strategy}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['week_1_actions', 'week_2_actions', 'week_3_actions', 'week_4_actions'].map((week, idx) => (
                data.first_100_customers[week] && (
                  <div key={week} className="bg-white border border-ink p-3">
                    <div className="font-bold text-sm">Week {idx + 1}</div>
                    <ul className="text-xs mt-1">
                      {data.first_100_customers[week].map((a: string, i: number) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {data.acquisition_channels && data.acquisition_channels.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Acquisition Channels</h3>
            <div className="space-y-3">
              {data.acquisition_channels.map((channel: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <div className="font-bold">{channel.channel}</div>
                    <div className="text-sm text-gray-500">{channel.type} • {channel.time_to_results}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cyan">{channel.expected_cac} CAC</div>
                    <div className="text-xs text-gray-500">Priority: {channel.priority}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTeam = () => {
    const data = result.team_plan;
    if (!data) return <div className="text-gray-500">Team plan not available</div>;
    
    return (
      <div className="space-y-6">
        {data.founding_team && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Ideal Founding Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-sm text-gray-500 mb-2">IDEAL COMPOSITION</div>
                <div className="flex flex-wrap gap-2">
                  {data.founding_team.ideal_composition?.map((role: string, idx: number) => (
                    <span key={idx} className="bg-cyan text-ink px-3 py-1 font-bold">{role}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold text-sm text-gray-500 mb-2">CRITICAL SKILLS NEEDED</div>
                <div className="flex flex-wrap gap-2">
                  {data.founding_team.critical_skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {data.hiring_roadmap && data.hiring_roadmap.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Hiring Roadmap</h3>
            <div className="space-y-6">
              {data.hiring_roadmap.map((phase: any, idx: number) => (
                <div key={idx} className="border-l-4 border-cyan pl-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-black">{phase.phase}</div>
                      <div className="text-sm text-gray-500">{phase.timeline}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{phase.total_headcount} people</div>
                      <div className="text-sm text-gray-500">{phase.monthly_burn}/mo burn</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.hires?.map((hire: any, i: number) => (
                      <div key={i} className="bg-gray-50 border border-ink p-3">
                        <div className="flex justify-between items-start">
                          <div className="font-bold">{hire.role}</div>
                          <span className={`text-xs font-bold px-2 py-1 ${
                            hire.priority === 'Critical' ? 'bg-red-100 text-red-700' : 
                            hire.priority === 'Important' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100'
                          }`}>{hire.priority}</span>
                        </div>
                        <div className="text-sm text-gray-600">{hire.salary_range}</div>
                        {hire.equity_range && (
                          <div className="text-xs text-cyan font-bold">{hire.equity_range} equity</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.culture && (
          <div className="bg-manilla border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Company Culture</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-bold text-sm text-gray-500 mb-2">CORE VALUES</div>
                <ul className="space-y-1">
                  {data.culture.core_values?.map((v: string, idx: number) => (
                    <li key={idx} className="font-bold">• {v}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-bold text-sm text-gray-500 mb-2">WORKING STYLE</div>
                <p>{data.culture.working_style}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRisks = () => {
    const data = result.risk_assessment;
    if (!data) return <div className="text-gray-500">Risk assessment not available</div>;
    
    return (
      <div className="space-y-6">
        {data.risk_score && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Risk Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Object.entries(data.risk_score).map(([key, value]: [string, any]) => (
                <div key={key} className={`p-4 text-center border-2 ${
                  value >= 7 ? 'border-red-500 bg-red-50' :
                  value >= 4 ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="text-3xl font-black">{value}</div>
                  <div className="text-xs font-bold text-gray-500">{key.replace('_', ' ').toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.critical_risks && data.critical_risks.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Critical Risks</h3>
            <div className="space-y-4">
              {data.critical_risks.map((risk: any, idx: number) => (
                <div key={idx} className={`border-2 p-4 ${
                  risk.impact === 'High' ? 'border-red-500' : 
                  risk.impact === 'Medium' ? 'border-yellow-500' :
                  'border-ink'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-black">{risk.risk}</div>
                    <div className="flex gap-2">
                      <span className={`text-xs font-bold px-2 py-1 ${
                        risk.probability === 'High' ? 'bg-red-100 text-red-700' : 
                        risk.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>P: {risk.probability}</span>
                      <span className={`text-xs font-bold px-2 py-1 ${
                        risk.impact === 'High' ? 'bg-red-100 text-red-700' : 
                        risk.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>I: {risk.impact}</span>
                    </div>
                  </div>
                  <div className="text-sm mb-2">
                    <span className="font-bold">Mitigation:</span> {risk.mitigation_strategy}
                  </div>
                  {risk.early_warning_signs && (
                    <div className="text-xs text-gray-500">
                      <span className="font-bold">Watch for:</span> {risk.early_warning_signs.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.kill_conditions && data.kill_conditions.length > 0 && (
          <div className="bg-red-50 border-2 border-red-500 p-6">
            <h3 className="font-black text-lg mb-4 text-red-700">Kill Conditions</h3>
            <p className="text-sm text-gray-600 mb-4">When to consider shutting down:</p>
            <ul className="space-y-2">
              {data.kill_conditions.map((kc: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500">🛑</span>
                  <div>
                    <div className="font-bold">{kc.condition}</div>
                    <div className="text-sm text-gray-600">{kc.metrics} • {kc.timeline}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderAction = () => {
    const data = result.action_plan;
    if (!data) return <div className="text-gray-500">Action plan not available</div>;
    
    return (
      <div className="space-y-6">
        {data.overview && (
          <div className="bg-cyan/10 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">90-Day Success Definition</h3>
            <p className="text-gray-700">{data.overview}</p>
          </div>
        )}

        {data.key_milestones && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Key Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.key_milestones).map(([day, milestones]: [string, any]) => (
                <div key={day} className="bg-cyan/10 border border-ink p-4">
                  <div className="font-black text-cyan">{day.replace('_', ' ').toUpperCase()}</div>
                  <ul className="mt-2 space-y-1">
                    {Array.isArray(milestones) && milestones.map((m: string, idx: number) => (
                      <li key={idx} className="text-sm">✓ {m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.quick_wins && data.quick_wins.length > 0 && (
          <div className="bg-manilla border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Quick Wins</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.quick_wins.map((win: any, idx: number) => (
                <div key={idx} className="bg-white border border-ink p-3">
                  <div className="font-bold">{win.action}</div>
                  <div className="text-sm text-gray-600">{win.impact}</div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-cyan font-bold">{win.time_required}</span>
                    <span>{win.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.week_by_week && data.week_by_week.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Week-by-Week Breakdown</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.week_by_week.slice(0, 4).map((week: any, idx: number) => (
                <div key={idx} className="border-l-4 border-cyan pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black">Week {week.week}: {week.theme}</div>
                      <div className="text-sm text-gray-500">Milestone: {week.milestone}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    {week.tasks?.slice(0, 3).map((task: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-1">
                        <span className={`text-xs font-bold px-1 ${
                          task.priority === 'P1' ? 'bg-red-100 text-red-700' :
                          task.priority === 'P2' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100'
                        }`}>{task.priority}</span>
                        <span>{task.task}</span>
                        <span className="text-gray-400 text-xs">{task.time_estimate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.resources_needed && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Resources Needed</h3>
            {data.resources_needed.budget && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 border border-ink">
                  <div className="text-xs font-bold text-gray-500">MONTH 1</div>
                  <div className="text-xl font-black">{data.resources_needed.budget.month_1}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 border border-ink">
                  <div className="text-xs font-bold text-gray-500">MONTH 2</div>
                  <div className="text-xl font-black">{data.resources_needed.budget.month_2}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 border border-ink">
                  <div className="text-xs font-bold text-gray-500">MONTH 3</div>
                  <div className="text-xl font-black">{data.resources_needed.budget.month_3}</div>
                </div>
              </div>
            )}
            {data.resources_needed.tools && (
              <div>
                <div className="font-bold text-sm text-gray-500 mb-2">TOOLS NEEDED</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {data.resources_needed.tools.map((tool: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 border border-ink">
                      <div>
                        <div className="font-bold text-sm">{tool.tool}</div>
                        <div className="text-xs text-gray-500">{tool.purpose}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{tool.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPitch = () => {
    const data = result.pitch_deck;
    if (!data) return <div className="text-gray-500">Pitch deck not available</div>;
    
    return (
      <div className="space-y-6">
        {data.deck_strategy && (
          <div className="bg-cyan/10 border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Deck Strategy</h3>
            <p className="text-gray-700">{data.deck_strategy}</p>
          </div>
        )}

        {data.slides && data.slides.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Slide-by-Slide Breakdown</h3>
            <div className="space-y-4">
              {data.slides.map((slide: any, idx: number) => (
                <div key={idx} className="border-2 border-ink p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cyan flex items-center justify-center font-black">
                        {slide.slide_number}
                      </div>
                      <div>
                        <div className="font-black">{slide.title}</div>
                        <div className="text-sm text-gray-500">{slide.purpose}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{slide.time}</span>
                  </div>
                  
                  {slide.content && (
                    <div className="bg-gray-50 p-3 mt-3">
                      {slide.content.headline && (
                        <div className="font-bold mb-2">{slide.content.headline}</div>
                      )}
                      {slide.content.key_points && (
                        <ul className="text-sm space-y-1">
                          {slide.content.key_points.map((point: string, i: number) => (
                            <li key={i}>• {point}</li>
                          ))}
                        </ul>
                      )}
                      {slide.content.visual && (
                        <div className="text-xs text-gray-400 mt-2 italic">Visual: {slide.content.visual}</div>
                      )}
                    </div>
                  )}

                  {slide.speaker_notes && (
                    <div className="mt-2 text-sm text-gray-600 border-l-2 border-gray-300 pl-3">
                      <span className="font-bold">Speaker notes:</span> {slide.speaker_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.investor_faqs && data.investor_faqs.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Investor FAQs</h3>
            <div className="space-y-4">
              {data.investor_faqs.map((faq: any, idx: number) => (
                <div key={idx} className="border-b pb-3">
                  <div className="font-bold text-cyan">Q: {faq.question}</div>
                  <div className="text-gray-700 mt-1">A: {faq.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.presentation_tips && data.presentation_tips.length > 0 && (
          <div className="bg-manilla border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-3">Presentation Tips</h3>
            <ul className="space-y-2">
              {data.presentation_tips.map((tip: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
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
          <div className="bg-cyan/20 border-2 border-ink p-6">
            <h3 className="font-black text-sm text-gray-500 mb-2">TARGET LOCATION</h3>
            <p className="text-3xl font-black">{data.location.city}, {data.location.state}</p>
          </div>
        )}

        {data.population_data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-ink p-6 text-center">
              <div className="font-black text-xs text-gray-500 mb-1">CITY POPULATION</div>
              <div className="text-3xl font-black">{data.population_data.city_population?.toLocaleString()}</div>
            </div>
            <div className="bg-white border-2 border-ink p-6 text-center">
              <div className="font-black text-xs text-gray-500 mb-1">METRO AREA</div>
              <div className="text-3xl font-black">{Math.round(data.population_data.metro_population || 0).toLocaleString()}</div>
            </div>
            <div className="bg-white border-2 border-ink p-6 text-center">
              <div className="font-black text-xs text-gray-500 mb-1">STATE POPULATION</div>
              <div className="text-3xl font-black">{data.population_data.state_population?.toLocaleString()}</div>
            </div>
          </div>
        )}

        {data.market_insights && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Market Size Calculations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 border border-ink">
                <div className="text-xs text-gray-500 font-bold">Households</div>
                <div className="text-xl font-black">{data.market_insights.total_households?.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 border border-ink">
                <div className="text-xs text-gray-500 font-bold">Metro Households</div>
                <div className="text-xl font-black">{data.market_insights.metro_households?.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 border border-ink">
                <div className="text-xs text-gray-500 font-bold">Working Adults</div>
                <div className="text-xl font-black">{data.market_insights.tam_calculation_base?.working_adults?.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-4 border border-ink">
                <div className="text-xs text-gray-500 font-bold">Est. HH Income</div>
                <div className="text-xl font-black">${data.market_insights.tam_calculation_base?.median_household_income_estimate?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {data.competitors_analyzed && data.competitors_analyzed.length > 0 && (
          <div className="bg-white border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Competitors Scraped ({data.competitors_analyzed.length})</h3>
            <div className="space-y-4">
              {data.competitors_analyzed.map((comp: any, idx: number) => (
                <div key={idx} className="border-2 border-ink p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-black">{comp.domain}</div>
                      {comp.title && <div className="text-sm text-gray-600">{comp.title}</div>}
                    </div>
                    {comp.error && <span className="text-red-500 text-xs">Error: {comp.error}</span>}
                  </div>
                  {comp.description && <p className="text-sm text-gray-600 mb-2">{comp.description}</p>}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {comp.prices_found && comp.prices_found.length > 0 && (
                      <span className="bg-green-100 px-2 py-1 border border-green-300">
                        Prices: ${Math.min(...comp.prices_found)} - ${Math.max(...comp.prices_found)}
                      </span>
                    )}
                    {comp.features?.has_online_booking && (
                      <span className="bg-blue-100 px-2 py-1 border border-blue-300">Online Booking</span>
                    )}
                    {comp.features?.shows_reviews && (
                      <span className="bg-yellow-100 px-2 py-1 border border-yellow-300">Shows Reviews</span>
                    )}
                    {comp.features?.has_pricing_page && (
                      <span className="bg-purple-100 px-2 py-1 border border-purple-300">Pricing Page</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.competitor_summary && (
          <div className="bg-manilla border-2 border-ink p-6">
            <h3 className="font-black text-lg mb-4">Competitor Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {data.competitor_summary.avg_price && (
                <div className="text-center">
                  <div className="text-2xl font-black">${data.competitor_summary.avg_price.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">Avg Price</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-black">{data.competitor_summary.pct_with_online_booking?.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Online Booking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{data.competitor_summary.pct_showing_reviews?.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Show Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{data.competitor_summary.pct_with_pricing?.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Show Pricing</div>
              </div>
            </div>
            {data.competitor_summary.market_gaps && data.competitor_summary.market_gaps.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Market Gaps Identified:</h4>
                <ul className="space-y-1">
                  {data.competitor_summary.market_gaps.map((gap: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const tabs = result.local_business_data ? [...baseTabs, localTab] : baseTabs;

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

  return (
    <div className="bg-[#F2F0E9] text-ink font-sans antialiased min-h-screen">
      <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b-2 border-ink px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-manilla border-2 border-ink flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
              <span className="font-black text-xl">M</span>
            </div>
            <span className="font-black text-xl tracking-tighter">myCEO</span>
          </Link>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan text-ink font-bold px-4 py-2 border-2 border-ink shadow-brutal-sm hover:bg-cyan-hover transition-all text-sm"
          >
            NEW ANALYSIS
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="inline-block bg-cyan text-ink text-xs font-black px-3 py-1 border-2 border-ink mb-2">
            BUSINESS OPERATING SYSTEM
          </div>
          <h1 className="text-3xl md:text-4xl font-black">Your Complete Business Analysis</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-56 flex-shrink-0">
            <div className="bg-paper border-2 border-ink shadow-brutal sticky top-24">
              <div className="p-3 border-b-2 border-ink bg-ink text-white">
                <span className="font-black text-sm">SECTIONS</span>
              </div>
              <div className="divide-y divide-ink">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-3 font-bold text-sm transition-all flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? 'bg-cyan text-ink' 
                        : 'bg-paper hover:bg-gray-100'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-paper border-2 border-ink shadow-brutal p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-ink">
                <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
                <h2 className="text-2xl font-black">{tabs.find(t => t.id === activeTab)?.label}</h2>
              </div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
