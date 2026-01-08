import {
  ChartBarIcon,
  BanknotesIcon,
  CogIcon,
  ScaleIcon,
  ComputerDesktopIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { RiskAssessmentData, Risk } from '../../../types/report';

interface RiskAssessmentProps {
  data: RiskAssessmentData;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ChartBarIcon,
  BanknotesIcon,
  CogIcon,
  ScaleIcon,
  ComputerDesktopIcon,
  ShieldExclamationIcon,
};

const severityConfig = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    indicator: 'bg-red-500',
  },
  medium: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    indicator: 'bg-orange-500',
  },
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    indicator: 'bg-green-500',
  },
};

function RiskCard({ risk }: { risk: Risk }) {
  const Icon = iconMap[risk.icon] || ShieldExclamationIcon;
  const severity = severityConfig[risk.severity];

  return (
    <div className={`${severity.bg} border ${severity.border} rounded-2xl p-5`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
            <Icon className={`w-5 h-5 ${risk.iconColor}`} />
          </div>
          <h4 className="font-semibold text-apple-text">{risk.category}</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${severity.badge}`}>
          {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)} Risk
        </span>
      </div>

      {/* Risk Items */}
      <div className="mb-4">
        <h5 className="text-xs font-medium text-apple-gray mb-2">Risk Factors</h5>
        <ul className="space-y-2">
          {risk.items.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-apple-text">
              <ExclamationTriangleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${risk.iconColor}`} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Mitigation */}
      <div className="bg-white/60 rounded-xl p-3">
        <h5 className="text-xs font-medium text-apple-gray mb-1">Mitigation Strategy</h5>
        <p className="text-sm text-apple-text">{risk.mitigation}</p>
      </div>
    </div>
  );
}

export default function RiskAssessment({ data }: RiskAssessmentProps) {
  const highRisks = data.risks.filter((r) => r.severity === 'high').length;
  const mediumRisks = data.risks.filter((r) => r.severity === 'medium').length;
  const lowRisks = data.risks.filter((r) => r.severity === 'low').length;

  return (
    <div className="space-y-8">
      {/* Risk Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold">{highRisks}</span>
          </div>
          <p className="text-sm font-medium text-red-700">High Risk</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold">{mediumRisks}</span>
          </div>
          <p className="text-sm font-medium text-orange-700">Medium Risk</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-2">
            <span className="text-white font-bold">{lowRisks}</span>
          </div>
          <p className="text-sm font-medium text-green-700">Low Risk</p>
        </div>
      </div>

      {/* Risk Cards */}
      <div className="grid grid-cols-2 gap-6">
        {data.risks.map((risk, index) => (
          <RiskCard key={index} risk={risk} />
        ))}
      </div>

      {/* Risk Framework */}
      {data.framework && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Risk Management Framework</h3>
          <div className="grid grid-cols-3 gap-4">
            {data.framework.monitoring && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-apple-gray">Monitoring</span>
                <p className="text-sm font-medium text-apple-text mt-1">{data.framework.monitoring}</p>
              </div>
            )}
            {data.framework.responseTime && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-apple-gray">Response Time</span>
                <p className="text-sm font-medium text-apple-text mt-1">{data.framework.responseTime}</p>
              </div>
            )}
            {data.framework.insurance && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-apple-gray">Insurance</span>
                <p className="text-sm font-medium text-apple-text mt-1">{data.framework.insurance}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
