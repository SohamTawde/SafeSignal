import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const signInAsDemoAuthority = () => {
    const demoUser = {
      id: 'demo-officer-001',
      email: 'officer.demo@nirbhaya.org'
    };
    const demoProfile = {
      id: 'demo-officer-001',
      email: 'officer.demo@nirbhaya.org',
      full_name: 'Officer J. Miller',
      role: 'authority'
    };
    setUser(demoUser);
    setProfile(demoProfile);
    localStorage.setItem('nirbhaya_demo_session', 'true');
  };

  useEffect(() => {
    // Check if demo authority session is active
    if (localStorage.getItem('nirbhaya_demo_session') === 'true') {
      signInAsDemoAuthority();
      setLoading(false);
      return;
    }

    // Safety timeout: Ensure loading never hangs if Supabase connection is offline/slow
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timer);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      clearTimeout(timer);
      setLoading(false);
    });

    // Listen for auth changes safely
    let subscription = null;
    try {
      const authRes = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });
      subscription = authRes?.data?.subscription;
    } catch (err) {
      console.warn("Auth state change listener error:", err);
    }

    return () => {
      clearTimeout(timer);
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) setProfile(data);
    } catch (err) {
      console.warn("Could not fetch profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = (email, password) => {
    localStorage.removeItem('nirbhaya_demo_session');
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = () => {
    localStorage.removeItem('nirbhaya_demo_session');
    setUser(null);
    setProfile(null);
    return supabase.auth.signOut();
  };

  const resetPassword = (email) => {
    return supabase.auth.resetPasswordForEmail(email);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    resetPassword,
    signInAsDemoAuthority
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
