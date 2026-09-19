import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Settings as SettingsIcon, Bell, Shield, Map as MapIcon, Check, RotateCcw } from 'lucide-react';
import { DEFAULT_PILOT_LOCATION } from '../../config/geoConfig';

const DEFAULT_SETTINGS = {
  activePilot: DEFAULT_PILOT_LOCATION.name,
  gridResolution: "20 Meters (Approximate)",
  patternThreshold: 3,
  highTrustBaseline: 80,
  slaDeadlineHours: 4,
  smsAlerts: true,
  emailDigest: false
};

const Settings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('safesignal_authority_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('safesignal_authority_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('safesignal_authority_settings');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">System Settings</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform & Algorithm Configuration</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <Check size={14} /> Saved
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw size={14} className="mr-1" /> Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Pilot Zone Config */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <MapIcon size={20} className="text-violet-400" />
            <h2 className="text-lg font-bold uppercase text-white tracking-tighter">Pilot Zone Configuration</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
             <div className="flex justify-between items-center py-2">
               <span>Active Pilot Zone</span>
               <span className="font-bold text-white bg-white/10 px-3 py-1 rounded">{settings.activePilot}</span>
             </div>
             <div className="flex justify-between items-center py-2">
               <span>Map Grid Resolution</span>
               <span className="font-bold text-white bg-white/10 px-3 py-1 rounded">{settings.gridResolution}</span>
             </div>
          </div>
        </GlassCard>

        {/* Algorithm Thresholds */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <Shield size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold uppercase text-white tracking-tighter">Algorithm Thresholds</h2>
          </div>
          <div className="space-y-6 text-sm text-slate-300">
             <div>
               <div className="flex justify-between items-center mb-2">
                 <span>Emerging Pattern Signal Count Threshold</span>
                 <span className="font-bold text-white bg-blue-500/20 text-blue-300 px-3 py-1 rounded">
                   &ge; {settings.patternThreshold} signals / 24h
                 </span>
               </div>
               <input
                 type="range"
                 min="1"
                 max="10"
                 value={settings.patternThreshold}
                 onChange={(e) => setSettings({ ...settings, patternThreshold: Number(e.target.value) })}
                 className="w-full accent-blue-500 cursor-pointer"
               />
             </div>

             <div>
               <div className="flex justify-between items-center mb-2">
                 <span>High Trust Baseline Confidence</span>
                 <span className="font-bold text-white bg-violet-500/20 text-violet-300 px-3 py-1 rounded">
                   {settings.highTrustBaseline}%
                 </span>
               </div>
               <input
                 type="range"
                 min="50"
                 max="95"
                 step="5"
                 value={settings.highTrustBaseline}
                 onChange={(e) => setSettings({ ...settings, highTrustBaseline: Number(e.target.value) })}
                 className="w-full accent-violet-500 cursor-pointer"
               />
             </div>

             <div className="flex justify-between items-center py-2 border-t border-white/5 pt-4">
               <span>Review Queue SLA Target</span>
               <span className="font-bold text-white bg-white/10 px-3 py-1 rounded">{settings.slaDeadlineHours} Hours</span>
             </div>
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard>
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <Bell size={20} className="text-magenta-400" />
            <h2 className="text-lg font-bold uppercase text-white tracking-tighter">Notifications & Dispatch</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
             <div className="flex justify-between items-center py-2">
               <div>
                 <div className="font-bold text-white">SMS Alerts (Critical Patterns)</div>
                 <div className="text-[11px] text-slate-500">Dispatch instant SMS when Trust Score &gt; {settings.highTrustBaseline}%</div>
               </div>
               <button
                 onClick={() => setSettings({ ...settings, smsAlerts: !settings.smsAlerts })}
                 className={`w-12 h-6 rounded-full transition-colors relative ${settings.smsAlerts ? 'bg-violet-600' : 'bg-white/10'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.smsAlerts ? 'right-1' : 'left-1'}`} />
               </button>
             </div>

             <div className="flex justify-between items-center py-2 border-t border-white/5 pt-4">
               <div>
                 <div className="font-bold text-white">Daily Summary Digest</div>
                 <div className="text-[11px] text-slate-500">Daily midnight briefing of emerging spatio-temporal trends</div>
               </div>
               <button
                 onClick={() => setSettings({ ...settings, emailDigest: !settings.emailDigest })}
                 className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailDigest ? 'bg-violet-600' : 'bg-white/10'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.emailDigest ? 'right-1' : 'left-1'}`} />
               </button>
             </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Settings;
