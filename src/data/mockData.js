export const MOCK_ZONES = [
  { id: "z1", name: "Station Road — Zone 14" },
  { id: "z2", name: "University Campus — Sector B" },
  { id: "z3", name: "Downtown — Transit Hub" },
  { id: "z4", name: "Safety Zone A12" },
  { id: "z5", name: "Market Square" },
];

export const MOCK_CATEGORIES = [
  "Catcalling",
  "Following",
  "Verbal Harassment",
  "Threatening Behaviour",
  "Suspicious Behaviour",
  "Other"
];

// Seed some initial signals
export const MOCK_SIGNALS = [
  {
    id: "sig-1",
    gridZone: "Station Road — Zone 14",
    category: "Following",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    status: "PENDING",
    trustScore: 85,
    reporterDiversity: "High",
    timeSpread: "Medium",
    burstPenalty: "Low",
  },
  {
    id: "sig-2",
    gridZone: "Station Road — Zone 14",
    category: "Catcalling",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    status: "PENDING",
    trustScore: 85,
    reporterDiversity: "High",
    timeSpread: "Medium",
    burstPenalty: "Low",
  },
  {
    id: "sig-3",
    gridZone: "University Campus — Sector B",
    category: "Suspicious Behaviour",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    status: "PENDING",
    trustScore: 60,
    reporterDiversity: "Low",
    timeSpread: "High",
    burstPenalty: "High",
  }
];

// Seed some patterns for Authority
export const MOCK_PATTERNS = [
  {
    id: "pat-101",
    gridZone: "Station Road — Zone 14",
    detectedFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    detectedTo: new Date().toISOString(),
    reportCount: 12,
    categories: ["Following", "Catcalling", "Verbal Harassment"],
    trustScore: 87,
    priority: "High",
    status: "Emerging",
    reporterDiversity: "High",
    timeSpread: "High",
    burstPenalty: "Low"
  },
  {
    id: "pat-102",
    gridZone: "Downtown — Transit Hub",
    detectedFrom: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    detectedTo: new Date().toISOString(),
    reportCount: 5,
    categories: ["Threatening Behaviour"],
    trustScore: 65,
    priority: "Medium",
    status: "Under Review",
    reporterDiversity: "Medium",
    timeSpread: "Low",
    burstPenalty: "Medium"
  }
];
