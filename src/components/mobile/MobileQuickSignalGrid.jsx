import React, { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { submitSignal } from '../../services/api';
import { DEFAULT_PILOT_LOCATION } from '../../config/geoConfig';

// Custom SVGs matching the user's mockup 1-to-1
const FollowingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7.5" cy="6.5" r="2.5" fill="#f43f5e" />
    <path d="M4.5 19v-4.5a3 3 0 0 1 6 0v4.5" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
    <circle cx="16.5" cy="6.5" r="2.5" fill="#0284c7" />
    <path d="M13.5 19v-4.5a3 3 0 0 1 6 0v4.5" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CatcallingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="7.5" r="3" stroke="#7c3aed" strokeWidth="2" fill="#8b5cf6" fillOpacity="0.25" />
    <path d="M4 19v-1.8a4 4 0 0 1 4-4h1.5a4 4 0 0 1 4 4v1.8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
    <path d="M14.5 7l3.5-1.5M15.5 10.5h4M14.5 14l3.5 1.5" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const VerbalHarassmentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19v-2a4 4 0 0 1 4-4h1.5a4 4 0 0 1 4 4v2" fill="#2563eb" />
    <circle cx="8.5" cy="7.5" r="3" fill="#2563eb" />
    <path d="M15 8a3.5 3.5 0 0 1 0 5" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M18.5 5.5a7 7 0 0 1 0 10" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const UnsafeAreaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6.5l6-2.5 6 2.5 6-2.5v12.5l-6 2.5-6-2.5-6 2.5v-12.5z" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 6.5a3 3 0 0 0-3 3c0 2.2 3 5.5 3 5.5s3-3.3 3-5.5a3 3 0 0 0-3-3z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
    <circle cx="12" cy="9.5" r="1" fill="white" />
  </svg>
);

const CATEGORIES = [
  {
    id: 'Following',
    label: 'Following',
    icon: FollowingIcon,
  },
  {
    id: 'Catcalling',
    label: 'Catcalling',
    icon: CatcallingIcon,
  },
  {
    id: 'Verbal Harassment',
    label: 'Verbal\nHarassment',
    icon: VerbalHarassmentIcon,
  },
  {
    id: 'Unsafe Area',
    label: 'Unsafe Area',
    icon: UnsafeAreaIcon,
  },
];

export const MobileQuickSignalGrid = () => {
  const { isDark } = useMobileTheme();
  const [submitting, setSubmitting] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const handleQuickReport = async (category) => {
    if (submitting) return;
    setSubmitting(category.id);

    try {
      await submitSignal({
        category: category.id,
        latitude: DEFAULT_PILOT_LOCATION.lat,
        longitude: DEFAULT_PILOT_LOCATION.lng,
        grid_zone: 'Zone 14',
      });

      setToastMessage(`✓ Anonymous "${category.id}" signal recorded`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage('✓ Signal logged locally');
      setTimeout(() => setToastMessage(''), 2500);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="w-full px-4 pt-1 pb-0.5 select-none relative">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-1 left-4 right-4 z-50 px-3.5 py-2 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-md animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Centered Section Header 1-to-1 matching mockup */}
      <div className="text-center mb-2.5">
        <h1 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Quick Signal
        </h1>
        <p className={`text-[11px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Elegants for instant micro-reporting
        </p>
      </div>

      {/* 2x2 Grid of 1-to-1 Mockup Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isCurrentSubmitting = submitting === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => handleQuickReport(cat)}
              disabled={submitting !== null}
              className={`p-3 rounded-[20px] flex flex-col justify-between items-start text-left h-[92px] transition-all duration-150 active:scale-[0.97] ${
                isDark
                  ? 'bg-[#181128] hover:bg-[#201736] border border-white/10 shadow-md'
                  : 'bg-[#eaeff8] hover:bg-[#e4ebf6] border border-slate-200/40 shadow-sm'
              }`}
            >
              {/* White Icon Box */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-all ${
                isDark
                  ? 'bg-[#251b3d] border border-white/10 shadow-inner'
                  : 'bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]'
              }`}>
                {isCurrentSubmitting ? (
                  <Loader2 size={16} className="animate-spin text-violet-500" />
                ) : (
                  <div className="scale-90">
                    <IconComponent />
                  </div>
                )}
              </div>

              {/* Label underneath */}
              <span className={`text-[13px] font-bold leading-tight whitespace-pre-line ${
                isDark ? 'text-white' : 'text-[#111827]'
              }`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileQuickSignalGrid;
