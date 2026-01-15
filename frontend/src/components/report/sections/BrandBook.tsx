import { SwatchIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

interface BrandBookData {
  mission?: string;
  vision?: string;
  coreValues?: string[];
  colorPalette?: {
    primary: { hex: string; name: string };
    secondary: { hex: string; name: string };
    accent: { hex: string; name: string };
    light: { hex: string; name: string };
    dark: { hex: string; name: string };
  };
  typography?: {
    heading: string;
    body: string;
    accent: string;
  };
  brandVoice?: string[];
}

interface BrandBookProps {
  data?: BrandBookData;
}

export default function BrandBook({ data }: BrandBookProps) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Mission & Vision */}
      <div className="grid grid-cols-2 gap-4">
        {data.mission && (
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white">
            <p className="text-teal-100 text-xs font-medium mb-2">Mission</p>
            <p className="text-lg font-medium">{data.mission}</p>
          </div>
        )}
        {data.vision && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <p className="text-blue-100 text-xs font-medium mb-2">Vision</p>
            <p className="text-lg font-medium">{data.vision}</p>
          </div>
        )}
      </div>

      {/* Core Values */}
      {data.coreValues && data.coreValues.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Core Values</h3>
          <div className="flex flex-wrap gap-2">
            {data.coreValues.map((value, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 rounded-full font-medium text-sm"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Color Palette */}
      {data.colorPalette && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <SwatchIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-apple-text">Color Palette</h3>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(data.colorPalette).map(([key, color]) => (
              <div key={key} className="text-center">
                <div
                  className="w-full h-16 rounded-xl shadow-inner mb-2 border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="font-medium text-apple-text text-xs capitalize">{key}</p>
                <p className="text-gray-500 text-xs">{color.name}</p>
                <p className="text-gray-400 text-xs font-mono">{color.hex}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typography & Brand Voice */}
      <div className="grid grid-cols-2 gap-4">
        {data.typography && (
          <div className="bg-gray-50 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-apple-text mb-4">Typography</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Heading</span>
                <span className="text-sm font-medium text-apple-text">{data.typography.heading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Body</span>
                <span className="text-sm font-medium text-apple-text">{data.typography.body}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Accent</span>
                <span className="text-sm font-medium text-apple-text">{data.typography.accent}</span>
              </div>
            </div>
          </div>
        )}

        {data.brandVoice && data.brandVoice.length > 0 && (
          <div className="bg-violet-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-violet-500" />
              <h3 className="text-sm font-semibold text-apple-text">Brand Voice</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.brandVoice.map((voice, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-violet-100 text-violet-800 rounded-full text-sm"
                >
                  {voice}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
