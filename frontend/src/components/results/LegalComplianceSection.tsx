import { ShieldCheckIcon, ExclamationTriangleIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import type { LegalCompliance } from '../../types/generation';

interface LegalComplianceSectionProps {
  data: LegalCompliance;
}

export function LegalComplianceSection({ data }: LegalComplianceSectionProps) {
  if (!data) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'Not Started':
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <section id="legalCompliance" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="w-7 h-7 text-emerald-600" />
          Legal & Compliance
        </h2>
        <p className="text-gray-600 mt-1">Risk assessment, PESTEL analysis, and regulatory requirements</p>
      </div>

      {/* Risk Matrix */}
      {data.riskMatrix && data.riskMatrix.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            Risk Assessment Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.riskMatrix.map((risk, idx) => (
              <div key={idx} className={`rounded-xl border-2 p-4 ${getSeverityColor(risk.severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{risk.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                    {risk.severity}
                  </span>
                </div>
                <p className="text-sm mb-2 opacity-90">{risk.description}</p>
                <p className="text-xs opacity-75">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTEL Analysis */}
      {data.pestel && data.pestel.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PESTEL Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pestel.map((factor, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{factor.category}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {factor.factors?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance Status */}
        {data.complianceStatus && data.complianceStatus.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <DocumentCheckIcon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                <div className="space-y-4">
                  {data.complianceStatus.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.progress === 100 ? 'bg-green-500' : item.progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Regulations */}
        {data.keyRegulations && data.keyRegulations.length > 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Regulations</h3>
            <div className="space-y-4">
              {data.keyRegulations.map((reg, idx) => (
                <div key={idx}>
                  <h4 className="font-medium text-gray-800 mb-2">{reg.domain}</h4>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    {reg.requirements?.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
