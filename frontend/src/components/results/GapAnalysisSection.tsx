import { ScaleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import type { GapAnalysis } from '../../types/generation';

interface GapAnalysisSectionProps {
  data: GapAnalysis;
}

export function GapAnalysisSection({ data }: GapAnalysisSectionProps) {
  if (!data) return null;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section id="gapAnalysis" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScaleIcon className="w-7 h-7 text-indigo-600" />
          Gap Analysis
        </h2>
        <p className="text-gray-600 mt-1">SWOT analysis, Porter's Five Forces, and strategic gaps</p>
      </div>

      {/* Competitive Metrics */}
      {data.competitiveMetrics && data.competitiveMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {data.competitiveMetrics.map((metric, idx) => (
            <div key={idx} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
              <p className="text-indigo-100 text-xs font-medium mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* SWOT Analysis */}
      {data.swot && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Strengths */}
          <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-3">Strengths</h3>
            <ul className="space-y-2">
              {data.swot.strengths?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-green-700">
                  <span className="text-green-500 mt-1">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Weaknesses</h3>
            <ul className="space-y-2">
              {data.swot.weaknesses?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-red-700">
                  <span className="text-red-500 mt-1">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Opportunities</h3>
            <ul className="space-y-2">
              {data.swot.opportunities?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-blue-700">
                  <span className="text-blue-500 mt-1">↑</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-3">Threats</h3>
            <ul className="space-y-2">
              {data.swot.threats?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-orange-700">
                  <span className="text-orange-500 mt-1">!</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Porter's Five Forces */}
      {data.portersFiveForces && data.portersFiveForces.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Porter's Five Forces</h3>
          <div className="space-y-4">
            {data.portersFiveForces.map((force, idx) => (
              <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{force.name}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getIntensityColor(force.intensity)}`}>
                    {force.intensity}
                  </span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  {force.factors?.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Gaps */}
      {data.strategicGaps && data.strategicGaps.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-3">
            <LightBulbIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategic Gaps to Exploit</h3>
              <ul className="space-y-2">
                {data.strategicGaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-amber-500 mt-1">★</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
