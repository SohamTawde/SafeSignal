import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { getDashboardStats } from '../../services/api';
import { supabase } from '../../lib/supabase';

const AuthorityOverview = () => {
  const [stats, setStats] = useState({
    totalSignals: 0,
    emergingPatterns: 0,
    highTrust: 0, // Mocked for now, need a specific query if wanted
    pendingReviews: 0
  });

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats({
        totalSignals: data.totalSignals || 0,
        emergingPatterns: data.emergingPatterns || 0,
        pendingReviews: data.pendingReviews || 0,
        highTrust: data.highTrustPatterns ?? 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to all changes on signals and patterns for live updates
    const signalSub = supabase
      .channel('overview-signals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'safety_signals' }, () => {
        fetchStats();
      })
      .subscribe();

    const patternSub = supabase
      .channel('overview-patterns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_patterns' }, () => {
        fetchStats();
      })
      .subscribe();

    // Polling fallback to guarantee updates even if realtime websocket disconnects
    const pollInterval = setInterval(fetchStats, 4000);

    return () => {
      clearInterval(pollInterval);
      signalSub.unsubscribe();
      patternSub.unsubscribe();
    };
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Network Overview</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pilot Zone A • Real-time Data</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Signals" 
          value={stats.totalSignals} 
          icon={<FileText size={20} />} 
          trend={null} 
          subtitle="All Time"
        />
        <StatCard 
          title="Emerging Patterns" 
          value={stats.emergingPatterns} 
          icon={<Activity size={20} />} 
          trend={null} 
          subtitle="Requires attention"
        />
        <StatCard 
          title="High Trust Patterns" 
          value={stats.highTrust ?? 0} 
          icon={<ShieldAlert size={20} />} 
          subtitle="Score > 80%"
        />
        <StatCard 
          title="Pending Reviews" 
          value={stats.pendingReviews} 
          icon={<CheckCircle size={20} />} 
          trend={null} 
          subtitle="Under Review Status"
        />
      </div>

      <div className="p-8 border border-white/5 rounded-2xl bg-white/[0.02] text-center mt-12">
         <p className="text-slate-400 text-sm">Select 'Safety Map' or 'Emerging Patterns' from the sidebar to dive deeper into the data.</p>
      </div>
    </div>
  );
};

export default AuthorityOverview;
