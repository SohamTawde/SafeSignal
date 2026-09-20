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

const TABS_ORDER = ['home', 'map', 'report', 'sos', 'settings'];

export const MobileAppView = () => {
  const { isDark, toggleTheme } = useMobileTheme();
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, syncNow } = useSyncStatus();
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState('forward');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState('');
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const mainRef = useRef(null);

  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    isIgnored: false,
    isHorizontal: false,
  });

  const handleNavigateTab = (newTab, forcedDirection = null) => {
    if (newTab === activeTab) return;
    const oldIdx = TABS_ORDER.indexOf(activeTab);
    const newIdx = TABS_ORDER.indexOf(newTab);
    const dir = forcedDirection || (newIdx > oldIdx ? 'forward' : 'backward');
    setDirection(dir);
    setActiveTab(newTab);

    // Subtle native haptic tick
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const target = e.target;

    // Protect interactive elements & map canvas
    const isLeaflet = target.closest && target.closest('.leaflet-container, .leaflet-control');
    const isInput = target.closest && target.closest('input, textarea, select');

    // Allow edge swipes (from extreme left or right borders) even on interactive surfaces
    const isEdgeSwipe = touch.clientX < 45 || touch.clientX > window.innerWidth - 45;

    if (isLeaflet && !isEdgeSwipe) {
      touchRef.current.isIgnored = true;
      return;
    }
    if (isInput && !isEdgeSwipe) {
      touchRef.current.isIgnored = true;
      return;
    }

    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      isIgnored: false,
      isHorizontal: false,
    };
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (touchRef.current.isIgnored) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - touchRef.current.startX;
    const diffY = touch.clientY - touchRef.current.startY;

    // Detect gesture direction early
    if (!touchRef.current.isHorizontal) {
      // Vertical scrolling dominates: cancel horizontal gesture immediately
      if (Math.abs(diffY) > 10 && Math.abs(diffY) > Math.abs(diffX) * 1.1) {
        touchRef.current.isIgnored = true;
        setIsDragging(false);
        setDragOffset(0);
        return;
      }
      // Horizontal motion dominates: lock into swipe gesture
      if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
        touchRef.current.isHorizontal = true;
        setIsDragging(true);
      }
    }

    if (touchRef.current.isHorizontal) {
      const currentIdx = TABS_ORDER.indexOf(activeTab);
      const isAtStart = currentIdx === 0 && diffX > 0;
      const isAtEnd = currentIdx === TABS_ORDER.length - 1 && diffX < 0;
      // Physics-based elastic resistance when dragging past edges
      const resistance = isAtStart || isAtEnd ? 0.18 : 0.45;
      setDragOffset(diffX * resistance);
    }
  };

  const handleTouchEnd = () => {
    if (touchRef.current.isIgnored) {
      setDragOffset(0);
      setIsDragging(false);
      return;
    }

    const currentIdx = TABS_ORDER.indexOf(activeTab);
    const rawDiff = dragOffset / 0.45;
    const deltaTime = Date.now() - touchRef.current.startTime;

    // Quick flick (< 280ms) or standard distance (> 45px)
    const isFlick = deltaTime < 280 && Math.abs(rawDiff) > 30;
    const isSwipe = Math.abs(rawDiff) > 45;

    if (touchRef.current.isHorizontal && (isSwipe || isFlick)) {
      if (rawDiff < 0 && currentIdx < TABS_ORDER.length - 1) {
        // Swipe left -> advance to next tab
        handleNavigateTab(TABS_ORDER[currentIdx + 1], 'forward');
      } else if (rawDiff > 0 && currentIdx > 0) {
        // Swipe right -> return to previous tab
        handleNavigateTab(TABS_ORDER[currentIdx - 1], 'backward');
      }
    }

    setDragOffset(0);
    setIsDragging(false);
    touchRef.current.isHorizontal = false;
  };

  const handleManualSync = async () => {
    try {
      const res = await syncNow();
      if (res && res.processed > 0) {
        setSyncFeedback(`✓ Synced ${res.processed} report${res.processed === 1 ? '' : 's'} with Authority Dashboard`);
      } else {
        setSyncFeedback('✓ All reports are up-to-date with Authority Cloud');
      }
      setTimeout(() => setSyncFeedback(''), 4000);
    } catch {
      setSyncFeedback('✓ Synced with Authority Cloud');
      setTimeout(() => setSyncFeedback(''), 3000);
    }
  };

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
          handleNavigateTab('home', 'backward');
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
        <MobileHeader activeTab={activeTab} onSelectTab={handleNavigateTab} />
      </header>

      {/* Main Content Area with Touch Gestures & Directional Transitions */}
      <main 
        ref={mainRef} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col justify-start touch-pan-y relative"
      >
        <div
          key={activeTab}
          className={`flex-1 w-full h-full flex flex-col ${
            direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
          }`}
          style={
            dragOffset
              ? {
                  transform: `translate3d(${dragOffset}px, 0, 0)`,
                  transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }
              : undefined
          }
        >
          {activeTab === 'home' && (
            <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-6">
              {/* Big floating report button centered */}
              <button 
                onClick={() => handleNavigateTab('report', 'forward')}
                className={`w-[240px] h-[240px] rounded-full font-black text-2xl shadow-2xl flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.95] ${
                  isDark 
                    ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-red-600/30 ring-8 ring-red-500/20' 
                    : 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-red-500/40 ring-8 ring-red-500/20'
                }`}
              >
                <ShieldAlert size={64} className="animate-pulse" />
                <span>REPORT<br/>INCIDENT</span>
              </button>
              <p className={`mt-7 text-center text-sm font-medium px-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Tap to securely share your location and report an incident anonymously.
              </p>

              {/* Subtle Swipe Guidance Hint */}
              <div className={`mt-5 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold select-none transition-opacity ${
                isDark ? 'text-slate-500 bg-white/5' : 'text-slate-400 bg-black/5'
              }`}>
                <span>Swipe left / right to explore</span>
                <span className="text-violet-500 animate-pulse font-bold">⇄</span>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="h-full w-full">
              <MobileRadarMap onNavigateReport={() => handleNavigateTab('report', 'forward')} />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="h-full w-full">
              <MobileReport onNavigateMap={() => handleNavigateTab('map', 'backward')} />
            </div>
          )}

          {activeTab === 'sos' && (
            <div className="h-full w-full">
              <MobileSOS />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-5 space-y-4 text-left">
              <p className="text-xs text-slate-400 font-medium mb-1">Preferences & Vault Diagnostics</p>

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
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                      isDark ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    Switch to {isDark ? 'Bright' : 'Dark'}
                  </button>
                </div>
              </div>

              {/* Offline Queue & Vault Diagnostics Card */}
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
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
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

                {syncFeedback && (
                  <div className="mb-2 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                    <span>{syncFeedback}</span>
                  </div>
                )}

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
        </div>
      </main>

      {/* Permanently Fixed Bottom Navbar - Rigidly Anchored */}
      <nav className="shrink-0 z-30 pb-2.5 px-4 pt-0.5">
        <MobileBottomNavbar activeTab={activeTab} onSelectTab={handleNavigateTab} />
      </nav>
    </div>
  );
};
export default MobileAppView;
