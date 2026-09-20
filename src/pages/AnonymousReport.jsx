import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, QrCode, Map as MapIcon, ChevronLeft, CheckCircle2, ShieldAlert, Megaphone, Footprints, MessageSquareWarning, AlertOctagon, UserX, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { cn } from '../utilities/utils';
import { submitSignal } from '../services/api';
import { calculateGridZone, DEFAULT_PILOT_LOCATION } from '../config/geoConfig';

/**
 * Anti-Sybil Rate Limiter (Privacy Conscious)
 * Prevents spam by restricting multiple reports from the same browser 
 * within a short time window without storing device fingerprints.
 */
const checkRateLimit = () => {
  const lastReportTime = localStorage.getItem('nirbhaya_last_report');
  const now = Date.now();
  if (lastReportTime && (now - parseInt(lastReportTime)) < 60000) {
    // 60 seconds rate limit
    return false;
  }
  return true;
};

const AnonymousReport = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    gridZone: '',
    category: '',
    approxLat: DEFAULT_PILOT_LOCATION.lat,
    approxLng: DEFAULT_PILOT_LOCATION.lng
  });

  // Generate or retrieve persistent anonymous hash
  const getReporterHash = () => {
    let hash = localStorage.getItem('nirbhaya_reporter_hash');
    if (!hash) {
      hash = 'anon-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('nirbhaya_reporter_hash', hash);
    }
    return hash;
  };

  const handleUseMyLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      // Fallback for browsers without geolocation
      handleLocationSelect('ZONE-A-014');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const zoneData = calculateGridZone(position.coords.latitude, position.coords.longitude);
        handleLocationSelect(zoneData.gridZone, zoneData.approxLat, zoneData.approxLng);
        setLoading(false);
      },
      (err) => {
        console.warn('Geolocation failed, using fallback zone:', err);
        handleLocationSelect('ZONE-A-014', 40.7128, -74.0060); // Fallback for MVP demo
        setLoading(false);
      },
      { timeout: 5000 }
    );
  };

  const handleLocationSelect = (gridZone, lat = 40.7128, lng = -74.0060) => {
    setFormData({ ...formData, gridZone, approxLat: lat, approxLng: lng });
    setStep(2);
  };

  const handleCategorySelect = (category) => {
    // Normalize category for database check constraint
    const normalizedCategory = category.toLowerCase().replace(' ', '_');
    // Ensure "threatening behaviour" maps to "threatening_behavior" if needed
    const finalCategory = normalizedCategory === 'threatening_behaviour' ? 'threatening_behavior' : normalizedCategory;
    
    setFormData({ ...formData, category: finalCategory });
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!checkRateLimit()) {
      setError('Please wait a moment before submitting another signal to prevent spam. (Wait 60 seconds)');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await submitSignal({
        grid_zone: formData.gridZone,
        category: formData.category,
        anonymous_reporter_hash: getReporterHash()
      }, formData.approxLat, formData.approxLng);
      // Set rate limit only on successful submission
      localStorage.setItem('nirbhaya_last_report', Date.now().toString());
      setStep(4);
    } catch (err) {
      console.error("Supabase Error Details:", err);
      // Display the actual error message to help debug
      setError(err.message || err.error_description || 'Unable to submit signal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayCategory = formData.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-[#0b0710] flex flex-col relative font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-900/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/5 relative z-10">
        {step > 1 && step < 4 ? (
          <button onClick={() => { setStep(step - 1); setError(''); }} className="p-2 text-slate-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-violet-500" />
          <span className="text-sm font-bold uppercase tracking-widest text-white">Nirbhaya</span>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center animate-in fade-in">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-2">Where did this happen?</h2>
              <p className="text-slate-400 text-sm mb-8">We map incidents to approximate safety grids. Your exact GPS coordinates are never exposed.</p>
              
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full h-16 justify-start text-left bg-white/5 border-white/10 hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-violet-300"
                  onClick={handleUseMyLocation}
                  disabled={loading}
                >
                  <MapPin size={20} className="mr-4 text-violet-500" /> 
                  <div>
                    <div className="font-bold">{loading ? 'Locating...' : 'Use My Location'}</div>
                    <div className="text-[10px] text-slate-500">Maps to approx 20m grid</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-16 justify-start text-left bg-white/5 border-white/10 hover:bg-blue-600/20 hover:border-blue-500/50 hover:text-blue-300"
                  onClick={() => handleLocationSelect('ZONE-B-022')}
                >
                  <QrCode size={20} className="mr-4 text-blue-500" /> 
                  <div>
                    <div className="font-bold">Scan Location QR</div>
                    <div className="text-[10px] text-slate-500">Prepared placeholder</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-16 justify-start text-left bg-white/5 border-white/10 hover:bg-magenta-600/20 hover:border-magenta-500/50 hover:text-magenta-300"
                  onClick={() => handleLocationSelect('ZONE-C-105', 40.7118, -74.0070)}
                >
                  <MapIcon size={20} className="mr-4 text-magenta-500" /> 
                  <div>
                    <div className="font-bold">Select Area Manually</div>
                    <div className="text-[10px] text-slate-500">Demo Zone C</div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
               <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-8">What did you notice?</h2>
               <div className="grid grid-cols-2 gap-3">
                 {[
                   { id: 'Catcalling', icon: Megaphone, color: 'text-pink-400' },
                   { id: 'Following', icon: Footprints, color: 'text-orange-400' },
                   { id: 'Verbal Harassment', icon: MessageSquareWarning, color: 'text-red-400' },
                   { id: 'Threatening Behavior', icon: AlertOctagon, color: 'text-red-500' },
                   { id: 'Suspicious Behavior', icon: UserX, color: 'text-yellow-400' },
                   { id: 'Other', icon: MoreHorizontal, color: 'text-slate-400' }
                 ].map((cat) => (
                   <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="p-4 rounded-xl border border-white/10 bg-[#150f24] hover:bg-violet-600/20 hover:border-violet-500/50 text-left transition-all active:scale-95 group flex items-start gap-3"
                   >
                     <div className="mt-0.5">
                       <cat.icon size={18} className={`${cat.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                     </div>
                     <span className="text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-white leading-tight">{cat.id}</span>
                   </button>
                 ))}
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <GlassCard className="text-center mb-6">
                 <h2 className="text-xl font-bold uppercase tracking-tighter text-white mb-6 border-b border-white/10 pb-4">Signal Summary</h2>
                 
                 <div className="space-y-4 mb-8">
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location Zone</p>
                     <p className="text-lg font-bold text-violet-300">{formData.gridZone}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incident Category</p>
                     <p className="text-lg font-bold text-white">{displayCategory}</p>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time</p>
                     <p className="text-sm font-bold text-slate-300">Just Now (Approx)</p>
                   </div>
                 </div>

                 <p className="text-[10px] text-slate-400 mb-6 bg-white/5 p-3 rounded-lg text-left leading-relaxed">
                   By submitting, you agree to send this anonymous data to the Nirbhaya network. Your exact coordinates are never transmitted.
                 </p>

                 <Button 
                   variant="primary" 
                   className="w-full" 
                   onClick={handleSubmit}
                   disabled={loading}
                 >
                   {loading ? 'Transmitting...' : 'Submit Anonymous Signal'}
                 </Button>
               </GlassCard>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in duration-500 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold uppercase tracking-tighter text-white mb-4">Signal Received</h2>
              <p className="text-slate-300 mb-2">Thank you for helping identify emerging safety patterns.</p>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-10 bg-emerald-500/10 px-4 py-2 rounded-lg inline-block mt-4">
                No name, phone number or account was required.
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>Return Home</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AnonymousReport;
