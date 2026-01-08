import { CheckIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { BusinessPlanData, RoadmapPhase } from '../../../types/report';

interface BusinessPlanProps {
  data: BusinessPlanData;
}

const statusConfig = {
  complete: {
    icon: CheckIcon,
    label: 'Complete',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  funded: {
    icon: BanknotesIcon,
    label: 'Funded',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  pending: {
    icon: ClockIcon,
    label: 'Pending',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
};

const colorConfig = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
};

function PhaseCard({ phase, index }: { phase: RoadmapPhase; index: number }) {
  const status = statusConfig[phase.status];
  const StatusIcon = status.icon;

  return (
    <div className="relative">
      {/* Connector line */}
      {index > 0 && (
        <div className="absolute -left-4 top-8 w-4 h-0.5 bg-gray-200" />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorConfig[phase.color]} flex items-center justify-center`}
          >
            <span className="text-white font-bold text-sm">{phase.quarter}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
            <StatusIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{status.label}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-apple-text mb-3">{phase.title}</h4>

        {/* Milestones */}
        <ul className="space-y-2">
          {phase.milestones.map((milestone, mIndex) => (
            <li key={mIndex} className="flex items-start gap-2 text-sm text-apple-gray">
              <div
                className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  phase.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              {milestone}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function BusinessPlan({ data }: BusinessPlanProps) {
  return (
    <div className="space-y-8">
      {/* Roadmap Timeline */}
      <div>
        <h3 className="text-sm font-semibold text-apple-text mb-4">Business Roadmap</h3>
        <div className="grid grid-cols-4 gap-6">
          {data.phases.map((phase, index) => (
            <PhaseCard key={index} phase={phase} index={index} />
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-apple-text mb-4">Overall Progress</h3>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
            style={{
              width: `${
                (data.phases.filter((p) => p.status === 'complete').length / data.phases.length) * 100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-apple-gray">
          <span>
            {data.phases.filter((p) => p.status === 'complete').length} of {data.phases.length} phases
            complete
          </span>
          <span>
            {Math.round(
              (data.phases.filter((p) => p.status === 'complete').length / data.phases.length) * 100
            )}
            %
          </span>
        </div>
      </div>

      {/* Supply Chain */}
      {data.supplyChain.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Supply Chain Partners</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.supplyChain.map((vendor, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-apple-gray">{vendor.category}</span>
                <p className="font-medium text-apple-text">{vendor.vendor}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
