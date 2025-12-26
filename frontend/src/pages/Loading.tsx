import { SparklesIcon } from '@heroicons/react/24/outline';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500">
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto animate-pulse">
            <SparklesIcon className="w-12 h-12 text-white animate-spin" />
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-2xl border-4 border-white/30 mx-auto animate-ping" />
        </div>
        <p className="text-white text-xl font-semibold mt-6">Loading BizGenius...</p>
        <p className="text-white/70 text-sm mt-2">Preparing your workspace</p>
      </div>
    </div>
  );
}
