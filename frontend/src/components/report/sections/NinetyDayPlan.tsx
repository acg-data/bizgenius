import { CheckCircleIcon, PlayCircleIcon, ClockIcon, FlagIcon } from '@heroicons/react/24/outline';
import { NinetyDayPlanData, ActionPlanMonth } from '../../../types/report';

interface NinetyDayPlanProps {
  data: NinetyDayPlanData;
}

const statusConfig = {
  complete: {
    icon: CheckCircleIcon,
    label: 'Complete',
    ringColor: 'ring-green-500',
    dotColor: 'bg-green-500',
    textColor: 'text-green-600',
  },
  'in-progress': {
    icon: PlayCircleIcon,
    label: 'In Progress',
    ringColor: 'ring-blue-500',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-600',
  },
  pending: {
    icon: ClockIcon,
    label: 'Pending',
    ringColor: 'ring-gray-300',
    dotColor: 'bg-gray-300',
    textColor: 'text-gray-500',
  },
};

const colorConfig = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
};

function MonthCard({ month, isLast }: { month: ActionPlanMonth; isLast: boolean }) {
  const status = statusConfig[month.status];
  const StatusIcon = status.icon;

  return (
    <div className="relative flex-1">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
      )}

      <div className="relative z-10 flex flex-col items-center">
        {/* Circle indicator */}
        <div
          className={`w-12 h-12 rounded-full bg-white ring-4 ${status.ringColor} flex items-center justify-center mb-4`}
        >
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorConfig[month.color]} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{month.month}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 w-full shadow-sm">
          {/* Status badge */}
          <div className={`flex items-center gap-1 mb-3 ${status.textColor}`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{status.label}</span>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-apple-text mb-1">{month.label}</h4>
          <p className="text-sm text-apple-gray mb-4">{month.title}</p>

          {/* Milestones */}
          <ul className="space-y-2">
            {month.milestones.map((milestone, index) => (
              <li key={index} className="flex items-start gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                    month.status === 'complete' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm text-apple-gray">{milestone}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function NinetyDayPlan({ data }: NinetyDayPlanProps) {
  return (
    <div className="space-y-8">
      {/* Timeline */}
      <div className="flex gap-6">
        {data.months.map((month, index) => (
          <MonthCard key={month.month} month={month} isLast={index === data.months.length - 1} />
        ))}
      </div>

      {/* Success Metrics */}
      {(data.successMetrics.revenueTarget || data.successMetrics.customerAcquisition) && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FlagIcon className="w-5 h-5 text-apple-blue" />
            <h3 className="text-sm font-semibold text-apple-text">90-Day Success Metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {data.successMetrics.revenueTarget && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-apple-gray">Revenue Target</span>
                <p className="text-xl font-bold text-apple-text">{data.successMetrics.revenueTarget}</p>
              </div>
            )}
            {data.successMetrics.customerAcquisition && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-apple-gray">Customer Acquisition</span>
                <p className="text-xl font-bold text-apple-text">{data.successMetrics.customerAcquisition}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick summary */}
      <div className="flex items-center justify-center gap-8 text-sm text-apple-gray">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Complete: {data.months.filter((m) => m.status === 'complete').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>In Progress: {data.months.filter((m) => m.status === 'in-progress').length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Pending: {data.months.filter((m) => m.status === 'pending').length}</span>
        </div>
      </div>
    </div>
  );
}
