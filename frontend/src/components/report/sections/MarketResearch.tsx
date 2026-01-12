import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { MarketResearchData } from '../../../types/report';

interface MarketResearchProps {
  data: MarketResearchData;
}

export default function MarketResearch({ data }: MarketResearchProps) {
  return (
    <div className="space-y-8">
      {/* TAM SAM SOM */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <h4 className="text-xs font-medium text-blue-100 mb-1">TAM</h4>
          <p className="text-2xl font-bold">{data.tam.value}</p>
          {data.tam.growth && (
            <p className="text-xs text-blue-100 mt-1">{data.tam.growth} growth</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <h4 className="text-xs font-medium text-purple-100 mb-1">SAM</h4>
          <p className="text-2xl font-bold">{data.sam.value}</p>
          {data.sam.description && (
            <p className="text-xs text-purple-100 mt-1">{data.sam.description}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <h4 className="text-xs font-medium text-green-100 mb-1">SOM</h4>
          <p className="text-2xl font-bold">{data.som.value}</p>
          {data.som.description && (
            <p className="text-xs text-green-100 mt-1">{data.som.description}</p>
          )}
        </div>
      </div>

      {/* Market Trends */}
      {data.trends && data.trends.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Market Trends</h3>
          <div className="space-y-3">
            {data.trends.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  {trend.positive !== false ? (
                    <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm text-apple-text">{trend.label}</span>
                </div>
                {trend.value && (
                  <span
                    className={`text-sm font-semibold ${
                      trend.positive !== false ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {trend.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demographics */}
      {data.demographics && data.demographics.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Target Demographics</h3>
          <div className="flex flex-wrap gap-2">
            {data.demographics.map((demo, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-white rounded-full text-sm text-apple-text border border-gray-200"
              >
                {demo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Insight & Opportunity */}
      {(data.insight || data.opportunity) && (
        <div className="grid grid-cols-2 gap-6">
          {data.insight && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <LightBulbIcon className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-700">Key Insight</h3>
              </div>
              <p className="text-sm text-apple-text leading-relaxed">{data.insight}</p>
            </div>
          )}
          {data.opportunity && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-semibold text-green-700">Market Opportunity</h3>
              </div>
              <p className="text-sm text-apple-text leading-relaxed">{data.opportunity}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
