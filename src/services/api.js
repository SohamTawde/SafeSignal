import { supabase } from '../lib/supabase';
import { evaluateGridZone } from './patternEngine';
import * as mockApi from './mockApi';
import { enqueueSignal, normalizeCategory, sanitizeSignalForDb } from './syncManager';

// Determine if mock mode is explicitly forced or if Supabase URL is placeholder
const isMockForced = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const isPlaceholderSupabase = !import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

export const isUsingMockMode = () => isMockForced || isPlaceholderSupabase;

/**
 * Submit an anonymous safety signal (with offline queue & auto-sync support)
 */
export const submitSignal = async (signalData, approxLat, approxLng) => {
  const cleanSignal = sanitizeSignalForDb(signalData);
  const effectiveLat = approxLat ?? signalData?.latitude ?? signalData?.approxLat;
  const effectiveLng = approxLng ?? signalData?.longitude ?? signalData?.approxLng;

  if (isUsingMockMode()) {
    const mockRes = await mockApi.submitSignal(cleanSignal, effectiveLat, effectiveLng);
    return { success: true, queued: false, data: mockRes };
  }

  // If offline, immediately enqueue to local vault
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const queuedItem = enqueueSignal(cleanSignal, effectiveLat, effectiveLng);
    return { 
      success: true, 
      queued: true, 
      item: queuedItem, 
      message: 'Signal safely saved offline. Will auto-sync when online.' 
    };
  }

  try {
    // Insert into Supabase safety_signals WITHOUT .select() (RLS compliant)
    const { error } = await supabase
      .from('safety_signals')
      .insert([cleanSignal]);

    if (error) throw error;
    
    // Trigger grid zone pattern aggregation for Authority Dashboard
    if (cleanSignal?.grid_zone) {
      evaluateGridZone(cleanSignal.grid_zone, effectiveLat, effectiveLng, cleanSignal).catch(console.error);
    }

    return { success: true, queued: false, data: cleanSignal };
  } catch (err) {
    console.warn("Supabase submitSignal failed, enqueuing to offline sync vault:", err.message);
    const queuedItem = enqueueSignal(cleanSignal, effectiveLat, effectiveLng);
    return { 
      success: true, 
      queued: true, 
      item: queuedItem, 
      message: 'Network transmission failed. Saved offline and will auto-sync.' 
    };
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
    if (data && data.length > 0) return data;

    // Fallback: If anonymous client RLS restricts selecting safety_signals,
    // construct representative signals from safety_patterns so charts display real pattern statistics
    const patterns = await getPatterns();
    const synthesized = [];
    (patterns || []).forEach((p) => {
      const count = p.report_count || 1;
      const cats = Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : ['other'];
      for (let i = 0; i < count; i++) {
        synthesized.push({
          id: `syn-${p.id}-${i}`,
          grid_zone: p.grid_zone,
          category: cats[i % cats.length],
          reported_at: p.end_time || p.created_at || new Date().toISOString(),
          status: p.status
        });
      }
    });
    return synthesized.length > 0 ? synthesized : mockApi.getSignals();
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
      { count: signalCount },
      { count: patternCount },
      { count: reviewCount },
      { count: highTrustCount },
      { data: allPatterns }
    ] = await Promise.all([
      supabase.from('safety_signals').select('*', { count: 'exact', head: true }),
      supabase.from('safety_patterns').select('*', { count: 'exact', head: true }).eq('status', 'emerging'),
      supabase.from('safety_patterns').select('*', { count: 'exact', head: true }).eq('status', 'under_review'),
      supabase.from('safety_patterns').select('*', { count: 'exact', head: true }).gte('trust_score', 80),
      supabase.from('safety_patterns').select('report_count')
    ]);

    // Calculate total signals from patterns if direct signal count is restricted by anonymous RLS
    const totalFromPatterns = (allPatterns || []).reduce((sum, p) => sum + (Number(p.report_count) || 0), 0);
    const effectiveSignalCount = Math.max(signalCount || 0, totalFromPatterns);

    return {
      totalSignals: effectiveSignalCount,
      emergingPatterns: patternCount || 0,
      pendingReviews: reviewCount || 0,
      highTrustPatterns: highTrustCount || 0
    };
  } catch (err) {
    console.warn("Supabase getDashboardStats failed, falling back to mock stats:", err.message);
    return mockApi.getDashboardStats();
  }
};
