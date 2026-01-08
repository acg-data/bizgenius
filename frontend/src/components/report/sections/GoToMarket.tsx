import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { GoToMarketData } from '../../../types/report';

interface GoToMarketProps {
  data: GoToMarketData;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MegaphoneIcon,
};

const bgColorMap: Record<string, string> = {
  'bg-blue-100': 'bg-blue-100',
  'bg-green-100': 'bg-green-100',
  'bg-purple-100': 'bg-purple-100',
  'bg-orange-100': 'bg-orange-100',
  'bg-red-100': 'bg-red-100',
  'bg-amber-100': 'bg-amber-100',
};

export default function GoToMarket({ data }: GoToMarketProps) {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white">
          <h4 className="text-sm font-medium text-white/80 mb-1">Customer Acquisition Cost</h4>
          <p className="text-3xl font-bold">{data.cac}</p>
          <p className="text-xs text-white/60 mt-2">Average cost to acquire one customer</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <h4 className="text-sm font-medium text-white/80 mb-1">Customer Lifetime Value</h4>
          <p className="text-3xl font-bold">{data.ltv}</p>
          <p className="text-xs text-white/60 mt-2">Expected revenue per customer</p>
        </div>
      </div>

      {/* LTV:CAC Ratio */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-apple-text mb-3">LTV:CAC Ratio</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (parseFloat(data.ltv.replace(/[^0-9.]/g, '')) /
                      parseFloat(data.cac.replace(/[^0-9.]/g, '')) /
                      5) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
          <span className="text-xl font-bold text-apple-text">
            {(
              parseFloat(data.ltv.replace(/[^0-9.]/g, '')) /
              parseFloat(data.cac.replace(/[^0-9.]/g, ''))
            ).toFixed(1)}
            :1
          </span>
        </div>
        <p className="text-xs text-apple-gray mt-2">
          A healthy ratio is 3:1 or higher. Higher is better.
        </p>
      </div>

      {/* Marketing Channels */}
      <div>
        <h3 className="text-sm font-semibold text-apple-text mb-4">Marketing Channels</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.channels.map((channel, index) => {
            const Icon = iconMap[channel.icon] || MegaphoneIcon;
            const bgColor = bgColorMap[channel.iconBgColor] || 'bg-gray-100';

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-gray-700" />
                </div>
                <h4 className="font-semibold text-apple-text mb-1">{channel.name}</h4>
                <p className="text-sm text-apple-gray">{channel.description}</p>
                {channel.priority && (
                  <span className="inline-block mt-3 px-2 py-1 bg-apple-blue/10 text-apple-blue text-xs font-medium rounded-full">
                    {channel.priority}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Viral Mechanic */}
      {data.viralMechanic && (
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <RocketLaunchIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-purple-700">{data.viralMechanic.title}</h3>
          </div>
          <p className="text-sm text-apple-text">{data.viralMechanic.description}</p>
        </div>
      )}
    </div>
  );
}
