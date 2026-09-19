import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { getPatterns, getSignals } from '../../services/api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const COLORS = ['#8b5cf6', '#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#150f24] border border-white/10 p-3 rounded-lg shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white font-bold">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const NetworkMetrics = () => {
  const [timeData, setTimeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [trustData, setTrustData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signals, patterns] = await Promise.all([
          getSignals(),
          getPatterns()
        ]);

        // Process Category Data
        const categoryCounts = {};
        signals.forEach(s => {
          const cat = s.category || 'Other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        setCategoryData(Object.keys(categoryCounts).map(k => ({
          name: k.replace('_', ' '),
          value: categoryCounts[k]
        })));

        // Process Zone Data (from Patterns)
        const zoneCounts = {};
        patterns.forEach(p => {
          zoneCounts[p.grid_zone] = (zoneCounts[p.grid_zone] || 0) + 1;
        });
        const sortedZones = Object.keys(zoneCounts)
          .map(k => ({ name: k, patterns: zoneCounts[k] }))
          .sort((a, b) => b.patterns - a.patterns)
          .slice(0, 5); // Top 5
        setZoneData(sortedZones);

        // Process Trust Data (from Patterns)
        const trustBuckets = { '0-20%': 0, '21-40%': 0, '41-60%': 0, '61-80%': 0, '81-100%': 0 };
        patterns.forEach(p => {
          if (p.trust_score <= 20) trustBuckets['0-20%']++;
          else if (p.trust_score <= 40) trustBuckets['21-40%']++;
          else if (p.trust_score <= 60) trustBuckets['41-60%']++;
          else if (p.trust_score <= 80) trustBuckets['61-80%']++;
          else trustBuckets['81-100%']++;
        });
        setTrustData(Object.keys(trustBuckets).map(k => ({ range: k, count: trustBuckets[k] })));

        // Process Time Data (last 7 days signals)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const recentSignals = signals.filter(s => (new Date() - new Date(s.reported_at)) < 7 * 24 * 60 * 60 * 1000);
        const dayCounts = {};
        recentSignals.forEach(s => {
          const d = new Date(s.reported_at).getDay();
          dayCounts[days[d]] = (dayCounts[days[d]] || 0) + 1;
        });
        
        // Ensure all 7 days are represented in order ending today
        const today = new Date().getDay();
        const orderedDays = [];
        for (let i = 6; i >= 0; i--) {
          const d = (today - i + 7) % 7;
          orderedDays.push({ name: days[d], signals: dayCounts[days[d]] || 0 });
        }
        setTimeData(orderedDays);

      } catch (err) {
        console.error("Error fetching analytics data", err);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white mb-1">Network Analytics</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Pattern Detection Statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Signals Over Time */}
        <GlassCard>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Signals Over Time (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="signals" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Signals By Category */}
        <GlassCard>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Signals By Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Emerging Patterns by Zone */}
        <GlassCard>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Emerging Patterns by Zone (Top 5)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="patterns" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Trust Score Distribution */}
        <GlassCard>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trust Score Distribution (Patterns)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trustData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="range" stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" tick={{ fill: '#ffffff50', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#d946ef" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default NetworkMetrics;
