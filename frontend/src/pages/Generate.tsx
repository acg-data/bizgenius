import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

const STORAGE_KEY = 'myceo_pending_idea';

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
    return localStorage.getItem(STORAGE_KEY) || '';
  }, [location.state, searchParams]);
  
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'market', label: 'Analyzing market opportunity', status: 'pending' },
    { id: 'business', label: 'Creating business plan', status: 'pending' },
    { id: 'financial', label: 'Building financial projections', status: 'pending' },
    { id: 'competitors', label: 'Researching competitors', status: 'pending' },
    { id: 'pitch', label: 'Designing pitch deck', status: 'pending' },
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
      const stepIds = ['market', 'business', 'financial', 'competitors', 'pitch'];
      
      for (let i = 0; i < stepIds.length; i++) {
        setSteps(prev => prev.map((step, idx) => ({
          ...step,
          status: idx < i ? 'completed' : idx === i ? 'in_progress' : 'pending'
        })));
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      try {
        const response = await axios.post('/api/v1/generate/', {
          idea: businessIdea
        });
        
        setResult(response.data);
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        setIsComplete(true);
        localStorage.removeItem(STORAGE_KEY);
      } catch (err: any) {
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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-paper border-2 border-ink shadow-brutal p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black mb-4">
              {isComplete ? 'Your Business is Ready!' : 'Building Your Empire...'}
            </h1>
            <div className="bg-manilla border-2 border-ink p-4 font-mono text-sm">
              <span className="font-bold text-gray-500">IDEA:</span> {businessIdea.substring(0, 150)}{businessIdea.length > 150 ? '...' : ''}
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

          <div className="space-y-4 mb-8">
            {steps.map((step, idx) => (
              <div 
                key={step.id}
                className={`flex items-center gap-4 p-4 border-2 border-ink transition-all ${
                  step.status === 'completed' ? 'bg-cyan/20' :
                  step.status === 'in_progress' ? 'bg-white shadow-brutal' :
                  step.status === 'error' ? 'bg-red-100' :
                  'bg-gray-50 opacity-50'
                }`}
              >
                <div className={`w-10 h-10 border-2 border-ink flex items-center justify-center font-black ${
                  step.status === 'completed' ? 'bg-cyan' :
                  step.status === 'in_progress' ? 'bg-white animate-pulse' :
                  step.status === 'error' ? 'bg-red-500 text-white' :
                  'bg-gray-200'
                }`}>
                  {step.status === 'completed' ? '✓' : 
                   step.status === 'error' ? '✕' :
                   step.status === 'in_progress' ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                   ) : String(idx + 1).padStart(2, '0')}
                </div>
                <span className={`font-bold ${step.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {isComplete && result && (
            <div className="space-y-6">
              <div className="border-t-4 border-ink pt-6">
                <h2 className="text-2xl font-black mb-4">Summary</h2>
                
                {result.business_plan?.executive_summary && (
                  <div className="bg-white border-2 border-ink p-6 mb-4">
                    <h3 className="font-black text-lg mb-2">Executive Summary</h3>
                    <p className="text-gray-700">{result.business_plan.executive_summary}</p>
                  </div>
                )}

                {result.market_research?.market_overview && (
                  <div className="bg-white border-2 border-ink p-6 mb-4">
                    <h3 className="font-black text-lg mb-2">Market Overview</h3>
                    <p className="text-gray-700">{result.market_research.market_overview}</p>
                  </div>
                )}

                {result.financial_model?.projections && (
                  <div className="bg-white border-2 border-ink p-6 mb-4">
                    <h3 className="font-black text-lg mb-2">5-Year Financial Projections</h3>
                    <div className="grid grid-cols-5 gap-2 mt-4">
                      {result.financial_model.projections.map((proj: any, idx: number) => (
                        <div key={idx} className="text-center p-2 bg-cyan/10 border border-ink">
                          <div className="font-bold text-xs">Year {proj.year}</div>
                          <div className="font-black text-lg">${typeof proj.revenue === 'number' ? proj.revenue.toLocaleString() : proj.revenue}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.competitor_analysis?.competitors && (
                  <div className="bg-white border-2 border-ink p-6 mb-4">
                    <h3 className="font-black text-lg mb-2">Top Competitors</h3>
                    <ul className="list-disc list-inside">
                      {result.competitor_analysis.competitors.slice(0, 3).map((comp: any, idx: number) => (
                        <li key={idx} className="font-medium">{comp.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Link 
                  to="/register"
                  className="flex-1 bg-cyan text-ink font-black px-6 py-4 border-2 border-ink shadow-brutal text-center hover:bg-cyan-hover transition-all"
                >
                  SAVE & CREATE ACCOUNT
                </Link>
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
