import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

const STORAGE_KEY = 'myceo_pending_idea';
const RESULT_KEY = 'myceo_analysis_result';
const ANSWERS_KEY = 'myceo_answers';
const SESSION_KEY = 'myceo_session_id';
const BRANDING_KEY = 'myceo_branding';

export default function Generate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const businessIdea = useMemo(() => {
    if (location.state?.businessIdea) {
      localStorage.setItem(STORAGE_KEY, location.state.businessIdea);
      return location.state.businessIdea;
    }
    const fromParams = searchParams.get('idea');
    if (fromParams) {
      localStorage.setItem(STORAGE_KEY, fromParams);
      return fromParams;
    }
    return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('myceo_business_idea') || '';
  }, [location.state, searchParams]);

  const answers = useMemo(() => {
    if (location.state?.answers) {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify(location.state.answers));
      return location.state.answers;
    }
    const stored = localStorage.getItem(ANSWERS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  }, [location.state]);

  const branding = useMemo(() => {
    if (location.state?.branding) {
      localStorage.setItem(BRANDING_KEY, JSON.stringify(location.state.branding));
      return location.state.branding;
    }
    const stored = localStorage.getItem(BRANDING_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }, [location.state]);
  
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'market', label: 'Market Opportunity', status: 'pending' },
    { id: 'competitors', label: 'Competitor Research', status: 'pending' },
    { id: 'icp', label: 'Ideal Customer Profile', status: 'pending' },
    { id: 'business', label: 'Business Strategy', status: 'pending' },
    { id: 'executive', label: 'Executive Summary', status: 'pending' },
    { id: 'financial', label: 'Financial Projections', status: 'pending' },
    { id: 'gtm', label: 'Go-to-Market Plan', status: 'pending' },
    { id: 'team', label: 'Team & Hiring', status: 'pending' },
    { id: 'risk', label: 'Risk Assessment', status: 'pending' },
    { id: 'action', label: '90-Day Action Plan', status: 'pending' },
    { id: 'pitch', label: 'Pitch Deck', status: 'pending' },
  ]);
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  const pollSessionStatus = async (sid: string) => {
    try {
      const response = await axios.get(`/api/v1/sessions/status/${sid}`);
      const { status, current_step, result: sessionResult, error_message } = response.data;
      
      if (status === 'completed' && sessionResult) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setResult(sessionResult);
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        setIsComplete(true);
        localStorage.setItem(RESULT_KEY, JSON.stringify(sessionResult));
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_KEY);
      } else if (status === 'failed') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setError(error_message || 'Generation failed. Please try again.');
        setSteps(prev => prev.map(step => ({
          ...step,
          status: step.status === 'in_progress' ? 'error' : step.status
        })));
      } else if (status === 'generating') {
        const stepIndex = steps.findIndex(s => s.id === current_step);
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx < stepIndex ? 'completed' : idx === stepIndex ? 'in_progress' : 'pending'
        })));
      }
    } catch (err) {
      console.error('Failed to poll session status:', err);
    }
  };

  const startDirectGeneration = async () => {
    const stepIds = steps.map(s => s.id);
    let currentStep = 0;
    
    const stepInterval = setInterval(() => {
      if (currentStep < stepIds.length) {
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx < currentStep ? 'completed' : idx === currentStep ? 'in_progress' : 'pending'
        })));
        currentStep++;
      }
    }, 2000);

    try {
      const response = await axios.post('/api/v1/generate/', {
        idea: businessIdea,
        answers: Object.keys(answers).length > 0 ? answers : null
      });
      
      clearInterval(stepInterval);
      setResult(response.data);
      setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
      setIsComplete(true);
      localStorage.setItem(RESULT_KEY, JSON.stringify(response.data));
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.response?.data?.detail || 'Failed to generate business analysis. Please try again.');
      setSteps(prev => prev.map(step => ({
        ...step,
        status: step.status === 'in_progress' || step.status === 'completed' ? 'error' : 'pending'
      })));
    }
  };

  useEffect(() => {
    if (!businessIdea || isComplete) return;

    const existingSessionId = localStorage.getItem(SESSION_KEY);
    
    if (existingSessionId) {
      setSessionId(existingSessionId);
      pollingRef.current = setInterval(() => pollSessionStatus(existingSessionId), 2000);
      pollSessionStatus(existingSessionId);
    } else if (!sessionId) {
      startDirectGeneration();
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [businessIdea]);

  const handleRetry = () => {
    setError(null);
    setSessionId(null);
    setIsComplete(false);
    localStorage.removeItem(SESSION_KEY);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    
    setTimeout(() => {
      startDirectGeneration();
    }, 100);
  };

  const handleViewResults = () => {
    navigate('/results', { state: { result, businessIdea, branding } });
  };

  if (!businessIdea) {
    return (
      <div className="bg-apple-bg min-h-screen font-sans antialiased">
        <nav className="fixed top-0 w-full z-50 glass-panel">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <CommandLineIcon className="w-5 h-5 text-apple-text" />
              <span className="text-lg tracking-tight">myCEO</span>
            </Link>
          </div>
        </nav>
        
        <div className="max-w-2xl mx-auto px-6 pt-32 pb-16">
          <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-12 text-center">
            <h1 className="text-2xl font-semibold text-apple-text mb-4">No Business Idea Found</h1>
            <p className="text-apple-gray mb-8">Please enter your business idea on the home page to get started.</p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-apple-text text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all"
            >
              Go to Home
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
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
          <span className="text-sm font-medium text-apple-gray">
            Step 2 of 2: Generating Analysis
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isComplete ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
              }`}>
                {isComplete ? (
                  <>
                    <CheckIcon className="w-3 h-3" />
                    Analysis Complete
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    Generating Analysis
                  </>
                )}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-apple-text mb-4">
              {isComplete ? 'Your Business Operating System is Ready' : 'Building Your Business Empire'}
            </h1>
            <div className="bg-apple-bg rounded-xl p-4">
              <p className="text-sm text-apple-gray line-clamp-2">
                {businessIdea.substring(0, 200)}{businessIdea.length > 200 ? '...' : ''}
              </p>
            </div>
          </div>

          <div className="px-8 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-apple-text">
                {completedSteps} of {steps.length} sections complete
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

          {error && (
            <div className="m-8 bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="font-medium text-red-700 mb-4">{error}</p>
              <div className="flex gap-3">
                <button 
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-4 py-2 rounded-lg font-medium text-apple-gray hover:bg-gray-100 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  step.status === 'completed' ? 'bg-green-50' :
                  step.status === 'in_progress' ? 'bg-primary-50' :
                  step.status === 'error' ? 'bg-red-50' :
                  'bg-gray-50 opacity-60'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  step.status === 'completed' ? 'bg-green-500' :
                  step.status === 'in_progress' ? 'bg-primary-500' :
                  step.status === 'error' ? 'bg-red-500' :
                  'bg-gray-300'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckIcon className="w-3 h-3 text-white" />
                  ) : step.status === 'error' ? (
                    <XMarkIcon className="w-3 h-3 text-white" />
                  ) : step.status === 'in_progress' ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'in_progress' ? 'text-primary-700' :
                  step.status === 'error' ? 'text-red-700' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {!isComplete && !error && (
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 text-center">
                <div className="inline-block mb-3">
                  <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <p className="font-medium text-apple-text">Our AI is building your complete business operating system</p>
                <p className="text-sm text-apple-gray mt-1">This typically takes 2-3 minutes for comprehensive analysis</p>
              </div>
            </div>
          )}

          {isComplete && result && (
            <div className="p-8 border-t border-gray-100">
              <h2 className="text-xl font-semibold text-apple-text mb-6">Quick Preview</h2>
              
              {result.executive_summary?.one_liner && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="text-sm font-medium text-apple-gray mb-2">Your One-Liner</h3>
                  <p className="text-lg font-semibold text-apple-text">"{result.executive_summary.one_liner}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {result.market_research?.tam?.value && (
                  <div className="bg-apple-bg rounded-xl p-4 text-center">
                    <div className="text-xs font-medium text-apple-gray mb-1">TOTAL MARKET</div>
                    <div className="text-xl font-semibold text-apple-text">{result.market_research.tam.value}</div>
                  </div>
                )}
                {result.financial_model?.break_even?.month && (
                  <div className="bg-apple-bg rounded-xl p-4 text-center">
                    <div className="text-xs font-medium text-apple-gray mb-1">BREAK-EVEN</div>
                    <div className="text-xl font-semibold text-apple-text">Month {result.financial_model.break_even.month}</div>
                  </div>
                )}
                {result.risk_assessment?.risk_score?.overall && (
                  <div className="bg-apple-bg rounded-xl p-4 text-center">
                    <div className="text-xs font-medium text-apple-gray mb-1">RISK SCORE</div>
                    <div className="text-xl font-semibold text-apple-text">{result.risk_assessment.risk_score.overall}/10</div>
                  </div>
                )}
              </div>

              <div className="bg-apple-bg rounded-xl p-6 mb-8">
                <h3 className="font-medium text-apple-text mb-4">What's Included</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  {['Executive Summary', 'Market Research', 'Business Plan', 'Financial Model', 'Competitor Analysis', 'Go-to-Market', 'Team Plan', 'Risk Assessment', '90-Day Plan', 'Pitch Deck'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-apple-gray">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleViewResults}
                  className="flex-1 bg-apple-text text-white font-medium px-6 py-4 rounded-xl hover:bg-gray-800 transition-all text-center shadow-lg"
                >
                  View Full Analysis
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="px-6 py-4 rounded-xl font-medium text-apple-gray hover:bg-gray-100 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
