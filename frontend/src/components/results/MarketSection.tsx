import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import type { MarketResearch } from '../../types/generation';

interface MarketSectionProps {
  data: MarketResearch;
}

export function MarketSection({ data }: MarketSectionProps) {
  if (!data) return null;

  return (
    <section id="market" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="w-7 h-7 text-blue-600" />
          Market Research
        </h2>
        <p className="text-gray-600 mt-1">Market size, trends, and opportunity analysis</p>
      </div>

      {/* TAM/SAM/SOM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium mb-1">TAM</p>
          <p className="text-3xl font-bold mb-2">{data.tam?.value || '$0'}</p>
          <p className="text-blue-100 text-sm">{data.tam?.label || 'Total Addressable Market'}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-indigo-100 text-sm font-medium mb-1">SAM</p>
          <p className="text-3xl font-bold mb-2">{data.sam?.value || '$0'}</p>
          <p className="text-indigo-100 text-sm">{data.sam?.label || 'Serviceable Addressable Market'}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-purple-100 text-sm font-medium mb-1">SOM</p>
          <p className="text-3xl font-bold mb-2">{data.som?.value || '$0'}</p>
          <p className="text-purple-100 text-sm">{data.som?.label || 'Serviceable Obtainable Market'}</p>
        </div>
      </div>

      {/* Trends Table */}
      {data.trends && data.trends.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Trends</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trend</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">YoY Change</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Direction</th>
                </tr>
              </thead>
              <tbody>
                {data.trends.map((trend, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-gray-900">{trend.name}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                        {trend.yoy}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {trend.direction === 'up' ? (
                        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Insight */}
        {data.aiInsight && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insight</h3>
                <p className="text-gray-700">{data.aiInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Demographics */}
        {data.demographics && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Demographics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Primary Age</span>
                <span className="font-medium text-gray-900">{data.demographics.primaryAge}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Income Range</span>
                <span className="font-medium text-gray-900">{data.demographics.income}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Urban Density</span>
                <span className="font-medium text-gray-900">{data.demographics.urbanDensity}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
