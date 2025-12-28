import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
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
  options?: QuestionOption[];
  allow_custom_input?: boolean;
  example_answer?: string;
}

interface AnswerState {
  selectedOption: string;
  customText: string;
}

const FIRST_QUESTION: Question = {
  id: 'location',
  question: 'Where will your business primarily operate?',
  why_important: 'Location helps us analyze your local market size, competition, and regulations.',
  category: 'location',
  options: [
    { value: 'local_us', label: 'Local business in the US (city/region)' },
    { value: 'national_us', label: 'National (across the US)' },
    { value: 'international', label: 'International / Global' },
    { value: 'online_only', label: 'Online only (no physical location)' },
    { value: 'other', label: 'Other (please specify)' }
  ],
  allow_custom_input: true
};

const TOTAL_QUESTIONS = 5;

export default function Questions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [businessIdea, setBusinessIdea] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([FIRST_QUESTION]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({
    [FIRST_QUESTION.id]: { selectedOption: '', customText: '' }
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [allQuestionsLoaded, setAllQuestionsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const idea = location.state?.businessIdea || localStorage.getItem('myceo_business_idea');
    
    if (!idea) {
      navigate('/');
      return;
    }

    setBusinessIdea(idea);
    localStorage.setItem('myceo_business_idea', idea);
  }, [location.state, navigate]);

  const fetchMoreQuestions = useCallback(async () => {
    if (loadingMore || allQuestionsLoaded || !businessIdea) return;
    
    setLoadingMore(true);
    
    try {
      const currentAnswers: Record<string, { question: string; answer: string }> = {};
      questions.forEach(q => {
        const answer = answers[q.id];
        if (answer?.selectedOption) {
          const answerText = answer.selectedOption === 'other' 
            ? answer.customText 
            : (q.options?.find(o => o.value === answer.selectedOption)?.label || answer.selectedOption);
          if (answerText) {
            currentAnswers[q.id] = { question: q.question, answer: answerText };
          }
        }
      });

      const response = await api.post('/generate/questions', { 
        idea: businessIdea,
        previous_answers: currentAnswers,
        exclude_categories: ['location']
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
      }
      
      setAllQuestionsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch more questions:', err);
      setAllQuestionsLoaded(true);
    } finally {
      setLoadingMore(false);
    }
  }, [businessIdea, questions, answers, loadingMore, allQuestionsLoaded]);

  useEffect(() => {
    if (currentIndex === 0 && answers[FIRST_QUESTION.id]?.selectedOption && !allQuestionsLoaded) {
      fetchMoreQuestions();
    }
  }, [currentIndex, answers, allQuestionsLoaded, fetchMoreQuestions]);

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
    
    if (!question.options || question.options.length === 0) {
      return answer?.customText?.trim() || '';
    }
    
    if (!answer?.selectedOption) return '';
    
    if (answer.selectedOption === 'other') {
      return answer.customText || '';
    }
    
    const option = question.options?.find(o => o.value === answer.selectedOption);
    return option?.label || answer.selectedOption;
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  
  const hasValidAnswer = currentQuestion && (
    (!currentQuestion.options || currentQuestion.options.length === 0)
      ? currentAnswer?.customText?.trim()
      : currentAnswer?.selectedOption && 
        (currentAnswer.selectedOption !== 'other' || currentAnswer.customText?.trim())
  );
  
  const totalDisplayQuestions = Math.max(questions.length, TOTAL_QUESTIONS);
  const isLastQuestion = currentIndex >= questions.length - 1 && allQuestionsLoaded;

  const handleNext = () => {
    if (!hasValidAnswer) return;
    
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
    questions.forEach((q: Question) => {
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
        answers: answersWithContext
      } 
    });
  };

  const handleSkip = () => {
    navigate('/generate', { 
      state: { 
        businessIdea,
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
      business_model: '📊',
      go_to_market: '🚀',
      team: '👤',
      funding: '💵',
      timeline: '📅',
      investment: '💎'
    };
    return icons[category] || '❓';
  };

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
            {loadingMore && (
              <span className="text-xs text-apple-gray flex items-center gap-2">
                <span className="w-3 h-3 border border-apple-gray border-t-transparent rounded-full animate-spin" />
                Loading more...
              </span>
            )}
          </div>
          
          <div className="flex gap-1.5">
            {Array.from({ length: totalDisplayQuestions }).map((_, idx) => {
              const question = questions[idx];
              const answer = question ? answers[question.id] : null;
              const isAnswered = answer?.selectedOption && 
                (answer.selectedOption !== 'other' || answer.customText?.trim());
              const isCurrent = idx === currentIndex;
              
              return (
                <div
                  key={idx}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    isAnswered
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-apple-text'
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
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-apple-gray uppercase tracking-wide">
                  {currentQuestion.category.replace('_', ' ')}
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-apple-text mb-3 leading-tight">
                {currentQuestion.question}
              </h2>
              <p className="text-apple-gray mb-8">{currentQuestion.why_important}</p>
              
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
                            ? 'bg-apple-text text-white shadow-lg scale-[1.02]'
                            : 'bg-gray-50 hover:bg-gray-100 text-apple-text'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-white bg-white'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckIcon className="w-4 h-4 text-apple-text" />
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
                        placeholder="Please specify your location or situation..."
                        className="w-full p-4 bg-white border-2 border-apple-text focus:ring-4 focus:ring-apple-text/10 text-apple-text font-medium focus:outline-none transition-all rounded-xl text-lg"
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
                  className="w-full h-32 p-4 bg-gray-50 border-2 border-transparent focus:border-apple-text focus:bg-white text-apple-text font-medium resize-none focus:outline-none transition-all rounded-xl text-lg"
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
                  ? 'bg-apple-text text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02]'
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
