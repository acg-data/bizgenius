import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CommandLineIcon, ArrowRightIcon, ArrowLeftIcon, LockClosedIcon, LockOpenIcon, ArrowPathIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

interface BrandingData {
  companyName: string;
  selectedLogo: string | null;
  colors: string[];
}

const STORAGE_KEY = 'myceo_branding';

export default function Branding() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [businessIdea, setBusinessIdea] = useState('');
  const [step, setStep] = useState<'name' | 'logo' | 'colors'>('name');
  
  const [companyName, setCompanyName] = useState('');
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [loadingNames, setLoadingNames] = useState(false);
  
  const [logos, setLogos] = useState<(string | null)[]>([]);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number | null>(null);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  
  const [colors, setColors] = useState<string[]>(['#1D1D1F', '#F5F5F7', '#0066CC', '#34C759', '#FF9500']);
  const [lockedColors, setLockedColors] = useState<boolean[]>([false, false, false, false, false]);
  const [suggestedPalettes, setSuggestedPalettes] = useState<string[][]>([]);
  const [loadingPalettes, setLoadingPalettes] = useState(false);

  useEffect(() => {
    const idea = location.state?.businessIdea || localStorage.getItem('myceo_business_idea');
    
    if (!idea) {
      navigate('/');
      return;
    }

    setBusinessIdea(idea);
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: BrandingData = JSON.parse(stored);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.colors) setColors(data.colors);
      } catch {}
    }
  }, [location.state, navigate]);

  const fetchNameSuggestions = useCallback(async () => {
    if (!businessIdea || loadingNames) return;
    setLoadingNames(true);
    
    try {
      const response = await api.post('/branding/company-names', { 
        business_idea: businessIdea,
        count: 5
      });
      setSuggestedNames(response.data.names || []);
    } catch (err) {
      console.error('Failed to fetch name suggestions:', err);
    } finally {
      setLoadingNames(false);
    }
  }, [businessIdea, loadingNames]);

  useEffect(() => {
    if (businessIdea && step === 'name' && suggestedNames.length === 0) {
      fetchNameSuggestions();
    }
  }, [businessIdea, step, suggestedNames.length, fetchNameSuggestions]);

  const fetchLogos = async () => {
    if (!companyName || loadingLogos) return;
    setLoadingLogos(true);
    setLogoError(null);
    
    try {
      const response = await api.post('/branding/logo-variations', {
        company_name: companyName,
        business_idea: businessIdea,
        count: 4
      });
      setLogos(response.data.logos || []);
    } catch (err) {
      console.error('Failed to generate logos:', err);
      setLogoError('Failed to generate logos. Please try again.');
    } finally {
      setLoadingLogos(false);
    }
  };

  const fetchPaletteSuggestions = async () => {
    if (!businessIdea || loadingPalettes) return;
    setLoadingPalettes(true);
    
    try {
      const response = await api.post('/branding/color-palettes', {
        business_idea: businessIdea,
        count: 3
      });
      setSuggestedPalettes(response.data.palettes || []);
    } catch (err) {
      console.error('Failed to fetch palette suggestions:', err);
    } finally {
      setLoadingPalettes(false);
    }
  };

  const shuffleUnlockedColors = async () => {
    try {
      const lockedColorValues = colors.map((c, i) => lockedColors[i] ? c : null);
      const response = await api.post('/branding/random-palette', {
        locked_colors: lockedColorValues
      });
      setColors(response.data.palette);
    } catch (err) {
      console.error('Failed to shuffle colors:', err);
      const newColors = [...colors];
      for (let i = 0; i < 5; i++) {
        if (!lockedColors[i]) {
          newColors[i] = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        }
      }
      setColors(newColors);
    }
  };

  const toggleColorLock = (index: number) => {
    setLockedColors(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleNextStep = () => {
    if (step === 'name' && companyName.trim()) {
      setStep('logo');
      if (logos.length === 0) {
        fetchLogos();
      }
    } else if (step === 'logo') {
      setStep('colors');
      if (suggestedPalettes.length === 0) {
        fetchPaletteSuggestions();
      }
    } else if (step === 'colors') {
      handleSubmit();
    }
  };

  const handleBackStep = () => {
    if (step === 'logo') setStep('name');
    else if (step === 'colors') setStep('logo');
  };

  const handleSubmit = () => {
    const brandingData: BrandingData = {
      companyName,
      selectedLogo: selectedLogoIndex !== null ? logos[selectedLogoIndex] || null : null,
      colors
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brandingData));
    
    navigate('/generate', {
      state: {
        businessIdea,
        answers: location.state?.answers || JSON.parse(localStorage.getItem('myceo_answers') || '{}'),
        branding: brandingData
      }
    });
  };

  const handleSkip = () => {
    navigate('/generate', {
      state: {
        businessIdea,
        answers: location.state?.answers || JSON.parse(localStorage.getItem('myceo_answers') || '{}')
      }
    });
  };

  const getContrastColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1D1D1F' : '#FFFFFF';
  };

  const stepNumber = step === 'name' ? 1 : step === 'logo' ? 2 : 3;

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
            Skip branding
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-apple-text">
              Step 2: Brand Setup ({stepNumber}/3)
            </span>
          </div>
          
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s < stepNumber ? 'bg-green-500' : s === stepNumber ? 'bg-apple-text' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {step === 'name' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-apple-text" />
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-apple-gray uppercase tracking-wide">
                  Company Identity
                </span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-apple-text mb-3 leading-tight">
                What's your company name?
              </h2>
              <p className="text-apple-gray mb-6">This will appear on your pitch deck and business plan.</p>
              
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name..."
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-apple-text focus:bg-white text-apple-text font-medium focus:outline-none transition-all rounded-xl text-lg mb-6"
                autoFocus
              />
              
              {suggestedNames.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-apple-gray mb-3">
                    AI Suggestions (click to use):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => setCompanyName(name)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          companyName === name
                            ? 'bg-apple-text text-white'
                            : 'bg-gray-100 text-apple-text hover:bg-gray-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {loadingNames && (
                <div className="flex items-center gap-2 text-apple-gray text-sm">
                  <div className="w-4 h-4 border-2 border-apple-gray border-t-transparent rounded-full animate-spin" />
                  Generating name suggestions...
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'logo' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-apple-text" />
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-apple-gray uppercase tracking-wide">
                    Logo
                  </span>
                </div>
                <button
                  onClick={fetchLogos}
                  disabled={loadingLogos}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-apple-gray hover:text-apple-text transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loadingLogos ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-apple-text mb-3 leading-tight">
                Choose your logo
              </h2>
              <p className="text-apple-gray mb-6">
                Select a logo for "{companyName}" or regenerate for new options.
              </p>
              
              {loadingLogos ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ))}
                </div>
              ) : logoError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{logoError}</p>
                  <button
                    onClick={fetchLogos}
                    className="px-6 py-3 bg-apple-text text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {logos.map((logo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedLogoIndex(index)}
                      className={`aspect-square rounded-2xl border-2 transition-all overflow-hidden ${
                        selectedLogoIndex === index
                          ? 'border-apple-text shadow-lg scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {logo ? (
                        <img src={logo} alt={`Logo option ${index + 1}`} className="w-full h-full object-contain p-4 bg-white" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-apple-gray">
                          Failed to load
                        </div>
                      )}
                      {selectedLogoIndex === index && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-apple-text rounded-full flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-apple-gray mt-4 text-center">
                You can skip logo selection and add your own later.
              </p>
            </div>
          </div>
        )}

        {step === 'colors' && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-6 h-6 text-apple-text" />
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-apple-gray uppercase tracking-wide">
                    Colors
                  </span>
                </div>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-apple-text mb-3 leading-tight">
                Pick your brand colors
              </h2>
              <p className="text-apple-gray mb-6">
                Click the lock to keep a color, then shuffle for new combinations.
              </p>
              
              <div className="flex h-32 rounded-2xl overflow-hidden shadow-lg mb-6">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => toggleColorLock(index)}
                    className="flex-1 relative group transition-all hover:flex-[1.2]"
                    style={{ backgroundColor: color }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {lockedColors[index] ? (
                        <LockClosedIcon className="w-6 h-6" style={{ color: getContrastColor(color) }} />
                      ) : (
                        <LockOpenIcon className="w-6 h-6" style={{ color: getContrastColor(color) }} />
                      )}
                      <span 
                        className="text-xs font-mono mt-1 uppercase"
                        style={{ color: getContrastColor(color) }}
                      >
                        {color}
                      </span>
                    </div>
                    {lockedColors[index] && (
                      <div className="absolute top-2 right-2">
                        <LockClosedIcon className="w-4 h-4" style={{ color: getContrastColor(color) }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={shuffleUnlockedColors}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-apple-gray font-medium hover:border-apple-text hover:text-apple-text transition-all flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Shuffle Unlocked Colors
              </button>
              
              {suggestedPalettes.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-apple-gray mb-3">AI-suggested palettes:</p>
                  <div className="space-y-2">
                    {suggestedPalettes.map((palette, pIndex) => (
                      <button
                        key={pIndex}
                        onClick={() => setColors(palette)}
                        className="w-full flex h-12 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                      >
                        {palette.map((color, cIndex) => (
                          <div key={cIndex} className="flex-1" style={{ backgroundColor: color }} />
                        ))}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {loadingPalettes && (
                <div className="flex items-center gap-2 text-apple-gray text-sm mt-4">
                  <div className="w-4 h-4 border-2 border-apple-gray border-t-transparent rounded-full animate-spin" />
                  Generating palette suggestions...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBackStep}
            disabled={step === 'name'}
            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all ${
              step === 'name'
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-apple-gray hover:text-apple-text hover:bg-white'
            }`}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={step === 'name' && !companyName.trim()}
            className={`flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all ${
              (step === 'name' && !companyName.trim())
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-apple-text text-white hover:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-[1.02]'
            }`}
          >
            {step === 'colors' ? (
              <>
                Generate Plan
                <ArrowRightIcon className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
