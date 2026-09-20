import React, { useState, useEffect, useRef } from 'react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { MobileStatusBar } from '../../components/mobile/MobileStatusBar';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import { MobileBottomNavbar } from '../../components/mobile/MobileBottomNavbar';

// Dedicated Mobile Views (Bright/Dark mode synchronized)
import { MobileRadarMap } from '../../components/mobile/MobileRadarMap';
import { MobileReport } from '../../components/mobile/MobileReport';
import { MobileSOS } from '../../components/mobile/MobileSOS';
import { ShieldAlert, Moon, Sun, Shield, Lock, Phone, Info, Bell, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';

export const MobileAppView = () => {
  const { isDark, toggleTheme } = useMobileTheme();
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, syncNow } = useSyncStatus();
  const [activeTab, setActiveTab] = useState('home');
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const mainRef = useRef(null);

  // Scroll to top on tab change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Native Android Status Bar & Back Button Integration
  useEffect(() => {
    if (isNative) {
      try {
        StatusBar.setBackgroundColor({ color: isDark ? '#0b0710' : '#f2f4f8' }).catch(() => {});
        StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
      } catch (e) {
        // Web fallback
      }

      const backListener = CapApp.addListener('backButton', () => {
        if (activeTab !== 'home') {
          setActiveTab('home');
        } else {
          CapApp.exitApp();
        }
      });

      return () => {
        backListener.then(l => l.remove()).catch(() => {});
      };
    }
  }, [isDark, activeTab, isNative]);

  return (
    <div className={`fixed inset-0 w-full h-full flex flex-col justify-between overflow-hidden select-none transition-colors duration-200 ${
      isDark ? 'bg-[#0b0710] text-white' : 'bg-[#f2f4f8] text-slate-900'
    }`}>
      {/* Top Device Bar & Brand Header - Rigidly Anchored */}
      <header className={`shrink-0 z-20 ${isNative ? 'pt-9' : ''}`}>
        <MobileStatusBar />
        <MobileHeader />
      </header>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col justify-start">
        {activeTab === 'home' && (
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Big floating report button centered */}
            <button 
              onClick={() => setActiveTab('report')}
              className={`w-[240px] h-[240px] rounded-full font-black text-2xl shadow-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.95] ${
                isDark 
                  ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-red-600/30 ring-8 ring-red-500/20' 
                  : 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-red-500/40 ring-8 ring-red-500/20'
              }`}
            >
              <ShieldAlert size={64} className="animate-pulse" />
              <span>REPORT<br/>INCIDENT</span>
            </button>
            <p className={`mt-8 text-center text-sm font-medium px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tap to securely share your location and report an incident anonymously.
            </p>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-full w-full animate-in fade-in duration-150">
            <MobileRadarMap onNavigateReport={() => setActiveTab('report')} />
          </div>
        )}

        {activeTab === 'report' && (
          <div className="h-full w-full animate-in fade-in duration-150">
            <MobileReport onNavigateMap={() => setActiveTab('map')} />
          </div>
        )}

        {activeTab === 'sos' && (
          <div className="h-full w-full animate-in fade-in duration-150">
            <MobileSOS />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-5 space-y-4 animate-in fade-in duration-200 text-left">
            <h2 className="text-xl font-bold tracking-tight">Mobile Settings</h2>

            {/* Theme Toggle Card */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#150f24] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-violet-950 text-violet-300' : 'bg-violet-100 text-violet-700'
                  }`}>
                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Theme Mode</span>
                    <span className="text-xs text-slate-400">Current: {isDark ? 'Dark (Night Vigilance)' : 'Bright (Daylight)'}</span>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isDark ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Switch to {isDark ? 'Bright' : 'Dark'}
                </button>
              </div>
            </div>

            {/* Offline Sync & Vault Diagnostics Card */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#150f24] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    !isOnline 
                      ? 'bg-amber-950 text-amber-400' 
                      : pendingCount > 0 
                        ? 'bg-blue-950 text-blue-400' 
                        : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {!isOnline ? <CloudOff size={18} /> : isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Cloud size={18} />}
                  </div>
                  <div>
                    <span className="text-sm font-bold block">Offline Queue & Sync</span>
                    <span className="text-xs text-slate-400">
                      Status: {isSyncing ? 'Syncing...' : isOnline ? 'Online & Ready' : 'Offline Mode'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={syncNow}
                  disabled={isSyncing}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    isSyncing
                      ? 'bg-violet-600/50 text-white/50 cursor-not-allowed'
                      : pendingCount > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : isDark
                          ? 'bg-white/10 hover:bg-white/15 text-slate-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing' : pendingCount > 0 ? `Sync (${pendingCount})` : 'Sync Now'}</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Queued Offline Reports:</span>
                  <span className={`font-bold font-mono ${pendingCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {pendingCount} item{pendingCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Auto-Sync Background Trigger:</span>
                  <span className="font-semibold text-violet-400">Active</span>
                </div>
                {lastSyncedAt && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Last Cloud Sync:</span>
                    <span className="font-mono text-[11px] text-slate-300">
                      {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Shield Info Card */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#150f24] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Shield size={18} className="text-violet-500" />
                <span className="text-sm font-bold">Privacy Guarantee</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nirbhaya never collects phone numbers, device IDs, or exact GPS coordinates. All signal data is obfuscated to safe anonymized zones.
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#150f24] border-white/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Phone size={18} className="text-emerald-500" />
                <span className="text-sm font-bold">Emergency Contacts</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Add trusted contacts to receive automated SMS alerts during an Emergency SOS trigger.
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs font-mono">
                <span>Emergency Services</span>
                <span className="text-emerald-400 font-bold">911 Active</span>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nirbhaya Mobile Edition • v1.0.0</p>
            </div>
          </div>
        )}
      </main>

      {/* Permanently Fixed Bottom Navbar - Rigidly Anchored */}
      <nav className="shrink-0 z-30 pb-2.5 px-4 pt-0.5">
        <MobileBottomNavbar activeTab={activeTab} onSelectTab={setActiveTab} />
      </nav>
    </div>
  );
};
export default MobileAppView;
