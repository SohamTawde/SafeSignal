import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Radio, AlertTriangle, ShieldAlert, Navigation, Layers } from 'lucide-react';
import { MapPanel } from '../MapPanel';
import { getSafetyZones } from '../../services/api';
import { useMobileTheme } from '../../contexts/MobileThemeContext';

export const MobileRadarMap = ({ onNavigateReport }) => {
  const { isDark } = useMobileTheme();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'alert', 'safe'

  useEffect(() => {
    const loadZones = async () => {
      try {
        const data = await getSafetyZones();
        const formatted = (data || []).map(z => ({
          id: z.id,
          name: z.zone_name || z.grid_zone || 'Zone 14',
          center: [z.center_lat, z.center_lng],
          activityLevel: z.activity_level || 'low',
          color: z.activity_level === 'high_priority' ? '#ef4444' : z.activity_level === 'emerging' ? '#f59e0b' : '#10b981',
          trustScore: z.activity_level === 'high_priority' ? 42 : 94,
          signalsCount: z.activity_level === 'high_priority' ? 3 : 1,
        }));
        setZones(formatted);
        if (formatted.length > 0) {
          setSelectedZone(formatted[0]);
        }
      } catch (err) {
        console.warn('Failed to load zones for mobile radar:', err);
      }
    };
    loadZones();
  }, []);

  const filteredZones = zones.filter(z => {
    if (filter === 'alert') return z.activityLevel === 'high_priority' || z.activityLevel === 'emerging';
    if (filter === 'safe') return z.activityLevel === 'low';
    return true;
  });

  return (
    <div className={`w-full h-full flex flex-col relative select-none ${
      isDark ? 'bg-[#0b0710] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Clean Top Title Bar - No non-functional '<' or refresh buttons */}
      <div className={`px-4 py-2 flex items-center justify-between border-b transition-colors ${
        isDark ? 'bg-[#120b1f] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            isDark ? 'bg-cyan-400 shadow-[0_0_8px_#0ea5e9]' : 'bg-blue-600'
          }`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Live Radar Map
          </span>
        </div>

        {/* Live Status Chip */}
        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
          isDark 
            ? 'bg-violet-950/80 text-violet-300 border border-violet-500/30' 
            : 'bg-violet-50 text-violet-700 border border-violet-200'
        }`}>
          <Radio size={11} className="animate-pulse" />
          <span>Live Safety Radar</span>
        </div>
      </div>

      {/* Map Filter Chips Overlay */}
      <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar z-10">
        {[
          { id: 'all', label: 'All Zones' },
          { id: 'alert', label: '⚠️ Active Alerts' },
          { id: 'safe', label: '🛡️ High Trust Areas' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 ${
              filter === f.id
                ? isDark
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-violet-600 text-white shadow-sm'
                : isDark
                  ? 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interactive Map Surface */}
      <div className="flex-1 w-full relative min-h-[300px]">
        <MapPanel
          zones={filteredZones}
          isDark={isDark}
          onZoneClick={(z) => setSelectedZone(z)}
        />

        {/* Floating Zone Detail Drawer (Bottom of map) */}
        {selectedZone && (
          <div className="absolute bottom-3 left-3 right-3 z-[1000] animate-in slide-in-from-bottom-3 duration-200">
            <div className={`p-3 rounded-2xl border shadow-xl transition-all ${
              isDark
                ? 'bg-[#150f24]/95 backdrop-blur-xl border-white/15 text-white shadow-black/80'
                : 'bg-white/95 backdrop-blur-xl border-slate-200/90 text-slate-900 shadow-slate-200/60'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: selectedZone.color }}
                  />
                  <div>
                    <h4 className="text-xs font-bold leading-tight">
                      {selectedZone.name}
                    </h4>
                    <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Safety Zone Boundary • {selectedZone.signalsCount} Reported Signals
                    </p>
                  </div>
                </div>

                <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  selectedZone.activityLevel === 'high_priority'
                    ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                    : isDark ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedZone.trustScore}% Safety
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="flex items-center gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => onNavigateReport && onNavigateReport(selectedZone.name)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    isDark
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShieldAlert size={12} />
                  <span>Report in this Zone</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
