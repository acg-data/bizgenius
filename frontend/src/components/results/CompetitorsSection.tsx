import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import type { CompetitorLandscape } from '../../types/generation';

interface CompetitorsSectionProps {
  data: CompetitorLandscape;
}

export function CompetitorsSection({ data }: CompetitorsSectionProps) {
  if (!data) return null;

  return (
    <section id="competitors" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BuildingOfficeIcon className="w-7 h-7 text-orange-600" />
          Competitor Landscape
        </h2>
        <p className="text-gray-600 mt-1">Competitive positioning and strategic analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Positioning Matrix */}
        {data.positioning && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Positioning</h3>
            <div className="relative aspect-square bg-gray-50 rounded-xl p-4">
              {/* Axis Labels */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                {data.positioning.xAxis}
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 origin-center">
                {data.positioning.yAxis}
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-8 border border-gray-200 rounded">
                <div className="absolute left-1/2 top-0 bottom-0 border-l border-gray-200" />
                <div className="absolute top-1/2 left-0 right-0 border-t border-gray-200" />
              </div>

              {/* Players */}
              {data.positioning.players?.map((player, idx) => (
                <div
                  key={idx}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${8 + player.x * 84}%`,
                    top: `${92 - player.y * 84}%`,
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                      player.isYou
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 ring-2 ring-orange-300'
                        : 'bg-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className={`text-xs mt-1 text-center whitespace-nowrap ${player.isYou ? 'font-bold text-orange-600' : 'text-gray-600'}`}>
                    {player.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Competitor List */}
      {data.list && data.list.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.list.map((competitor, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                    <p className="text-sm text-gray-500">{competitor.type}</p>
                  </div>
                  <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                    {competitor.marketShare}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.strengths?.map((s, i) => (
                        <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Weaknesses</p>
                    <div className="flex flex-wrap gap-1">
                      {competitor.weaknesses?.map((w, i) => (
                        <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Advantage */}
      {data.competitiveAdvantage && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Your Competitive Advantage</h3>
          <p className="text-orange-100">{data.competitiveAdvantage}</p>
        </div>
      )}
    </section>
  );
}
