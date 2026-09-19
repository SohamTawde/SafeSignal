import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0710] text-white font-sans p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
            Verifying authority credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/authority/login" replace />;
  }

  // Ensure they are an authority or admin
  if (profile && profile.role !== 'authority' && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-4">
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Unauthorized</h2>
          <p className="text-gray-300 mb-6">You do not have permission to access the Authority Dashboard.</p>
          <a href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
