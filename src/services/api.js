import { supabase } from '../lib/supabase';
import { evaluateGridZone } from './patternEngine';
import * as mockApi from './mockApi';

// Determine if mock mode is explicitly forced or if Supabase URL is placeholder
const isMockForced = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const isPlaceholderSupabase = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

export const isUsingMockMode = () => isMockForced || isPlaceholderSupabase;

/**
 * Submit an anonymous safety signal
 */
export const submitSignal = async (signalData, approxLat, approxLng) => {
  if (isUsingMockMode()) {
    return mockApi.submitSignal(signalData, approxLat, approxLng);
  }

  try {
    const { error } = await supabase
      .from('safety_signals')
      .insert([signalData]);

    if (error) throw error;
    
    // Client-side pattern evaluation fallback for MVP
    if (signalData?.grid_zone) {
      evaluateGridZone(signalData.grid_zone, approxLat, approxLng).catch(console.error);
    }

    return true;
  } catch (err) {
    console.warn("Supabase submitSignal failed, falling back to mock storage:", err.message);
    return mockApi.submitSignal(signalData, approxLat, approxLng);
  }
};

/**
 * Authority: Get Patterns
 */
export const getPatterns = async () => {
  if (isUsingMockMode()) {
    return mockApi.getPatterns();
  }

  try {
    const { data, error } = await supabase
      .from('safety_patterns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data && data.length > 0 ? data : mockApi.getPatterns();
  } catch (err) {
    console.warn("Supabase getPatterns failed, falling back to mock patterns:", err.message);
    return mockApi.getPatterns();
  }
};

/**
 * Authority: Get Signals
 */
export const getSignals = async () => {
  if (isUsingMockMode()) {
    return mockApi.getSignals();
  }

  try {
    const { data, error } = await supabase
      .from('safety_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data && data.length > 0 ? data : mockApi.getSignals();
  } catch (err) {
    console.warn("Supabase getSignals failed, falling back to mock signals:", err.message);
    return mockApi.getSignals();
  }
};

/**
 * Authority: Review Pattern
 */
export const reviewPattern = async (patternId, newStatus, notes, authorityId) => {
  if (isUsingMockMode()) {
    return mockApi.reviewPattern(patternId, newStatus, notes, authorityId);
  }

  try {
    const { data: pattern, error: patternError } = await supabase
      .from('safety_patterns')
      .update({ status: newStatus })
      .eq('id', patternId)
      .select()
      .single();

    if (patternError) throw patternError;

    const actionMap = {
      'validated': 'validate',
      'dismissed': 'dismiss',
      'under_review': 'review'
    };

    await supabase
      .from('reviews')
      .insert([{
        pattern_id: patternId,
        authority_id: authorityId || null,
        action: actionMap[newStatus] || 'review',
        notes
      }]);

    return pattern;
  } catch (err) {
    console.warn("Supabase reviewPattern failed, falling back to mock:", err.message);
    return mockApi.reviewPattern(patternId, newStatus, notes, authorityId);
  }
};

/**
 * Map: Get Safety Zones
 */
export const getSafetyZones = async () => {
  if (isUsingMockMode()) {
    return mockApi.getSafetyZones();
  }

  try {
    const { data, error } = await supabase
      .from('safety_zones')
      .select('*');

    if (error) throw error;
    return data && data.length > 0 ? data : mockApi.getSafetyZones();
  } catch (err) {
    console.warn("Supabase getSafetyZones failed, falling back to mock zones:", err.message);
    return mockApi.getSafetyZones();
  }
};

/**
 * Dashboard Summary KPI Stats
 */
export const getDashboardStats = async () => {
  if (isUsingMockMode()) {
    return mockApi.getDashboardStats();
  }

  try {
    const [
      { count: signalCount, error: sigErr },
      { count: patternCount, error: patErr },
      { count: reviewCount, error: revErr },
      { count: highTrustCount, error: trustErr }
    ] = await Promise.all([
      supabase.from('safety_signals').select('*', { count: 'exact', head: true }),
      supabase.from('safety_patterns').select('*', { count: 'exact', head: true }).eq('status', 'emerging'),
      supabase.from('safety_patterns').select('*', { count: 'exact', head: true }).eq('status', 'under_review'),
      supabase.from('safety_patterns').select('*', { count: 'exact', head: true }).gte('trust_score', 80)
    ]);

    if (sigErr || patErr || revErr || trustErr) {
      throw new Error("Supabase query error on dashboard stats");
    }

    return {
      totalSignals: signalCount || 0,
      emergingPatterns: patternCount || 0,
      pendingReviews: reviewCount || 0,
      highTrustPatterns: highTrustCount || 0
    };
  } catch (err) {
    console.warn("Supabase getDashboardStats failed, falling back to mock stats:", err.message);
    return mockApi.getDashboardStats();
  }
};
