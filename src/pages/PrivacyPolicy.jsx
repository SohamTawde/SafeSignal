import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronLeft, Lock, MapPinOff, EyeOff, UserX } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0710] font-sans relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-900/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="p-4 flex items-center border-b border-white/5 relative z-10 bg-[#150f24]/50 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white mr-4">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-500" />
          <span className="text-lg font-bold uppercase tracking-widest text-white">Privacy by Design</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-tight">
            Total Anonymity.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Zero Compromise.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
            SafeSignal is built on the principle that citizen safety should not come at the cost of privacy. We do not want your personal data. We only want to detect emerging safety patterns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <GlassCard className="border-emerald-500/20">
            <UserX size={32} className="text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">No Citizen Login</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              You will never be asked to create an account, log in, or authenticate to report a safety signal.
            </p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20">
            <Lock size={32} className="text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">No PII Collected</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We do not collect names, phone numbers, or email addresses. There is no way for the system to identify who you are.
            </p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20">
            <MapPinOff size={32} className="text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">No Exact GPS</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your precise location is never exposed or stored. All signals are snapped to approximate 20m "Safety Grids". Authorities only see aggregated zones.
            </p>
          </GlassCard>

          <GlassCard className="border-emerald-500/20">
            <EyeOff size={32} className="text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Human Review</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our pattern detection algorithms never automatically dispatch authorities. All signals are subject to human review before escalation.
            </p>
          </GlassCard>
        </div>

        <div className="bg-[#150f24] border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-tight text-white mb-4">Anti-Abuse Mechanism</h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            To prevent spam without compromising anonymity, SafeSignal uses a rotating, localized device identifier. This allows us to calculate "Reporter Diversity" for a pattern—ensuring that a spike in reports isn't just one person clicking a button repeatedly. This identifier cannot be traced back to your device globally or used for tracking.
          </p>
        </div>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/')}>Return to Homepage</Button>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
