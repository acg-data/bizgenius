import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { useAction } from '../lib/convex';
import { api } from '../convex/_generated/api';

type BusinessMode = 'idea' | 'existing';

interface QuestionOption {
  value: string;
  label: string;
}

interface Question {
  id: string;
  question: string;
  why_important: string;
  category: string;
  mece_dimension?: string;
  options?: QuestionOption[];
  allow_custom_input?: boolean;
  example_answer?: string;
  isCompanyName?: boolean;
}

interface AnswerState {
  selectedOption: string;
  customText: string;
}


// 5 essential questions - focused on what the AI actually needs
const CANNED_QUESTIONS: Question[] = [
  {
    id: 'target_market',
    question: 'Who will pay for this?',
    why_important: 'Shapes market research, personas, and go-to-market strategy.',
    category: 'target_customer',
    options: [
      { value: 'b2c', label: 'Individual consumers (B2C)' },
      { value: 'b2b_smb', label: 'Small/medium businesses' },
      { value: 'b2b_enterprise', label: 'Large enterprises' },
      { value: 'both', label: 'Both consumers and businesses' }
    ]
  },
  {
    id: 'problem',
    question: "What's the #1 pain point you solve?",
    why_important: 'Your problem statement drives the entire value proposition and pitch.',
    category: 'differentiation',
    allow_custom_input: true,
    example_answer: 'e.g., "Small restaurants lose 30% of revenue to delivery app fees"'
  },
  {
    id: 'geography',
    question: 'Where will you operate first?',
    why_important: 'Geography determines market size calculations and regulatory considerations.',
    category: 'location',
    options: [
      { value: 'local', label: 'Single city or region' },
      { value: 'national', label: 'One country (national)' },
      { value: 'global', label: 'Online / Global' }
    ]
  },
  {
    id: 'revenue_model',
    question: 'How will customers pay you?',
    why_important: 'Revenue model shapes your financial projections and business strategy.',
    category: 'business_model',
    options: [
      { value: 'subscription', label: 'Subscription (recurring)' },
      { value: 'transaction', label: 'Per-transaction or one-time' },
      { value: 'marketplace', label: 'Marketplace fees' },
      { value: 'services', label: 'Services / consulting' },
      { value: 'freemium', label: 'Free + premium / ads' }
    ]
  },
  {
    id: 'stage',
    question: 'Where are you at today?',
    why_important: "We'll tailor projections and recommendations to your current reality.",
    category: 'timeline',
    options: [
      { value: 'idea', label: 'Just an idea' },
      { value: 'building', label: 'Building product/MVP' },
      { value: 'launched', label: 'Launched with customers' },
      { value: 'growing', label: 'Growing with revenue' }
    ]
  }
];

const TOTAL_CANNED_QUESTIONS = CANNED_QUESTIONS.length;

