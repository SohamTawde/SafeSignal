import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { getPatterns, reviewPattern } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, AlertTriangle, Activity, Users, Clock, CheckCircle2, Ban, ChevronRight, ChevronDown, Info } from 'lucide-react';

const formatStatus = (status) => {
  if (!status) return '';
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const HumanReview = () => {
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const data = await getPatterns();
      setPatterns(data.filter(p => p.status === 'emerging' || p.status === 'under_review'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (status) => {
    setActionLoading(true);
    try {
      await reviewPattern(selectedPattern.id, status, notes || 'Reviewed via Dashboard', user?.id);
      await fetchQueue();
      setSelectedPattern(null);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getConfidenceLevel = (score) => {
    if (score >= 85) return "Very High Confidence";
    if (score >= 70) return "High Confidence";
    if (score >= 40) return "Moderate Confidence";
    return "Low Confidence";
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Main Queue Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar">
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">Review Queue</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA Targets & Prioritization</p>
        </div>

        <div className="grid gap-4 max-w-4xl">
          {patterns.map((p) => (
            <GlassCard key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-6 group hover:border-violet-500/30 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.priority === 'critical' || p.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                    {p.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pattern {p.id.substring(0, 8)}</span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-2">{p.grid_zone}</h3>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1"><ShieldAlert size={12} className={p.trust_score > 80 ? 'text-red-400' : 'text-orange-400'}/> {p.trust_score}% Trust</div>
                  <div className="flex items-center gap-1"><Activity size={12} className="text-violet-400"/> {p.report_count} Signals</div>
                  <div className="flex items-center gap-1"><Clock size={12} className="text-blue-400"/> {formatStatus(p.status)}</div>
                  <div className="flex items-center gap-1"><Clock size={12} className="text-slate-500"/> {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
              
              <div className="flex sm:flex-col gap-2 shrink-0">
                <Button variant="outline" size="sm" className="w-full sm:w-32 bg-white/5" onClick={() => setSelectedPattern(p)}>
                  Review <ChevronRight size={14} className="ml-1"/>
                </Button>
              </div>
            </GlassCard>
          ))}
          {patterns.length === 0 && (
            <div className="text-center py-20">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Queue Empty</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest">All emerging patterns have been reviewed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Drawer */}
      {selectedPattern && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-[#0b0710] border-l border-white/5 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 bg-[#150f24]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-3 border border-yellow-500/20">
                    <AlertTriangle size={12} /> AI-generated signal — human review required
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">
                    {selectedPattern.grid_zone}
                  </h2>
                </div>
                <button onClick={() => setSelectedPattern(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
               
                <div className="mb-8">
                 <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                   <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <ShieldAlert size={12} className="text-violet-500"/> Trust Score
                   </h3>
                   <span className="text-xs font-bold text-white bg-violet-600/20 px-2 py-0.5 rounded border border-violet-500/30">
                     {selectedPattern.trust_score} / 100
                   </span>
                 </div>
                 
                 <p className={`text-lg font-black uppercase tracking-tighter mb-2 ${selectedPattern.trust_score >= 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                   {getConfidenceLevel(selectedPattern.trust_score)}
                 </p>
                 <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   <Clock size={12} /> Generated: {selectedPattern.created_at ? new Date(selectedPattern.created_at).toLocaleString() : 'N/A'}
                 </div>

                 {/* Detailed Breakdown */}
                 <div className="space-y-4 mb-6">
                    {[
                      { label: 'Reporter Diversity', val: selectedPattern.reporter_diversity || 0, color: 'bg-blue-500' },
                      { label: 'Time Spread', val: selectedPattern.time_spread || 0, color: 'bg-emerald-500' },
                      { label: 'Category Diversity', val: selectedPattern.category_diversity || 0, color: 'bg-yellow-500' },
                      { label: 'Burst Penalty', val: selectedPattern.burst_penalty || 0, color: 'bg-red-500', isPenalty: true }
                    ].map(metric => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest mb-1 text-slate-400">
                          <span>{metric.label}</span>
                          <span className={metric.isPenalty ? 'text-red-400' : 'text-white'}>{metric.val}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${metric.color} ${metric.isPenalty ? 'opacity-80' : ''}`} 
                            style={{ width: `${Math.min(100, Math.max(0, metric.val))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                 </div>

                 {/* Explanation Panel */}
                 <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                   <button 
                     onClick={() => setShowExplanation(!showExplanation)}
                     className="w-full p-3 flex justify-between items-center text-xs font-bold text-slate-300 uppercase tracking-wider hover:bg-white/5 transition-colors"
                   >
                     <span className="flex items-center gap-2"><Info size={14} className="text-violet-400"/> Why this score?</span>
                     <ChevronDown size={14} className={`transform transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
                   </button>
                   
                   {showExplanation && (
                     <div className="p-4 pt-0 text-[10px] text-slate-400 space-y-2 border-t border-white/5 mt-2 pt-3">
                       <p className="mb-2 text-white font-bold">Nirbhaya Trust Score estimates how reliable an emerging pattern is based on diverse data factors. It does not determine whether a crime occurred.</p>
                       <ul className="list-disc pl-4 space-y-1">
                         {selectedPattern.reporter_diversity > 70 
                           ? <li className="text-emerald-400">✓ Reports came from highly diverse anonymous sources</li>
                           : <li className="text-orange-400">⚠ Most reports came from a small number of anonymous sources</li>}
                         {selectedPattern.time_spread > 50 
                           ? <li className="text-emerald-400">✓ Reports occurred across multiple time periods</li>
                           : <li className="text-orange-400">⚠ Several reports arrived within a short time window</li>}
                         {selectedPattern.category_diversity > 40
                           ? <li className="text-emerald-400">✓ Multiple safety categories were reported</li>
                           : <li className="text-orange-400">⚠ Limited category diversity (mostly similar incident types)</li>}
                         {selectedPattern.burst_penalty > 0
                           ? <li className="text-red-400">⚠ Unusual reporting concentration (burst) detected</li>
                           : <li className="text-emerald-400">✓ No significant reporting burst was detected</li>}
                       </ul>
                     </div>
                   )}
                 </div>
                </div>

               <div>
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Category Distribution</h3>
                 <div className="flex flex-wrap gap-2">
                   {selectedPattern.categories.map(cat => (
                     <span key={cat} className="px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-xs font-bold text-slate-300 uppercase tracking-wider">
                       {cat}
                     </span>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Review Notes</h3>
                 <textarea 
                   className="w-full bg-[#150f24] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 resize-none h-32"
                   placeholder="Enter officer remarks here before validation or dismissal..."
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                 ></textarea>
               </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-[#150f24] flex gap-4">
               <Button 
                 variant="ghost" 
                 className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400"
                 onClick={() => handleAction('dismissed')}
                 disabled={actionLoading}
               >
                 <Ban size={16} className="mr-2"/> Dismiss
               </Button>
               <Button 
                 variant="primary" 
                 className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                 onClick={() => handleAction('validated')}
                 disabled={actionLoading}
               >
                 <CheckCircle2 size={16} className="mr-2"/> Validate
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanReview;
