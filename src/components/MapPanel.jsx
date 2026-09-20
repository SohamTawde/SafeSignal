import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Rectangle, Tooltip, useMap, Circle } from 'react-leaflet';
import { DEFAULT_PILOT_LOCATION, calculateGridBounds } from '../config/geoConfig';
import { Geolocation } from '@capacitor/geolocation';
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
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    let watchId;
    let isMounted = true;

    const startWatching = async () => {
      try {
        // Request permissions for mobile (does nothing or browser prompt on web)
        await Geolocation.requestPermissions();

        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
          (position, err) => {
            if (err) {
              console.error("Error watching position:", err);
              return;
            }
            if (position && isMounted) {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy || 100
              });
            }
          }
        );
      } catch (error) {
        console.error("Error setting up geolocation:", error);
      }
    };

    startWatching();

    return () => {
      isMounted = false;
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, []);

  // Determine if we should wait for user location
  // If no explicit center is provided and no zones are provided, we should wait for userLocation
  const shouldWaitForLocation = !center && (!zones || zones.length === 0) && !userLocation;

  if (shouldWaitForLocation) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0710] text-slate-400">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div className="text-xs font-bold uppercase tracking-widest">Locating you...</div>
      </div>
    );
  }

  // Center on userLocation if available, else first zone, else default
  const mapCenter = center || (userLocation ? [userLocation.lat, userLocation.lng] : null) || (zones && zones.length > 0 && zones[0].center ? zones[0].center : DEFAULT_CENTER);
  const mapZoom = (zones && zones.length > 0 && !userLocation) ? 15 : zoom;

  // Calculate distance in meters (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Determine user color based on proximity to zones (within 2000 meters)
  const getUserStatusColor = () => {
    // Default is Yellow (Safe/Caution)
    if (!userLocation || !zones || zones.length === 0) return '#eab308'; 
    
    let closestZoneColor = '#eab308'; // Default Yellow
    let minDistance = Infinity;

    for (const zone of zones) {
      if (!zone.center) continue;
      const dist = getDistance(userLocation.lat, userLocation.lng, zone.center[0], zone.center[1]);
      if (dist < 2000 && dist < minDistance) {
        minDistance = dist;
        // Turn red/orange depending on zone color if within range
        closestZoneColor = zone.color || '#ef4444'; 
      }
    }
    return closestZoneColor;
  };

  const userColor = getUserStatusColor();

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

      {userLocation && (
        <React.Fragment>
          {/* Accuracy/Coverage Area */}
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={userLocation.accuracy < 30 ? 50 : userLocation.accuracy} // Ensure at least a decent area is shown
            pathOptions={{
              color: userColor,
              fillColor: userColor,
              fillOpacity: 0.15,
              weight: 1,
              dashArray: '4, 4'
            }}
          />
          {/* Main User Marker */}
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={7}
            pathOptions={{
              color: '#ffffff', // White border for premium look
              fillColor: userColor, // Solid core matching status
              fillOpacity: 1,
              weight: 2
            }}
          >
            <Tooltip direction="top" opacity={0.9}>
              <div className="text-xs font-bold font-sans">You are here</div>
            </Tooltip>
          </CircleMarker>
        </React.Fragment>
      )}
    </MapContainer>
  );
};
