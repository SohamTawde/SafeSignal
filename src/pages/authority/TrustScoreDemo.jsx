import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { ShieldAlert, Activity, Users, Clock, Zap, ArrowRight } from 'lucide-react';
import { calculateTrustScoreEngine } from '../../services/trustScore';

export default function TrustScoreDemo() {
  const [activeScenario, setActiveScenario] = useState('A');
  const [results, setResults] = useState(null);

  const runScenario = (scenario) => {
    let mockSignals = [];
    const now = Date.now();
    
    if (scenario === 'A') {
      // Scenario A: 10 reports, 2 anonymous sources, same category, same minute
      for(let i=0; i<10; i++) {
        mockSignals.push({
          id: `sig-${i}`,
          anonymous_reporter_hash: i % 2 === 0 ? 'user-1' : 'user-2',
          category: 'catcalling',
          reported_at: new Date(now - (i * 5000)).toISOString() // Within 50 seconds
        });
      }
    } else {
      // Scenario B: 10 reports, 8 anonymous sources, multiple days, multiple categories
      const categories = ['catcalling', 'following', 'verbal_harassment', 'suspicious_behavior'];
      for(let i=0; i<10; i++) {
        mockSignals.push({
          id: `sig-${i}`,
          anonymous_reporter_hash: `user-${i % 8}`,
          category: categories[i % 4],
          reported_at: new Date(now - (i * 10 * 60 * 60 * 1000)).toISOString() // Spread over ~100 hours
        });
      }
    }
    
    setActiveScenario(scenario);
    setResults(calculateTrustScoreEngine(mockSignals));
  };

  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto no-scrollbar">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">Trust Score Demonstration</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anti-Gaming & Signal Confidence Engine</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mb-8">
        {/* Scenario A */}
        <GlassCard 
          className={`p-6 cursor-pointer border-2 transition-all ${activeScenario === 'A' ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 hover:border-white/20'}`}
          onClick={() => runScenario('A')}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Scenario A</h3>
            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-slate-300">Spam / Low Diversity</span>
          </div>
          <ul className="text-xs font-bold text-slate-400 space-y-2 uppercase tracking-widest">
            <li className="flex items-center gap-2"><Activity size={14} className="text-slate-500"/> 10 Reports</li>
            <li className="flex items-center gap-2"><Users size={14} className="text-red-400"/> 2 Anonymous Sources</li>
            <li className="flex items-center gap-2"><ShieldAlert size={14} className="text-orange-400"/> 1 Category (Catcalling)</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-red-400"/> All within 1 minute</li>
          </ul>
        </GlassCard>

        {/* Scenario B */}
        <GlassCard 
          className={`p-6 cursor-pointer border-2 transition-all ${activeScenario === 'B' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 hover:border-white/20'}`}
          onClick={() => runScenario('B')}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Scenario B</h3>
            <span className="text-[10px] font-bold bg-white/10 px-2 py-1 rounded text-slate-300">Genuine Pattern</span>
          </div>
          <ul className="text-xs font-bold text-slate-400 space-y-2 uppercase tracking-widest">
            <li className="flex items-center gap-2"><Activity size={14} className="text-slate-500"/> 10 Reports</li>
            <li className="flex items-center gap-2"><Users size={14} className="text-emerald-400"/> 8 Anonymous Sources</li>
            <li className="flex items-center gap-2"><ShieldAlert size={14} className="text-emerald-400"/> 4 Categories</li>
            <li className="flex items-center gap-2"><Clock size={14} className="text-emerald-400"/> Spread over 4 days</li>
          </ul>
        </GlassCard>
      </div>

      <div className="flex justify-center mb-8">
        <button 
          onClick={() => runScenario(activeScenario)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <Zap size={16} /> Run Calculation Engine
        </button>
      </div>

      {results && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GlassCard className="p-8 border-violet-500/30 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Engine Output</p>
              <h2 className="text-5xl font-black text-white">{results.finalScore} <span className="text-xl text-slate-500">/ 100</span></h2>
              <p className={`text-sm font-bold uppercase tracking-widest mt-2 ${results.finalScore >= 70 ? 'text-emerald-400' : 'text-orange-400'}`}>
                {results.finalScore >= 85 ? "Very High Confidence" : results.finalScore >= 70 ? "High Confidence" : results.finalScore >= 40 ? "Moderate Confidence" : "Low Confidence"}
              </p>
            </div>

            <div className="space-y-5">
              {[
                { label: 'Reporter Diversity (Weight: 35%)', val: results.breakdown.reporterDiversity, color: 'bg-blue-500' },
                { label: 'Time Spread (Weight: 30%)', val: results.breakdown.timeSpread, color: 'bg-emerald-500' },
                { label: 'Category Diversity (Weight: 20%)', val: results.breakdown.categoryDiversity, color: 'bg-yellow-500' },
                { label: 'Burst Penalty (Weight: -15%)', val: results.breakdown.burstPenalty, color: 'bg-red-500', isPenalty: true }
              ].map(metric => (
                <div key={metric.label}>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 text-slate-400">
                    <span>{metric.label}</span>
                    <span className={metric.isPenalty ? 'text-red-400' : 'text-white'}>{metric.val}</span>
                  </div>
                  <div className="h-2 w-full bg-[#0b0710] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full ${metric.color} ${metric.isPenalty ? 'opacity-80' : ''}`} 
                      style={{ width: `${Math.min(100, Math.max(0, metric.val))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
