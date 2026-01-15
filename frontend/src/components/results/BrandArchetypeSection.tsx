import { SparklesIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { BrandArchetype } from '../../types/generation';

interface BrandArchetypeSectionProps {
  data: BrandArchetype;
}

export function BrandArchetypeSection({ data }: BrandArchetypeSectionProps) {
  if (!data) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <section id="brandArchetype" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SparklesIcon className="w-7 h-7 text-purple-600" />
          Brand Archetype
        </h2>
        <p className="text-gray-600 mt-1">Your brand personality using the 12 archetypal frameworks</p>
      </div>

      {/* Primary Archetype Card */}
      {data.primaryArchetype && (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-purple-200 text-sm font-medium">Primary Archetype</span>
              <h3 className="text-3xl font-bold mt-1 flex items-center gap-2">
                {getRankBadge(data.primaryArchetype.rank)} {data.primaryArchetype.name}
              </h3>
            </div>
            <StarIcon className="w-10 h-10 text-yellow-300" />
          </div>
          <p className="text-purple-100 mb-4">{data.primaryArchetype.definition}</p>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-sm text-purple-200 mb-2">Human Need Fulfilled</p>
            <p className="text-white font-medium">{data.primaryArchetype.humanNeed}</p>
          </div>
          {data.primaryArchetype.personalityTraits && (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.primaryArchetype.personalityTraits.map((trait, idx) => (
                <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secondary Archetypes */}
      {data.secondaryArchetypes && data.secondaryArchetypes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {data.secondaryArchetypes.map((archetype, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{getRankBadge(archetype.rank)}</span>
                <h4 className="text-lg font-semibold text-gray-900">{archetype.name}</h4>
              </div>
              <p className="text-gray-600 text-sm mb-3">{archetype.definition}</p>
              <p className="text-xs text-gray-500 mb-2">Human Need: {archetype.humanNeed}</p>
              {archetype.personalityTraits && (
                <div className="flex flex-wrap gap-1">
                  {archetype.personalityTraits.map((trait, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                      {trait}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotional Benefits */}
        {data.emotionalBenefits && data.emotionalBenefits.length > 0 && (
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200 p-6">
            <div className="flex items-start gap-3">
              <HeartIcon className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Emotional Benefits</h3>
                <ul className="space-y-2">
                  {data.emotionalBenefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-pink-500 mt-1">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Core Insight */}
        {data.coreInsight && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-start gap-3">
              <SparklesIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Core Insight</h3>
                <p className="text-gray-700">{data.coreInsight}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
