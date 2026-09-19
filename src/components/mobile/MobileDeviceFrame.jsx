import React, { useState } from 'react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { Sun, Moon, Smartphone, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Capacitor } from '@capacitor/core';

export const MobileDeviceFrame = ({ children }) => {
  const { isDark, toggleTheme } = useMobileTheme();
  const [fullscreen, setFullscreen] = useState(false);
  const navigate = useNavigate();
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  // On actual physical phone, render edge-to-edge natively
  if (isNative) {
    return <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-[#0b0710]">{children}</div>;
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-6 transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#06030a] text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top Controls Toolbar for Desktop Reviewers */}
      <div className="w-full max-w-xl mb-4 px-4 py-2.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-xl text-xs z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition"
        >
          <ArrowLeft size={14} /> Back to Web
        </button>

        <div className="flex items-center gap-2">
          {/* Bright / Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-sm ${
              isDark 
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 hover:bg-violet-600/40' 
                : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
            }`}
          >
            {isDark ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-600" />}
            <span>{isDark ? 'Bright Mode' : 'Dark Mode'}</span>
          </button>

          {/* Fullscreen / Frame Toggle */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition"
            title="Toggle Device Frame"
          >
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{fullscreen ? 'Frame' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Main Screen Container (Mobile chassis or full-screen) */}
      <div className={`transition-all duration-300 ${
        fullscreen
          ? 'w-full max-w-md h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10'
          : 'w-full max-w-[395px] h-[835px] rounded-[48px] p-3.5 bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-[0_25px_70px_rgba(0,0,0,0.6)] border-4 border-slate-700/80 relative flex flex-col justify-center'
      }`}>
        {/* Dynamic Island / Notch on Phone Frame */}
        {!fullscreen && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-black/90 z-40 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 ml-auto mr-3 border border-slate-700/40" />
          </div>
        )}

        {/* Screen Content Wrapper */}
        <div className={`w-full h-full overflow-hidden transition-colors ${
          fullscreen ? 'rounded-3xl' : 'rounded-[38px]'
        } ${isDark ? 'bg-[#0b0710]' : 'bg-[#f8fafc]'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
