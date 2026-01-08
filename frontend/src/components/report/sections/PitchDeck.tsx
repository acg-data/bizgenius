import { LockClosedIcon, DocumentDuplicateIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { PitchDeckData } from '../../../types/report';

interface PitchDeckProps {
  data: PitchDeckData;
}

export default function PitchDeck({ data }: PitchDeckProps) {
  if (data.isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <LockClosedIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-apple-text mb-2">Pitch Deck Locked</h3>
        <p className="text-apple-gray text-center max-w-md mb-6">
          Upgrade to Premium to unlock your investor-ready pitch deck with professionally designed slides and speaker notes.
        </p>
        <button className="bg-apple-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Slide Overview */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-apple-text">Pitch Deck Slides</h3>
          <span className="text-xs text-apple-gray">{data.slides.length} slides</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {data.slides.map((slide, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Slide number badge */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-apple-blue flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-apple-text text-sm mb-1">{slide.title}</h4>
                  <p className="text-xs text-apple-gray line-clamp-2">{slide.content}</p>
                </div>
              </div>

              {/* Visual suggestion */}
              {slide.visuals && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-apple-gray">Visual: </span>
                  <span className="text-xs text-apple-text">{slide.visuals}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Speaker Notes Preview */}
      {data.slides.some((s) => s.speakerNotes) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-semibold text-amber-700">Speaker Notes Preview</h3>
          </div>
          <div className="space-y-4">
            {data.slides
              .filter((s) => s.speakerNotes)
              .slice(0, 3)
              .map((slide, index) => (
                <div key={index} className="bg-white/60 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-apple-text mb-2">{slide.title}</h4>
                  <p className="text-sm text-apple-gray">{slide.speakerNotes}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Key Messages */}
      {data.keyMessages.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-apple-text mb-4">Key Messages</h3>
          <div className="grid grid-cols-2 gap-3">
            {data.keyMessages.map((message, index) => (
              <div key={index} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-apple-blue/10 flex items-center justify-center flex-shrink-0">
                  <DocumentDuplicateIcon className="w-3 h-3 text-apple-blue" />
                </div>
                <p className="text-sm text-apple-text">{message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {data.callToAction && (
        <div className="bg-gradient-to-br from-apple-blue to-blue-600 rounded-2xl p-6 text-center text-white">
          <h3 className="font-semibold mb-2">The Ask</h3>
          <p className="text-lg">{data.callToAction}</p>
        </div>
      )}
    </div>
  );
}
