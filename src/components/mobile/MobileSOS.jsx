import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, ShieldAlert, MessageSquare, Volume2, VolumeX, CheckCircle2, Siren 
} from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';

export const MobileSOS = ({ initialZone = 'Zone 14' }) => {
  const { isDark } = useMobileTheme();
  const [countdown, setCountdown] = useState(null);
  const [sosSent, setSosSent] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // 5-second countdown timer
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setSosSent(true);
      setCountdown(null);
    }
  }, [countdown]);

  // Audio Siren Generator via Web Audio API (tactile deterrent)
  const toggleSiren = () => {
    if (sirenPlaying) {
      try {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
      } catch (e) {}
      setSirenPlaying(false);
    } else {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);

        let freq = 800;
        let up = true;
        const interval = setInterval(() => {
          if (!oscillatorRef.current) {
            clearInterval(interval);
            return;
          }
          freq = up ? freq + 60 : freq - 60;
          if (freq >= 1200) up = false;
          if (freq <= 700) up = true;
          try {
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
          } catch (e) {}
        }, 50);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setSirenPlaying(true);
      } catch (err) {
        console.warn('Audio Siren not supported:', err);
      }
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {}
      }
    };
  }, []);

  const emergencySmsBody = encodeURIComponent(
    `EMERGENCY ALERT: I am in danger. My SafeSignal safety zone is: ${initialZone}. Please send immediate assistance.`
  );
  const emergencySmsHref = `sms:911?body=${emergencySmsBody}`;

  return (
    <div className={`w-full h-full flex flex-col justify-between px-4 pt-1 pb-1 select-none overflow-y-auto no-scrollbar transition-colors ${
      isDark ? 'bg-[#0b0710] text-white' : 'bg-[#f2f4f8] text-slate-900'
    }`}>
      {/* Centered Header matching Home design 1-to-1 */}
      <div className="text-center mb-2">
        <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-rose-400' : 'text-[#dc2626]'}`}>
          Emergency SOS Hub
        </h1>
        <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Direct emergency escalation & instant alarm triggers
        </p>
      </div>

      {/* Countdown State */}
      {countdown !== null ? (
        <div className={`p-5 rounded-[26px] border text-center my-auto animate-in zoom-in-95 duration-200 ${
          isDark 
            ? 'bg-[#1e070c] border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.35)]' 
            : 'bg-white border-red-300 shadow-xl'
        }`}>
          <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center mx-auto mb-2 animate-ping">
            <span className="text-3xl font-black text-red-500">{countdown}</span>
          </div>

          <h3 className="text-base font-black uppercase text-red-500 mb-1">
            Dispatching Silent SOS
          </h3>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Transmitting coordinates ({initialZone}) to local dispatch network.
          </p>

          <button
            onClick={() => setCountdown(null)}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold uppercase tracking-wider text-slate-300 border border-white/20 transition-all"
          >
            Cancel Dispatch (I am Safe)
          </button>
        </div>
      ) : sosSent ? (
        /* SOS Dispatched State */
        <div className={`p-5 rounded-[26px] border text-center my-auto animate-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#0f1e14] border-emerald-500/40' : 'bg-emerald-50 border-emerald-300'
        }`}>
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>

          <h3 className="text-base font-black text-emerald-500 mb-1">
            Silent SOS Dispatched
          </h3>
          <p className={`text-xs mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Authorities alerted for <strong>{initialZone}</strong>. Responder dispatch initiated.
          </p>

          <button
            onClick={() => setSosSent(false)}
            className="w-full py-2 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
          >
            Reset Status
          </button>
        </div>
      ) : (
        /* Normal SOS Actions View */
        <div className="space-y-2.5 my-auto">
          {/* Main Direct Call 911 Button in Layered Capsule Pill Style */}
          <div className={`w-full p-1 rounded-full transition-all ${
            isDark
              ? 'bg-red-950/30 border border-red-500/20'
              : 'bg-[#fee2e2]/70 border border-[#fecaca]'
          }`}>
            <a
              href="tel:911"
              className={`w-full h-[46px] rounded-full flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider text-white shadow-md active:scale-[0.99] transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                  : 'bg-gradient-to-r from-[#ff4d4f] via-[#ff5a5c] to-[#ff4d4f] shadow-[0_4px_14px_rgba(255,77,79,0.35)]'
              }`}
            >
              <Phone size={18} className="shrink-0 text-white" />
              <span>Call Emergency (911)</span>
            </a>
          </div>

          {/* 2 Secondary Action Cards matching Home card styling */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Silent SOS Trigger Button */}
            <button
              onClick={() => setCountdown(5)}
              className={`p-3 rounded-[20px] flex flex-col justify-between items-start text-left h-[88px] transition-all duration-150 active:scale-[0.97] border ${
                isDark
                  ? 'bg-[#181128] hover:bg-[#201736] border-white/10 shadow-md'
                  : 'bg-[#eaeff8] hover:bg-[#e4ebf6] border-slate-200/40 shadow-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-all ${
                isDark
                  ? 'bg-[#251b3d] border border-white/10 shadow-inner'
                  : 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
              }`}>
                <ShieldAlert size={17} className="text-red-500 shrink-0" />
              </div>

              <div>
                <span className={`text-xs font-bold leading-tight block ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                  Silent Dispatch
                </span>
                <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  5s auto-countdown
                </span>
              </div>
            </button>

            {/* Emergency SMS Fallback Button */}
            <a
              href={emergencySmsHref}
              className={`p-3 rounded-[20px] flex flex-col justify-between items-start text-left h-[88px] transition-all duration-150 active:scale-[0.97] border ${
                isDark
                  ? 'bg-[#181128] hover:bg-[#201736] border-white/10 shadow-md'
                  : 'bg-[#eaeff8] hover:bg-[#e4ebf6] border-slate-200/40 shadow-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 transition-all ${
                isDark
                  ? 'bg-[#251b3d] border border-white/10 shadow-inner'
                  : 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
              }`}>
                <MessageSquare size={17} className="text-rose-500 shrink-0" />
              </div>

              <div>
                <span className={`text-xs font-bold leading-tight block ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                  Emergency SMS
                </span>
                <span className={`text-[9px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Zone coordinates
                </span>
              </div>
            </a>
          </div>

          {/* Audio Siren Deterrent Card */}
          <div className={`p-3 rounded-[20px] border flex items-center justify-between transition-all ${
            isDark 
              ? 'bg-[#181128] border-white/10 shadow-sm' 
              : 'bg-white border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                sirenPlaying 
                  ? 'bg-amber-500 text-black animate-bounce' 
                  : isDark ? 'bg-[#251b3d] text-amber-400' : 'bg-amber-50 text-amber-600'
              }`}>
                <Siren size={17} />
              </div>
              <div>
                <span className={`text-xs font-bold block leading-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>
                  Audible Alarm Siren
                </span>
                <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Loud deterrent through speaker
                </span>
              </div>
            </div>

            <button
              onClick={toggleSiren}
              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all active:scale-95 ${
                sirenPlaying
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : isDark
                    ? 'bg-white/10 hover:bg-white/15 text-amber-300 border border-white/10'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800'
              }`}
            >
              {sirenPlaying ? 'Stop Siren' : 'Sound Alarm'}
            </button>
          </div>
        </div>
      )}

      {/* Emergency Network Directory Card */}
      <div className={`p-3 rounded-[22px] border text-left transition-colors ${
        isDark ? 'bg-[#181128] border-white/10 shadow-sm' : 'bg-white border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
      }`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          Emergency Priority Network
        </span>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>911 Police / Ambulance</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Priority 1
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold">
            <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Transit Security Booth</span>
            <span className="text-[10px] font-mono text-slate-400">
              50m away
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSOS;
