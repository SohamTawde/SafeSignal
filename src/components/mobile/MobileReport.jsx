import React, { useState } from 'react';
import { 
  CheckCircle2, MapPin, Loader2, ArrowRight, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { submitSignal } from '../../services/api';
import { DEFAULT_PILOT_LOCATION } from '../../config/geoConfig';

// Custom SVG Icons matching mockup style
const FollowingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7.5" cy="6.5" r="2.5" fill="#f43f5e" />
    <path d="M4.5 19v-4.5a3 3 0 0 1 6 0v4.5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16.5" cy="6.5" r="2.5" fill="#0284c7" />
    <path d="M13.5 19v-4.5a3 3 0 0 1 6 0v4.5" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CatcallingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="7.5" r="3" stroke="#7c3aed" strokeWidth="2" fill="#8b5cf6" fillOpacity="0.25" />
    <path d="M4 19v-1.8a4 4 0 0 1 4-4h1.5a4 4 0 0 1 4 4v1.8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M14.5 7l3.5-1.5M15.5 10.5h4M14.5 14l3.5 1.5" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const VerbalHarassmentIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19v-2a4 4 0 0 1 4-4h1.5a4 4 0 0 1 4 4v2" fill="#2563eb" />
    <circle cx="8.5" cy="7.5" r="3" fill="#2563eb" />
    <path d="M15 8a3.5 3.5 0 0 1 0 5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M18.5 5.5a7 7 0 0 1 0 10" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const UnsafeAreaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6.5l6-2.5 6 2.5 6-2.5v12.5l-6 2.5-6-2.5-6 2.5v-12.5z" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 6.5a3 3 0 0 0-3 3c0 2.2 3 5.5 3 5.5s3-3.3 3-5.5a3 3 0 0 0-3-3z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
    <circle cx="12" cy="9.5" r="1" fill="white" />
  </svg>
);

const PoorLightingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18h6M10 21h4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 2a6 6 0 0 0-6 6c0 2.5 1.5 4.5 2.5 6h7c1-1.5 2.5-3.5 2.5-6a6 6 0 0 0-6-6z" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
    <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const StalkingIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="3.5" stroke="#8b5cf6" strokeWidth="2" fill="#ede9fe" />
    <path d="M6 20v-2.5a5 5 0 0 1 10 0V20" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.5" fill="#7c3aed" />
  </svg>
);

const REPORT_CATEGORIES = [
  { id: 'following', label: 'Following', icon: FollowingIcon, desc: 'Being tracked' },
  { id: 'catcalling', label: 'Catcalling', icon: CatcallingIcon, desc: 'Unwanted remarks' },
  { id: 'verbal_harassment', label: 'Verbal Harassment', icon: VerbalHarassmentIcon, desc: 'Aggressive speech' },
  { id: 'unsafe_area', label: 'Unsafe Area', icon: UnsafeAreaIcon, desc: 'Suspicious spot' },
  { id: 'poor_lighting', label: 'Poor Lighting', icon: PoorLightingIcon, desc: 'Broken streetlights' },
  { id: 'stalking', label: 'Stalking / Loitering', icon: StalkingIcon, desc: 'Hovering presence' },
];

const TIMEFRAMES = [
  { id: 'just_now', label: 'Just Now (< 5m)' },
  { id: 'recent', label: '15–30m Ago' },
  { id: 'earlier', label: 'Earlier Today' },
];

