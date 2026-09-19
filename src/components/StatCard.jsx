import React from 'react';
import { GlassCard } from './GlassCard';

export const StatCard = ({ title, value, subtitle, icon, trend }) => {
  return (
    <GlassCard className="p-6 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        {subtitle && <p className="text-[9px] text-slate-500 mt-2 uppercase">{subtitle}</p>}
      </div>
    </GlassCard>
  );
};
