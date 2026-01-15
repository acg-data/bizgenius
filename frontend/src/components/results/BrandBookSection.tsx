import { SwatchIcon, EyeIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import type { BrandBook } from '../../types/generation';

interface BrandBookSectionProps {
  data: BrandBook;
}

export function BrandBookSection({ data }: BrandBookSectionProps) {
  if (!data) return null;

  return (
    <section id="brandBook" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SwatchIcon className="w-7 h-7 text-teal-600" />
          Brand Book
        </h2>
        <p className="text-gray-600 mt-1">Brand guidelines including mission, colors, and voice</p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {data.mission && (
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-teal-100 text-sm font-medium mb-2">Mission</p>
            <p className="text-xl font-medium">{data.mission}</p>
          </div>
        )}
        {data.vision && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-blue-100 text-sm font-medium mb-2">Vision</p>
            <p className="text-xl font-medium">{data.vision}</p>
          </div>
        )}
      </div>

      {/* Core Values */}
      {data.coreValues && data.coreValues.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Values</h3>
          <div className="flex flex-wrap gap-3">
            {data.coreValues.map((value, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 rounded-full font-medium"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette */}
      {data.colorPalette && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(data.colorPalette).map(([key, color]: [string, { hex: string; name: string }]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-20 rounded-xl shadow-inner mb-2 border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="font-medium text-gray-900 text-sm capitalize">{key}</p>
                <p className="text-gray-500 text-xs">{color.name}</p>
                <p className="text-gray-400 text-xs font-mono">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Typography */}
        {data.typography && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <EyeIcon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Heading</span>
                    <span className="font-medium text-gray-900">{data.typography.heading}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Body</span>
                    <span className="font-medium text-gray-900">{data.typography.body}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Accent</span>
                    <span className="font-medium text-gray-900">{data.typography.accent}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Brand Voice */}
        {data.brandVoice && data.brandVoice.length > 0 && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-6">
            <div className="flex items-start gap-3">
              <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Brand Voice</h3>
                <div className="flex flex-wrap gap-2">
                  {data.brandVoice.map((voice, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm font-medium"
                    >
                      {voice}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
