import { ScaleIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface GapAnalysisData {
  competitiveMetrics?: Array<{ label: string; value: string }>;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  portersFiveForces?: Array<{
    name: string;
    intensity: "High" | "Medium" | "Low";
    factors: string[];
  }>;
  strategicGaps?: string[];
}

interface GapAnalysisProps {
  data: GapAnalysisData;
}

export default function GapAnalysis({ data }: GapAnalysisProps) {
  if (!data) return null;

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Competitive Metrics */}
      {data.competitiveMetrics && data.competitiveMetrics.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {data.competitiveMetrics.map((metric, idx) => (
            <div key={idx} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-indigo-100 text-xs mb-1">{metric.label}</p>
              <p className="text-xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* SWOT Analysis */}
      {data.swot && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-5">
            <h4 className="font-semibold text-green-800 mb-3">Strengths</h4>
            <ul className="space-y-1.5">
              {data.swot.strengths?.map((item, idx) => (
                <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                  <span className="text-green-500">+</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 rounded-2xl p-5">
            <h4 className="font-semibold text-red-800 mb-3">Weaknesses</h4>
            <ul className="space-y-1.5">
              {data.swot.weaknesses?.map((item, idx) => (
                <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="text-red-500">-</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5">
            <h4 className="font-semibold text-blue-800 mb-3">Opportunities</h4>
            <ul className="space-y-1.5">
              {data.swot.opportunities?.map((item, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                  <span className="text-blue-500">↑</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 rounded-2xl p-5">
            <h4 className="font-semibold text-orange-800 mb-3">Threats</h4>
            <ul className="space-y-1.5">
              {data.swot.threats?.map((item, idx) => (
                <li key={idx} className="text-sm text-orange-700 flex items-start gap-2">
                  <span className="text-orange-500">!</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Porter's Five Forces */}
      {data.portersFiveForces && data.portersFiveForces.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ScaleIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-apple-text">Porter's Five Forces</h3>
          </div>
          <div className="space-y-4">
            {data.portersFiveForces.map((force, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-apple-text">{force.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getIntensityColor(force.intensity)}`}>
                    {force.intensity}
                  </span>
                </div>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {force.factors?.map((factor, i) => (
                    <li key={i}>• {factor}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Gaps */}
      {data.strategicGaps && data.strategicGaps.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <LightBulbIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-apple-text">Strategic Gaps to Exploit</h3>
          </div>
          <ul className="space-y-2">
            {data.strategicGaps.map((gap, idx) => (
              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-amber-500">★</span>{gap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
