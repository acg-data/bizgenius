import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

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

interface BrandingData {
  companyName: string;
  logos: (string | null)[];
  palettes: string[][];
  isLoading: boolean;
}

const COMPANY_NAME_QUESTION: Question = {
  id: 'company_name',
  question: 'What would you like to name your company?',
  why_important: 'Your company name is the first impression customers will have. We\'ll generate logo options and color palettes while you continue.',
  category: 'branding',
  isCompanyName: true,
  allow_custom_input: true,
  example_answer: 'Enter your company name or leave blank for AI suggestions...'
};

const TOTAL_QUESTIONS = 6;

export default function Questions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [businessIdea, setBusinessIdea] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loadingFirst, setLoadingFirst] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allQuestionsLoaded, setAllQuestionsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [branding, setBranding] = useState<BrandingData>({
    companyName: '',
    logos: [],
    palettes: [],
    isLoading: false
  });
  const brandingGeneratedRef = useRef(false);

  useEffect(() => {
    const idea = location.state?.businessIdea || localStorage.getItem('myceo_business_idea');
    
    if (!idea) {
      navigate('/');
      return;
    }

    setBusinessIdea(idea);
    localStorage.setItem('myceo_business_idea', idea);
  }, [location.state, navigate]);

  useEffect(() => {
    if (!businessIdea || questions.length > 0) return;

    const fetchFirstQuestion = async () => {
      setLoadingFirst(true);
      try {
        const response = await api.post('/generate/questions', { 
          idea: businessIdea 
        });
        
        const aiQuestions = response.data.questions?.slice(0, 1) || [];
        
        if (aiQuestions.length > 0) {
          const allQuestions = [aiQuestions[0], COMPANY_NAME_QUESTION];
          setQuestions(allQuestions);
          
          const initialAnswers: Record<string, AnswerState> = {};
          allQuestions.forEach((q: Question) => {
            initialAnswers[q.id] = { selectedOption: '', customText: '' };
          });
          setAnswers(initialAnswers);
        } else {
          setQuestions([COMPANY_NAME_QUESTION]);
          setAnswers({ [COMPANY_NAME_QUESTION.id]: { selectedOption: '', customText: '' } });
        }
      } catch (err) {
        console.error('Failed to fetch first question:', err);
        setQuestions([COMPANY_NAME_QUESTION]);
        setAnswers({ [COMPANY_NAME_QUESTION.id]: { selectedOption: '', customText: '' } });
      } finally {
        setLoadingFirst(false);
      }
    };

    fetchFirstQuestion();
  }, [businessIdea, questions.length]);

  const generateBrandingInBackground = useCallback(async (companyName: string) => {
    if (brandingGeneratedRef.current || !companyName.trim()) return;
    brandingGeneratedRef.current = true;
    
    setBranding(prev => ({ ...prev, companyName, isLoading: true }));
    
    try {
      const [logosResponse, palettesResponse] = await Promise.all([
        api.post('/branding/logo-variations', {
          company_name: companyName,
          business_idea: businessIdea,
          count: 4
        }).catch(() => ({ data: { logos: [] } })),
        api.post('/branding/color-palettes', {
          business_idea: businessIdea,
          count: 3
        }).catch(() => ({ data: { palettes: [] } }))
      ]);
      
      setBranding({
        companyName,
        logos: logosResponse.data.logos || [],
        palettes: palettesResponse.data.palettes || [],
        isLoading: false
      });
      
      localStorage.setItem('myceo_branding', JSON.stringify({
        companyName,
        logos: logosResponse.data.logos || [],
        palettes: palettesResponse.data.palettes || [],
        selectedLogo: logosResponse.data.logos?.[0] || null,
        selectedPalette: palettesResponse.data.palettes?.[0] || []
      }));
    } catch (err) {
      console.error('Background branding generation failed:', err);
      setBranding(prev => ({ ...prev, isLoading: false }));
    }
  }, [businessIdea]);

  const fetchMoreQuestions = useCallback(async () => {
    if (loadingMore || !businessIdea) return;
    
    const nonCompanyQuestions = questions.filter(q => !q.isCompanyName);
    const targetQuestions = TOTAL_QUESTIONS - 1;
    
    if (nonCompanyQuestions.length >= targetQuestions) {
      setAllQuestionsLoaded(true);
      return;
    }
    
    setLoadingMore(true);
    
    try {
      const currentAnswers: Record<string, { question: string; answer: string }> = {};
      questions.forEach(q => {
        if (q.isCompanyName) return;
        const answer = answers[q.id];
        if (answer?.selectedOption || answer?.customText) {
          const answerText = answer.selectedOption === 'other' 
            ? answer.customText 
            : (q.options?.find(o => o.value === answer.selectedOption)?.label || answer.selectedOption || answer.customText);
          if (answerText) {
            currentAnswers[q.id] = { question: q.question, answer: answerText };
          }
        }
      });

      const coveredCategories = questions
        .filter(q => !q.isCompanyName)
        .map(q => q.category);

      const response = await api.post('/generate/questions', { 
        idea: businessIdea,
        previous_answers: currentAnswers,
        exclude_categories: coveredCategories
      });
      
      const newQuestions = response.data.questions?.filter(
        (q: Question) => !questions.some(existing => existing.id === q.id)
      ) || [];
      
      if (newQuestions.length > 0) {
        setQuestions(prev => [...prev, ...newQuestions]);
        const newAnswerStates: Record<string, AnswerState> = {};
        newQuestions.forEach((q: Question) => {
          newAnswerStates[q.id] = { selectedOption: '', customText: '' };
        });
        setAnswers(prev => ({ ...prev, ...newAnswerStates }));
        
        const totalNonCompany = nonCompanyQuestions.length + newQuestions.length;
        if (totalNonCompany >= targetQuestions) {
          setAllQuestionsLoaded(true);
        }
      } else {
        setAllQuestionsLoaded(true);
      }
    } catch (err) {
      console.error('Failed to fetch more questions:', err);
      setAllQuestionsLoaded(true);
    } finally {
      setLoadingMore(false);
    }
  }, [businessIdea, questions, answers, loadingMore]);

  useEffect(() => {
    const nonCompanyQuestions = questions.filter(q => !q.isCompanyName);
    const hasEnoughQuestions = nonCompanyQuestions.length >= TOTAL_QUESTIONS - 1;
    
    if (!hasEnoughQuestions && !loadingMore && !allQuestionsLoaded && businessIdea) {
      const companyAnswer = answers[COMPANY_NAME_QUESTION.id];
      if (companyAnswer?.customText?.trim() || currentIndex > 0) {
        fetchMoreQuestions();
      }
    }
  }, [currentIndex, answers, allQuestionsLoaded, fetchMoreQuestions, questions, loadingMore, businessIdea]);

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

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  
  const hasValidAnswer = currentQuestion && (
    currentQuestion.isCompanyName
      ? currentAnswer?.customText?.trim()
      : (!currentQuestion.options || currentQuestion.options.length === 0)
        ? currentAnswer?.customText?.trim()
        : currentAnswer?.selectedOption && 
          (currentAnswer.selectedOption !== 'other' || currentAnswer.customText?.trim())
  );
  
  const totalDisplayQuestions = Math.max(questions.length, TOTAL_QUESTIONS);
  const isLastQuestion = currentIndex >= questions.length - 1 && allQuestionsLoaded;

  const handleNext = () => {
    if (!hasValidAnswer) return;
    
    if (currentQuestion?.isCompanyName) {
      const companyName = currentAnswer?.customText?.trim() || '';
      if (companyName && !brandingGeneratedRef.current) {
        generateBrandingInBackground(companyName);
      }
    }
    
    if (isLastQuestion) {
      handleSubmit();
      return;
    }
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
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
    let companyName = '';
    
    questions.forEach((q: Question) => {
      const answerText = getAnswerText(q.id, q);
      if (q.isCompanyName) {
        companyName = answerText;
      } else if (answerText.trim()) {
        answersWithContext[q.id] = {
          question: q.question,
          answer: answerText.trim()
        };
      }
    });
    
    localStorage.setItem('myceo_answers', JSON.stringify(answersWithContext));
    
    const storedBranding = localStorage.getItem('myceo_branding');
    let brandingData = storedBranding ? JSON.parse(storedBranding) : null;
    
    if (!brandingData && companyName) {
      brandingData = {
        companyName,
        logos: branding.logos,
        palettes: branding.palettes,
        selectedLogo: branding.logos[0] || null,
        selectedPalette: branding.palettes[0] || []
      };
      localStorage.setItem('myceo_branding', JSON.stringify(brandingData));
    }
    
    navigate('/generate', { 
      state: { 
        businessIdea, 
        answers: answersWithContext,
        branding: brandingData
      } 
    });
  };

  const handleSkip = () => {
    navigate('/generate', { 
      state: { 
        businessIdea,
        answers: {},
        branding: null
      } 
    });
  };

  const getCategoryIcon = (category: string, isCompanyName?: boolean) => {
    if (isCompanyName) return '✨';
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

  if (loadingFirst) {
    return (
      <div className="bg-apple-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-apple-gray">Crafting your first question...</p>
        </div>
      </div>
    );
  }

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
            {(loadingMore || branding.isLoading) && (
              <span className="text-xs text-apple-gray flex items-center gap-2">
                <span className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />
                {branding.isLoading ? 'Generating branding...' : 'Loading more...'}
              </span>
            )}
          </div>
          
          <div className="flex gap-1.5">
            {Array.from({ length: totalDisplayQuestions }).map((_, idx) => {
              const question = questions[idx];
              const answer = question ? answers[question.id] : null;
              const isAnswered = question?.isCompanyName
                ? answer?.customText?.trim()
                : answer?.selectedOption && 
                  (answer.selectedOption !== 'other' || answer.customText?.trim());
              const isCurrent = idx === currentIndex;
              
              return (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isAnswered
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-violet-500 to-indigo-500'
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
                <span className="text-2xl">{getCategoryIcon(currentQuestion.category, currentQuestion.isCompanyName)}</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 uppercase tracking-wide">
                  {currentQuestion.isCompanyName ? 'Branding' : currentQuestion.category.replace('_', ' ')}
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
              <p className="text-apple-gray mb-8">{currentQuestion.why_important}</p>
              
              {currentQuestion.isCompanyName ? (
                <div className="space-y-4">
                  <div className="relative">
                    <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                    <input
                      type="text"
                      value={currentAnswer?.customText || ''}
                      onChange={(e) => handleCustomTextChange(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.example_answer}
                      className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-apple-text font-medium focus:outline-none transition-all rounded-xl text-lg"
                      autoFocus
                    />
                  </div>
                  {branding.isLoading && (
                    <div className="flex items-center gap-2 text-sm text-violet-600 bg-violet-50 rounded-lg p-3">
                      <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      Generating your logo and color palette in the background...
                    </div>
                  )}
                </div>
              ) : currentQuestion.options && currentQuestion.options.length > 0 ? (
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
              disabled={!hasValidAnswer || (currentIndex >= questions.length - 1 && loadingMore)}
              className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${
                hasValidAnswer && !(currentIndex >= questions.length - 1 && loadingMore)
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLastQuestion ? (
                <>
                  Generate Plan
                  <ArrowRightIcon className="w-5 h-5" />
                </>
              ) : currentIndex >= questions.length - 1 && loadingMore ? (
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
