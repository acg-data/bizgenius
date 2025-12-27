import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      target_customer: 'bg-blue-100 text-blue-800',
      pricing: 'bg-green-100 text-green-800',
      competition: 'bg-red-100 text-red-800',
      location: 'bg-purple-100 text-purple-800',
      business_model: 'bg-orange-100 text-orange-800',
      go_to_market: 'bg-cyan-100 text-cyan-800',
      team: 'bg-yellow-100 text-yellow-800',
      funding: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const answeredCount = Object.entries(answers).filter(([qId, a]) => {
    const question = questionsData?.questions?.find(q => q.id === qId);
    if (!question) return false;
    return a.selectedOption && (a.selectedOption !== 'other' || a.customText.trim());
  }).length;
  const totalQuestions = questionsData?.questions?.length || 0;

  return (
    <div className="bg-[#F2F0E9] text-ink font-sans antialiased min-h-screen">
      <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b-2 border-ink px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-manilla border-2 border-ink flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
              <span className="font-black text-xl">M</span>
            </div>
            <span className="font-black text-xl tracking-tighter">myCEO</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500">
              Step 1 of 2: Discovery Questions
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-24">
            <div className="inline-block mb-6">
              <div className="w-16 h-16 border-4 border-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-black mb-2">Analyzing Your Idea...</h2>
            <p className="text-gray-600">Our AI is identifying the key questions to make your business plan even stronger.</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-500 p-8 rounded-xl text-center">
            <h2 className="text-xl font-black text-red-600 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchQuestions(businessIdea)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black mb-4">
                Let's refine your idea 💡
              </h1>
              {questionsData?.analysis && (
                <div className="bg-cyan/10 border-2 border-cyan p-4 rounded-xl">
                  <p className="font-medium text-gray-700">{questionsData.analysis}</p>
                </div>
              )}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-bold text-gray-500">
                {answeredCount} of {totalQuestions} questions answered
              </div>
              <div className="w-48 h-2 bg-gray-200 border border-ink rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan transition-all duration-300"
                  style={{ width: `${(answeredCount / Math.max(totalQuestions, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-6 mb-8">
              {questionsData?.questions?.map((q, index) => (
                <div 
                  key={q.id} 
                  className="bg-white border-2 border-ink shadow-brutal p-6 rounded-xl"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-ink text-white flex items-center justify-center font-black rounded-lg flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCategoryColor(q.category)}`}>
                          {getCategoryIcon(q.category)} {q.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{q.question}</h3>
                      <p className="text-sm text-gray-500 mt-1">{q.why_important}</p>
                    </div>
                  </div>
                  
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleOptionSelect(q.id, option.value)}
                          className={`w-full text-left p-4 border-2 transition-all rounded-lg flex items-center gap-3 ${
                            answers[q.id]?.selectedOption === option.value
                              ? 'border-cyan bg-cyan/10 shadow-brutal-sm'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            answers[q.id]?.selectedOption === option.value
                              ? 'border-cyan bg-cyan'
                              : 'border-gray-300'
                          }`}>
                            {answers[q.id]?.selectedOption === option.value && (
                              <div className="w-2 h-2 bg-ink rounded-full" />
                            )}
                          </div>
                          <span className="font-medium">{option.label}</span>
                        </button>
                      ))}
                      
                      {answers[q.id]?.selectedOption === 'other' && (
                        <div className="mt-3 ml-8">
                          <input
                            type="text"
                            value={answers[q.id]?.customText || ''}
                            onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                            placeholder="Please specify..."
                            className="w-full p-3 bg-white border-2 border-cyan focus:border-ink text-ink font-medium focus:outline-none transition-colors rounded-lg"
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
                      className="w-full h-24 p-4 bg-gray-50 border-2 border-gray-200 focus:border-cyan text-ink font-medium resize-none focus:outline-none transition-colors rounded-lg"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-manilla border-2 border-ink p-6 rounded-xl shadow-brutal">
              <div className="text-sm">
                <p className="font-bold">Answering helps create a more tailored plan.</p>
                <p className="text-gray-600">But you can skip if you prefer.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleSkip}
                  className="px-6 py-3 border-2 border-ink bg-white font-bold hover:bg-gray-100 transition-colors"
                >
                  Skip Questions
                </button>
                <button 
                  onClick={handleSubmit}
                  className="btn-cyan flex items-center gap-2"
                >
                  Generate Plan
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
