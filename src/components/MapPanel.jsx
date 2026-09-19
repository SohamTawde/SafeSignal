import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Rectangle, Tooltip, useMap } from 'react-leaflet';
import { DEFAULT_PILOT_LOCATION, calculateGridBounds } from '../config/geoConfig';

// Fix leaflet default icon issue in React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [DEFAULT_PILOT_LOCATION.lat, DEFAULT_PILOT_LOCATION.lng];

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

export const MapPanel = ({ zones = [], onZoneClick, center = null, zoom = 15, isDark = true }) => {
  // Center on the first zone if available, otherwise default pilot coordinates
  const mapCenter = center || (zones.length > 0 && zones[0].center ? zones[0].center : DEFAULT_CENTER);
  const mapZoom = (zones.length > 0) ? 15 : zoom;

  return (
    <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <MapUpdater center={mapCenter} zoom={mapZoom} />
      {/* OpenStreetMap with Dark Mode CSS Filter (enabled only in dark mode) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        className={isDark ? "map-tiles" : ""}
      />
      
      {zones.map((zone) => {
        if (!zone.center || !Array.isArray(zone.center) || zone.center.length < 2) return null;
        
        // Calculate 20m bounding box for grid visualization
        const bounds = zone.bounds || calculateGridBounds(zone.center[0], zone.center[1]);
        const color = zone.color || '#8b5cf6';

        return (
          <React.Fragment key={zone.id}>
            {/* 20m Privacy Grid Square Boundary */}
            <Rectangle
              bounds={bounds}
              pathOptions={{
                color: color,
                weight: 1.5,
                fillColor: color,
                fillOpacity: 0.2,
                dashArray: '4, 4'
              }}
              eventHandlers={{
                click: () => onZoneClick && onZoneClick(zone)
              }}
            >
              <Tooltip direction="top" opacity={0.9}>
                <div className="text-xs font-bold font-sans">
                  <span className="uppercase">{zone.name || zone.grid_zone}</span>
                  {zone.activityLevel && <span className="block text-[10px] text-slate-300">Level: {zone.activityLevel}</span>}
                </div>
              </Tooltip>
            </Rectangle>

            {/* Approximate Center Core */}
            <CircleMarker
              center={zone.center}
              radius={8}
              pathOptions={{ 
                color: color, 
                fillColor: '#ffffff', 
                fillOpacity: 0.9,
                weight: 2
              }}
              eventHandlers={{
                click: () => onZoneClick && onZoneClick(zone)
              }}
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};
