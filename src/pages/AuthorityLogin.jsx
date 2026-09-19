import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Shield, Key, Zap, CheckCircle2, X } from 'lucide-react';

const AuthorityLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const navigate = useNavigate();
  const { signIn, signInAsDemoAuthority, resetPassword } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message || 'Failed to authenticate');
      setLoading(false);
    } else {
      navigate('/authority');
    }
  };

  const handleDemoLogin = () => {
    signInAsDemoAuthority();
    navigate('/authority');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    try {
      await resetPassword(resetEmail);
      setResetStatus('Password reset link sent to your email.');
    } catch (err) {
      setResetStatus('Failed to send reset link: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0710] text-white p-4 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-900/10 blur-[150px] rounded-full pointer-events-none" />

      <GlassCard className="max-w-md w-full p-8 text-center border-white/10 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Shield className="w-8 h-8 text-violet-400" />
          </div>
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tight mb-1 text-white">Authority Login</h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Secure Portal for Authorized Responders</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Official Email Address" 
              className="w-full bg-[#150f24] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 text-white text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-[#150f24] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 text-white text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-between items-center text-xs pt-1">
            <label className="flex items-center text-slate-400 hover:text-white cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded border-white/20 bg-white/5 accent-violet-600" 
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-violet-400 hover:text-violet-300 font-bold"
            >
              Forgot Password?
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full justify-center mt-6"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard'}
          </Button>
        </form>

        {/* 1-Click Demo Access for Reviewers */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3">Testing & Evaluation</p>
          <Button 
            variant="outline" 
            size="sm"
            className="w-full bg-violet-600/10 border-violet-500/30 text-violet-300 hover:bg-violet-600/20"
            onClick={handleDemoLogin}
          >
            <Zap size={14} className="mr-2 text-violet-400" /> One-Click Demo Authority Access
          </Button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white text-xs uppercase tracking-wider font-bold"
          >
            &larr; Return to Public Portal
          </button>
        </div>
      </GlassCard>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <GlassCard className="max-w-md w-full p-6 border-white/10 text-left relative">
            <button 
              onClick={() => { setShowForgotModal(false); setResetStatus(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your official email to receive a password recovery link.</p>

            {resetStatus && (
              <div className="text-xs p-3 rounded-lg mb-4 bg-violet-500/10 border border-violet-500/30 text-violet-300">
                {resetStatus}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input 
                type="email" 
                placeholder="officer@safesignal.org" 
                className="w-full bg-[#150f24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowForgotModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Send Recovery Link
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default AuthorityLogin;
