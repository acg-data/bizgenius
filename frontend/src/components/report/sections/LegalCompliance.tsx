import { ShieldCheckIcon, ExclamationTriangleIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

interface LegalComplianceData {
  riskMatrix?: Array<{
    category: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    description: string;
    mitigation: string;
  }>;
  pestel?: Array<{
    category: string;
    factors: string[];
  }>;
  complianceStatus?: Array<{
    name: string;
    status: "Compliant" | "In Progress" | "Not Started";
    progress: number;
  }>;
  keyRegulations?: Array<{
    domain: string;
    requirements: string[];
  }>;
}

interface LegalComplianceProps {
  data?: LegalComplianceData;
}

export default function LegalCompliance({ data }: LegalComplianceProps) {
  if (!data) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'text-green-600 bg-green-100';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100';
      case 'Not Started': return 'text-gray-500 bg-gray-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Risk Matrix */}
      {data.riskMatrix && data.riskMatrix.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-apple-text">Risk Assessment Matrix</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {data.riskMatrix.map((risk, idx) => (
              <div key={idx} className={`rounded-xl border p-4 ${getSeverityColor(risk.severity)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{risk.category}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs mb-2 opacity-90">{risk.description}</p>
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
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">PESTEL Analysis</h3>
          <div className="grid grid-cols-3 gap-3">
            {data.pestel.map((factor, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4">
                <h4 className="font-semibold text-apple-text text-sm mb-2">{factor.category}</h4>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {factor.factors?.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Status & Key Regulations */}
      <div className="grid grid-cols-2 gap-4">
        {data.complianceStatus && data.complianceStatus.length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DocumentCheckIcon className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-semibold text-apple-text">Compliance Status</h3>
            </div>
            <div className="space-y-3">
              {data.complianceStatus.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        item.progress === 100 ? 'bg-green-500' : item.progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.keyRegulations && data.keyRegulations.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
              <h3 className="text-sm font-semibold text-apple-text">Key Regulations</h3>
            </div>
            <div className="space-y-3">
              {data.keyRegulations.map((reg, idx) => (
                <div key={idx}>
                  <h4 className="font-medium text-apple-text text-xs mb-1">{reg.domain}</h4>
                  <ul className="text-xs text-gray-500 space-y-0.5">
                    {reg.requirements?.map((req, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-emerald-500">✓</span>{req}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
