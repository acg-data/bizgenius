import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation } from '../lib/convex';
import { api } from '../convex/_generated/api';

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

const STEP_ORDER = [
  'market',
  'customers',
  'competitors',
  'brandArchetype',
  'brandBook',
  'businessPlan',
  'gapAnalysis',
  'goToMarket',
  'financial',
  'legalCompliance',
  'pitchDeck',
  'team'
];


export default function Generate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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

  const mode = useMemo(() => {
    return location.state?.mode || 'idea';
  }, [location.state]);

  const websiteUrl = useMemo(() => {
    return location.state?.websiteUrl || '';
  }, [location.state]);

  const scrapedData = useMemo(() => {
    return location.state?.scrapedData || null;
  }, [location.state]);
  
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  
  const existingSessionId = localStorage.getItem(SESSION_KEY);

  // Convex useQuery returns data directly (or undefined while loading)
  // Use "skip" as second arg to skip the query when no sessionId
  const session = useQuery(
    api.sessions.getSessionStatus,
    existingSessionId ? { sessionId: existingSessionId } : "skip"
  );
  const isSessionLoading = existingSessionId ? session === undefined : false;
  
  const createSession = useMutation(api.sessions.createSession);
  const retrySession = useMutation(api.sessions.retrySession);
  
  const steps: GenerationStep[] = useMemo(() => {
    if (!session?.currentStep) {
      return STEP_ORDER.map((id, idx) => ({
        id,
        label: getStepLabel(id),
        status: 'pending'
      }));
    }
    
    const currentStepIndex = STEP_ORDER.indexOf(session.currentStep);
    
    return STEP_ORDER.map((id, idx) => ({
      id,
      label: getStepLabel(id),
      status: idx < currentStepIndex ? 'completed' :
              idx === currentStepIndex ? (session.status === 'failed' ? 'error' : 'in_progress') :
              'pending'
    }));
  }, [session?.currentStep, session?.status]);
  
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;
  
  const isGenerating = !isComplete && session?.status === 'generating';
  const isResuming = !!existingSessionId && isGenerating;
  
  const startSessionGeneration = async () => {
    if (!businessIdea) return;
    
    try {
      const result = await createSession({
        idea: businessIdea,
        mode: mode as "idea" | "existing",
        websiteUrl: websiteUrl || undefined,
        scrapedData: scrapedData || undefined,
        answers: Object.keys(answers).length > 0 ? answers : undefined
      });
      
      setSessionId(result.sessionId);
      localStorage.setItem(SESSION_KEY, result.sessionId);
      setError(null);
    } catch (err: any) {
      console.error('Failed to start generation:', err);
      setError('Failed to start generation. Please try again.');
    }
  };
  
  const handleRetry = async () => {
    setError(null);
    setIsComplete(false);
    
    if (existingSessionId) {
      try {
        await retrySession({ sessionId: existingSessionId });
        setError(null);
      } catch (err: any) {
        console.error('Failed to retry:', err);
        localStorage.removeItem(SESSION_KEY);
        setSessionId(null);
        startSessionGeneration();
      }
    } else {
      startSessionGeneration();
    }
  };
  
  const handleViewResults = () => {
    navigate('/results', { state: { result: session?.result, businessIdea, branding } });
  };
  
  const setSessionId = (id: string | null) => {
    if (id) { localStorage.setItem(SESSION_KEY, id); } else { localStorage.removeItem(SESSION_KEY); }
    window.location.reload();
  };
  
  useEffect(() => {
    if (session?.status === 'completed' && !isComplete) {
      setIsComplete(true);
      localStorage.setItem(RESULT_KEY, JSON.stringify(session.result));
      localStorage.removeItem(STORAGE_KEY);
    }
    
    if (session?.status === 'failed') {
      setError(session.errorMessage || 'Generation failed. Please try again.');
    }
  }, [session?.status, session?.errorMessage, session?.result]);

  // Start a new session if we don't have one and we have a business idea
  useEffect(() => {
    if (businessIdea && !existingSessionId && !isSessionLoading && !hasStartedSession) {
      setHasStartedSession(true);
      startSessionGeneration();
    }
  }, [businessIdea, existingSessionId, isSessionLoading, hasStartedSession]);

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
            <p className="text-apple-gray mb-8">Please enter your business idea on home page to get started.</p>
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
  
  if (isSessionLoading) {
    return <LoadingSpinner />;
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
                {isResuming ? (
                  <>
                    <p className="font-medium text-apple-text">Welcome back! Reconnecting to your generation...</p>
                    <p className="text-sm text-apple-gray mt-1">Your analysis is still running in the background</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-apple-text">Our AI is building your complete business operating system</p>
                    <p className="text-sm text-apple-gray mt-1">Feel free to leave - we'll save your progress. This typically takes 2-3 minutes.</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {isComplete && session?.result && (
            <div className="p-8 border-t border-gray-100">
              <h2 className="text-xl font-semibold text-apple-text mb-6">Quick Preview</h2>
              
              {session.result.executive_summary?.one_liner && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="text-sm font-medium text-apple-gray mb-2">Your One-Liner</h3>
                  <p className="text-lg font-semibold text-apple-text">"{session.result.executive_summary.one_liner}"</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {session.result.market_research?.tam?.value && (
                  <div className="bg-apple-bg rounded-xl p-4 text-center">
                    <div className="text-xs font-medium text-apple-gray mb-1">TOTAL MARKET</div>
                    <div className="text-xl font-semibold text-apple-text">{session.result.market_research.tam.value}</div>
                  </div>
                )}
                {session.result.financial_model?.break_even?.month && (
                  <div className="bg-apple-bg rounded-xl p-4 text-center">
                    <div className="text-xs font-medium text-apple-gray mb-1">BREAK-EVEN</div>
                    <div className="text-xl font-semibold text-apple-text">Month {session.result.financial_model.break_even.month}</div>
                  </div>
                )}
                {session.result.risk_assessment?.risk_score?.overall && (
                  <div className="bg-apple-bg rounded-xl p-4 text-center">
                    <div className="text-xs font-medium text-apple-gray mb-1">RISK SCORE</div>
                    <div className="text-xl font-semibold text-apple-text">{session.result.risk_assessment.risk_score.overall}/10</div>
                  </div>
                )}
              </div>
              
              <div className="bg-apple-bg rounded-xl p-6 mb-8">
                <h3 className="font-medium text-apple-text mb-4">What's Included</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {['Market Research', 'Customer Profiles', 'Competitor Analysis', 'Brand Archetype', 'Brand Book', 'Business Strategy', 'Gap Analysis', 'Go-to-Market', 'Financial Model', 'Legal & Compliance', 'Pitch Deck', 'Team & Ops'].map((item) => (
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

function getStepLabel(stepId: string): string {
  const labels: Record<string, string> = {
    'market': 'Market Research',
    'customers': 'Customer Profiles',
    'competitors': 'Competitor Analysis',
    'brandArchetype': 'Brand Archetype',
    'brandBook': 'Brand Book',
    'businessPlan': 'Business Strategy',
    'gapAnalysis': 'Gap Analysis',
    'goToMarket': 'Go-to-Market',
    'financial': 'Financial Model',
    'legalCompliance': 'Legal & Compliance',
    'pitchDeck': 'Pitch Deck',
    'team': 'Team & Ops'
  };
  return labels[stepId] || stepId;
}


function LoadingSpinner() {
  return (
    <div className="bg-apple-bg min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
