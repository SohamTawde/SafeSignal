import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';

export const MobileHeader = () => {
  const { isDark, toggleTheme } = useMobileTheme();

  return (
    <div className="w-full px-5 pt-2 pb-1.5 flex items-center justify-between select-none">
      <div className="flex items-center gap-3 cursor-pointer">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
        />
        <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#111827]'} uppercase`}>
          Nirbhaya
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
