import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Map, Lock, Activity, ArrowRight, AlertCircle, Eye, Download, CheckCircle2, Zap, Radio, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { ScrollProgressBar, ScrollRoll, SlowWordReveal, SlowTextReveal } from '../components/ScrollReveal';

const SafeSignalLanding = () => {
  const navigate = useNavigate();
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleDownloadApk = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 6000);
  };

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden bg-[#0b0710] text-white selection:bg-violet-500/30 selection:text-violet-200">
      {/* Top Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Abstract Background Effects with Parallax Depth */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-violet-900/25 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[25%] right-[-10%] w-[800px] h-[800px] bg-blue-900/15 blur-[130px] rounded-full" />
        <div className="absolute top-[55%] left-[-5%] w-[700px] h-[700px] bg-indigo-900/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-1/4 w-[650px] h-[650px] bg-magenta-900/15 blur-[130px] rounded-full" />
      </div>

      {/* Download Floating Notification Toast */}
      {downloadNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-violet-950/95 border border-violet-500/50 backdrop-blur-2xl shadow-[0_10px_35px_rgba(139,92,246,0.3)] flex items-center gap-3 text-white text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Download size={16} className="text-violet-400 animate-bounce" />
          <span>Downloading <strong>safesignal.apk</strong> (54 MB)... Tap to install when completed.</span>
        </div>
      )}

      {/* Fixed Glass Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-[#0b0710]/75 backdrop-blur-2xl border-b border-white/5 transition-all duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase">SafeSignal</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/safesignal.apk"
            download="safesignal.apk"
            onClick={handleDownloadApk}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors flex items-center gap-1.5 cursor-pointer hover:scale-105 transform duration-200"
          >
            <Download size={14} /> Install APK
          </a>
          <button onClick={() => navigate('/map')} className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors">Safety Map</button>
          <button onClick={() => navigate('/privacy')} className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-widest transition-colors">Privacy</button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/authority/login')}>Authority Login</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-36 pb-24 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <ScrollRoll delay={50} direction="down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
            <span className="text-[10px] font-bold text-violet-300 uppercase tracking-widest">Proactive Safety Network</span>
          </div>
        </ScrollRoll>
        
        {/* Slow Word-by-Word Title Reveal */}
        <div className="mb-6 max-w-5xl">
          <SlowWordReveal
            as="h1"
            text="See the pattern before it becomes a crisis."
            highlightWord="pattern"
            highlightClass="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-magenta-400 font-extrabold"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase leading-[1.08] text-white"
            staggerMs={85}
            initialDelay={120}
          />
        </div>
        
        {/* Slow Subtitle Reveal */}
        <SlowTextReveal delay={450} duration={1200} className="max-w-2xl mx-auto mb-12">
          <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
            Anonymous micro-reporting platform. Don't wait for an emergency to speak up. Share small safety signals in seconds and help uncover emerging risks in your community.
          </p>
        </SlowTextReveal>
        
        {/* Action Buttons with Rolling Stagger */}
        <ScrollRoll delay={600} direction="up">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-violet-600/30 hover:scale-105 transition-all" onClick={() => navigate('/report')}>
              <Activity size={20} className="mr-2" /> Report a Safety Signal
            </Button>
            <a
              href="/safesignal.apk"
              download="safesignal.apk"
              onClick={handleDownloadApk}
              className="w-full sm:w-auto inline-flex items-center justify-center font-bold px-7 py-3.5 rounded-xl border border-violet-500/40 text-violet-300 hover:bg-violet-600/15 hover:text-white transition-all shadow-lg hover:shadow-violet-500/25 cursor-pointer active:scale-95"
            >
              <Download size={18} className="mr-2 text-violet-400" /> Install Android App (APK)
            </a>
            <Button variant="danger" size="lg" className="w-full sm:w-auto bg-red-600/15 text-red-400 border-red-500/30 hover:bg-red-600/25 shadow-none" onClick={() => navigate('/sos')}>
              <AlertCircle size={20} className="mr-2" /> Emergency SOS
            </Button>
          </div>
        </ScrollRoll>
      </main>

      {/* Rolling Stats & Trust Bar */}
      <section className="py-12 px-6 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Privacy Score', value: '100%', sub: 'Zero PII Collected', icon: Lock, color: 'text-violet-400' },
            { label: 'Dispatch Speed', value: '< 3s', sub: 'Real-time Clustering', icon: Zap, color: 'text-blue-400' },
            { label: 'Safe Grid Mesh', value: '20m', sub: 'Obfuscated Zones', icon: Radio, color: 'text-emerald-400' },
            { label: 'Verification Trust', value: '99.4%', sub: 'Dynamic AI Engine', icon: Sparkles, color: 'text-magenta-400' },
          ].map((stat, index) => (
            <ScrollRoll key={index} delay={index * 120} direction="scale">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl flex flex-col items-center text-center hover:border-violet-500/30 transition-all hover:bg-white/[0.04]">
                <stat.icon size={22} className={`${stat.color} mb-2`} />
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-0.5">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">{stat.label}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-medium">{stat.sub}</div>
              </div>
            </ScrollRoll>
          ))}
        </div>
      </section>

      {/* How it Works: Tap -> Pattern -> Trust */}
      <section className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SlowWordReveal
              as="h2"
              text="How SafeSignal Works"
              highlightWord="SafeSignal"
              className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 text-center justify-center w-full text-white"
              staggerMs={70}
            />
            <SlowTextReveal delay={250} duration={1000}>
              <p className="text-slate-400 max-w-xl mx-auto text-base">
                A paradigm shift from reactive emergency calls to proactive pattern detection.
              </p>
            </SlowTextReveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollRoll delay={0} direction="up">
              <GlassCard className="h-full hover:border-violet-500/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide text-white">1. Tap</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Submit an anonymous signal in 3 quick steps. No login, no personal details. Just location zone and category.
                </p>
              </GlassCard>
            </ScrollRoll>
            
            <ScrollRoll delay={160} direction="up">
              <GlassCard className="h-full hover:border-blue-500/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Eye size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide text-white">2. Pattern</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Our system aggregates spatio-temporal data across approximate safety grids to detect emerging clusters of suspicious activity.
                </p>
              </GlassCard>
            </ScrollRoll>
            
            <ScrollRoll delay={320} direction="up">
              <GlassCard className="h-full hover:border-magenta-500/40 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-magenta-500/20 flex items-center justify-center text-magenta-400 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wide text-white">3. Trust</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Signals are dynamically scored for trust based on reporter diversity and time spread, flagging real issues for human review.
                </p>
              </GlassCard>
            </ScrollRoll>
          </div>
        </div>
      </section>

      {/* Privacy & Safety Map Preview */}
      <section className="py-28 px-6 bg-[#150f24]/30 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollRoll delay={50} direction="left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                <Lock size={12} /> Privacy by Design
              </div>
            </ScrollRoll>

            <SlowWordReveal
              as="h2"
              text="Total Anonymity. Zero Compromise."
              highlightWord="Zero"
              className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 leading-tight text-white"
              staggerMs={75}
            />

            <ul className="space-y-4 mb-8">
              {[
                'No citizen login required',
                'No name, phone, or email collected',
                'No exact GPS coordinates exposed',
                'Data aggregated into 20m safety grids'
              ].map((text, i) => (
                <ScrollRoll key={i} delay={150 + i * 110} direction="left">
                  <li className="flex items-center gap-3 text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 font-bold text-xs">✓</div>
                    <span className="text-sm font-medium">{text}</span>
                  </li>
                </ScrollRoll>
              ))}
            </ul>

            <ScrollRoll delay={550} direction="up">
              <Button variant="outline" onClick={() => navigate('/privacy')}>
                Read Privacy Policy <ArrowRight size={16} className="ml-2" />
              </Button>
            </ScrollRoll>
          </div>
          
          <ScrollRoll delay={200} direction="right">
            <div className="relative h-[420px] rounded-3xl overflow-hidden border border-white/10 group cursor-pointer shadow-2xl" onClick={() => navigate('/map')}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 grayscale group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0710] via-transparent to-transparent" />
              
              {/* Mock map overlay elements */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/20 border border-red-500/50 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md animate-pulse">
                <span className="text-red-400 font-bold uppercase text-[10px] tracking-widest bg-black/60 px-2.5 py-1 rounded-full border border-red-500/30">Zone 14</span>
                <span className="text-[9px] text-red-300/80 mt-1 font-semibold">Elevated Cluster</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-yellow-500/20 border border-yellow-500/50 rounded-2xl flex flex-col items-center justify-center backdrop-blur-md">
                <span className="text-yellow-400 font-bold uppercase text-[10px] tracking-widest bg-black/60 px-2.5 py-1 rounded-full border border-yellow-500/30">Zone B</span>
                <span className="text-[9px] text-yellow-300/80 mt-1 font-semibold">Low Density</span>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm">
                <Button variant="primary" className="shadow-2xl">Explore Live Safety Map</Button>
              </div>
            </div>
          </ScrollRoll>
        </div>
      </section>

      {/* Community Protection CTA Roll Banner */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <ScrollRoll delay={100} direction="scale">
            <div className="rounded-3xl p-10 md:p-14 bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-violet-900/40 border border-violet-500/30 backdrop-blur-2xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/15 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-magenta-500/15 blur-3xl rounded-full pointer-events-none" />

              <SlowWordReveal
                as="h2"
                text="Protect Your Neighborhood Today"
                highlightWord="Protect"
                className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-4 justify-center"
              />
              <SlowTextReveal delay={200} duration={1000}>
                <p className="text-slate-300 max-w-xl mx-auto mb-8 font-light text-base">
                  Every small report helps our AI engine correlate safety trends before they escalate. Install the native app on your phone for one-tap reporting.
                </p>
              </SlowTextReveal>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="primary" size="lg" onClick={() => navigate('/report')} className="w-full sm:w-auto shadow-lg shadow-violet-600/40">
                  <Activity size={18} className="mr-2" /> Report an Incident
                </Button>
                <a
                  href="/safesignal.apk"
                  download="safesignal.apk"
                  onClick={handleDownloadApk}
                  className="w-full sm:w-auto inline-flex items-center justify-center font-bold px-7 py-3.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all shadow-lg cursor-pointer"
                >
                  <Download size={18} className="mr-2 text-violet-300" /> Get Android App (APK)
                </a>
              </div>
            </div>
          </ScrollRoll>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center bg-[#07040c]">
        <ScrollRoll delay={100} direction="up">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ShieldAlert size={18} className="text-violet-500" />
            <span className="text-sm font-bold tracking-widest text-white uppercase">SafeSignal</span>
          </div>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
            Proactive early-warning safety platform • Built for citizen privacy
          </p>
        </ScrollRoll>
      </footer>
    </div>
  );
};

export default SafeSignalLanding;

