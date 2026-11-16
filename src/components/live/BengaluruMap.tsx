import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { StationData } from '../../types/airQuality';
import { getAQIMeta } from '../../utils/aqiUtils';

interface BengaluruMapProps {
  stations: StationData[];
  selectedStation: StationData | null;
  onSelectStation: (station: StationData) => void;
}

export const BengaluruMap: React.FC<BengaluruMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const prevSelectedIdRef = useRef<string | null>(null);

  // 1. Initialize Map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      // Free, high-reliability OpenStreetMap tile layer (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to ensure container boundaries render smoothly without tile clipping
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 150);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  // 2. Resize observer to handle layout/sidebar collapse transitions smoothly without glitching
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });

    resizeObserver.observe(mapContainerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 3. Update markers when stations array updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    stations.forEach((st) => {
      const meta = getAQIMeta(st.aqi);
      const isSelected = selectedStation?.id === st.id;

      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background-color: #FFFFFF;
            border: 2.5px solid ${meta.color};
            border-radius: 9999px;
            box-shadow: 0 2px 8px rgba(24, 61, 50, 0.25);
            color: ${meta.color};
            font-size: ${isSelected ? '12px' : '10px'};
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span>${st.aqi}</span>
            ${isSelected ? `
              <div style="
                position: absolute;
                inset: -4px;
                border-radius: 9999px;
                border: 2px solid ${meta.color};
                opacity: 0.6;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
      });

      const marker = L.marker(st.coordinates, { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="min-width: 190px; font-family: inherit; padding: 4px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #78947A; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 2px;">
            ${st.zone}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #183D32; font-family: 'Playfair Display', Georgia, serif; margin-bottom: 6px;">
            ${st.name}
          </div>
          <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 22px; font-weight: 800; font-family: 'Playfair Display', Georgia, serif; color: ${meta.color};">
              AQI ${st.aqi}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${meta.color}; text-transform: uppercase;">
              ${meta.category}
            </span>
          </div>
          <div style="font-size: 11px; color: #525B54; border-top: 1px solid #E6ECE7; padding-top: 6px;">
            <div>PM2.5: <strong style="color: #292E2A;">${st.pm25} µg/m³</strong></div>
            <div>PM10: <strong style="color: #292E2A;">${st.pm10} µg/m³</strong></div>
            <div>Temp: <strong style="color: #292E2A;">${st.temperature}°C</strong> | Wind: <strong style="color: #292E2A;">${st.windSpeed} km/h</strong></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectStation(st);
      });

      markersRef.current[st.id] = marker;
    });
  }, [stations, onSelectStation]);

  // 4. Smooth flyTo ONLY when selectedStation changes (prevents glitch loop)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedStation) return;

    if (prevSelectedIdRef.current !== selectedStation.id) {
      prevSelectedIdRef.current = selectedStation.id;
      map.flyTo(selectedStation.coordinates, 13, { duration: 0.6 });

      const targetMarker = markersRef.current[selectedStation.id];
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }
  }, [selectedStation]);

  // 5. Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-sage/30 bg-ivory shadow-editorial">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] light-map z-10" />

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-sage/30 rounded-lg p-3 shadow-editorial-md max-w-xs text-xs">
        <div className="text-[10px] font-bold uppercase tracking-wider text-forest mb-1.5 flex items-center justify-between">
          <span>Bengaluru CAAQMS Grid</span>
          <span className="text-charcoal-muted font-normal">NAQI</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-charcoal">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#183D32]"></span>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#5B8260]"></span>
            <span>Sat</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C2873E]"></span>
            <span>Mod</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B24E38]"></span>
            <span>Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
};
