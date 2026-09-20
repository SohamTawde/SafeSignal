import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { 
  normalizeCategory, 
  enqueueSignal, 
  getQueue, 
  processQueue, 
  subscribeSyncStatus 
} from '../services/syncManager';

describe('Nirbhaya Offline Queue & Auto-Sync Manager', () => {
  const store = new Map();
  const mockStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };

  beforeAll(() => {
    globalThis.localStorage = mockStorage;
  });

  beforeEach(() => {
    store.clear();
  });

  describe('Category Normalization', () => {
    it('normalizes mobile categories to valid Supabase database enums', () => {
      expect(normalizeCategory('following')).toBe('following');
      expect(normalizeCategory('catcalling')).toBe('catcalling');
      expect(normalizeCategory('verbal_harassment')).toBe('verbal_harassment');
      expect(normalizeCategory('unsafe_area')).toBe('suspicious_behavior');
      expect(normalizeCategory('stalking')).toBe('threatening_behavior');
      expect(normalizeCategory('poor_lighting')).toBe('other');
    });

    it('gracefully handles missing, empty or arbitrary category names', () => {
      expect(normalizeCategory(null)).toBe('other');
      expect(normalizeCategory('')).toBe('other');
      expect(normalizeCategory('random_unknown_type')).toBe('other');
      expect(normalizeCategory('aggressive harassment')).toBe('verbal_harassment');
    });
  });

  describe('Offline Queue Storage & Enqueueing', () => {
    it('enqueues a signal into local persistent storage with PII-free metadata', () => {
      const signal = {
        category: 'stalking',
        grid_zone: 'ZONE-A-014',
      };

      const queued = enqueueSignal(signal, 40.7128, -74.0060);
      expect(queued.id).toMatch(/^queue_/);
      expect(queued.signalData.category).toBe('threatening_behavior'); // Normalized
      expect(queued.signalData.grid_zone).toBe('ZONE-A-014');
      expect(queued.retryCount).toBe(0);

      const queue = getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].id).toBe(queued.id);
    });

    it('notifies status subscribers upon enqueueing', () => {
      let latestStatus = null;
      const unsubscribe = subscribeSyncStatus((status) => {
        latestStatus = status;
      });

      expect(latestStatus.pendingCount).toBe(0);

      enqueueSignal({ category: 'following', grid_zone: 'ZONE-B-022' }, 40.7128, -74.0060);
      expect(latestStatus.pendingCount).toBe(1);

      unsubscribe();
    });
  });

  describe('Queue Processing & Synchronization', () => {
    it('processes queued signals and drains the queue', async () => {
      enqueueSignal({ category: 'following', grid_zone: 'ZONE-A-014' }, 40.7128, -74.0060);
      enqueueSignal({ category: 'catcalling', grid_zone: 'ZONE-A-014' }, 40.7128, -74.0060);

      expect(getQueue().length).toBe(2);

      const result = await processQueue();
      expect(result.processed).toBeGreaterThanOrEqual(1);

      const remainingQueue = getQueue();
      expect(remainingQueue.length).toBe(0);
    });
  });
});
