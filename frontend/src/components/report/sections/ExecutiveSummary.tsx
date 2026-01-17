import { MapPinIcon, BuildingOfficeIcon, BanknotesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ExecutiveSummaryData } from '../../../types/report';

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
}

export default function ExecutiveSummary({ data }: ExecutiveSummaryProps) {
  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {data.location && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-apple-gray mb-1">
              <MapPinIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Location</span>
            </div>
            <p className="text-sm font-semibold text-apple-text">{data.location}</p>
            {data.locationDetail && (
              <p className="text-xs text-apple-gray">{data.locationDetail}</p>
            )}
          </div>
        )}

        {data.businessModel && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-apple-gray mb-1">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Business Model</span>
            </div>
            <p className="text-sm font-semibold text-apple-text">{data.businessModel}</p>
            {data.businessModelDetail && (
              <p className="text-xs text-apple-gray">{data.businessModelDetail}</p>
            )}
          </div>
        )}

        {data.fundingNeeded && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-apple-gray mb-1">
              <BanknotesIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Funding Target</span>
            </div>
            <p className="text-sm font-semibold text-apple-text">{data.fundingNeeded}</p>
            {data.fundingStage && (
              <p className="text-xs text-apple-gray">{data.fundingStage}</p>
            )}
          </div>
        )}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-blue mb-3">Mission</h3>
          <p className="text-apple-text leading-relaxed">{data.mission}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-purple-600 mb-3">Vision</h3>
          <p className="text-apple-text leading-relaxed">{data.vision}</p>
        </div>
      </div>

      {/* Problem & Solution */}
      {(data.problem || data.solution) && (
        <div className="grid grid-cols-2 gap-6">
          {data.problem && (
            <div className="border border-red-100 bg-red-50/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-red-600 mb-3">Problem</h3>
              <p className="text-apple-text leading-relaxed">{data.problem}</p>
            </div>
          )}
          {data.solution && (
            <div className="border border-green-100 bg-green-50/50 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-green-600 mb-3">Solution</h3>
              <p className="text-apple-text leading-relaxed">{data.solution}</p>
            </div>
          )}
        </div>
      )}

      {/* Highlights */}
      {data.highlights && data.highlights.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Key Highlights</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-apple-text">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
