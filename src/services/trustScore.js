import { TRUST_SCORE_CONFIG } from '../config/trustScoreConfig';

/**
 * SafeSignal Trust Score Engine
 * TRUST THROUGH DIVERSITY, NOT RAW VOLUME.
 */

// 1. Reporter Diversity (0-100)
export const calculateReporterDiversity = (signals) => {
  if (!signals || signals.length === 0) return 0;
  
  const uniqueReporters = new Set(signals.map(s => s.anonymous_reporter_hash || s.id));
  const ratio = uniqueReporters.size / signals.length;
  
  // Normalize ratio to 0-100 score. 
  // If ratio is 1.0 (all unique), score is 100.
  return Math.round(ratio * 100);
};

// 2. Time Spread (0-100)
export const calculateTimeSpread = (signals) => {
  if (!signals || signals.length <= 1) return 0;
  
  const oldestTime = Math.min(...signals.map(s => new Date(s.reported_at).getTime()));
  const newestTime = Math.max(...signals.map(s => new Date(s.reported_at).getTime()));
  
  const timeSpreadHours = (newestTime - oldestTime) / (1000 * 60 * 60);
  
  // Example normalization: 0 hours = 0, >= 24 hours = 100
  // Capped at 100
  let score = (timeSpreadHours / 24) * 100;
  return Math.round(Math.min(Math.max(score, 0), 100));
};

// 3. Category Diversity (0-100)
export const calculateCategoryDiversity = (signals) => {
  if (!signals || signals.length === 0) return 0;
  
  const uniqueCategories = new Set(signals.map(s => s.category));
  
  // Max possible categories in the system is around 6
  // We'll say 4 unique categories is a 100 score for pattern detection
  const ratio = uniqueCategories.size / 4;
  
  return Math.round(Math.min(ratio * 100, 100));
};

// 4. Burst Penalty (0-100)
export const calculateBurstPenalty = (signals) => {
  if (!signals || signals.length <= 3) return 0;
  
  const oldestTime = Math.min(...signals.map(s => new Date(s.reported_at).getTime()));
  const newestTime = Math.max(...signals.map(s => new Date(s.reported_at).getTime()));
  
  const timeSpreadSeconds = (newestTime - oldestTime) / 1000;
  
  // If there are many reports in less than 60 seconds, apply a heavy penalty.
  if (timeSpreadSeconds < 60) {
    return 100; // Maximum burst penalty
  } else if (timeSpreadSeconds < 300) {
    return 50; // Moderate burst penalty (within 5 mins)
  }
  
  return 0; // No burst penalty
};

// Main Engine Function
export const calculateTrustScoreEngine = (signals) => {
  if (!signals || signals.length === 0) {
    return { finalScore: 0, breakdown: { reporterDiversity: 0, timeSpread: 0, categoryDiversity: 0, burstPenalty: 0 }};
  }

  // Base case for a single signal
  if (signals.length === 1) {
    return { finalScore: 15, breakdown: { reporterDiversity: 100, timeSpread: 0, categoryDiversity: 25, burstPenalty: 0 }};
  }

  const reporterDiversity = calculateReporterDiversity(signals);
  const timeSpread = calculateTimeSpread(signals);
  const categoryDiversity = calculateCategoryDiversity(signals);
  const burstPenalty = calculateBurstPenalty(signals);

  const { reporterDiversityWeight, timeSpreadWeight, categoryDiversityWeight, burstPenaltyWeight } = TRUST_SCORE_CONFIG;

  const baseScore = 
    (reporterDiversity * reporterDiversityWeight) +
    (timeSpread * timeSpreadWeight) +
    (categoryDiversity * categoryDiversityWeight);

  // Apply penalty based on its weight
  const finalScore = Math.max(0, baseScore - (burstPenalty * burstPenaltyWeight));

  return {
    finalScore: Math.round(finalScore),
    breakdown: {
      reporterDiversity,
      timeSpread,
      categoryDiversity,
      burstPenalty
    }
  };
};
