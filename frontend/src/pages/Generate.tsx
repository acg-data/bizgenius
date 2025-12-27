import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

const STORAGE_KEY = 'myceo_pending_idea';
const RESULT_KEY = 'myceo_analysis_result';
const ANSWERS_KEY = 'myceo_answers';

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
  
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'market', label: 'Analyzing Market Opportunity', status: 'pending' },
    { id: 'competitors', label: 'Researching Competitors', status: 'pending' },
    { id: 'icp', label: 'Defining Ideal Customer Profile', status: 'pending' },
    { id: 'business', label: 'Building Business Strategy', status: 'pending' },
    { id: 'executive', label: 'Crafting Executive Summary', status: 'pending' },
    { id: 'financial', label: 'Creating Financial Projections', status: 'pending' },
    { id: 'gtm', label: 'Designing Go-to-Market Plan', status: 'pending' },
    { id: 'team', label: 'Planning Team & Hiring', status: 'pending' },
    { id: 'risk', label: 'Assessing Risks & Mitigations', status: 'pending' },
    { id: 'action', label: 'Building 90-Day Action Plan', status: 'pending' },
    { id: 'pitch', label: 'Designing Pitch Deck', status: 'pending' },
  ]);
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!businessIdea) {
      return;
    }

    if (isGenerating || isComplete) return;

    const generateBusiness = async () => {
      setIsGenerating(true);
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
        setIsGenerating(false);
      }
    };

    generateBusiness();
  }, [businessIdea]);

  const handleRetry = () => {
    setError(null);
    setIsGenerating(false);
    setIsComplete(false);
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
  };

  const handleViewResults = () => {
    navigate('/results', { state: { result, businessIdea } });
  };

  if (!businessIdea) {
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
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-paper border-2 border-ink shadow-brutal p-8 md:p-12 text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-4">No Business Idea Found</h1>
            <p className="text-gray-600 mb-8">Please enter your business idea on the home page to get started.</p>
            <Link 
              to="/"
              className="bg-cyan text-ink font-black px-6 py-4 border-2 border-ink shadow-brutal inline-block hover:bg-cyan-hover transition-all"
            >
              GO TO HOME PAGE
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-paper border-2 border-ink shadow-brutal p-8 md:p-12">
          <div className="mb-8">
            <div className="inline-block bg-cyan text-ink text-xs font-black px-3 py-1 border-2 border-ink mb-4">
              {isComplete ? 'ANALYSIS COMPLETE' : 'GENERATING ANALYSIS'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4">
              {isComplete ? 'Your Business Operating System is Ready' : 'Building Your Business Empire...'}
            </h1>
            <div className="bg-manilla border-2 border-ink p-4 font-mono text-sm">
              <span className="font-bold text-gray-500">IDEA:</span> {businessIdea.substring(0, 200)}{businessIdea.length > 200 ? '...' : ''}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 p-4 mb-8">
              <p className="font-bold text-red-700">{error}</p>
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={handleRetry}
                  className="bg-cyan text-ink px-4 py-2 font-bold hover:bg-cyan-hover transition-colors border-2 border-ink"
                >
                  Retry
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-ink text-white px-4 py-2 font-bold hover:bg-gray-800 transition-colors border-2 border-ink"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {steps.map((step, idx) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 border-2 border-ink transition-all ${
                  step.status === 'completed' ? 'bg-cyan/20' :
                  step.status === 'in_progress' ? 'bg-white shadow-brutal' :
                  step.status === 'error' ? 'bg-red-100' :
                  'bg-gray-50 opacity-50'
                }`}
              >
                <div className={`w-8 h-8 border-2 border-ink flex items-center justify-center font-black text-sm ${
                  step.status === 'completed' ? 'bg-cyan' :
                  step.status === 'in_progress' ? 'bg-white animate-pulse' :
                  step.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-200'
                }`}>
                  {step.status === 'completed' ? '✓' : 
                   step.status === 'error' ? '✕' :
                   step.status === 'in_progress' ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   ) : String(idx + 1).padStart(2, '0')}
                </div>
                <span className={`font-bold text-sm ${step.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {!isComplete && !error && (
            <div className="bg-manilla/50 border-2 border-ink p-6 text-center">
              <div className="inline-block animate-bounce mb-2">
                <span className="text-4xl">🚀</span>
              </div>
              <p className="font-bold text-lg">Our AI is building your complete business operating system</p>
              <p className="text-gray-600 mt-2">This typically takes 2-3 minutes for comprehensive analysis</p>
            </div>
          )}

          {isComplete && result && (
            <div className="space-y-6">
              <div className="border-t-4 border-ink pt-6">
                <h2 className="text-2xl font-black mb-4">Quick Preview</h2>
                
                {result.executive_summary?.one_liner && (
                  <div className="bg-cyan/10 border-2 border-ink p-6 mb-4">
                    <h3 className="font-black text-lg mb-2">Your One-Liner</h3>
                    <p className="text-xl font-bold">"{result.executive_summary.one_liner}"</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {result.market_research?.tam?.value && (
                    <div className="bg-white border-2 border-ink p-4 text-center">
                      <div className="text-xs font-bold text-gray-500 mb-1">TOTAL MARKET</div>
                      <div className="text-2xl font-black">{result.market_research.tam.value}</div>
                    </div>
                  )}
                  {result.financial_model?.break_even?.month && (
                    <div className="bg-white border-2 border-ink p-4 text-center">
                      <div className="text-xs font-bold text-gray-500 mb-1">BREAK-EVEN</div>
                      <div className="text-2xl font-black">Month {result.financial_model.break_even.month}</div>
                    </div>
                  )}
                  {result.risk_assessment?.risk_score?.overall && (
                    <div className="bg-white border-2 border-ink p-4 text-center">
                      <div className="text-xs font-bold text-gray-500 mb-1">RISK SCORE</div>
                      <div className="text-2xl font-black">{result.risk_assessment.risk_score.overall}/10</div>
                    </div>
                  )}
                </div>

                <div className="bg-white border-2 border-ink p-6 mb-4">
                  <h3 className="font-black text-lg mb-3">What's Included</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Executive Summary
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Market Research
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Business Plan
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Financial Model
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Competitor Analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Go-to-Market Plan
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Team & Hiring Plan
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Risk Assessment
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> 90-Day Action Plan
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan font-black">✓</span> Pitch Deck
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={handleViewResults}
                  className="flex-1 bg-cyan text-ink font-black px-6 py-4 border-2 border-ink shadow-brutal text-center hover:bg-cyan-hover transition-all text-lg"
                >
                  VIEW FULL ANALYSIS
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-ink text-white font-black px-6 py-4 border-2 border-ink shadow-brutal hover:bg-gray-800 transition-all"
                >
                  START OVER
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
