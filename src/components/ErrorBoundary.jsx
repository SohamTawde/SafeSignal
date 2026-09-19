import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("SafeSignal ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0710] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#150f24] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              SafeSignal encountered an unexpected view error. Your session and safety data are safe.
            </p>

            {this.state.error?.message && (
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 mb-6 text-left overflow-x-auto">
                <p className="text-xs text-rose-400 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs uppercase tracking-widest transition-all"
              >
                <RefreshCw size={14} /> Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs uppercase tracking-widest border border-white/10 transition-all"
              >
                <Home size={14} /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
