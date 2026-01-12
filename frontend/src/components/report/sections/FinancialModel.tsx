import { LockClosedIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { FinancialModelData } from '../../../types/report';

interface FinancialModelProps {
  data: FinancialModelData;
}

export default function FinancialModel({ data }: FinancialModelProps) {
  if (data.isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <LockClosedIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-apple-text mb-2">Financial Model Locked</h3>
        <p className="text-apple-gray text-center max-w-md mb-6">
          Upgrade to Premium to unlock detailed financial projections, break-even analysis, and funding strategy.
        </p>
        <button className="bg-apple-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      {data.metrics.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {data.metrics.map((metric, index) => (
            <div
              key={index}
              className={`rounded-2xl p-5 ${
                metric.highlight
                  ? 'bg-gradient-to-br from-apple-blue to-blue-600 text-white'
                  : 'bg-gray-50'
              }`}
            >
              <span className={`text-xs ${metric.highlight ? 'text-blue-100' : 'text-apple-gray'}`}>
                {metric.label}
              </span>
              <p className={`text-xl font-bold mt-1 ${metric.highlight ? 'text-white' : 'text-apple-text'}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Financial Projections Table */}
      {data.projections.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">3-Year Financial Projections</h3>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-apple-gray">Metric</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-apple-gray">Year 1</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-apple-gray">Year 2</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-apple-gray">Year 3</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.projections.map((row, index) => (
                  <tr
                    key={index}
                    className={row.isHighlight ? 'bg-green-50' : row.isNegative ? 'bg-red-50/50' : ''}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-apple-text">{row.metric}</td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        row.isHighlight ? 'text-green-600' : row.isNegative ? 'text-red-600' : 'text-apple-text'
                      }`}
                    >
                      {row.year1}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        row.isHighlight ? 'text-green-600' : row.isNegative ? 'text-red-600' : 'text-apple-text'
                      }`}
                    >
                      {row.year2}
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-semibold ${
                        row.isHighlight ? 'text-green-600' : row.isNegative ? 'text-red-600' : 'text-apple-text'
                      }`}
                    >
                      {row.year3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Startup Costs */}
      {data.startupCosts.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-apple-text mb-4">Startup Costs</h3>
            <div className="space-y-3">
              {data.startupCosts.map((cost, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-apple-gray">{cost.item}</span>
                  <span className="text-sm font-semibold text-apple-text">{cost.amount}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-apple-text">Total Capital Required</span>
                  <span className="text-lg font-bold text-apple-blue">{data.totalCapital}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Indicator */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-700">Growth Trajectory</h3>
                <p className="text-sm text-green-600">Projected path to profitability</p>
              </div>
            </div>
            <div className="space-y-2">
              {data.projections.slice(0, 3).map((proj, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-apple-text">
                    Year {index + 1}: {proj.year1 || proj.metric}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
