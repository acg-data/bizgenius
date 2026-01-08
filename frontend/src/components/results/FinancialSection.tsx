import { BanknotesIcon, ArrowTrendingUpIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import type { FinancialModel } from '../../types/generation';

interface FinancialSectionProps {
  data: FinancialModel;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function FinancialSection({ data }: FinancialSectionProps) {
  if (!data) return null;

  return (
    <section id="financial" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BanknotesIcon className="w-7 h-7 text-emerald-600" />
          Financial Model
        </h2>
        <p className="text-gray-600 mt-1">5-year projections and financial metrics</p>
      </div>

      {/* Summary Metrics */}
      {data.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-emerald-100 text-sm font-medium mb-1">Startup Cost</p>
            <p className="text-2xl font-bold">{data.summary.startupCost}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-gray-500 text-sm font-medium mb-1">Monthly Burn</p>
            <p className="text-2xl font-bold text-gray-900">{data.summary.monthlyBurnRate}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-gray-500 text-sm font-medium mb-1">Break Even</p>
            <p className="text-2xl font-bold text-gray-900">{data.summary.breakEvenMonths} <span className="text-base font-normal text-gray-500">months</span></p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-1">Year 1 Revenue</p>
            <p className="text-2xl font-bold">{data.summary.yearOneRevenue}</p>
          </div>
        </div>
      )}

      {/* P&L Table */}
      {data.projections && data.projections.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-6 h-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">5-Year Projections</h3>
          </div>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-500"></th>
                {data.projections.map((year, idx) => (
                  <th key={idx} className="text-right py-3 px-2 text-sm font-medium text-gray-900">
                    {year.period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-2 text-sm text-gray-600">Revenue</td>
                {data.projections.map((year, idx) => (
                  <td key={idx} className="text-right py-3 px-2 text-sm font-medium text-gray-900">
                    {formatCurrency(year.revenue)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-2 text-sm text-gray-600">COGS</td>
                {data.projections.map((year, idx) => (
                  <td key={idx} className="text-right py-3 px-2 text-sm text-gray-600">
                    ({formatCurrency(year.cogs)})
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50">
                <td className="py-3 px-2 text-sm font-medium text-gray-700">Gross Profit</td>
                {data.projections.map((year, idx) => (
                  <td key={idx} className="text-right py-3 px-2 text-sm font-medium text-gray-900">
                    {formatCurrency(year.grossProfit)}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-2 text-sm text-gray-600">Operating Expenses</td>
                {data.projections.map((year, idx) => (
                  <td key={idx} className="text-right py-3 px-2 text-sm text-gray-600">
                    ({formatCurrency(year.opex)})
                  </td>
                ))}
              </tr>
              <tr className="bg-emerald-50">
                <td className="py-3 px-2 text-sm font-semibold text-gray-900">Net Profit</td>
                {data.projections.map((year, idx) => (
                  <td key={idx} className={`text-right py-3 px-2 text-sm font-bold ${
                    year.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {year.netProfit >= 0 ? formatCurrency(year.netProfit) : `(${formatCurrency(Math.abs(year.netProfit))})`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-2 text-sm text-gray-600">Margin</td>
                {data.projections.map((year, idx) => (
                  <td key={idx} className={`text-right py-3 px-2 text-sm font-medium ${
                    year.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {year.margin}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CapEx */}
        {data.capex && data.capex.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalculatorIcon className="w-6 h-6 text-emerald-600" />
              <h3 className="text-lg font-semibold text-gray-900">Capital Expenditures</h3>
            </div>
            <div className="space-y-3">
              {data.capex.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.item}</p>
                    <p className="text-sm text-gray-500">{item.depreciation}</p>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.cost)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Funding Needs */}
        {data.fundingNeeds && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">Funding Requirements</h3>
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-emerald-600">{data.fundingNeeds.amount}</p>
              <p className="text-sm text-emerald-700 mt-1">{data.fundingNeeds.runway} runway</p>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800 mb-3">Use of Funds</p>
              <ul className="space-y-2">
                {data.fundingNeeds.use?.map((use, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {use}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
