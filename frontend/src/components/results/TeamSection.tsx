import { UserGroupIcon, UserPlusIcon, BuildingOffice2Icon, AcademicCapIcon } from '@heroicons/react/24/outline';
import type { TeamOperations } from '../../types/generation';

interface TeamSectionProps {
  data: TeamOperations;
}

export function TeamSection({ data }: TeamSectionProps) {
  if (!data) return null;

  const priorityColors = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    important: 'bg-amber-100 text-amber-700 border-amber-200',
    'nice-to-have': 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <section id="team" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserGroupIcon className="w-7 h-7 text-violet-600" />
          Team & Operations
        </h2>
        <p className="text-gray-600 mt-1">Organizational structure and hiring plan</p>
      </div>

      {/* Founders */}
      {data.founders && data.founders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Founders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.founders.map((founder, idx) => (
              <div key={idx} className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                    {idx === 0 ? '👤' : '👥'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-1">{founder.role}</h4>
                    <p className="text-violet-100 text-sm mb-4">{founder.background}</p>

                    <div className="space-y-3">
                      <div>
                        <p className="text-violet-200 text-xs font-medium mb-2">Key Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {founder.skills?.map((skill, sIdx) => (
                            <span key={sIdx} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-violet-200 text-xs font-medium mb-2">Responsibilities</p>
                        <ul className="space-y-1">
                          {founder.responsibilities?.map((resp, rIdx) => (
                            <li key={rIdx} className="text-violet-100 text-sm flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-300 mt-1.5 flex-shrink-0" />
                              {resp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hiring Roadmap */}
      {data.hires && data.hires.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlusIcon className="w-6 h-6 text-violet-600" />
            <h3 className="text-lg font-semibold text-gray-900">Hiring Roadmap</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Timeline</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Salary Range</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Priority</th>
                </tr>
              </thead>
              <tbody>
                {data.hires.map((hire, idx) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{hire.role}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{hire.timeline}</td>
                    <td className="py-3 px-4 text-gray-600">{hire.salary}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${priorityColors[hire.priority] || priorityColors['nice-to-have']}`}>
                        {hire.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partners */}
        {data.partners && data.partners.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <BuildingOffice2Icon className="w-6 h-6 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Operational Partners</h3>
            </div>
            <div className="space-y-3">
              {data.partners.map((partner, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{partner.type}</h4>
                    <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full">
                      {partner.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{partner.service}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advisors */}
        {data.advisors && data.advisors.length > 0 && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AcademicCapIcon className="w-6 h-6 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Advisory Board</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Recommended expertise areas:</p>
            <div className="flex flex-wrap gap-3">
              {data.advisors.map((advisor, idx) => (
                <div key={idx} className="bg-white rounded-xl px-4 py-3 border border-violet-200 shadow-sm">
                  <span className="text-violet-700 font-medium">{advisor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
