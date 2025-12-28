import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
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

interface QuestionsData {
  analysis: string;
  questions: Question[];
}

interface AnswerState {
  selectedOption: string;
  customText: string;
}

export default function Questions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [businessIdea, setBusinessIdea] = useState('');
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idea = location.state?.businessIdea || localStorage.getItem('myceo_business_idea');
    
    if (!idea) {
      navigate('/');
      return;
    }

    setBusinessIdea(idea);
    localStorage.setItem('myceo_business_idea', idea);
    
    fetchQuestions(idea);
  }, [location.state, navigate]);

  const fetchQuestions = async (idea: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/generate/questions', { idea });
      setQuestionsData(response.data);
      
      const initialAnswers: Record<string, AnswerState> = {};
      response.data.questions?.forEach((q: Question) => {
        initialAnswers[q.id] = { selectedOption: '', customText: '' };
      });
      setAnswers(initialAnswers);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
    if (!answer?.selectedOption) return '';
    
    if (answer.selectedOption === 'other') {
      return answer.customText || '';
    }
    
    const option = question.options?.find(o => o.value === answer.selectedOption);
    return option?.label || answer.selectedOption;
  };

  const handleSubmit = () => {
    const answersWithContext: Record<string, { question: string; answer: string }> = {};
    questionsData?.questions?.forEach((q: Question) => {
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
      funding: '💵'
    };
    return icons[category] || '❓';
  };

  const answeredCount = Object.entries(answers).filter(([qId, a]) => {
    const question = questionsData?.questions?.find(q => q.id === qId);
    if (!question) return false;
    return a.selectedOption && (a.selectedOption !== 'other' || a.customText.trim());
  }).length;
  const totalQuestions = questionsData?.questions?.length || 0;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="bg-apple-bg min-h-screen font-sans antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <CommandLineIcon className="w-5 h-5 text-apple-text" />
            <span className="text-lg tracking-tight">myCEO</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-apple-gray">
              Step 1 of 2: Discovery Questions
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {loading ? (
          <div className="text-center py-24 animate-fade-in">
            <div className="inline-block mb-6">
              <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-semibold text-apple-text mb-2">Analyzing Your Idea</h2>
            <p className="text-apple-gray">Our AI is identifying key questions to strengthen your business plan.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-2xl text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-apple-gray mb-6">{error}</p>
            <button 
              onClick={() => fetchQuestions(businessIdea)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-apple-text mb-4">
                Let's refine your idea
              </h1>
              {questionsData?.analysis && (
                <div className="bg-white rounded-xl p-4 shadow-card border border-gray-100">
                  <p className="text-apple-gray">{questionsData.analysis}</p>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-apple-gray">
                  {answeredCount} of {totalQuestions} questions answered
                </span>
                <span className="text-sm font-medium text-apple-gray">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6 mb-8">
              {questionsData?.questions?.map((q, index) => (
                <div 
                  key={q.id} 
                  className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-card-hover"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-apple-bg text-apple-text flex items-center justify-center font-semibold rounded-xl flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-apple-gray">
                            {getCategoryIcon(q.category)} {q.category.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-apple-text">{q.question}</h3>
                        <p className="text-sm text-apple-gray mt-1">{q.why_important}</p>
                      </div>
                    </div>
                    
                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        {q.options.map((option) => {
                          const isSelected = answers[q.id]?.selectedOption === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => handleOptionSelect(q.id, option.value)}
                              className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-primary-500/10 border-2 border-primary-500'
                                  : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <CheckIcon className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className={`font-medium ${isSelected ? 'text-apple-text' : 'text-apple-gray'}`}>
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                        
                        {answers[q.id]?.selectedOption === 'other' && (
                          <div className="mt-3 ml-8">
                            <input
                              type="text"
                              value={answers[q.id]?.customText || ''}
                              onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                              placeholder="Please specify..."
                              className="w-full p-3 bg-white border-2 border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-apple-text font-medium focus:outline-none transition-all rounded-xl"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <textarea
                        value={answers[q.id]?.customText || ''}
                        onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                        placeholder={q.example_answer || 'Enter your answer...'}
                        className="w-full h-24 p-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white text-apple-text font-medium resize-none focus:outline-none transition-all rounded-xl mt-4"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-center sm:text-left">
                  <p className="font-medium text-apple-text">Answering helps create a more tailored plan.</p>
                  <p className="text-apple-gray">But you can skip if you prefer.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSkip}
                    className="px-6 py-3 rounded-full font-medium text-apple-gray hover:bg-gray-100 transition-colors"
                  >
                    Skip Questions
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="bg-apple-text text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
                  >
                    Generate Plan
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
