import { supabase } from '../lib/supabase';
import { evaluateGridZone } from './patternEngine';
import * as mockApi from './mockApi';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

const QUEUE_STORAGE_KEY = 'nirbhaya_offline_queue';
const LAST_SYNCED_KEY = 'nirbhaya_last_synced';

// Strict categories supported by Supabase schema
const VALID_CATEGORIES = [
  'catcalling', 
  'following', 
  'verbal_harassment', 
  'threatening_behavior', 
  'suspicious_behavior', 
  'other'
];

/**
 * Normalizes any category string into valid database enum
 */
export const normalizeCategory = (cat) => {
  if (!cat) return 'other';
  const c = cat.toLowerCase().replace(/[-\s]/g, '_');
  if (VALID_CATEGORIES.includes(c)) return c;
  if (c === 'stalking') return 'threatening_behavior';
  if (c === 'unsafe_area') return 'suspicious_behavior';
  if (c === 'poor_lighting') return 'other';
  if (c.includes('harass')) return 'verbal_harassment';
  if (c.includes('threat')) return 'threatening_behavior';
  if (c.includes('suspicious')) return 'suspicious_behavior';
  return 'other';
};

// Check if running in mock mode
const isUsingMock = () => {
  const isMockForced = import.meta.env?.VITE_USE_MOCK_DATA === 'true';
  const isPlaceholder = !import.meta.env?.VITE_SUPABASE_URL || 
    import.meta.env?.VITE_SUPABASE_URL.includes('placeholder');
  return isMockForced || isPlaceholder;
};

// Internal State
let listeners = new Set();
let isOnline = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' 
  ? navigator.onLine 
  : true;
let isSyncing = false;

export const getQueue = () => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to parse offline queue:', err);
    return [];
  }
};

const saveQueue = (queue) => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  } catch (err) {
    console.error('Failed to save offline queue to localStorage:', err);
  }
  notifyListeners();
};

export const getLastSyncedAt = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(LAST_SYNCED_KEY) || null;
  } catch {
    return null;
  }
};

const notifyListeners = () => {
  const state = {
    isOnline,
    isSyncing,
    pendingCount: getQueue().length,
    lastSyncedAt: getLastSyncedAt()
  };
  listeners.forEach(cb => {
    try {
      cb(state);
    } catch (e) {
      console.error('Error in sync listener:', e);
    }
  });
};

/**
 * Enqueue a signal for offline processing
 */
export const enqueueSignal = (signalData, approxLat, approxLng) => {
  const currentQueue = getQueue();
  const normalizedCategory = normalizeCategory(signalData.category);

  const queuedItem = {
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    signalData: {
      ...signalData,
      category: normalizedCategory,
      reported_at: signalData.reported_at || new Date().toISOString()
    },
    approxLat,
    approxLng,
    enqueuedAt: new Date().toISOString(),
    retryCount: 0
  };

  currentQueue.push(queuedItem);
  saveQueue(currentQueue);
  return queuedItem;
};

/**
 * Attempt to process and empty the offline queue
 */
export const processQueue = async () => {
  if (isSyncing) return { processed: 0, remaining: getQueue().length };
  
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    isOnline = false;
    notifyListeners();
    return { processed: 0, remaining: getQueue().length };
  }

  const queue = getQueue();
  if (queue.length === 0) {
    return { processed: 0, remaining: 0 };
  }

  isSyncing = true;
  notifyListeners();

  let processedCount = 0;
  const remainingItems = [];

  for (const item of queue) {
    try {
      if (isUsingMock()) {
        await mockApi.submitSignal(item.signalData, item.approxLat, item.approxLng);
        processedCount++;
      } else {
        const { error } = await supabase
          .from('safety_signals')
          .insert([item.signalData]);

        if (error) {
          throw error;
        }

        // Trigger client-side pattern evaluation for synced zone
        if (item.signalData?.grid_zone) {
          evaluateGridZone(item.signalData.grid_zone, item.approxLat, item.approxLng).catch(() => {});
        }

        processedCount++;
      }
    } catch (err) {
      console.warn(`Sync failed for item ${item.id}:`, err.message || err);
      // Increment retry count and keep item
      remainingItems.push({
        ...item,
        retryCount: (item.retryCount || 0) + 1,
        lastError: err.message || 'Transmission failed'
      });
      // If error is network related, stop processing remainder
      if (err.message && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch'))) {
        isOnline = false;
        // Keep rest of queue unchanged
        const idx = queue.indexOf(item);
        if (idx !== -1 && idx < queue.length - 1) {
          remainingItems.push(...queue.slice(idx + 1));
        }
        break;
      }
    }
  }

  saveQueue(remainingItems);
  if (processedCount > 0) {
    const now = new Date().toISOString();
    try {
      localStorage.setItem(LAST_SYNCED_KEY, now);
    } catch {}
  }

  isSyncing = false;
  notifyListeners();

  return {
    processed: processedCount,
    remaining: remainingItems.length
  };
};

/**
 * Manual trigger for user actions
 */
export const syncNow = () => {
  return processQueue();
};

/**
 * Subscribe to connectivity and queue status
 */
export const subscribeSyncStatus = (callback) => {
  listeners.add(callback);
  // Emit initial state
  callback({
    isOnline,
    isSyncing,
    pendingCount: getQueue().length,
    lastSyncedAt: getLastSyncedAt()
  });

  return () => {
    listeners.delete(callback);
  };
};

// Initialize listeners on module load
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    notifyListeners();
    processQueue();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    notifyListeners();
  });

  // Mobile app resumed/foreground listener
  if (Capacitor.isNativePlatform()) {
    try {
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive && isOnline) {
          processQueue();
        }
      });
    } catch {}
  }

  // Periodic check (every 30 seconds) if queue has pending items
  setInterval(() => {
    if (isOnline && getQueue().length > 0 && !isSyncing) {
      processQueue();
    }
  }, 30000);
}
