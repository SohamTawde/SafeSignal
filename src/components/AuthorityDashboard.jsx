import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Activity, CheckSquare, 
  BarChart2, Settings as SettingsIcon, LogOut, Menu, X, ShieldAlert, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/authority/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, path: '/authority' },
    { id: 'map', label: 'Safety Map', icon: <Map size={18} />, path: '/authority/map' },
    { id: 'patterns', label: 'Emerging Patterns', icon: <Activity size={18} />, path: '/authority/patterns' },
    { id: 'review', label: 'Review Queue', icon: <CheckSquare size={18} />, path: '/authority/review' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} />, path: '/authority/analytics' },
    { id: 'demo', label: 'Trust Score Demo', icon: <Zap size={18} />, path: '/authority/demo' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} />, path: '/authority/settings' },
  ];

  return (
    <div className="flex h-screen w-full text-slate-200 overflow-hidden relative font-sans">
      
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[90] w-64 bg-[#08100d]/90 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase">Nirbhaya</h1>
              <p className="text-[9px] text-violet-400 font-bold uppercase tracking-widest">Authority Portal</p>
            </div>
          </div>
          <button className="lg:hidden text-white/50" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/authority' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white py-2.5 rounded-xl font-bold uppercase text-[10px] bg-white/5 hover:bg-white/10 transition-all">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#0b0710]">
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 bg-[#150f24]/50 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-3">
          <button className="lg:hidden p-2 text-white/70 bg-white/5 rounded-lg shrink-0" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={18} />
          </button>

          <div className="flex-1 flex items-center">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 border border-violet-500/20 rounded-lg text-[10px] font-bold text-violet-300 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
              Live Monitoring Active
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-1">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold text-white leading-none">
                {profile?.full_name || user?.email || 'Authority User'}
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Role: {profile?.role || 'Admin'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_10px_rgba(139,92,246,0.5)]">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AuthorityDashboard;