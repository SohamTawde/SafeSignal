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

  return (
    <div className={`w-full max-w-sm mx-auto rounded-full transition-all duration-200 select-none px-2 py-1 border ${
      isDark 
        ? 'bg-[#160e26]/95 backdrop-blur-2xl border-white/15 shadow-[0_10px_35px_rgba(0,0,0,0.7)]' 
        : 'bg-white/95 backdrop-blur-2xl border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
    }`}>
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-full transition-all duration-150 relative group ${
                isActive 
                  ? isDark 
                    ? 'bg-white/5' 
                    : 'bg-violet-50/80' 
                  : 'hover:bg-transparent'
              }`}
            >
              <div className={`transition-all duration-150 ${
                isActive 
                  ? isDark 
                    ? 'text-white scale-105' 
                    : 'text-violet-600 scale-105' 
                  : isDark 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
              }`}>
                <Icon 
                  size={19} 
                  strokeWidth={isActive ? 2.4 : 1.8} 
                  fill={isActive && tab.id === 'home' ? 'currentColor' : 'none'}
                />
              </div>

              <span className={`text-[10px] mt-0.5 font-semibold tracking-tight transition-colors ${
                isActive
                  ? isDark 
                    ? 'text-white font-bold' 
                    : 'text-violet-600 font-bold'
                  : isDark 
                    ? 'text-slate-400' 
                    : 'text-slate-500'
              }`}>
                {tab.label}
              </span>

              {/* Active Indicator Underline Pill */}
              {isActive && (
                <span className={`w-4 h-0.5 rounded-full mt-0.5 ${
                  isDark ? 'bg-violet-400 shadow-[0_0_8px_#a78bfa]' : 'bg-violet-600'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNavbar;
