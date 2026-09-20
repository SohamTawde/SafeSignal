import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers & System
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Eager Landing Page for instant loading
import NirbhayaLanding from './pages/NirbhayaLanding';

// Lazy Loaded Routes for performance & adblocker isolation
const AnonymousReport = lazy(() => import('./pages/AnonymousReport'));
const EmergencySOS = lazy(() => import('./pages/EmergencySOS'));
const SafetyMap = lazy(() => import('./pages/SafetyMap'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AuthorityLogin = lazy(() => import('./pages/AuthorityLogin'));
const MobilePage = lazy(() => import('./pages/MobilePage'));

// Authority Dashboard Pages (Lazy)
const AuthorityDashboard = lazy(() => import('./components/AuthorityDashboard'));
const AuthorityOverview = lazy(() => import('./pages/authority/AuthorityOverview'));
const AuthorityMap = lazy(() => import('./pages/authority/AuthorityMap'));
const EmergingPatterns = lazy(() => import('./pages/authority/EmergingPatterns'));
const HumanReview = lazy(() => import('./pages/authority/HumanReview'));
const NetworkMetrics = lazy(() => import('./pages/authority/NetworkMetrics'));
const Settings = lazy(() => import('./pages/authority/Settings'));
const TrustScoreDemo = lazy(() => import('./pages/authority/TrustScoreDemo'));

import { Capacitor } from '@capacitor/core';

import './index.css';

const RouteFallback = () => (
  <div className="min-h-screen bg-[#0b0710] text-white flex items-center justify-center font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Loading Nirbhaya...</p>
    </div>
  </div>
);

function App() {
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* --- Public Citizen Routes --- */}
              <Route path="/" element={isNative ? <MobilePage /> : <NirbhayaLanding />} />
              <Route path="/report" element={<AnonymousReport />} />
              <Route path="/sos" element={<EmergencySOS />} />
              <Route path="/map" element={<SafetyMap />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/mobile" element={<MobilePage />} />

              {/* --- Authority Routes --- */}
              <Route path="/authority/login" element={<AuthorityLogin />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/authority" element={<AuthorityDashboard />}>
                  <Route index element={<AuthorityOverview />} />
                  <Route path="map" element={<AuthorityMap />} />
                  <Route path="patterns" element={<EmergingPatterns />} />
                  <Route path="review" element={<HumanReview />} />
                  <Route path="analytics" element={<NetworkMetrics />} />
                  <Route path="demo" element={<TrustScoreDemo />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Route>

              {/* --- Catch All Redirect --- */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;