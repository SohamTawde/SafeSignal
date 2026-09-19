import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { Capacitor } from '@capacitor/core';

export const MobileStatusBar = () => {
  const { isDark } = useMobileTheme();
  const [time, setTime] = useState('');
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  // On a real phone, the Android OS already renders the real status bar
  if (isNative) return null;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-full px-6 pt-3 pb-1 flex justify-between items-center text-xs font-semibold tracking-tight transition-colors duration-200 select-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <span>{time || '9:41 AM'}</span>
      <div className="flex items-center gap-1.5 opacity-90">
        <Signal size={13} strokeWidth={2.5} />
        <Wifi size={13} strokeWidth={2.5} />
        <div className="flex items-center gap-0.5">
          <BatteryMedium size={18} strokeWidth={2.2} className="rotate-90" />
        </div>
      </div>
    </div>
  );
};
