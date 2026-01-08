import { CheckCircleIcon, XCircleIcon, ArrowUpCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CompetitorLandscapeData } from '../../../types/report';

interface CompetitorLandscapeProps {
  data: CompetitorLandscapeData;
}

export default function CompetitorLandscape({ data }: CompetitorLandscapeProps) {
  return (
    <div className="space-y-8">
      {/* Competitor Cards */}
      {data.competitors.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {data.competitors.map((competitor, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: competitor.color }}
                >
                  {competitor.initial}
                </div>
                <div>
                  <h4 className="font-semibold text-apple-text text-sm">{competitor.name}</h4>
                  <p className="text-xs text-apple-gray">{competitor.type}</p>
                </div>
              </div>
              {competitor.avgPrice && (
                <div className="text-xs text-apple-gray">
                  Avg Price: <span className="font-medium text-apple-text">{competitor.avgPrice}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Positioning Matrix */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-apple-text mb-4">Competitive Positioning</h3>
        <div className="relative h-64 bg-white rounded-xl border border-gray-200">
          {/* Axes Labels */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-apple-gray whitespace-nowrap">
            Quality
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-apple-gray">Price</div>

          {/* Grid */}
          <div className="absolute inset-8 border-l border-b border-gray-200">
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-gray-200" />
            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-gray-200" />
          </div>

          {/* Competitor dots */}
          {data.competitors.map((competitor, index) => (
            <div
              key={index}
              className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              style={{
                backgroundColor: competitor.color,
                left: `${8 + (competitor.position?.x || 30 + index * 15) * 0.84}%`,
                top: `${8 + (100 - (competitor.position?.y || 30 + index * 20)) * 0.84}%`,
              }}
              title={competitor.name}
            >
              {competitor.initial}
            </div>
          ))}

          {/* Your position */}
          {data.yourPosition && (
            <div
              className="absolute w-10 h-10 rounded-full bg-apple-blue flex items-center justify-center text-white text-xs font-bold shadow-lg ring-4 ring-blue-200 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${8 + data.yourPosition.x * 0.84}%`,
                top: `${8 + (100 - data.yourPosition.y) * 0.84}%`,
              }}
            >
              You
            </div>
          )}
        </div>
      </div>

      {/* SWOT Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strengths */}
        {data.strengths.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-700">Strengths</h4>
            </div>
            <ul className="space-y-2">
              {data.strengths.map((item, index) => (
                <li key={index} className="text-sm text-apple-text flex items-start gap-2">
                  <span className="text-green-500 mt-1">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {data.weaknesses.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-700">Weaknesses</h4>
            </div>
            <ul className="space-y-2">
              {data.weaknesses.map((item, index) => (
                <li key={index} className="text-sm text-apple-text flex items-start gap-2">
                  <span className="text-red-500 mt-1">-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {data.opportunities && data.opportunities.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpCircleIcon className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-700">Opportunities</h4>
            </div>
            <ul className="space-y-2">
              {data.opportunities.map((item, index) => (
                <li key={index} className="text-sm text-apple-text flex items-start gap-2">
                  <span className="text-blue-500 mt-1">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Threats */}
        {data.threats && data.threats.length > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-700">Threats</h4>
            </div>
            <ul className="space-y-2">
              {data.threats.map((item, index) => (
                <li key={index} className="text-sm text-apple-text flex items-start gap-2">
                  <span className="text-orange-500 mt-1">!</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
