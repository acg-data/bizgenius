import React from 'react';
import { 
  Home, 
  Layout, 
  Users, 
  Megaphone, 
  BarChart2, 
  Compass, 
  FlaskConical, 
  PenTool, 
  GitCompare, // Used for Competitors icon
  ChevronDown,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react';

interface LeaderboardItem {
  rank: number;
  name: string;
  score: number;
  change: string;
  color: string;
  initial: string;
  highlight: boolean;
  changeColor?: string;
}

interface MovementItem {
  type: string;
  company: string;
  desc: string;
  value: string;
  badgeColor: string;
  valueColor: string;
}

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: string;
}

const CompetitorAnalysisDashboard = () => {
  
  // Data for the Leaderboard
  const leaderboardData: LeaderboardItem[] = [
    { rank: 1, name: "Deel (You)", score: 88, change: "+3", color: "bg-blue-600", initial: "D", highlight: true },
    { rank: 2, name: "Rippling", score: 78, change: "+5", color: "bg-purple-600", initial: "R", highlight: false },
    { rank: 3, name: "Gusto", score: 65, change: "-2", changeColor: "text-red-500", color: "bg-orange-400", initial: "G", highlight: false },
    { rank: 4, name: "Remote.com", score: 52, change: "+8", color: "bg-emerald-500", initial: "R", highlight: false },
    { rank: 5, name: "Papaya Global", score: 47, change: "+3", color: "bg-pink-500", initial: "P", highlight: false },
  ];

  // Data for Market Movements
  const movementsData: MovementItem[] = [
    { 
      type: "Gaining", 
      company: "Remote.com", 
      desc: "Up 12% in 'EOR platform' queries", 
      value: "+12%", 
      badgeColor: "bg-emerald-100 text-emerald-700",
      valueColor: "text-emerald-600"
    },
    { 
      type: "Losing", 
      company: "Gusto", 
      desc: "Down 8% in 'payroll software' queries", 
      value: "-8%", 
      badgeColor: "bg-red-100 text-red-700",
      valueColor: "text-red-600"
    },
    { 
      type: "New", 
      company: "Oyster HR", 
      desc: "First appeared in AI responses this week", 
      value: "New", 
      badgeColor: "bg-blue-100 text-blue-700",
      valueColor: "text-blue-600"
    }
  ];

  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: "Home" },
    { icon: Layout, label: "Brand" },
    { icon: Users, label: "Audiences" },
    { icon: Megaphone, label: "Ad Campaigns" },
    { icon: BarChart2, label: "Web Analytics", badge: "New" },
    { icon: Compass, label: "Prompt Explorer" },
    { icon: FlaskConical, label: "Research" },
    { icon: PenTool, label: "Content Ideas" },
    { icon: GitCompare, label: "Competitors", active: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans flex justify-center items-center">
      {/* Window Frame */}
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-xl overflow-hidden flex border border-gray-200 h-[800px]">
        
        {/* --- Sidebar --- */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
          
          {/* Mac Window Dots (Decorative) */}
          <div className="p-4 flex gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>

          {/* Company Switcher */}
          <div className="px-4 mb-8">
            <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="font-medium text-gray-700">Deel</span>
              <ChevronDown size={16} className="ml-auto text-gray-400" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-2 space-y-1">
            {sidebarItems.map((item, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
                  item.active 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={18} className={item.active ? "text-blue-600" : "text-gray-400"} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 bg-gray-50/50 p-8 overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Competitor Analysis</h1>
              <p className="text-gray-500 text-sm">Track how AI models mention competitors versus your brand.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-green-700 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Live Demo
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                #1 in category
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Leaderboard */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-6">AI Visibility Leaderboard</h2>
              
              <div className="space-y-6">
                {leaderboardData.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-4 ${item.highlight ? 'bg-blue-50/50 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                    <span className="text-gray-400 font-medium w-6">#{item.rank}</span>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 ${item.color} rounded flex-shrink-0 flex items-center justify-center text-white font-bold text-sm`}>
                      {item.initial}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className={`text-sm font-medium ${item.highlight ? 'text-blue-700' : 'text-gray-700'}`}>
                          {item.name}
                        </span>
                        <div className="flex gap-4 text-sm">
                          <span className={`font-medium ${item.changeColor || 'text-green-600'}`}>{item.change}</span>
                          <span className="font-bold text-gray-900">{item.score}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`} 
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Card: Market Movements */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-6">Market Movements</h2>
              
              <div className="space-y-4">
                {movementsData.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${item.badgeColor}`}>
                        {item.type}
                      </span>
                      <span className={`text-sm font-bold ${item.valueColor}`}>
                        {item.value}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.company}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysisDashboard;