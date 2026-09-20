import { DEFAULT_PILOT_ZONES } from '../config/geoConfig';
import { calculateTrustScoreEngine } from './trustScore';

// In-memory mock storage
let mockZones = [...DEFAULT_PILOT_ZONES];

let mockSignals = [
  {
    id: "sig-001",
    grid_zone: "ZONE-A-014",
    category: "catcalling",
    reported_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "aggregated",
    anonymous_reporter_hash: "anon-usr-1"
  },
  {
    id: "sig-002",
    grid_zone: "ZONE-A-014",
    category: "following",
    reported_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: "aggregated",
    anonymous_reporter_hash: "anon-usr-2"
  },
  {
    id: "sig-003",
    grid_zone: "ZONE-C-105",
    category: "suspicious_behavior",
    reported_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: "aggregated",
    anonymous_reporter_hash: "anon-usr-3"
  },
  {
    id: "sig-004",
    grid_zone: "ZONE-D-088",
    category: "verbal_harassment",
    reported_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: "aggregated",
    anonymous_reporter_hash: "anon-usr-4"
  },
  {
    id: "sig-005",
    grid_zone: "ZONE-D-088",
    category: "threatening_behavior",
    reported_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: "aggregated",
    anonymous_reporter_hash: "anon-usr-5"
  }
];

let mockPatterns = [
  {
    id: "pat-101",
    grid_zone: "ZONE-A-014",
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    end_time: new Date().toISOString(),
    report_count: 2,
    categories: ["catcalling", "following"],
    trust_score: 65,
    reporter_diversity: 100,
    time_spread: 35,
    category_diversity: 50,
    burst_penalty: 0,
    priority: "medium",
    status: "emerging",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "pat-102",
    grid_zone: "ZONE-C-105",
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    end_time: new Date().toISOString(),
    report_count: 4,
    categories: ["suspicious_behavior", "other"],
    trust_score: 82,
    reporter_diversity: 80,
    time_spread: 70,
    category_diversity: 50,
    burst_penalty: 0,
    priority: "high",
    status: "under_review",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "pat-103",
    grid_zone: "ZONE-D-088",
    start_time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    end_time: new Date().toISOString(),
    report_count: 8,
    categories: ["verbal_harassment", "threatening_behavior"],
    trust_score: 95,
    reporter_diversity: 90,
    time_spread: 85,
    category_diversity: 75,
    burst_penalty: 0,
    priority: "critical",
    status: "validated",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  }
];

let mockReviews = [];

const loadFromStorage = () => {
  try {
    const s = localStorage.getItem('nirbhaya_mock_signals');
    if (s) { const parsed = JSON.parse(s); if (parsed.length > 0) mockSignals = parsed; }
    const p = localStorage.getItem('nirbhaya_mock_patterns');
    if (p) { const parsed = JSON.parse(p); if (parsed.length > 0) mockPatterns = parsed; }
    const z = localStorage.getItem('nirbhaya_mock_zones');
    if (z) { const parsed = JSON.parse(z); if (parsed.length > 0) mockZones = parsed; }
  } catch (e) {}
};

const saveToStorage = () => {
  try {
    localStorage.setItem('nirbhaya_mock_signals', JSON.stringify(mockSignals));
    localStorage.setItem('nirbhaya_mock_patterns', JSON.stringify(mockPatterns));
    localStorage.setItem('nirbhaya_mock_zones', JSON.stringify(mockZones));
  } catch (e) {}
};

// Initial load on script execution
loadFromStorage();

export const submitSignal = async (signalData, approxLat = 40.7128, approxLng = -74.0060) => {
  loadFromStorage();
  const newSignal = {
    id: `sig-${Date.now()}`,
    ...signalData,
    reported_at: new Date().toISOString(),
    status: "pending"
  };
  mockSignals.unshift(newSignal);

  // In-memory pattern evaluation for mock mode
  const zoneSignals = mockSignals.filter(s => s.grid_zone === signalData.grid_zone);
  const { finalScore, breakdown } = calculateTrustScoreEngine(zoneSignals);

  let priority = 'low';
  if (finalScore > 80 && zoneSignals.length >= 3) priority = 'critical';
  else if (finalScore > 60) priority = 'high';
  else if (finalScore > 40) priority = 'medium';

  const existingPatternIndex = mockPatterns.findIndex(p => p.grid_zone === signalData.grid_zone && ['emerging', 'under_review'].includes(p.status));
  const categories = [...new Set(zoneSignals.map(s => s.category))];

  if (existingPatternIndex !== -1) {
    mockPatterns[existingPatternIndex] = {
      ...mockPatterns[existingPatternIndex],
      report_count: zoneSignals.length,
      categories,
      trust_score: finalScore,
      reporter_diversity: breakdown.reporterDiversity,
      time_spread: breakdown.timeSpread,
      category_diversity: breakdown.categoryDiversity,
      burst_penalty: breakdown.burstPenalty,
      priority,
      end_time: new Date().toISOString()
    };
  } else {
    mockPatterns.unshift({
      id: `pat-${Date.now()}`,
      grid_zone: signalData.grid_zone,
      start_time: new Date().toISOString(),
      end_time: new Date().toISOString(),
      report_count: 1,
      categories,
      trust_score: finalScore,
      reporter_diversity: breakdown.reporterDiversity,
      time_spread: breakdown.timeSpread,
      category_diversity: breakdown.categoryDiversity,
      burst_penalty: breakdown.burstPenalty,
      priority,
      status: 'emerging',
      created_at: new Date().toISOString()
    });
  }

  // Update or insert zone
  const zoneIndex = mockZones.findIndex(z => z.grid_zone === signalData.grid_zone);
  const activityLevel = (priority === 'critical' || priority === 'high') ? 'high_priority' : (priority === 'medium') ? 'emerging' : 'under_review';

  if (zoneIndex !== -1) {
    mockZones[zoneIndex] = {
      ...mockZones[zoneIndex],
      activity_level: activityLevel,
      trust_score: finalScore,
      categories
    };
  } else {
    mockZones.push({
      id: `zone-${Date.now()}`,
      zone_name: signalData.grid_zone,
      grid_zone: signalData.grid_zone,
      center_lat: approxLat,
      center_lng: approxLng,
      activity_level: activityLevel,
      trust_score: finalScore,
      categories
    });
  }

  saveToStorage();
  return newSignal;
};

export const getPatterns = async () => {
  loadFromStorage();
  return [...mockPatterns];
};

export const getSignals = async () => {
  loadFromStorage();
  return [...mockSignals];
};

export const reviewPattern = async (patternId, newStatus, notes, authorityId) => {
  loadFromStorage();
  const patternIndex = mockPatterns.findIndex(p => p.id === patternId);
  if (patternIndex !== -1) {
    mockPatterns[patternIndex] = {
      ...mockPatterns[patternIndex],
      status: newStatus
    };
    mockReviews.push({
      id: `rev-${Date.now()}`,
      pattern_id: patternId,
      authority_id: authorityId || 'mock-authority-1',
      action: newStatus,
      notes: notes || 'Reviewed via mock',
      created_at: new Date().toISOString()
    });
    saveToStorage();
    return mockPatterns[patternIndex];
  }
  throw new Error("Pattern not found");
};

export const getSafetyZones = async () => {
  loadFromStorage();
  return [...mockZones];
};

export const getDashboardStats = async () => {
  loadFromStorage();
  const emerging = mockPatterns.filter(p => p.status === 'emerging').length;
  const underReview = mockPatterns.filter(p => p.status === 'under_review').length;
  const highTrust = mockPatterns.filter(p => p.trust_score >= 80).length;

  return {
    totalSignals: mockSignals.length,
    emergingPatterns: emerging,
    pendingReviews: underReview,
    highTrustPatterns: highTrust
  };
};
