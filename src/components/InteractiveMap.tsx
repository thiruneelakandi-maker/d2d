import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EmergencyFacility } from '../types';

interface InteractiveMapProps {
  userLat?: number | null;
  userLng?: number | null;
  facilities: EmergencyFacility[];
  selectedFacility?: EmergencyFacility | null;
  onSelectFacility?: (facility: EmergencyFacility) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  userLat,
  userLng,
  facilities,
  selectedFacility,
  onSelectFacility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const defaultLat = userLat ?? 40.7128;
  const defaultLng = userLng ?? -74.0060;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // 1. User Location Marker (Pulse Beacon)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <span style="position: absolute; width: 24px; height: 24px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></span>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([defaultLat, defaultLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>Your Current Location</strong><br/>Lat: ${defaultLat.toFixed(4)}, Lng: ${defaultLng.toFixed(4)}`);
    markersRef.current.push(userMarker);

    // 2. Add Facility Markers
    facilities.forEach((fac) => {
      let pinColor = '#2563eb';
      let symbol = '🏥';

      if (fac.facility_type === 'hospital') {
        pinColor = '#dc2626';
        symbol = '🚑';
      } else if (fac.facility_type === 'police') {
        pinColor = '#1d4ed8';
        symbol = '🛡️';
      } else if (fac.facility_type === 'fire') {
        pinColor = '#d97706';
        symbol = '🚒';
      } else if (fac.facility_type === 'shelter') {
        pinColor = '#059669';
        symbol = '⛺';
      }

      const isSelected = selectedFacility && selectedFacility.id === fac.id;

      const facIcon = L.divIcon({
        className: 'custom-fac-marker',
        html: `
          <div style="background: ${pinColor}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); ${isSelected ? 'transform: rotate(-45deg) scale(1.25);' : ''}">
            <span style="transform: rotate(45deg); font-size: 14px;">${symbol}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: facIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong style="font-size: 13px; color: #0f172a;">${fac.name}</strong><br/>
            <span style="color: #64748b; font-size: 11px;">${fac.address}</span><br/>
            <div style="margin-top: 6px; font-size: 12px; font-weight: bold; color: ${pinColor};">
              ${fac.distance_km} km away (~${fac.eta_minutes} mins)
            </div>
            <div style="margin-top: 6px;">
              <a href="tel:${fac.phone}" style="display: inline-block; background: #2563eb; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: bold;">
                Call Facility
              </a>
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectFacility) onSelectFacility(fac);
      });

      markersRef.current.push(marker);
    });

    // 3. Draw route line if a facility is selected
    if (selectedFacility) {
      const latlngs: [number, number][] = [
        [defaultLat, defaultLng],
        // mid-point curve for realistic route feel
        [(defaultLat + selectedFacility.latitude) / 2 + 0.0005, (defaultLng + selectedFacility.longitude) / 2 - 0.0008],
        [selectedFacility.latitude, selectedFacility.longitude],
      ];

      const polyline = L.polyline(latlngs, {
        color: '#dc2626',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      routeLayerRef.current = polyline;
      map.flyToBounds(polyline.getBounds(), { padding: [50, 50], duration: 1.2 });
    } else if (facilities.length > 0) {
      // Fit all markers
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    }

    return () => {
      // Keep map instance alive for fast re-renders, but clean up markers on unmount if needed
    };
  }, [userLat, userLng, facilities, selectedFacility]);

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs z-10 transition-colors">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Map Overlay Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-3.5 py-2 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block animate-pulse"></span> You
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Hospital
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block"></span> Police
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Fire
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Shelter
        </span>
      </div>
    </div>
  );
};
