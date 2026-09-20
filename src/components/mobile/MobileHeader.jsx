import React from 'react';
import { Sun, Moon, CloudOff, RefreshCw, Zap, ChevronLeft } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { useSyncStatus } from '../../hooks/useSyncStatus';

const PAGE_TITLES = {
  home: 'Nirbhaya',
  map: 'Radar Map',
  report: 'Report Incident',
  sos: 'Emergency SOS',
  settings: 'Settings',
};

export const MobileHeader = ({ activeTab = 'home', onSelectTab }) => {
  const { isDark, toggleTheme } = useMobileTheme();
  const { isOnline, isSyncing, pendingCount, syncNow } = useSyncStatus();

  // On non-home pages: Remove Nirbhaya logo, name, and bright/dark switch; show page title on top
  if (activeTab !== 'home') {
    return (
      <div className="w-full px-4 pt-2 pb-1.5 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab && onSelectTab('home')}
            className={`p-1.5 -ml-1.5 rounded-xl transition-all active:scale-95 ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Back to Home"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className={`text-lg font-black tracking-tight uppercase ${
            activeTab === 'sos'
              ? isDark ? 'text-rose-400' : 'text-red-600'
              : isDark ? 'text-white' : 'text-[#111827]'
          }`}>
            {PAGE_TITLES[activeTab] || 'Nirbhaya'}
          </h1>
        </div>

        {/* Sync & Connectivity Status Indicator */}
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <div
              className={`px-2 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold ${
                isDark 
                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' 
                  : 'bg-violet-50 border-violet-200 text-violet-700'
              }`}
            >
              <RefreshCw size={12} className="animate-spin text-violet-500 shrink-0" />
              <span>Syncing</span>
            </div>
          ) : !isOnline ? (
            <button
              onClick={syncNow}
              title="Device is offline. Tap to retry sync."
              className={`px-2 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold transition-all active:scale-95 ${
                isDark 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25' 
                  : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <CloudOff size={12} className="shrink-0 text-amber-500" />
              <span>Offline {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
            </button>
          ) : pendingCount > 0 ? (
            <button
              onClick={syncNow}
              title="Pending reports stored locally. Tap to sync now."
              className={`px-2 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold transition-all active:scale-95 ${
                isDark 
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25' 
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Zap size={12} className="shrink-0 text-blue-500" />
              <span>Sync ({pendingCount})</span>
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // On Home page: Show Nirbhaya logo, brand name, and bright/dark switch
  return (
    <div className="w-full px-4 pt-2 pb-1.5 flex items-center justify-between select-none">
      <div className="flex items-center gap-2.5 cursor-pointer">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="h-9 w-auto object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
        />
        <span className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-[#111827]'} uppercase`}>
          Nirbhaya
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Sync & Connectivity Status Indicator */}
        {isSyncing ? (
          <div
            className={`px-2 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold ${
              isDark 
                ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' 
                : 'bg-violet-50 border-violet-200 text-violet-700'
            }`}
          >
            <RefreshCw size={12} className="animate-spin text-violet-500 shrink-0" />
            <span>Syncing</span>
          </div>
        ) : !isOnline ? (
          <button
            onClick={syncNow}
            title="Device is offline. Tap to retry sync."
            className={`px-2 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold transition-all active:scale-95 ${
              isDark 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25' 
                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <CloudOff size={12} className="shrink-0 text-amber-500" />
            <span>Offline {pendingCount > 0 ? `(${pendingCount})` : ''}</span>
          </button>
        ) : pendingCount > 0 ? (
          <button
            onClick={syncNow}
            title="Pending reports stored locally. Tap to sync now."
            className={`px-2 py-1 rounded-xl flex items-center gap-1.5 border text-[10px] font-bold transition-all active:scale-95 ${
              isDark 
                ? 'bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25' 
                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Zap size={12} className="shrink-0 text-blue-500" />
            <span>Sync ({pendingCount})</span>
          </button>
        ) : null}

        {/* Bright/Dark Switch pill */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Bright' : 'Dark'} Mode`}
          className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 border ${
            isDark
              ? 'bg-[#181128] border-white/10 text-amber-300 hover:bg-white/10 shadow-[0_0_12px_rgba(0,0,0,0.4)]'
              : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 shadow-sm'
          }`}
        >
          {isDark ? (
            <Sun size={14} className="text-amber-400 shrink-0" />
          ) : (
            <Moon size={14} className="text-violet-600 shrink-0" />
          )}
          <span className={`text-[11px] font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            {isDark ? 'Dark' : 'Bright'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
