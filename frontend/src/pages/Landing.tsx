import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [businessIdea, setBusinessIdea] = useState('');

  const handleSubmit = () => {
    if (!businessIdea.trim()) return;
    navigate('/questions', { state: { businessIdea: businessIdea.trim() } });
  };

  return (
    <div className="bg-[#F2F0E9] text-ink font-sans antialiased overflow-x-hidden relative selection:bg-cyan selection:text-ink min-h-screen">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 paper-texture"></div>
        <div className="absolute top-[10%] right-[5%] w-48 h-48 rounded-full border-[12px] border-[#4a3b2a]/10 blur-[2px]"></div>
        <div className="absolute top-[40%] left-[5%] w-40 h-40 bg-marker shadow-brutal rotate-[-6deg] p-4 hidden md:block">
          <p className="font-black text-ink text-sm uppercase transform rotate-[-2deg]">To Do:</p>
          <ul className="list-disc list-inside text-xs font-bold mt-2 leading-loose">
            <li>Quit job</li>
            <li>Build Empire</li>
            <li>Buy Island</li>
          </ul>
        </div>
        <div className="absolute bottom-[20%] right-[10%] w-24 h-24 bg-white border-2 border-ink rounded-full shadow-brutal blur-[0.5px] opacity-80 hidden md:block"></div>
      </div>

      <div className="bg-ink text-cyan text-xs font-mono py-2 border-b-2 border-ink overflow-hidden whitespace-nowrap z-50 relative">
        <div className="inline-block animate-marquee">
          JUST GENERATED: VERTICAL FARMING SAAS (DENVER) - $3.2M PROJ. REV  ///  NEW: D2C SNEAKER BRAND (TOKYO) - PITCH DECK READY  ///  NEW: AI LEGAL AIDE (NYC) - COMPETITOR ANALYSIS COMPLETE  ///  JUST GENERATED: MOBILE PET GROOMING (AUSTIN)
        </div>
      </div>

      <nav className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b-2 border-ink px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-manilla border-2 border-ink flex items-center justify-center shadow-brutal-sm group-hover:rotate-6 transition-transform">
              <span className="font-black text-xl">M</span>
            </div>
            <span className="font-black text-xl tracking-tighter">myCEO</span>
          </Link>
          <div className="flex gap-4">
            <a href="#demo" className="hidden md:flex items-center font-bold text-sm hover:text-cyan transition-colors">How it works</a>
            <Link to="/register" className="btn-primary">Start Building</Link>
          </div>
        </div>
      </nav>

      <section className="pt-24 pb-32 px-4 relative z-10 min-h-[90vh] flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 bg-white border-2 border-ink px-4 py-1 rounded-full shadow-brutal-sm rotate-[-2deg] mb-8 animate-float">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="font-bold text-xs uppercase tracking-wide">Warning: Extremely Addictive</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-center leading-[0.9] tracking-tight mb-6 max-w-5xl">
          Every empire started with an idea. <br /> <span className="marker-highlight px-2">Start yours now.</span>
        </h1>
        
        <p className="text-lg md:text-xl font-medium text-center text-gray-600 mb-12 max-w-2xl">
          AI-powered business plans that would take consultants <span className="font-black text-ink">weeks</span>.
        </p>

        <div className="w-full max-w-2xl relative group">
          <div className="absolute -top-10 left-0 bg-manilla border-2 border-ink border-b-0 px-6 py-2 rounded-t-xl font-bold text-xs uppercase tracking-widest translate-y-1 z-0">
            Your_Next_Empire.folder
          </div>

          <div className="bg-paper border-2 border-ink shadow-brutal p-8 md:p-10 rounded-xl rounded-tl-none relative z-20">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-black uppercase tracking-wide text-gray-500 mb-3">
                  Describe your business idea
                </label>
                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="I want to build a mobile app that connects dog walkers with busy pet owners in Austin, TX. Think Uber but for dog walking..."
                  className="w-full h-32 p-4 bg-white border-2 border-ink text-ink font-medium text-lg resize-none focus:outline-none focus:border-cyan transition-colors placeholder-gray-400 relative z-50"
                  style={{ pointerEvents: 'auto' }}
                />
              </div>

              <button 
                type="submit"
                disabled={!businessIdea.trim()}
                className={`btn-cyan w-full group relative overflow-hidden ${!businessIdea.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  GENERATE BUSINESS
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-y-2 border-ink" id="demo">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Why is this usually so <span className="text-alert underline decoration-4 decoration-ink">hard?</span></h2>
            <p className="text-gray-500 font-bold">You are wasting 90% of your time on "fake work".</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 border-b-2 md:border-b-0 md:border-r-2 border-ink bg-gray-50 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-9xl opacity-5 select-none">😫</div>
              <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
                <span className="bg-ink text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">A</span>
                The Old Way
              </h3>
              
              <ul className="space-y-6 opacity-60">
                <li className="flex gap-4">
                  <span className="text-2xl">📉</span>
                  <div>
                    <strong className="block text-ink line-through decoration-alert decoration-2">Excel Hell</strong>
                    <span className="text-sm">Download a broken template. Cry because "EBITDA" is confusing.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">😴</span>
                  <div>
                    <strong className="block text-ink line-through decoration-alert decoration-2">PowerPoint Paralysis</strong>
                    <span className="text-sm">Stare at a blank white slide for 3 days straight.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-2xl">💸</span>
                  <div>
                    <strong className="block text-ink line-through decoration-alert decoration-2">Expensive Consultants</strong>
                    <span className="text-sm">Pay $5k for a PDF that tells you "customer service is key."</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-8 md:p-12 bg-cyan/5 relative">
              <div className="absolute -right-4 -top-4 text-9xl opacity-10 select-none">🚀</div>
              <div className="absolute top-0 right-0 bg-cyan text-ink text-xs font-black px-3 py-1 border-b-2 border-l-2 border-ink">CHEAT CODE ACTIVE</div>
              
              <h3 className="font-black text-2xl mb-8 flex items-center gap-3">
                <span className="bg-cyan text-ink border-2 border-ink w-8 h-8 flex items-center justify-center rounded-full text-sm">B</span>
                The myCEO Way
              </h3>

              <ul className="space-y-6">
                <li className="card-base p-4 bg-white flex gap-4 items-center">
                  <div className="w-10 h-10 bg-cyan border-2 border-ink flex items-center justify-center font-black rounded text-lg">✓</div>
                  <div>
                    <strong className="block text-ink">Instant Financials</strong>
                    <span className="text-sm text-gray-600">5-Year P&L generated with industry benchmarks.</span>
                  </div>
                </li>
                <li className="card-base p-4 bg-white flex gap-4 items-center">
                  <div className="w-10 h-10 bg-cyan border-2 border-ink flex items-center justify-center font-black rounded text-lg">✓</div>
                  <div>
                    <strong className="block text-ink">Deck Designer</strong>
                    <span className="text-sm text-gray-600">We write the story and design the slides.</span>
                  </div>
                </li>
                <li className="card-base p-4 bg-white flex gap-4 items-center">
                  <div className="w-10 h-10 bg-cyan border-2 border-ink flex items-center justify-center font-black rounded text-lg">✓</div>
                  <div>
                    <strong className="block text-ink">Execution Dashboard</strong>
                    <span className="text-sm text-gray-600">Your daily to-do list to reach $1M ARR.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-manilla px-4 border-b-2 border-ink">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-black mb-2">Everything in one folder.</h2>
              <p className="font-medium opacity-70">No more loose Google Docs.</p>
            </div>
            <div className="flex items-center gap-3 bg-paper border-2 border-ink rounded-full px-2 py-2">
              <span className="bg-ink text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Manilla View</span>
              <span className="text-gray-400 px-4 py-1 text-xs font-bold uppercase cursor-not-allowed">Blueprint View</span>
            </div>
          </div>

          <div className="relative mt-8 group">
            <div className="absolute -top-10 left-0 w-64 h-12 bg-manilla-dark border-2 border-ink border-b-0 rounded-t-xl z-0"></div>
            
            <div className="bg-paper border-2 border-ink rounded-xl rounded-tl-none shadow-brutal-lg min-h-[600px] flex flex-col md:flex-row relative z-10 overflow-hidden">
              <div className="w-full md:w-64 bg-gray-50 border-r-2 border-ink p-6 flex flex-col gap-2">
                <div className="text-xs font-black uppercase text-gray-400 mb-2">My Startups</div>
                <div className="p-3 bg-cyan border-2 border-ink font-bold text-sm shadow-brutal-sm cursor-pointer">
                  🐶 Dog Walker App
                </div>
                <div className="p-3 bg-white border-2 border-transparent hover:border-ink hover:bg-gray-100 font-bold text-sm text-gray-500 cursor-pointer transition-all">
                  ☕️ Coffee Shop
                </div>
                
                <div className="mt-8 text-xs font-black uppercase text-gray-400 mb-2">Files</div>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer rounded">
                  <span className="text-lg">📊</span> <span className="font-bold text-sm">Financials.xls</span>
                </div>
                <div className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer rounded">
                  <span className="text-lg">🎨</span> <span className="font-bold text-sm">PitchDeck.ppt</span>
                </div>
              </div>

              <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-ink/10">
                  <div>
                    <h3 className="text-2xl font-black">Startup Overview</h3>
                    <p className="text-xs font-mono text-gray-500">LAST UPDATED: JUST NOW</p>
                  </div>
                  <button className="bg-ink text-white px-4 py-2 text-xs font-bold uppercase border-2 border-ink hover:bg-white hover:text-ink transition-colors">Export Report</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-2 bg-white border-2 border-ink shadow-brutal p-6">
                    <div className="text-xs font-black uppercase text-gray-400 mb-2">Projected Revenue (Y1)</div>
                    <div className="text-5xl font-black text-ink mb-6">$420,000</div>
                    <div className="flex items-end gap-2 h-24 border-b-2 border-ink pb-0">
                      <div className="w-full bg-cyan/20 h-[30%] border-t-2 border-x-2 border-ink relative group">
                        <div className="absolute -top-8 left-0 bg-ink text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Q1</div>
                      </div>
                      <div className="w-full bg-cyan/40 h-[50%] border-t-2 border-x-2 border-ink relative group">
                        <div className="absolute -top-8 left-0 bg-ink text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Q2</div>
                      </div>
                      <div className="w-full bg-cyan/60 h-[70%] border-t-2 border-x-2 border-ink relative group">
                        <div className="absolute -top-8 left-0 bg-ink text-white text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Q3</div>
                      </div>
                      <div className="w-full bg-cyan h-[90%] border-t-2 border-x-2 border-ink relative group">
                        <div className="absolute -top-8 left-0 bg-ink text-white text-[10px] px-2 py-1 opacity-100">Q4</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-ink shadow-brutal p-6">
                    <div className="text-xs font-black uppercase text-gray-400 mb-4">Immediate Actions</div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 border-2 border-ink rounded bg-cyan flex items-center justify-center text-xs">✓</div>
                        <span className="text-sm font-bold line-through opacity-50">Generate Name</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 border-2 border-ink rounded bg-white group-hover:bg-gray-100"></div>
                        <span className="text-sm font-bold">Register LLC</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 border-2 border-ink rounded bg-white group-hover:bg-gray-100"></div>
                        <span className="text-sm font-bold">Open Bank Account</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 border-2 border-ink rounded bg-white group-hover:bg-gray-100"></div>
                        <span className="text-sm font-bold">Build MVP</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to stop dreaming and <span className="marker-highlight px-2">start building?</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 font-medium">
            Join thousands of founders who went from idea to launch in record time.
          </p>
          <Link to="/register" className="btn-cyan inline-flex">
            START BUILDING NOW
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="bg-ink text-white py-16 px-4 border-t-2 border-ink">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-manilla border-2 border-ink flex items-center justify-center">
                  <span className="font-black text-xl text-ink">M</span>
                </div>
                <span className="font-bold text-xl">myCEO</span>
              </div>
              <p className="text-gray-400 text-sm">
                The cheat code for founders. Build your empire faster.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/pricing" className="hover:text-cyan transition-colors">Pricing</Link></li>
                <li><a href="#demo" className="hover:text-cyan transition-colors">How it Works</a></li>
                <li><Link to="/about" className="hover:text-cyan transition-colors">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/help" className="hover:text-cyan transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-cyan transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/privacy" className="hover:text-cyan transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-cyan transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            © 2024 myCEO. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
