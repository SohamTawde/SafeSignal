import React from 'react';
import { Home, Compass, FileText, Radio, Settings } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';

export const MobileBottomNavbar = ({ activeTab, onSelectTab }) => {
  const { isDark } = useMobileTheme();

  const TABS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Radar Map', icon: Compass },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'sos', label: 'SOS', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === activeTab));

  return (
    <div className={`w-full max-w-sm mx-auto rounded-full transition-all duration-200 select-none px-1.5 py-1 border relative ${
      isDark 
        ? 'bg-[#160e26]/95 backdrop-blur-2xl border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.7)]' 
        : 'bg-white/95 backdrop-blur-2xl border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
    }`}>
      <div className="relative flex items-center justify-around">
        {/* Animated Gliding Active Background Pill */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1/5 p-0.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none z-0"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        >
          <div className={`w-full h-full rounded-2xl transition-colors duration-200 ${
            isDark 
              ? 'bg-white/10 border border-white/15 shadow-[0_0_12px_rgba(139,92,246,0.15)]' 
              : 'bg-violet-100/90 border border-violet-200/70 shadow-xs'
          }`} />
        </div>

        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1 rounded-full relative z-10 group active:scale-95 transition-transform"
            >
              <div className={`transition-all duration-200 ${
                isActive 
                  ? isDark 
                    ? 'text-white scale-110 -translate-y-0.5' 
                    : 'text-violet-700 scale-110 -translate-y-0.5' 
                  : isDark 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
              }`}>
                <Icon 
                  size={19} 
                  strokeWidth={isActive ? 2.5 : 1.8} 
                  fill={isActive && tab.id === 'home' ? 'currentColor' : 'none'}
                />
              </div>

              <span className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors duration-150 ${
                isActive
                  ? isDark 
                    ? 'text-white font-bold' 
                    : 'text-violet-700 font-bold'
                  : isDark 
                    ? 'text-slate-400' 
                    : 'text-slate-500'
              }`}>
                {tab.label}
              </span>

              {/* Active Indicator Underline Pill */}
              <span className={`w-3.5 h-0.5 rounded-full mt-0.5 transition-all duration-300 ${
                isActive 
                  ? isDark 
                    ? 'bg-violet-400 shadow-[0_0_8px_#a78bfa] opacity-100 scale-100' 
                    : 'bg-violet-600 opacity-100 scale-100'
                  : 'opacity-0 scale-50'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavbar;
