import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Navigation
} from 'lucide-react';
import type { StationData } from '../../types/airQuality';
import { BENGALURU_STATIONS } from '../../data/mockAirQualityData';
import { getAQIMeta } from '../../utils/aqiUtils';
import { BengaluruMap } from './BengaluruMap';
import { fetchWaqiBengaluruStations } from '../../services/waqiService';

interface LiveAirQualitySectionProps {
  selectedStation: StationData | null;
  onSelectStation: (station: StationData) => void;
}

export const LiveAirQualitySection: React.FC<LiveAirQualitySectionProps> = ({
  selectedStation,
  onSelectStation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'clean' | 'moderate' | 'poor'>('all');
  const [stations, setStations] = useState<StationData[]>(BENGALURU_STATIONS);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveStations() {
      const live = await fetchWaqiBengaluruStations();
      if (isMounted && live.length > 0) {
        setStations(live);
      }
    }
    loadLiveStations();
    return () => { isMounted = false; };
  }, []);

  const activeStation = selectedStation || stations[0];
  const activeMeta = getAQIMeta(activeStation.aqi);

  const filteredStations = stations.filter((st) => {
    const matchesSearch = 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.landmark.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTier === 'clean') return st.aqi <= 100;
    if (filterTier === 'moderate') return st.aqi > 100 && st.aqi <= 150;
    if (filterTier === 'poor') return st.aqi > 150;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Section Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-sage/25 rounded-2xl p-5 shadow-editorial">
        <div>
          <h2 
            className="text-xl font-bold text-forest flex items-center gap-2 font-serif"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <Navigation className="w-5 h-5 text-forest" />
            Geospatial Atmospheric Monitoring Grid
          </h2>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Real-time CPCB / KSPCB physical monitoring stations (via WAQI) across Bengaluru corridors
          </p>
        </div>

        {/* Filter controls & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-sage absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg bg-ivory-subtle border border-sage/30 text-xs text-charcoal placeholder-charcoal-muted focus:outline-none focus:border-forest w-48 sm:w-56"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex items-center p-1 rounded-lg bg-ivory border border-sage/30 text-xs">
            <button
              onClick={() => setFilterTier('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTier === 'all' ? 'bg-forest text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              All ({stations.length})
            </button>
            <button
              onClick={() => setFilterTier('clean')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTier === 'clean' ? 'bg-[#5B8260] text-ivory shadow-sm' : 'text-charcoal-muted hover:text-forest'
              }`}
            >
              Good/Sat
            </button>
            <button
              onClick={() => setFilterTier('poor')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterTier === 'poor' ? 'bg-[#B24E38] text-ivory shadow-sm' : 'text-charcoal-muted hover:text-[#963723]'
              }`}
            >
              Poor/Severe
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left/Center) + Station List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Box */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="h-[460px] w-full">
            <BengaluruMap
              stations={filteredStations}
              selectedStation={activeStation}
              onSelectStation={onSelectStation}
            />
          </div>

          {/* Selected Station Telemetry Strip */}
          <div className="rounded-2xl bg-white border border-sage/25 p-5 shadow-editorial">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ivory">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-extrabold text-xl text-white shadow-sm"
                  style={{ backgroundColor: activeMeta.color }}
                >
                  {activeStation.aqi}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 
                      className="text-base font-bold text-forest font-serif"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {activeStation.name}
                    </h3>
                    <span 
                      className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border"
                      style={{ 
                        backgroundColor: activeMeta.bgColor.replace('bg-', ''), 
                        borderColor: activeMeta.color,
                        color: activeMeta.color 
                      }}
                    >
                      {activeMeta.category}
                    </span>
                  </div>
                  <div className="text-xs text-charcoal-muted flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sage" />
                    <span>{activeStation.zone} • {activeStation.landmark}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-charcoal-muted font-mono">
                Updated: <span className="text-charcoal font-semibold">{activeStation.lastUpdated}</span>
              </div>
            </div>

            {/* Pollutants Breakdown Grid in Warm Ivory */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4">
              <div className="p-2.5 rounded-lg bg-ivory-subtle border border-sage/20">
                <div className="text-[10px] text-charcoal-muted uppercase font-bold">PM2.5</div>
                <div className="text-base font-serif font-bold text-forest mt-0.5">
                  {activeStation.pm25} <span className="text-[10px] font-sans font-normal text-charcoal-muted">µg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-ivory-subtle border border-sage/20">
                <div className="text-[10px] text-charcoal-muted uppercase font-bold">PM10</div>
                <div className="text-base font-serif font-bold text-forest mt-0.5">
                  {activeStation.pm10} <span className="text-[10px] font-sans font-normal text-charcoal-muted">µg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-ivory-subtle border border-sage/20">
                <div className="text-[10px] text-charcoal-muted uppercase font-bold">NO₂</div>
                <div className="text-base font-serif font-bold text-forest mt-0.5">
                  {activeStation.no2} <span className="text-[10px] font-sans font-normal text-charcoal-muted">µg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-ivory-subtle border border-sage/20">
                <div className="text-[10px] text-charcoal-muted uppercase font-bold">SO₂</div>
                <div className="text-base font-serif font-bold text-forest mt-0.5">
                  {activeStation.so2} <span className="text-[10px] font-sans font-normal text-charcoal-muted">µg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-ivory-subtle border border-sage/20">
                <div className="text-[10px] text-charcoal-muted uppercase font-bold">CO</div>
                <div className="text-base font-serif font-bold text-forest mt-0.5">
                  {activeStation.co} <span className="text-[10px] font-sans font-normal text-charcoal-muted">mg/m³</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-ivory-subtle border border-sage/20">
                <div className="text-[10px] text-charcoal-muted uppercase font-bold">O₃ (Ozone)</div>
                <div className="text-base font-serif font-bold text-forest mt-0.5">
                  {activeStation.o3} <span className="text-[10px] font-sans font-normal text-charcoal-muted">µg/m³</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Station Selection List (Right column) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-sage/25 p-5 shadow-editorial flex flex-col h-[610px]">
          <div className="flex items-center justify-between pb-3 border-b border-ivory">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">
              Monitored Stations ({filteredStations.length})
            </span>
            <span className="text-[11px] text-sage font-medium">
              Click to select
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-3 pr-1">
            {filteredStations.map((station) => {
              const meta = getAQIMeta(station.aqi);
              const isSelected = activeStation.id === station.id;

              return (
                <div
                  key={station.id}
                  onClick={() => onSelectStation(station)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sage-soft border-forest/40 shadow-sm'
                      : 'bg-ivory-light border-sage/20 hover:border-sage/40 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-charcoal truncate">
                        {station.name}
                      </div>
                      <div className="text-[11px] text-charcoal-muted truncate">
                        {station.zone}
                      </div>
                    </div>

                    <div className="flex flex-col items-end flex-shrink-0">
                      <span 
                        className="font-serif font-bold text-sm px-2 py-0.5 rounded shadow-sm"
                        style={{
                          backgroundColor: meta.bgColor.replace('bg-', ''),
                          color: meta.color,
                        }}
                      >
                        AQI {station.aqi}
                      </span>
                      <span className="text-[10px] text-charcoal-muted mt-0.5">
                        {meta.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-ivory flex items-center justify-between text-[11px] text-charcoal-muted font-mono">
                    <span>PM2.5: <strong className="text-charcoal">{station.pm25}</strong></span>
                    <span>PM10: <strong className="text-charcoal">{station.pm10}</strong></span>
                    <span>{station.temperature}°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
