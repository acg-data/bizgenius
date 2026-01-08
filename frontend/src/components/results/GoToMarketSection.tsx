import { RocketLaunchIcon, CurrencyDollarIcon, MegaphoneIcon, ShareIcon } from '@heroicons/react/24/outline';
import type { GoToMarket } from '../../types/generation';

interface GoToMarketSectionProps {
  data: GoToMarket;
}

export function GoToMarketSection({ data }: GoToMarketSectionProps) {
  if (!data) return null;

  return (
    <section id="goToMarket" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <RocketLaunchIcon className="w-7 h-7 text-cyan-600" />
          Go-To-Market
        </h2>
        <p className="text-gray-600 mt-1">Customer acquisition and launch strategy</p>
      </div>

      {/* CAC / LTV Metrics */}
      {data.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-cyan-100 text-sm font-medium mb-1">Customer Acquisition Cost</p>
            <p className="text-3xl font-bold mb-2">{data.metrics.cac?.value || '$0'}</p>
            <p className="text-cyan-100 text-sm">{data.metrics.cac?.breakdown}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-emerald-100 text-sm font-medium mb-1">Lifetime Value</p>
            <p className="text-3xl font-bold mb-2">{data.metrics.ltv?.value || '$0'}</p>
            <p className="text-emerald-100 text-sm">{data.metrics.ltv?.basis}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-gray-500 text-sm font-medium mb-1">LTV:CAC Ratio</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{data.metrics.ltvCacRatio || 'N/A'}</p>
            <p className="text-sm text-green-600 font-medium">Healthy ratio: 3:1+</p>
          </div>
        </div>
      )}

      {/* Launch Phases */}
      {data.launchPhases && data.launchPhases.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Launch Phases</h3>
          <div className="space-y-4">
            {data.launchPhases.map((phase, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    idx === 0 ? 'bg-cyan-500' :
                    idx === 1 ? 'bg-blue-500' :
                    'bg-indigo-500'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < data.launchPhases.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{phase.phase}</h4>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {phase.duration}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Activities</p>
                        <ul className="space-y-1">
                          {phase.activities?.map((activity, aIdx) => (
                            <li key={aIdx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Goals</p>
                        <ul className="space-y-1">
                          {phase.goals?.map((goal, gIdx) => (
                            <li key={gIdx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marketing Channels */}
        {data.channels && data.channels.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MegaphoneIcon className="w-6 h-6 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">Marketing Channels</h3>
            </div>
            <div className="space-y-3">
              {data.channels.map((channel, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{channel.name}</h4>
                    <span className="bg-cyan-100 text-cyan-700 text-xs font-medium px-2 py-1 rounded-full">
                      {channel.budget}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{channel.strategy}</p>
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Expected ROI: {channel.expectedROI}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Viral Mechanics */}
        {data.viralMechanics && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShareIcon className="w-6 h-6 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">Viral Mechanics</h3>
            </div>
            <div className="space-y-4">
              {data.viralMechanics.referralProgram && (
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-cyan-900 mb-2">Referral Program</h4>
                  <p className="text-sm text-cyan-800">{data.viralMechanics.referralProgram}</p>
                </div>
              )}
              {data.viralMechanics.socialProof && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Social Proof</h4>
                  <p className="text-sm text-blue-800">{data.viralMechanics.socialProof}</p>
                </div>
              )}
              {data.viralMechanics.communityBuilding && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                  <h4 className="font-medium text-indigo-900 mb-2">Community Building</h4>
                  <p className="text-sm text-indigo-800">{data.viralMechanics.communityBuilding}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
