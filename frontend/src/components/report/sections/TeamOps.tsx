import { UserIcon, StarIcon, BriefcaseIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { TeamOpsData } from '../../../types/report';

interface TeamOpsProps {
  data: TeamOpsData;
}

export default function TeamOps({ data }: TeamOpsProps) {
  return (
    <div className="space-y-8">
      {/* Team Members */}
      {data.members.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-apple-text mb-4">Leadership Team</h3>
          <div className="grid grid-cols-2 gap-4">
            {data.members.map((member, index) => (
              <div
                key={index}
                className={`rounded-2xl p-5 ${
                  member.isOwner
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
                    : 'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      member.isOwner ? 'bg-amber-500' : 'bg-gray-400'
                    }`}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-7 h-7 text-white" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-apple-text">{member.name}</h4>
                      {member.isOwner && <StarIcon className="w-4 h-4 text-amber-500" />}
                    </div>
                    <p className="text-sm text-apple-gray">{member.role}</p>
                    {member.background && (
                      <p className="text-xs text-apple-gray mt-2 line-clamp-2">{member.background}</p>
                    )}
                    {member.salary && (
                      <p className="text-xs text-apple-blue mt-2 font-medium">{member.salary}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Positions */}
      {data.openPositions && data.openPositions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlusIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-700">Open Positions</h3>
          </div>
          <div className="space-y-3">
            {data.openPositions.map((position, index) => (
              <div key={index} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-apple-text">{position.title}</h4>
                    <p className="text-xs text-apple-gray">{position.timing}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-apple-blue">{position.pay}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partners */}
      {data.partners.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BuildingOffice2Icon className="w-5 h-5 text-apple-gray" />
            <h3 className="text-sm font-semibold text-apple-text">Key Partners</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.partners.map((partner, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white rounded-full text-sm text-apple-text border border-gray-200"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Org Chart visualization placeholder */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-apple-text mb-4">Organization Structure</h3>
        <div className="flex flex-col items-center">
          {/* Owner/CEO */}
          {data.members.find((m) => m.isOwner) && (
            <div className="bg-amber-100 rounded-xl px-6 py-3 text-center mb-4">
              <p className="font-semibold text-amber-800">
                {data.members.find((m) => m.isOwner)?.name}
              </p>
              <p className="text-xs text-amber-600">
                {data.members.find((m) => m.isOwner)?.role}
              </p>
            </div>
          )}

          {/* Connector line */}
          {data.members.filter((m) => !m.isOwner).length > 0 && (
            <div className="w-0.5 h-8 bg-gray-300" />
          )}

          {/* Other team members */}
          <div className="flex gap-4 flex-wrap justify-center">
            {data.members
              .filter((m) => !m.isOwner)
              .map((member, index) => (
                <div key={index} className="bg-white rounded-xl px-4 py-2 text-center border border-gray-200">
                  <p className="font-medium text-apple-text text-sm">{member.name}</p>
                  <p className="text-xs text-apple-gray">{member.role}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