export default function Questions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [businessIdea, setBusinessIdea] = useState('');
  const [mode, setMode] = useState<BusinessMode>('idea');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<any>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize answers for canned questions immediately - no loading spinner!
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() => {
    // Pre-initialize answers for all canned questions
    const initial: Record<string, AnswerState> = {};
    CANNED_QUESTIONS.forEach(q => {
      initial[q.id] = { selectedOption: '', customText: '' };
    });
    return initial;
  });

  // AI-generated questions (fetched in background)
  const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
  const [aiQuestionsLoading, setAiQuestionsLoading] = useState(false);
  const aiQuestionsFetchedRef = useRef(false);

  // AI insight for current question
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const lastInsightQuestionRef = useRef<string | null>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Convex actions
  const generateSmartQuestions = useAction(api.ai.generateSmartQuestions);
  const generateInsight = useAction(api.ai.generateInsight);
  const scrapeWebsite = useAction(api.ai.scrapeWebsite);
  // Branding removed - not needed for plan generation

  useEffect(() => {
    const idea = location.state?.businessIdea || localStorage.getItem('myceo_business_idea');
    const modeFromState = (location.state?.mode as BusinessMode) || 'idea';
    const websiteUrlFromState = location.state?.websiteUrl || '';
    
    if (!idea) {
      navigate('/');
      return;
    }

    setBusinessIdea(idea);
    localStorage.setItem('myceo_business_idea', idea);
    setMode(modeFromState);
    setWebsiteUrl(websiteUrlFromState);
    
    // If existing company mode, scrape the website
    if (modeFromState === 'existing' && websiteUrlFromState) {

      scrapeWebsite({ url: websiteUrlFromState })
        .then(result => {
          if (result.success) {
            setScrapedData(result.data);
          }
        })
        .catch(err => console.error('Scrape failed:', err))

    }
  }, [location.state, navigate, scrapeWebsite]);

  // Fetch AI-generated questions in background (specific to business idea)
  useEffect(() => {
    if (!businessIdea || aiQuestionsFetchedRef.current) return;
    aiQuestionsFetchedRef.current = true;

    const fetchAiQuestions = async () => {
      setAiQuestionsLoading(true);
      try {
        const result = await generateSmartQuestions({
          businessIdea,
          existingCategories: mode === 'existing' ? [] : CANNED_QUESTIONS.map(q => q.category),
          count: 5,
          mode,
          companyContext: scrapedData
        });

        const newQuestions = result.questions?.filter(
          (q: Question) => !CANNED_QUESTIONS.some(canned => canned.id === q.id)
        ) || [];

        if (newQuestions.length > 0) {
          setAiQuestions(newQuestions);
          // Add answer states for AI questions
          const newAnswerStates: Record<string, AnswerState> = {};
          newQuestions.forEach((q: Question) => {
            newAnswerStates[q.id] = { selectedOption: '', customText: '' };
          });
          setAnswers(prev => ({ ...prev, ...newAnswerStates }));
        }
      } catch (err) {
        console.error('Background AI question fetch failed (non-blocking):', err);
        // Silently fail - canned questions are sufficient
      } finally {
        setAiQuestionsLoading(false);
      }
    };

    // Start fetching immediately in background
    fetchAiQuestions();
  }, [businessIdea, generateSmartQuestions]);


  // Combine canned questions with AI questions when available
  // AI questions appear AFTER all canned questions
  const allQuestions = [...CANNED_QUESTIONS, ...aiQuestions];

  const handleOptionSelect = (questionId: string, optionValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { 
        ...prev[questionId],
        selectedOption: optionValue,
        customText: optionValue === 'other' ? prev[questionId]?.customText || '' : ''
      }
    }));
  };

  const handleCustomTextChange = (questionId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { 
        ...prev[questionId],
        customText: text
      }
    }));
  };

  const getAnswerText = (questionId: string, question: Question): string => {
    const answer = answers[questionId];
    
    if (question.isCompanyName || !question.options || question.options.length === 0) {
      return answer?.customText?.trim() || '';
    }
    
    if (!answer?.selectedOption) return '';
    
    if (answer.selectedOption === 'other' || answer.selectedOption === 'unknown') {
      return answer.customText || answer.selectedOption;
    }
    
    const option = question.options?.find(o => o.value === answer.selectedOption);
    return option?.label || answer.selectedOption;
  };

  const currentQuestion = allQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];

  // Fetch AI insight when question changes (debounced)
  useEffect(() => {
    if (!currentQuestion || currentQuestion.id === lastInsightQuestionRef.current) return;
    lastInsightQuestionRef.current = currentQuestion.id;
    setAiInsight(null);

    // Only fetch insights after a few questions answered
    if (currentIndex < 2) return;

    const fetchInsight = async () => {
      setInsightLoading(true);
      try {
        const result = await generateInsight({
          businessIdea,
          currentQuestion: currentQuestion.question,
          partialAnswers: Object.fromEntries(
            Object.entries(answers)
              .filter(([_, v]) => v.selectedOption || v.customText)
              .map(([k, v]) => [k, v.customText || v.selectedOption])
          )
        });
        setAiInsight(result.insight);
      } catch (err) {
        // Silently fail
      } finally {
        setInsightLoading(false);
      }
    };

    // Debounce to avoid too many API calls
    const timeout = setTimeout(fetchInsight, 500);
    return () => clearTimeout(timeout);
  }, [currentQuestion?.id, currentIndex, businessIdea, answers, generateInsight]);

  const hasValidAnswer = currentQuestion && (
    (!currentQuestion.options || currentQuestion.options.length === 0)
      ? currentAnswer?.customText?.trim()
      : currentAnswer?.selectedOption &&
        (currentAnswer.selectedOption !== 'other' || currentAnswer.customText?.trim())
  );

  // Total questions = 5 canned + AI questions (0-2, loading in background)
  const totalDisplayQuestions = aiQuestionsLoading
    ? TOTAL_CANNED_QUESTIONS + 2 // Show placeholder count while loading
    : allQuestions.length;

  // Last question: at end of combined list and AI fetch is done
  const isLastQuestion = currentIndex >= allQuestions.length - 1 && !aiQuestionsLoading;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && hasValidAnswer) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    if (!hasValidAnswer) return;

    if (isLastQuestion) {
      handleSubmit();
      return;
    }

    setIsTransitioning(true);
    setTimeout(() => {
      if (currentIndex < allQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleSubmit = () => {
    const answersWithContext: Record<string, { question: string; answer: string }> = {};

    allQuestions.forEach((q: Question) => {
      const answerText = getAnswerText(q.id, q);
      if (answerText.trim()) {
        answersWithContext[q.id] = {
          question: q.question,
          answer: answerText.trim()
        };
      }
    });

    localStorage.setItem('myceo_answers', JSON.stringify(answersWithContext));

    navigate('/generate', {
      state: {
        businessIdea,
        mode,
        websiteUrl: mode === 'existing' ? websiteUrl : undefined,
        scrapedData: mode === 'existing' ? scrapedData : undefined,
        answers: answersWithContext
      }
    });
  };

  const handleSkip = () => {
    navigate('/generate', {
      state: {
        businessIdea,
        mode,
        websiteUrl: mode === 'existing' ? websiteUrl : undefined,
        scrapedData: mode === 'existing' ? scrapedData : undefined,
        answers: {}
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      target_customer: '👥',
      pricing: '💰',
      competition: '🎯',
      location: '📍',
      local_needs: '🏠',
      business_model: '📊',
      go_to_market: '🚀',
      team: '👤',
      funding: '💵',
      investment: '💎',
      timeline: '📅',
      expertise: '🎓',
      differentiation: '⚡'
    };
    return icons[category] || '❓';
  };

  const getMeceDimensionLabel = (dimension?: string) => {
    const labels: Record<string, string> = {
      financial: 'Financial',
      geographic: 'Geographic', 
      human: 'Human',
      market: 'Market'
    };
    return dimension ? labels[dimension] || dimension : '';
  };

  // No loadingFirst spinner needed - canned questions appear instantly!

  if (!currentQuestion) {
    return (
      <div className="bg-apple-bg min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-apple-text border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-apple-bg min-h-screen font-sans antialiased">
      <nav className="fixed top-0 w-full z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <CommandLineIcon className="w-5 h-5 text-apple-text" />
            <span className="text-lg tracking-tight">myCEO</span>
          </Link>
          <button
            onClick={handleSkip}
            className="text-sm text-apple-gray hover:text-apple-text transition-colors"
          >
            Skip to generate
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-apple-text">
              Question {currentIndex + 1} of {totalDisplayQuestions}
            </span>
            {aiQuestionsLoading && (
              <span className="text-xs text-apple-gray flex items-center gap-2">
                <span className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
                Loading personalized questions...
              </span>
            )}
          </div>
          
          <div className="flex gap-1.5">
            {Array.from({ length: totalDisplayQuestions }).map((_, idx) => {
              const question = allQuestions[idx];
              const answer = question ? answers[question.id] : null;
              const isAnswered = question?.allow_custom_input && !question?.options
                ? answer?.customText?.trim()
                : answer?.selectedOption &&
                  (answer.selectedOption !== 'other' || answer.customText?.trim());
              const isCurrent = idx === currentIndex;
              const isPlaceholder = idx >= allQuestions.length; // AI questions not loaded yet

              return (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isAnswered
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-500'
                      : isPlaceholder
                      ? 'bg-gray-100 animate-pulse'
                      : 'bg-gray-200'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className={`transition-all duration-150 ${isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{getCategoryIcon(currentQuestion.category)}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 uppercase tracking-wide">
                  {currentQuestion.category.replace('_', ' ')}
                </span>
                {currentQuestion.mece_dimension && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                    {getMeceDimensionLabel(currentQuestion.mece_dimension)}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-apple-text mb-3 leading-tight">
                {currentQuestion.question}
              </h2>
              <p className="text-apple-gray mb-4">{currentQuestion.why_important}</p>

              {/* AI Insight */}
              {(aiInsight || insightLoading) && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <LightBulbIcon className={`w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 ${insightLoading ? 'animate-pulse' : ''}`} />
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">AI Insight</span>
                      {insightLoading ? (
                        <p className="text-sm text-amber-800 mt-1 animate-pulse">Thinking...</p>
                      ) : (
                        <p className="text-sm text-amber-800 mt-1">{aiInsight}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected = currentAnswer?.selectedOption === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4 ${
                          isSelected
                            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg scale-[1.02]'
                            : 'bg-gray-50 hover:bg-gray-100 text-apple-text'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-white bg-white'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-violet-600" />
                          )}
                        </div>
                        <span className="font-medium text-lg">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                  
                  {currentAnswer?.selectedOption === 'other' && (
                    <div className="mt-4 animate-fade-in">
                      <input
                        type="text"
                        value={currentAnswer?.customText || ''}
                        onChange={(e) => handleCustomTextChange(currentQuestion.id, e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Please specify..."
                        className="w-full p-4 bg-white border-2 border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-apple-text font-medium focus:outline-none transition-all rounded-xl text-lg"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={currentAnswer?.customText || ''}
                  onChange={(e) => handleCustomTextChange(currentQuestion.id, e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={currentQuestion.example_answer || 'Enter your answer...'}
                  className="w-full h-32 p-4 bg-gray-50 border-2 border-transparent focus:border-violet-500 focus:bg-white text-apple-text font-medium resize-none focus:outline-none transition-all rounded-xl text-lg"
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${
                currentIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-apple-gray hover:text-apple-text hover:bg-white'
              }`}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={!hasValidAnswer || (currentIndex >= allQuestions.length - 1 && aiQuestionsLoading)}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${
                hasValidAnswer && !(currentIndex >= allQuestions.length - 1 && aiQuestionsLoading)
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLastQuestion ? (
                <>
                  Generate Plan
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              ) : currentIndex >= allQuestions.length - 1 && aiQuestionsLoading ? (
                <>
                  Loading...
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-apple-gray">
            Your answers help us create a more personalized business plan
          </p>
        </div>
      </main>
    </div>
  );
}
