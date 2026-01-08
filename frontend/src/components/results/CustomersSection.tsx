import { UsersIcon } from '@heroicons/react/24/outline';
import type { CustomerProfiles } from '../../types/generation';

interface CustomersSectionProps {
  data: CustomerProfiles;
}

export function CustomersSection({ data }: CustomersSectionProps) {
  if (!data) return null;

  const profiles = data.profiles || [];
  const segmentSplit = data.segmentSplit || {};

  return (
    <section id="customers" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UsersIcon className="w-7 h-7 text-green-600" />
          Customer Profiles
        </h2>
        <p className="text-gray-600 mt-1">Ideal customer personas and segments</p>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {profiles.map((persona, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="text-4xl mb-2">{persona.avatar}</div>
              <h3 className="text-xl font-bold">{persona.name}</h3>
              <p className="text-green-100">{persona.tagline}</p>
            </div>

            {/* Demographics */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Demographics</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="font-medium text-gray-900 text-sm">{persona.demographics?.age}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Income</p>
                  <p className="font-medium text-gray-900 text-sm">{persona.demographics?.income}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900 text-sm truncate">{persona.demographics?.location}</p>
                </div>
              </div>
            </div>

            {/* Psychographics */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Psychographics</h4>

              {persona.psychographics?.values && persona.psychographics.values.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Values</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.psychographics.values.map((value, i) => (
                      <span key={i} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {persona.psychographics?.painPoints && persona.psychographics.painPoints.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-2">Pain Points</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.psychographics.painPoints.map((pain, i) => (
                      <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                        {pain}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {persona.psychographics?.buyingTriggers && persona.psychographics.buyingTriggers.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Buying Triggers</p>
                  <div className="flex flex-wrap gap-1">
                    {persona.psychographics.buyingTriggers.map((trigger, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Day in Life */}
            {persona.dayInLife && (
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">A Day in Their Life</h4>
                <p className="text-gray-700 text-sm italic">"{persona.dayInLife}"</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Segment Split */}
      {Object.keys(segmentSplit).length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Segment Distribution</h3>
          <div className="space-y-3">
            {Object.entries(segmentSplit).map(([segment, percentage], idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">{segment}</span>
                  <span className="font-medium text-gray-900">{percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
