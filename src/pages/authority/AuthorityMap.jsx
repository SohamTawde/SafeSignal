import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPanel } from '../../components/MapPanel';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { getPatterns, getSafetyZones } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { ChevronRight, ShieldAlert, Activity, Users, Clock, AlertTriangle } from 'lucide-react';

const AuthorityMap = () => {
  const navigate = useNavigate();
  const [mapZones, setMapZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchData = async () => {
    try {
      const [patterns, zones] = await Promise.all([
        getPatterns(),
        getSafetyZones()
      ]);

      // Filter to emerging/under_review
      const activePatterns = patterns.filter(p => p.status === 'emerging' || p.status === 'under_review');
      
      const mapped = activePatterns.map((p) => {
        const zoneData = zones.find(z => z.grid_zone === p.grid_zone);
        return {
          ...p,
          id: p.id,
          name: p.grid_zone,
          center: zoneData ? [zoneData.center_lat, zoneData.center_lng] : [51.505, -0.09],
          color: p.trust_score > 80 ? '#ef4444' : p.trust_score > 60 ? '#f97316' : '#eab308'
        };
      });
      setMapZones(mapped);

      // Update selected zone if it was open
      if (selectedZone) {
        const updated = mapped.find(m => m.id === selectedZone.id);
        if (updated) setSelectedZone(updated);
        else setSelectedZone(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    const subscription = supabase
      .channel('authority-map-patterns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_patterns' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="h-full w-full relative flex">
      {/* Map Area */}
      <div className="flex-1 relative z-0">
        <MapPanel zones={mapZones} onZoneClick={(p) => setSelectedZone(p)} />
      </div>

      {/* Side Panel for Selected Pattern */}
      {selectedZone && (() => {
        const selectedPattern = selectedZone;
        const categories = Array.isArray(selectedPattern.categories) ? selectedPattern.categories : [];
        return (
          <div className="w-80 lg:w-96 bg-[#08100d]/95 backdrop-blur-xl border-l border-white/5 h-full absolute right-0 top-0 z-20 shadow-2xl flex flex-col overflow-y-auto no-scrollbar animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 sticky top-0 bg-[#08100d]/95 z-30 flex justify-between items-start">
              <div>
                <div className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest mb-3">
                  <ShieldAlert size={10} /> Pattern {selectedPattern.id ? selectedPattern.id.substring(0, 8) : 'N/A'}
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">
                  {selectedPattern.grid_zone || selectedPattern.name}
                </h2>
              </div>
              <button onClick={() => setSelectedZone(null)} className="p-1 bg-white/5 hover:bg-white/10 rounded-full text-slate-400">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Trust Score</p>
                   <p className={`text-2xl font-black ${selectedPattern.trust_score > 80 ? 'text-red-400' : 'text-orange-400'}`}>
                     {selectedPattern.trust_score ?? 0}%
                   </p>
                 </div>
                 <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Signals</p>
                   <p className="text-2xl font-black text-white">{selectedPattern.report_count ?? 0}</p>
                 </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Primary Categories</p>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <div key={cat} className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                      <Activity size={12} className="text-violet-400" /> {cat}
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No specific categories recorded</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#08100d] sticky bottom-0">
              <Button 
                className="w-full" 
                onClick={() => navigate('/authority/review')}
              >
                Review Pattern in Queue
              </Button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AuthorityMap;
