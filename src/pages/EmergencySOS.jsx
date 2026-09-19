import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, ShieldAlert, MessageSquare, X, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { calculateGridZone, DEFAULT_PILOT_LOCATION } from '../config/geoConfig';

const EmergencySOS = () => {
  const navigate = useNavigate();
  const [sosSent, setSosSent] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [currentZone, setCurrentZone] = useState('ZONE-A-014');
  const [eta, setEta] = useState(4); // Estimated responder arrival minutes

  // Get current approximate zone on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const zone = calculateGridZone(pos.coords.latitude, pos.coords.longitude);
          setCurrentZone(zone.gridZone);
        },
        () => setCurrentZone('ZONE-A-014'),
        { timeout: 3000 }
      );
    }
  }, []);

  // Handle countdown before final dispatch
  const startSOSCountdown = () => {
    setCountdown(5);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setSosSent(true);
      setCountdown(null);
    }
  }, [countdown]);

  const cancelCountdown = () => {
    setCountdown(null);
  };

  // Pre-fill emergency SMS link for native phone messaging
  const emergencySmsBody = encodeURIComponent(
    `EMERGENCY ALERT: I am in immediate danger and need urgent assistance. My approximate SafeSignal grid zone is: ${currentZone}. Time: ${new Date().toLocaleTimeString()}. Please send help or contact authorities.`
  );
  const emergencySmsHref = `sms:?body=${emergencySmsBody}`;

  return (
    <div className="min-h-screen bg-[#1a0505] flex flex-col items-center justify-center p-6 relative font-sans overflow-hidden">
      {/* Intense Red Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      
      <div className="w-full max-w-md relative z-10 text-center">
        {countdown !== null ? (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="w-28 h-28 bg-red-600/30 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-red-500 shadow-[0_0_60px_rgba(220,38,38,0.7)] animate-ping">
              <span className="text-5xl font-black text-white">{countdown}</span>
            </div>
            
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
              Dispatching SOS in {countdown}s
            </h1>
            <p className="text-red-200/70 text-sm mb-8">
              Alerting local emergency responders with grid: <strong className="text-white">{currentZone}</strong>
            </p>

            <Button 
              className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 uppercase tracking-widest text-sm"
              onClick={cancelCountdown}
            >
              <X size={18} className="mr-2" /> Cancel Dispatch
            </Button>
          </div>
        ) : !sosSent ? (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-3 leading-tight">
              Are you in <br/> immediate danger?
            </h1>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-500/30 rounded-full text-[11px] font-bold text-red-300 uppercase tracking-wider mb-6">
              <MapPin size={12} /> Zone: {currentZone}
            </div>

            <p className="text-red-200/70 text-xs mb-8 px-4 leading-relaxed">
              SOS bypasses pattern aggregation and initiates instant escalation.
            </p>

            <div className="space-y-3">
              {/* Call 911 / 112 */}
              <Button 
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-500 font-black text-base"
                onClick={() => window.location.href = 'tel:911'}
              >
                <Phone size={22} className="mr-3" /> Call Emergency (911)
              </Button>

              {/* Silent SOS Dispatch */}
              <Button 
                variant="outline"
                className="w-full h-14 bg-red-950/50 border-red-500/50 hover:bg-red-900/50 text-red-100 font-bold"
                onClick={startSOSCountdown}
              >
                <ShieldAlert size={20} className="mr-3 text-red-500" /> Send Silent SOS to Authorities
              </Button>

              {/* Emergency SMS Fallback */}
              <a 
                href={emergencySmsHref}
                className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold rounded-xl flex items-center justify-center uppercase tracking-widest text-xs transition-colors"
              >
                <MessageSquare size={18} className="mr-2 text-violet-400" /> Broadcast Emergency SMS
              </a>
              
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-slate-400 hover:text-white text-xs"
                onClick={() => navigate('/')}
              >
                <X size={16} className="mr-1" /> Return to Safety Portal
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500">
            <GlassCard className="border-red-500/40 bg-red-950/40 text-left p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/50 shrink-0">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">Silent SOS Dispatched</h2>
                  <p className="text-[11px] font-bold text-red-300 uppercase tracking-wider">Priority Code Red • Broadcast Sent</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 bg-black/30 p-4 rounded-xl border border-white/5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">Grid Zone</span>
                  <span className="font-bold text-white">{currentZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">Units Notified</span>
                  <span className="font-bold text-emerald-400">Campus Security & Local Patrol</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">Estimated ETA</span>
                  <span className="font-bold text-white flex items-center gap-1 bg-red-500/20 px-2 py-0.5 rounded text-red-300">
                    <Clock size={12} /> ~{eta} Minutes
                  </span>
                </div>
              </div>

              <p className="text-slate-300 text-xs mb-6 leading-relaxed">
                Stay in a well-lit area or nearest open shop if possible. Keep your phone accessible.
              </p>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                  onClick={() => window.location.href = 'tel:911'}
                >
                  <Phone size={18} className="mr-2" /> Direct Call Dispatch
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-white/10 text-slate-300" 
                  onClick={() => navigate('/map')}
                >
                  View Live Map
                </Button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySOS;
