import { describe, it, expect } from 'vitest';
import * as mockApi from '../services/mockApi';
import { calculateGridZone, calculateGridBounds, GRID_RESOLUTION } from '../config/geoConfig';

describe('Nirbhaya Geographic Grid Converter', () => {
  it('converts exact coordinates to 20m grid format', () => {
    const { gridZone, approxLat, approxLng, bounds } = calculateGridZone(40.7128, -74.0060);
    expect(gridZone).toMatch(/^ZONE-[AB]-\d{3}$/);
    expect(typeof approxLat).toBe('number');
    expect(typeof approxLng).toBe('number');
    expect(bounds).toHaveLength(2);
    expect(bounds[0]).toHaveLength(2);
    expect(bounds[1]).toHaveLength(2);
  });

  it('calculates rectangular 20m bounding box properly', () => {
    const lat = 40.7128;
    const lng = -74.0060;
    const bounds = calculateGridBounds(lat, lng, GRID_RESOLUTION);
    const half = GRID_RESOLUTION / 2;
    expect(bounds[0][0]).toBeCloseTo(lat - half);
    expect(bounds[0][1]).toBeCloseTo(lng - half);
    expect(bounds[1][0]).toBeCloseTo(lat + half);
    expect(bounds[1][1]).toBeCloseTo(lng + half);
  });
});

describe('Nirbhaya Mock API & Pattern Aggregation', () => {
  it('fetches safety zones with coordinates and activity levels', async () => {
    const zones = await mockApi.getSafetyZones();
    expect(zones.length).toBeGreaterThan(0);
    const firstZone = zones[0];
    expect(firstZone).toHaveProperty('grid_zone');
    expect(firstZone).toHaveProperty('center_lat');
    expect(firstZone).toHaveProperty('center_lng');
    expect(firstZone).toHaveProperty('activity_level');
  });

  it('submits an anonymous signal and updates mock patterns dynamically', async () => {
    const testZone = 'ZONE-TEST-099';
    const newSignal = await mockApi.submitSignal({
      grid_zone: testZone,
      category: 'catcalling',
      anonymous_reporter_hash: 'anon-test-hash'
    }, 40.7128, -74.0060);

    expect(newSignal).toHaveProperty('id');
    expect(newSignal.grid_zone).toBe(testZone);

    const patterns = await mockApi.getPatterns();
    const createdPattern = patterns.find(p => p.grid_zone === testZone);
    expect(createdPattern).toBeDefined();
    expect(createdPattern.report_count).toBeGreaterThanOrEqual(1);
    expect(createdPattern.trust_score).toBeGreaterThanOrEqual(0);
  });

  it('reviews an existing pattern and persists status change', async () => {
    const patterns = await mockApi.getPatterns();
    const patternToReview = patterns[0];
    
    const reviewed = await mockApi.reviewPattern(
      patternToReview.id,
      'validated',
      'Officer verified camera footage',
      'officer-test'
    );

    expect(reviewed.status).toBe('validated');
  });

  it('calculates dashboard statistics accurately', async () => {
    const stats = await mockApi.getDashboardStats();
    expect(typeof stats.totalSignals).toBe('number');
    expect(typeof stats.emergingPatterns).toBe('number');
    expect(typeof stats.pendingReviews).toBe('number');
    expect(typeof stats.highTrustPatterns).toBe('number');
  });
});
