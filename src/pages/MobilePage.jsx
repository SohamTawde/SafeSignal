import React, { useEffect } from 'react';
import { MobileThemeProvider } from '../contexts/MobileThemeContext';
import { MobileDeviceFrame } from '../components/mobile/MobileDeviceFrame';
import { MobileAppView } from './mobile/MobileAppView';
import { Capacitor } from '@capacitor/core';
import { Download, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobilePage = () => {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();
  const navigate = useNavigate();

  useEffect(() => {
    // When visited on website (not native app), automatically trigger APK download
    if (!isNative) {
      const link = document.createElement('a');
      link.href = '/safesignal.apk';
      link.setAttribute('download', 'safesignal.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [isNative]);

  // On actual physical phone / native platform, render edge-to-edge native mobile app
  if (isNative) {
    return (
      <MobileThemeProvider>
        <MobileDeviceFrame>
          <MobileAppView />
        </MobileDeviceFrame>
      </MobileThemeProvider>
    );
  }

  // On website, instead of showing the mobile app frame, show automatic download & installation hub
  return (
    <div className="min-h-screen bg-[#06030a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-3xl p-7 shadow-2xl relative z-10 flex flex-col items-center text-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] mb-5">
          <Download size={28} className="text-white animate-bounce" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-[11px] font-bold uppercase tracking-wider mb-3">
          <CheckCircle2 size={13} className="text-violet-400" /> Downloading SafeSignal APK
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Installing SafeSignal Android App
        </h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Your direct APK download should begin automatically in your browser.
        </p>

        {/* Manual Download Button */}
        <a
          href="/safesignal.apk"
          download="safesignal.apk"
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all mb-5 active:scale-[0.98]"
        >
          <Download size={18} /> Download SafeSignal APK (54 MB)
        </a>

        {/* 3 Step Installation Guide */}
        <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left space-y-3 mb-6">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Simple 3-Step Installation:
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
            <span>Tap <strong>Open</strong> or find <strong>safesignal.apk</strong> in your Downloads.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
            <span>If prompted by Android, tap <strong>Settings</strong> & toggle <strong>Allow from this source</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
            <span>Tap <strong>Install</strong> to launch the native SafeSignal mobile application.</span>
          </div>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition font-medium"
        >
          <ArrowLeft size={14} /> Return to SafeSignal Web
        </button>
      </div>
    </div>
  );
};

export default MobilePage;

