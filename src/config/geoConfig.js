/**
 * Nirbhaya Geographic & Grid Configuration
 * Centralized coordinates, resolution metrics, and privacy grid conversions.
 */

// Default pilot metropolitan center (matching seed.sql)
export const DEFAULT_PILOT_LOCATION = {
  lat: 40.7128,
  lng: -74.0060,
  zoom: 15,
  name: "Metro Pilot Safety Grid"
};

// Approximate 20m grid resolution in degrees
export const GRID_RESOLUTION = 0.0002;

/**
 * Converts exact lat/lng into an approximate 20m grid zone identifier and center point.
 * Exact coordinates are never stored or transmitted to the database.
 */
export const calculateGridZone = (lat, lng, resolution = GRID_RESOLUTION) => {
  const gridLat = Math.floor(lat / resolution);
  const gridLng = Math.floor(lng / resolution);
  const zoneRegion = Math.abs(gridLat % 2) === 0 ? 'A' : 'B';
  const gridZone = `ZONE-${zoneRegion}-${Math.abs(gridLat % 100).toString().padStart(3, '0')}`;

  const approxLat = (gridLat * resolution) + (resolution / 2);
  const approxLng = (gridLng * resolution) + (resolution / 2);

  return {
    gridZone,
    approxLat,
    approxLng,
    bounds: calculateGridBounds(approxLat, approxLng, resolution)
  };
};

/**
 * Returns a 2-point bounding box [[south, west], [north, east]] for Leaflet Rectangle
 */
export const calculateGridBounds = (centerLat, centerLng, resolution = GRID_RESOLUTION) => {
  const half = resolution / 2;
  return [
    [centerLat - half, centerLng - half],
    [centerLat + half, centerLng + half]
  ];
};

/**
 * Default Safety Zones for Mock/Offline Fallback (aligns with seed.sql)
 */
export const DEFAULT_PILOT_ZONES = [
  {
    id: "zone-1",
    zone_name: "Downtown Station",
    grid_zone: "ZONE-A-014",
    center_lat: 40.7128,
    center_lng: -74.0060,
    activity_level: "emerging",
    trust_score: 65,
    categories: ["catcalling", "following"],
    report_count: 2
  },
  {
    id: "zone-2",
    zone_name: "University Campus",
    grid_zone: "ZONE-B-022",
    center_lat: 40.7138,
    center_lng: -74.0050,
    activity_level: "low",
    trust_score: 30,
    categories: ["suspicious_behavior"],
    report_count: 1
  },
  {
    id: "zone-3",
    zone_name: "Park Avenue",
    grid_zone: "ZONE-C-105",
    center_lat: 40.7118,
    center_lng: -74.0070,
    activity_level: "under_review",
    trust_score: 82,
    categories: ["suspicious_behavior", "other"],
    report_count: 4
  },
  {
    id: "zone-4",
    zone_name: "Northside Alley",
    grid_zone: "ZONE-D-088",
    center_lat: 40.7148,
    center_lng: -74.0080,
    activity_level: "high_priority",
    trust_score: 95,
    categories: ["verbal_harassment", "threatening_behavior"],
    report_count: 8
  }
];
