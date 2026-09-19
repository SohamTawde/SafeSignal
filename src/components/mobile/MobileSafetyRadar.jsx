import React, { useState, useEffect } from 'react';
import { useMobileTheme } from '../../contexts/MobileThemeContext';
import { getSafetyZones } from '../../services/api';

export const MobileSafetyRadar = ({ onOpenFullMap }) => {
  const { isDark } = useMobileTheme();
  const [currentZone, setCurrentZone] = useState({
    name: 'Zone 14',
    status: 'High Trust Area',
    score: 94,
  });

  useEffect(() => {
    const loadZone = async () => {
      try {
        const zones = await getSafetyZones();
        if (zones && zones.length > 0) {
          const z = zones[0];
          setCurrentZone({
            name: z.zone_name || z.grid_zone || 'Zone 14',
            status: z.activity_level === 'high_priority' ? 'High Alert Area' : 'High Trust Area',
            score: z.activity_level === 'high_priority' ? 42 : 94,
          });
        }
      } catch (e) {
        console.warn('Using default zone radar:', e);
      }
    };
    loadZone();
  }, []);

  return (
    <div className="w-full px-4 pt-1 pb-1 select-none">
      {/* Container Card matching mockup 1-to-1 */}
      <div className={`p-3 rounded-[22px] transition-all text-left ${
        isDark 
          ? 'bg-[#181128] border border-white/10 shadow-lg' 
          : 'bg-white border border-slate-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
      }`}>
        {/* Title & Subtitle */}
        <h3 className={`text-base font-bold tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-[#111827]'}`}>
          Live safety zone radar
        </h3>
        <p className={`text-[11px] font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {currentZone.name} • {currentZone.status} • {currentZone.score}% Safety Index
        </p>

        {/* High-fidelity Vector Map Canvas matching mockup */}
        <div 
          onClick={onOpenFullMap}
          className={`relative h-[96px] rounded-xl overflow-hidden cursor-pointer border transition-all ${
            isDark 
              ? 'bg-[#0f0a1c] border-white/10' 
              : 'bg-[#f4f7fb] border-slate-200/70'
          }`}
        >
          {/* Detailed Street Grid Illustration */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Background block fills */}
            <rect width="100%" height="100%" fill={isDark ? '#0e0a1a' : '#f0f4f9'} />
            
            {/* Light pastel park / green space on upper right */}
            <path d="M220 0 L320 0 L300 60 L190 40 Z" fill={isDark ? '#141f23' : '#eaf4eb'} />
            
            {/* Water / shoreline on lower right */}
            <path d="M260 124 L320 80 L320 124 Z" fill={isDark ? '#111e2e' : '#dbeafe'} />

            {/* Angled City Street Grid Pattern */}
            <g stroke={isDark ? '#261c42' : '#ffffff'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              {/* Primary Avenues */}
              <line x1="-20" y1="30" x2="350" y2="20" />
              <line x1="-20" y1="75" x2="350" y2="65" />
              <line x1="-20" y1="110" x2="350" y2="105" />

              {/* Diagonal Cross Streets */}
              <line x1="40" y1="-10" x2="10" y2="140" />
              <line x1="90" y1="-10" x2="60" y2="140" />
              <line x1="140" y1="-10" x2="110" y2="140" />
              <line x1="190" y1="-10" x2="160" y2="140" />
              <line x1="240" y1="-10" x2="210" y2="140" />
              <line x1="290" y1="-10" x2="260" y2="140" />

              {/* Angled Connecting boulevards */}
              <line x1="0" y1="120" x2="200" y2="0" strokeWidth="6" stroke={isDark ? '#312456' : '#ffffff'} />
              <line x1="80" y1="130" x2="280" y2="10" strokeWidth="6" stroke={isDark ? '#312456' : '#ffffff'} />
            </g>

            {/* Inner Street Lines (Subtle Gray) */}
            <g stroke={isDark ? '#1a1330' : '#e2e8f0'} strokeWidth="1.5">
              <line x1="-20" y1="30" x2="350" y2="20" />
              <line x1="-20" y1="75" x2="350" y2="65" />
              <line x1="140" y1="-10" x2="110" y2="140" />
              <line x1="190" y1="-10" x2="160" y2="140" />
            </g>
          </svg>

          {/* Central Blue Radar Concentric Circles & Beacon Dot matching mockup */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              {/* Outer soft blue radar wave */}
              <span className={`animate-pulse absolute inline-flex h-14 w-14 rounded-full ${
                isDark ? 'bg-cyan-500/20' : 'bg-[#0284c7]/20'
              }`} />
              
              {/* Inner semi-translucent blue circle */}
              <span className={`absolute inline-flex h-8 w-8 rounded-full ${
                isDark ? 'bg-cyan-500/30' : 'bg-[#0284c7]/30'
              }`} />

              {/* Solid bright blue beacon dot with white ring */}
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white shadow-md ${
                isDark ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-[#0284c7]'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
