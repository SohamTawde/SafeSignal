import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldAlert, Activity, Filter, RefreshCw } from 'lucide-react';
import { MapPanel } from '../components/MapPanel';
import { GlassCard } from '../components/GlassCard';
import { getSafetyZones } from '../services/api';
import { supabase } from '../lib/supabase';

const getActivityColor = (level) => {
  switch (level) {
    case 'high_priority': return '#ef4444';
    case 'under_review': return '#f97316';
    case 'emerging': return '#eab308';
    case 'low':
    default: return '#10b981';
  }
};

const formatActivityLevel = (level) => {
  if (!level) return 'Low';
  return level.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const SafetyMap = () => {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchZones = async () => {
    try {
      const data = await getSafetyZones();
      const formattedZones = data.map(z => ({
        id: z.id,
        name: z.zone_name || z.grid_zone,
        center: [z.center_lat, z.center_lng],
        activityLevel: formatActivityLevel(z.activity_level),
        color: getActivityColor(z.activity_level),
        trustScore: 'N/A', // Pulled from patterns if we expand this
        categories: ['Varies'],
        timeRange: 'Recent'
      }));
      setZones(formattedZones);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();

    // Realtime subscription for safety_zones
    const subscription = supabase
      .channel('public:safety_zones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_zones' }, () => {
        // Refresh zones when changes occur
        fetchZones();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[#0b0710] font-sans relative overflow-hidden">
      
      {/* Map Header */}
      <header className="h-16 px-4 flex items-center justify-between border-b border-white/5 bg-[#150f24]/80 backdrop-blur-md relative z-10">
        <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-white flex items-center gap-2">
          <ChevronLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-violet-500" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">Live Safety Grid</span>
        </div>
        <button className="p-2 text-slate-400 hover:text-violet-400 flex items-center gap-2" onClick={fetchZones}>
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> 
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* The Map itself */}
        <div className="absolute inset-0 z-0 bg-[#0b0710]">
          {!loading && <MapPanel zones={zones} onZoneClick={(zone) => setSelectedZone(zone)} />}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 z-10">
          <GlassCard className="p-3 py-2 space-y-2 !rounded-xl hidden sm:block">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 border-b border-white/5 pb-1">Activity Level</h3>
            {[
              { label: 'High Priority Pattern', color: 'bg-red-500' },
              { label: 'Under Review', color: 'bg-orange-500' },
              { label: 'Emerging Activity', color: 'bg-yellow-500' },
              { label: 'Low Activity', color: 'bg-emerald-500' }
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${l.color}`}></div>
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{l.label}</span>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Bottom Panel Overlay (when zone is selected) */}
        {selectedZone && (
          <div className="absolute bottom-0 left-0 w-full sm:bottom-6 sm:left-6 sm:w-96 z-20 animate-in slide-in-from-bottom-8 duration-300">
             <GlassCard className="!rounded-b-none sm:!rounded-2xl border-b-0 sm:border-b border-white/5 pb-8 sm:pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Safety Zone</h3>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">{selectedZone.name}</h2>
                  </div>
                  <button onClick={() => setSelectedZone(null)} className="text-slate-500 hover:text-white bg-white/5 rounded-full p-1">
                    <ChevronLeft size={16} className="rotate-[-90deg]" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity Level</span>
                    <span className="text-xs font-bold uppercase" style={{ color: selectedZone.color }}>{selectedZone.activityLevel}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Range</span>
                    <span className="text-xs font-bold text-slate-300 uppercase">{selectedZone.timeRange}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trust Score</span>
                    <span className="text-xs font-bold text-white bg-violet-600/20 px-2 py-1 rounded">{selectedZone.trustScore}</span>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Categories</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedZone.categories.map(cat => (
                        <span key={cat} className="text-[9px] font-bold uppercase tracking-wider bg-white/5 text-slate-300 px-2 py-1 rounded border border-white/5">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
             </GlassCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default SafetyMap;
