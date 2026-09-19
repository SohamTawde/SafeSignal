import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/GlassCard';
import { getPatterns } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { ShieldAlert, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const EmergingPatterns = () => {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState([]);

  const fetchPatterns = async () => {
    try {
      const data = await getPatterns();
      setPatterns(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatterns();

    const subscription = supabase
      .channel('emerging-patterns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_patterns' }, () => {
        fetchPatterns();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'emerging': return <ShieldAlert size={14} className="text-red-400" />;
      case 'under_review': return <AlertCircle size={14} className="text-orange-400" />;
      case 'validated': return <CheckCircle size={14} className="text-emerald-400" />;
      case 'dismissed': return <XCircle size={14} className="text-slate-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'emerging': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'under_review': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'validated': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'dismissed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-white/5 text-white border-white/10';
    }
  };

  const formatStatus = (status) => {
    if (!status) return '';
    return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">Emerging Patterns</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Spatio-Temporal Anomaly Detection</p>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pattern ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location Zone</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Signals</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Span</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Trust Score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {patterns.map((p) => {
                // Time span in hours or days
                const ms = new Date(p.end_time) - new Date(p.start_time);
                const hours = Math.round(ms / (1000 * 60 * 60));
                const timeSpan = hours > 24 ? `${Math.round(hours/24)} days` : `${hours} hours`;
                
                // Truncate ID for display
                const shortId = p.id.substring(0, 8);

                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-300 uppercase tracking-wider">{shortId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-white uppercase tracking-tight">{p.grid_zone}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-300">{p.report_count}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{timeSpan}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${p.trust_score > 80 ? 'bg-red-500' : 'bg-orange-500'}`} 
                            style={{ width: `${p.trust_score}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-white">{p.trust_score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-widest ${getStatusColor(p.status)}`}>
                        {getStatusIcon(p.status)} {formatStatus(p.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/authority/review`)}
                        className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-opacity"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
              {patterns.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500 text-sm">
                    No emerging patterns detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default EmergingPatterns;
