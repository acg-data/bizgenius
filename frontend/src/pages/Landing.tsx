import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SparklesIcon, ArrowRightIcon, CommandLineIcon, CheckIcon, ChartBarIcon, DocumentTextIcon, RocketLaunchIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

const TYPEWRITER_PHRASES = [
  "A dog walking app for busy professionals in Austin...",
  "An AI-powered tutoring platform for K-12 students...",
  "A sustainable fashion marketplace connecting artisans...",
  "A meal prep delivery service for fitness enthusiasts...",
  "A mobile mechanic service for electric vehicles...",
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [businessIdea, setBusinessIdea] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tickerText, setTickerText] = useState('Live: Dog Walking App (Austin) - $420K projected revenue');

  const handleSubmit = () => {
    if (!businessIdea.trim()) return;
    navigate('/questions', { state: { businessIdea: businessIdea.trim() } });
  };

  useEffect(() => {
    const currentPhrase = TYPEWRITER_PHRASES[phraseIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentPhrase.length) {
          setPlaceholder(currentPhrase.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (charIndex > 0) {
          setPlaceholder(currentPhrase.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % TYPEWRITER_PHRASES.length);
        }
      }
    }, isDeleting ? 30 : 50);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex]);

  useEffect(() => {
    const tickers = [
      'Live: Vertical Farming SaaS (Denver) - $3.2M projected',
      'Live: D2C Sneaker Brand (Tokyo) - Pitch deck ready',
      'Live: AI Legal Assistant (NYC) - Market analysis complete',
      'Live: Mobile Pet Grooming (Austin) - 90-day plan generated',
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % tickers.length;
      setTickerText(tickers[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-apple-bg min-h-screen font-sans antialiased overflow-x-hidden">
      {/* Live Ticker */}
      <div className="fixed top-20 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur border border-gray-200 shadow-soft rounded-full px-4 py-1.5 flex items-center gap-2 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[11px] font-medium text-gray-500">{tickerText}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <CommandLineIcon className="w-5 h-5 text-apple-text" />
            <span className="text-lg tracking-tight">myCEO</span>
          </Link>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#demo" className="text-apple-text/70 hover:text-apple-text transition hidden md:block">How it Works</a>
            <a href="#features" className="text-apple-text/70 hover:text-apple-text transition hidden md:block">Features</a>
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.profile_image_url ? (
                  <img 
                    src={user.profile_image_url} 
                    alt={user.first_name || 'User'} 
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                )}
                <span className="text-apple-text hidden md:block">{user.first_name || user.email}</span>
                <button 
                  onClick={logout}
                  className="text-apple-text/70 hover:text-apple-text transition"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button onClick={login} className="text-apple-text/70 hover:text-apple-text transition">Log In</button>
                <button 
                  onClick={login} 
                  className="bg-apple-text text-white px-4 py-1.5 rounded-full hover:bg-gray-800 transition shadow-sm text-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-apple-text mb-6 leading-[1.05] animate-fade-in-up">
            Turn your idea into <br />
            <span className="text-gray-400">a business. Instantly.</span>
          </h1>

          <p className="text-lg md:text-xl font-normal text-apple-text/70 max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The operating system for founders. Generate your business plan, financials, and pitch deck in seconds.
          </p>

          {/* Floating Input */}
          <div className="max-w-2xl mx-auto relative group mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-2xl shadow-float p-2 flex items-center gap-2 border border-gray-100/50 transition-all duration-300 ring-4 ring-transparent focus-within:ring-primary-500/10">
              <div className="pl-4 pr-2 text-gray-400">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={placeholder || "Describe your business idea..."}
                className="flex-1 h-14 bg-transparent text-lg md:text-xl text-apple-text font-medium focus:outline-none placeholder-gray-400"
              />
              <button
                onClick={handleSubmit}
                disabled={!businessIdea.trim()}
                className={`w-12 h-12 rounded-xl bg-apple-text text-white flex items-center justify-center hover:bg-gray-800 transition-all duration-200 shadow-lg ${!businessIdea.trim() ? 'opacity-40 cursor-not-allowed' : 'group-hover:scale-105'}`}
              >
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 text-xs font-medium text-gray-400">
              Press <kbd className="font-sans border border-gray-300 rounded px-1.5 py-0.5 mx-1 bg-white">Enter</kbd> to generate
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white" id="demo">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-apple-text mb-4">
              From idea to launch in minutes
            </h2>
            <p className="text-apple-gray text-lg">No more spreadsheet chaos or expensive consultants</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-apple-bg rounded-2xl p-8 text-center card-apple">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-apple-text mb-3">1. Describe Your Idea</h3>
              <p className="text-apple-gray">Tell us about your business concept in plain English. No forms, no friction.</p>
            </div>

            <div className="bg-apple-bg rounded-2xl p-8 text-center card-apple">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-apple-text mb-3">2. AI Analysis</h3>
              <p className="text-apple-gray">Our AI researches your market, analyzes competitors, and builds your strategy.</p>
            </div>

            <div className="bg-apple-bg rounded-2xl p-8 text-center card-apple">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <RocketLaunchIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-apple-text mb-3">3. Launch Ready</h3>
              <p className="text-apple-gray">Get your complete business plan, financials, and 90-day action plan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-apple-text mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-apple-gray text-lg">10 comprehensive analyses generated in parallel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: DocumentTextIcon, title: 'Executive Summary', desc: 'One-liner pitch, value proposition, and key metrics' },
              { icon: ChartBarIcon, title: 'Market Research', desc: 'TAM/SAM/SOM with real population data' },
              { icon: 'competitors', title: 'Competitor Analysis', desc: 'Real competitor data with pricing and reviews' },
              { icon: 'financial', title: 'Financial Model', desc: '5-year projections and break-even analysis' },
              { icon: 'gtm', title: 'Go-to-Market', desc: 'Launch strategy and customer acquisition' },
              { icon: 'action', title: '90-Day Plan', desc: 'Week-by-week action items to launch' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300">
                <div className="w-10 h-10 bg-apple-bg rounded-xl flex items-center justify-center mb-4">
                  {typeof feature.icon === 'string' ? (
                    <CheckIcon className="w-5 h-5 text-apple-text" />
                  ) : (
                    <feature.icon className="w-5 h-5 text-apple-text" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-apple-text mb-2">{feature.title}</h3>
                <p className="text-apple-gray text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-apple-text mb-6">
            Ready to build your empire?
          </h2>
          <p className="text-lg text-apple-gray mb-10">
            Join thousands of founders who turned their ideas into businesses.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-apple-text text-white font-medium px-8 py-4 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Get Started Free
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-apple-text text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CommandLineIcon className="w-5 h-5" />
                <span className="font-semibold text-lg">myCEO</span>
              </div>
              <p className="text-gray-400 text-sm">
                The operating system for founders. Build your empire faster.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">How it Works</a></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} myCEO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
