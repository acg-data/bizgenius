import { SparklesIcon, StarIcon, HeartIcon } from '@heroicons/react/24/outline';

interface BrandArchetypeData {
  primaryArchetype?: {
    name: string;
    rank: number;
    definition: string;
    humanNeed: string;
    personalityTraits: string[];
  };
  secondaryArchetypes?: Array<{
    name: string;
    rank: number;
    definition: string;
    humanNeed: string;
    personalityTraits: string[];
  }>;
  emotionalBenefits?: string[];
  coreInsight?: string;
}

interface BrandArchetypeProps {
  data?: BrandArchetypeData;
}

export default function BrandArchetype({ data }: BrandArchetypeProps) {
  if (!data) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  return (
    <div className="space-y-8">
      {/* Primary Archetype */}
      {data.primaryArchetype && (
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-purple-200 text-xs font-medium mb-1">Primary Archetype</p>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-300" />
                {data.primaryArchetype.name}
              </h3>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {getRankBadge(data.primaryArchetype.rank)}
            </span>
          </div>
          <p className="text-purple-100 mb-4">{data.primaryArchetype.definition}</p>
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <p className="text-xs text-purple-200 mb-1">Human Need</p>
            <p className="text-white">{data.primaryArchetype.humanNeed}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.primaryArchetype.personalityTraits?.map((trait, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Secondary Archetypes */}
      {data.secondaryArchetypes && data.secondaryArchetypes.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {data.secondaryArchetypes.map((archetype, idx) => (
            <div key={idx} className="bg-gray-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-purple-600">
                  {getRankBadge(archetype.rank)}
                </span>
                <h4 className="font-semibold text-apple-text">{archetype.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-2">{archetype.definition}</p>
              <div className="flex flex-wrap gap-1">
                {archetype.personalityTraits?.slice(0, 3).map((trait, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-600">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Emotional Benefits & Core Insight */}
      <div className="grid grid-cols-2 gap-4">
        {data.emotionalBenefits && data.emotionalBenefits.length > 0 && (
          <div className="bg-pink-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <HeartIcon className="w-5 h-5 text-pink-500" />
              <h4 className="font-semibold text-apple-text">Emotional Benefits</h4>
            </div>
            <ul className="space-y-1.5">
              {data.emotionalBenefits.map((benefit, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.coreInsight && (
          <div className="bg-amber-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-amber-500" />
              <h4 className="font-semibold text-apple-text">Core Insight</h4>
            </div>
            <p className="text-sm text-gray-600">{data.coreInsight}</p>
          </div>
        )}
      </div>
    </div>
  );
}
