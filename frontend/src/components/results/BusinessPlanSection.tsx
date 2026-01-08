import { BriefcaseIcon, FlagIcon, TruckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import type { BusinessPlan } from '../../types/generation';

interface BusinessPlanSectionProps {
  data: BusinessPlan;
}

export function BusinessPlanSection({ data }: BusinessPlanSectionProps) {
  if (!data) return null;

  return (
    <section id="businessPlan" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BriefcaseIcon className="w-7 h-7 text-purple-600" />
          Business Plan
        </h2>
        <p className="text-gray-600 mt-1">Vision, roadmap, and operational strategy</p>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {data.vision && (
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <FlagIcon className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Vision</h3>
            </div>
            <p className="text-purple-100">{data.vision}</p>
          </div>
        )}
        {data.mission && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <FlagIcon className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Mission</h3>
            </div>
            <p className="text-gray-700">{data.mission}</p>
          </div>
        )}
      </div>

      {/* Quarterly Roadmap */}
      {data.roadmap && data.roadmap.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quarterly Roadmap</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data.roadmap.map((quarter, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-100 z-10" />

                  <div className="bg-gray-50 rounded-xl p-4 mt-8">
                    <h4 className="font-semibold text-purple-600 mb-1">{quarter.quarter}</h4>
                    <p className="text-sm text-gray-500 mb-3">{quarter.focus}</p>
                    <ul className="space-y-2">
                      {quarter.milestones?.map((milestone, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supply Chain */}
        {data.supplyChain && data.supplyChain.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TruckIcon className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Supply Chain</h3>
            </div>
            <div className="space-y-4">
              {data.supplyChain.map((category, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {category.vendors?.map((vendor, vIdx) => (
                      <span key={vIdx} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {vendor}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{category.strategy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Operations */}
        {data.operations && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Cog6ToothIcon className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Operations</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Operating Model</h4>
                <p className="text-gray-900">{data.operations.model}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Hours of Operation</h4>
                <p className="text-gray-900">{data.operations.hours}</p>
              </div>
              {data.operations.locations && data.operations.locations.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.operations.locations.map((loc, idx) => (
                      <span key={idx} className="bg-white text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200">
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Staffing</h4>
                <p className="text-gray-900">{data.operations.staffing}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
