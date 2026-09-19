import React, { useState, useRef } from 'react';
import { Siren, PhoneCall } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';

export const MobileEmergencyButton = () => {
  const { isDark } = useMobileTheme();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sosActivated, setSosActivated] = useState(false);
  const [statusText, setStatusText] = useState('');
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  const HOLD_DURATION_MS = 2500; // 2.5 seconds hold for emergency trigger

  const startHold = (e) => {
    e.preventDefault();
    if (sosActivated) return;
    setHolding(true);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(timerRef.current);
        triggerEmergency();
      }
    }, 25);
  };

  const endHold = () => {
    if (sosActivated) return;
    setHolding(false);
    clearInterval(timerRef.current);
    if (progress < 100 && progress > 5) {
      setStatusText('Hold continuously to trigger SOS');
      setTimeout(() => setStatusText(''), 2000);
    }
    setProgress(0);
  };

  const triggerEmergency = () => {
    setSosActivated(true);
    setHolding(false);
    setProgress(100);
  };

  return (
    <div className="w-full px-4 py-1 select-none">
      {/* SOS Activated Fullscreen Modal */}
      {sosActivated && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-[#16060c] border border-red-500/50 rounded-3xl p-6 text-center text-white shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Siren size={32} className="text-red-400 animate-pulse" />
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tight text-red-400 mb-1">
              Emergency SOS Active
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Dispatching live location (Zone 14) and silent alerts to emergency network.
            </p>

            <div className="space-y-3 mb-6">
              <a 
                href="tel:911"
                className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 text-sm uppercase tracking-wider"
              >
                <PhoneCall size={18} /> Call 911 Direct
              </a>

              <a
                href="sms:911?body=EMERGENCY:%20I%20need%20immediate%20assistance.%20Current%20location:%20SafeSignal%20Zone%2014"
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold flex items-center justify-center gap-2 border border-white/20 text-xs uppercase tracking-wider"
              >
                Send Emergency SMS
              </a>
            </div>

            <button
              onClick={() => {
                setSosActivated(false);
                setProgress(0);
              }}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition uppercase tracking-widest"
            >
              Cancel Alert (I am safe)
            </button>
          </div>
        </div>
      )}

      {/* Helper Status text */}
      {statusText && (
        <p className="text-[11px] font-bold text-rose-500 text-center mb-1 animate-pulse">
          {statusText}
        </p>
      )}

      {/* Layered Outer Capsule matching mockup 1-to-1 */}
      <div className={`w-full p-1 rounded-full transition-all ${
        isDark
          ? 'bg-red-950/30 border border-red-500/20'
          : 'bg-[#fee2e2]/70 border border-[#fecaca]'
      }`}>
        {/* Inner Solid Red Capsule Button */}
        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className={`relative w-full h-[42px] rounded-full flex items-center justify-center overflow-hidden transition-all duration-150 active:scale-[0.99] ${
            isDark
              ? 'bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#dc2626] text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
              : 'bg-gradient-to-r from-[#ff4d4f] via-[#ff5a5c] to-[#ff4d4f] text-white shadow-[0_4px_14px_rgba(255,77,79,0.35)]'
          }`}
        >
          {/* Progress Fill Indicator */}
          <div 
            className="absolute inset-0 bg-red-800/50 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />

          {/* Centered Mockup Label Text */}
          <span className="relative z-10 font-extrabold text-[13px] sm:text-sm uppercase tracking-wider drop-shadow-sm">
            {holding ? `HOLDING... ${Math.ceil((HOLD_DURATION_MS - (progress / 100) * HOLD_DURATION_MS) / 1000)}s` : 'HOLD FOR EMERGENCY SOS'}
          </span>
        </button>
      </div>
    </div>
  );
};