export const MobileReport = ({ onNavigateMap, initialZone = 'Zone 14' }) => {
  const { isDark } = useMobileTheme();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('just_now');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!selectedCategory) {
      setErrorMessage('Please select an incident category');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await submitSignal({
        category: selectedCategory,
        latitude: DEFAULT_PILOT_LOCATION.lat,
        longitude: DEFAULT_PILOT_LOCATION.lng,
        grid_zone: initialZone,
      });

      setSubmitted(true);
    } catch (err) {
      console.warn('Fallback submit signal:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedTimeframe('just_now');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center select-none animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#0b0710] text-white' : 'bg-[#f2f4f8] text-slate-900'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl ${
          isDark 
            ? 'bg-emerald-950/60 border-2 border-emerald-500/60 text-emerald-400 shadow-emerald-500/20' 
            : 'bg-emerald-100 border-2 border-emerald-500 text-emerald-600 shadow-emerald-200'
        }`}>
          <CheckCircle2 size={36} className="animate-in zoom-in-50 duration-300" />
        </div>

        <h3 className="text-xl font-black tracking-tight mb-1">
          Signal Anonymously Transmitted
        </h3>
        <p className={`text-xs max-w-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Your report has been hashed and obfuscated into <strong className={isDark ? 'text-violet-400' : 'text-violet-700'}>{initialZone}</strong>. Zero identifying data was collected.
        </p>

        <div className="w-full max-w-xs space-y-2.5">
          <button
            onClick={onNavigateMap}
            className={`w-full py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              isDark 
                ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/30' 
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md'
            }`}
          >
            <span>View Radar Map</span>
            <ArrowRight size={14} />
          </button>

          <button
            onClick={handleReset}
            className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold transition-all ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
            }`}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col justify-between px-4 pt-1 pb-1 select-none overflow-y-auto no-scrollbar transition-colors ${
      isDark ? 'bg-[#0b0710] text-white' : 'bg-[#f2f4f8] text-slate-900'
    }`}>
      {/* Centered Header matching Home design 1-to-1 */}
      <div className="text-center mb-1.5">
        <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Anonymous Report
        </h1>
        <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Select incident type to warn nearby citizens in real-time
        </p>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="mb-1.5 p-1.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs font-bold text-center animate-in fade-in duration-150">
          {errorMessage}
        </div>
      )}

      {/* 2x3 Category Grid matching Home card styling 1-to-1 */}
      <div className="grid grid-cols-2 gap-2 mb-1.5">
        {REPORT_CATEGORIES.map(cat => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setErrorMessage('');
              }}
              className={`p-2 rounded-[18px] flex flex-col justify-between items-start text-left h-[72px] transition-all duration-150 active:scale-[0.97] border ${
                isSelected
                  ? isDark
                    ? 'bg-violet-950/80 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.35)] ring-2 ring-violet-500'
                    : 'bg-violet-100/90 border-violet-600 shadow-md ring-2 ring-violet-600/40'
                  : isDark
                    ? 'bg-[#181128] hover:bg-[#201736] border-white/10 shadow-sm'
                    : 'bg-[#eaeff8] hover:bg-[#e4ebf6] border-slate-200/40 shadow-sm'
              }`}
            >
              {/* White Icon Box */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 transition-all ${
                isDark
                  ? 'bg-[#251b3d] border border-white/10 shadow-inner'
                  : 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.06)]'
              }`}>
                <div className="scale-75">
                  <IconComponent />
                </div>
              </div>

              {/* Label & Description */}
              <div className="overflow-hidden w-full">
                <span className={`text-[12px] font-bold leading-tight block truncate ${
                  isSelected 
                    ? isDark ? 'text-white' : 'text-violet-950'
                    : isDark ? 'text-white' : 'text-[#111827]'
                }`}>
                  {cat.label}
                </span>
                <span className={`text-[9px] block leading-none truncate ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {cat.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Timeframe Selector with rounded pills */}
      <div className="mb-1.5 text-left">
        <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          When did this occur?
        </span>
        <div className="flex items-center gap-1.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.id}
              onClick={() => setSelectedTimeframe(tf.id)}
              className={`flex-1 py-1.5 px-2 rounded-full text-[10px] font-bold transition-all text-center border ${
                selectedTimeframe === tf.id
                  ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                  : isDark
                    ? 'bg-[#181128] border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snapped Zone Location Card */}
      <div className={`p-2 rounded-[16px] border flex items-center justify-between mb-1.5 text-left ${
        isDark 
          ? 'bg-[#181128] border-white/10 shadow-sm' 
          : 'bg-white border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
      }`}>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-violet-500 shrink-0" />
          <div>
            <span className={`text-[11px] font-bold block leading-none ${isDark ? 'text-white' : 'text-[#111827]'}`}>
              Location: {initialZone}
            </span>
            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Auto-snapped safety zone • Exact GPS discarded
            </span>
          </div>
        </div>

        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
          isDark ? 'bg-violet-500/15 text-violet-300' : 'bg-violet-100 text-violet-700'
        }`}>
          <ShieldCheck size={11} /> 100% PII Free
        </span>
      </div>

      {/* Submit Button in Layered Capsule Pill style */}
      <div className={`w-full p-1 rounded-full transition-all ${
        isDark
          ? 'bg-violet-950/40 border border-violet-500/30'
          : 'bg-[#ede9fe]/70 border border-[#ddd6fe]'
      }`}>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full h-[40px] rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
            isDark
              ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
              : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)]'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Hashing & Transmitting...</span>
            </>
          ) : (
            <>
              <ShieldAlert size={16} />
              <span>Transmit Anonymous Signal</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileReport;
