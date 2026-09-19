import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';

export const MobileHeader = () => {
  const { isDark, toggleTheme } = useMobileTheme();

  return (
    <div className="w-full px-5 pt-2 pb-1.5 flex items-center justify-between select-none">
      {/* Brand Logo: Stylized Shield with 'S' */}
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
          isDark 
            ? 'bg-gradient-to-br from-violet-600 to-indigo-700 shadow-[0_0_14px_rgba(139,92,246,0.5)] border border-violet-400/30' 
            : 'bg-gradient-to-br from-[#6366f1] via-[#7c3aed] to-[#8b5cf6] shadow-[0_4px_12px_rgba(124,58,237,0.25)] border border-violet-300/60'
        }`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2L4 5V11C4 16.52 7.41 21.61 12 23C16.59 21.61 20 16.52 20 11V5L12 2Z" 
              fill="white" 
              fillOpacity="0.22" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M14.5 9.5C14.5 9.5 10.5 9.5 10.5 11.2C10.5 12.8 13.8 12.8 13.8 14.8C13.8 16.8 9.5 16.8 9.5 16.8" 
              stroke="white" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          SafeSignal
        </span>
      </div>

      {/* Right side: Bright/Dark Switch pill replacing privacy shield */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${isDark ? 'Bright' : 'Dark'} Mode`}
        className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 transition-all active:scale-95 border ${
          isDark
            ? 'bg-[#181128] border-white/10 text-amber-300 hover:bg-white/10 shadow-[0_0_12px_rgba(0,0,0,0.4)]'
            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-sm'
        }`}
      >
        {isDark ? (
          <Sun size={16} className="text-amber-400 shrink-0" />
        ) : (
          <Moon size={16} className="text-violet-600 shrink-0" />
        )}
        <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {isDark ? 'Dark' : 'Bright'}
        </span>
      </button>
    </div>
  );
};

export default MobileHeader;
