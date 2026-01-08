import { useState } from 'react';
import { PresentationChartBarIcon, ChevronDownIcon, ChevronUpIcon, SparklesIcon } from '@heroicons/react/24/outline';
import type { PitchDeck } from '../../types/generation';

interface PitchDeckSectionProps {
  data: PitchDeck;
}

export function PitchDeckSection({ data }: PitchDeckSectionProps) {
  const [expandedSlide, setExpandedSlide] = useState<number | null>(null);

  if (!data) return null;

  const slides = data.slides || [];

  const slideColors = [
    'from-red-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-amber-500 to-orange-500',
    'from-yellow-500 to-amber-500',
    'from-lime-500 to-green-500',
    'from-green-500 to-emerald-500',
    'from-teal-500 to-cyan-500',
    'from-cyan-500 to-blue-500',
    'from-blue-500 to-indigo-500',
    'from-indigo-500 to-purple-500',
  ];

  return (
    <section id="pitchDeck" className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PresentationChartBarIcon className="w-7 h-7 text-pink-600" />
          Pitch Deck
        </h2>
        <p className="text-gray-600 mt-1">Investor-ready 10-slide presentation</p>
      </div>

      {/* The Ask Card */}
      {data.askAmount && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">The Ask</h3>
              <p className="text-4xl font-bold">{data.askAmount}</p>
            </div>
            {data.useOfFunds && data.useOfFunds.length > 0 && (
              <div>
                <p className="text-pink-100 text-sm mb-2">Use of Funds</p>
                <div className="flex flex-wrap gap-2">
                  {data.useOfFunds.map((use, idx) => (
                    <span key={idx} className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Narrative Arc */}
      {data.narrativeArc && (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 p-6 mb-6">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-6 h-6 text-pink-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Narrative Arc</h3>
              <p className="text-gray-700">{data.narrativeArc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Slide Thumbnails */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {slides.map((slide, idx) => (
          <button
            key={idx}
            onClick={() => setExpandedSlide(expandedSlide === idx ? null : idx)}
            className={`aspect-[4/3] rounded-xl p-4 text-white text-left transition-all hover:scale-105 bg-gradient-to-br ${slideColors[idx % slideColors.length]} ${
              expandedSlide === idx ? 'ring-4 ring-pink-300 scale-105' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <span className="text-white/70 text-xs font-medium">Slide {slide.number}</span>
              <span className="font-semibold text-sm mt-auto line-clamp-2">{slide.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Slides */}
      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all ${
              expandedSlide === idx ? 'block' : 'hidden'
            }`}
          >
            <div
              className={`bg-gradient-to-r ${slideColors[idx % slideColors.length]} p-4 text-white`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white/70 text-sm">Slide {slide.number}</span>
                  <h3 className="text-xl font-bold">{slide.title}</h3>
                </div>
                <button
                  onClick={() => setExpandedSlide(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ChevronUpIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Content</h4>
                  <p className="text-gray-900">{slide.content}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Visual Suggestion</h4>
                  <p className="text-gray-700 italic">{slide.visualSuggestion}</p>
                </div>
              </div>
              {slide.speakerNotes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Speaker Notes</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{slide.speakerNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* All Slides List (when none expanded) */}
      {expandedSlide === null && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Slides</h3>
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setExpandedSlide(idx)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${slideColors[idx % slideColors.length]} flex items-center justify-center text-white font-bold`}>
                  {slide.number}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{slide.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-1">{slide.content}</p>
                </div>
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
