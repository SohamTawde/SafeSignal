import { describe, it, expect } from 'vitest';
import { calculateTrustScoreEngine } from '../services/trustScore';

describe('SafeSignal Trust Score Engine', () => {
  const now = Date.now();

  it('Test 1: High diversity (9 unique reporters, multiple days, multiple categories) -> high score', () => {
    const signals = Array.from({ length: 10 }).map((_, i) => ({
      id: `sig-${i}`,
      anonymous_reporter_hash: `user-${i % 9}`, // 9 unique reporters
      category: i % 3 === 0 ? 'catcalling' : i % 3 === 1 ? 'following' : 'verbal_harassment', // 3 categories
      reported_at: new Date(now - (i * 12 * 60 * 60 * 1000)).toISOString() // Spread over 4.5 days
    }));
    
    const result = calculateTrustScoreEngine(signals);
    expect(result.finalScore).toBeGreaterThan(70);
    expect(result.breakdown.reporterDiversity).toBe(90); // 9/10
    expect(result.breakdown.burstPenalty).toBe(0);
  });

  it('Test 2: Low diversity/spam (2 unique reporters, same minute, same category) -> low score', () => {
    const signals = Array.from({ length: 10 }).map((_, i) => ({
      id: `sig-${i}`,
      anonymous_reporter_hash: `user-${i % 2}`, // 2 unique reporters
      category: 'catcalling', // 1 category
      reported_at: new Date(now - (i * 2000)).toISOString() // Within 20 seconds
    }));
    
    const result = calculateTrustScoreEngine(signals);
    expect(result.finalScore).toBeLessThan(40);
    expect(result.breakdown.reporterDiversity).toBe(20); // 2/10
    expect(result.breakdown.burstPenalty).toBe(100); // Max penalty
  });

  it('Test 3: Single report -> no meaningful pattern (baseline 15)', () => {
    const signals = [{
      id: 'sig-1',
      anonymous_reporter_hash: 'user-1',
      category: 'catcalling',
      reported_at: new Date().toISOString()
    }];
    
    const result = calculateTrustScoreEngine(signals);
    expect(result.finalScore).toBe(15);
  });

  it('Test 4: Multiple reports over long period -> higher time spread', () => {
    const signals = Array.from({ length: 5 }).map((_, i) => ({
      id: `sig-${i}`,
      anonymous_reporter_hash: `user-${i}`,
      category: 'catcalling',
      reported_at: new Date(now - (i * 10 * 60 * 60 * 1000)).toISOString() // 40 hours spread
    }));
    
    const result = calculateTrustScoreEngine(signals);
    expect(result.breakdown.timeSpread).toBe(100); // Maxes out at 24 hours
  });

  it('Test 5: Large burst of reports -> heavy burst penalty', () => {
    const signals = Array.from({ length: 8 }).map((_, i) => ({
      id: `sig-${i}`,
      anonymous_reporter_hash: `user-${i}`,
      category: 'catcalling',
      reported_at: new Date(now - (i * 5000)).toISOString() // 40 seconds spread
    }));
    
    const result = calculateTrustScoreEngine(signals);
    expect(result.breakdown.burstPenalty).toBe(100);
  });

  it('Test 6: Multiple categories -> category diversity increases', () => {
    const categories = ['catcalling', 'following', 'verbal_harassment', 'suspicious_behavior'];
    const signals = Array.from({ length: 4 }).map((_, i) => ({
      id: `sig-${i}`,
      anonymous_reporter_hash: `user-${i}`,
      category: categories[i],
      reported_at: new Date(now - (i * 24 * 60 * 60 * 1000)).toISOString()
    }));
    
    const result = calculateTrustScoreEngine(signals);
    expect(result.breakdown.categoryDiversity).toBe(100); // 4 unique categories = 100%
  });
});
