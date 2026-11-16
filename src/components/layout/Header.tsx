import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  RefreshCw, 
  Clock, 
  MapPin, 
  Globe2,
  ChevronDown
} from 'lucide-react';
import type { StationData } from '../../types/airQuality';
import { BENGALURU_STATIONS } from '../../data/mockAirQualityData';

interface HeaderProps {
  currentTabTitle: string;
  currentTabSubtitle: string;
  selectedStation: StationData | null;
  onSelectStation: (station: StationData | null) => void;
  onToggleMobileMenu: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastRetrievalTime?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTabTitle,
  currentTabSubtitle,
  selectedStation,
  onSelectStation,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing = false,
  lastRetrievalTime,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateString = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      setCurrentTime(`${dateString} • ${istString} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-ivory/95 backdrop-blur-md border-b border-sage/20 px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Mobile menu toggle & Active Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-white border border-sage/30 text-charcoal hover:bg-ivory-subtle"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 
            className="text-xl sm:text-2xl font-bold tracking-tight text-forest font-serif"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {currentTabTitle}
          </h1>
          <p className="text-xs text-charcoal-muted hidden sm:block mt-0.5">
            {currentTabSubtitle}
          </p>
        </div>
      </div>

      {/* Right: Real API Source, Location, IST Clock & Refresh */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Real CPCB WAQI Live API Source Badge */}
        <div 
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-medium cursor-help"
          title="Direct integration with CPCB / KSPCB ground monitoring stations via WAQI API."
        >
          <Globe2 className="w-3.5 h-3.5 text-forest" />
          <span className="hidden xl:inline">Source:</span>
          <span className="font-semibold">CPCB Live (WAQI)</span>
        </div>

        {/* Location Dropdown */}
        <div className="relative">
          <button
            onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-ivory-subtle border border-sage/30 text-xs font-medium text-charcoal shadow-editorial transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0" />
            <span className="max-w-[150px] truncate font-medium">
              {selectedStation ? selectedStation.name : 'Bengaluru (12.97°N, 77.59°E)'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-sage" />
          </button>

          {stationDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setStationDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-sage/30 shadow-editorial-lg py-1.5 z-40 max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[10px] font-bold text-sage uppercase tracking-wider border-b border-ivory">
                  Monitoring Domain
                </div>
                <button
                  onClick={() => {
                    onSelectStation(null);
                    setStationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-ivory-subtle transition-colors ${
                    !selectedStation ? 'bg-sage-soft text-forest font-bold' : 'text-charcoal'
                  }`}
                >
                  <div>
                    <div>Bengaluru Atmospheric Grid</div>
                    <div className="text-[10px] text-charcoal-muted">Open-Meteo Real Data (Lat: 12.9716, Lon: 77.5946)</div>
                  </div>
                  <span className="text-[9px] font-mono text-forest font-semibold px-1.5 py-0.5 rounded bg-forest/10">
                    Live
                  </span>
                </button>
                <div className="px-3 py-1.5 text-[10px] font-bold text-sage uppercase tracking-wider border-y border-ivory mt-1">
                  Local Sector References (Historical Context)
                </div>
                {BENGALURU_STATIONS.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => {
                      onSelectStation(station);
                      setStationDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-ivory-subtle transition-colors ${
                      selectedStation?.id === station.id ? 'bg-sage-soft text-forest font-bold' : 'text-charcoal'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{station.name}</div>
                      <div className="text-[10px] text-charcoal-muted truncate">{station.zone}</div>
                    </div>
                    <span 
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 font-bold"
                      style={{
                        backgroundColor: station.aqi > 150 ? '#FAECE8' : station.aqi > 100 ? '#F9F4EB' : '#E6ECE7',
                        color: station.aqi > 150 ? '#963723' : station.aqi > 100 ? '#8F5E1F' : '#183D32',
                      }}
                    >
                      {station.aqi}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Live IST Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-sage/30 text-charcoal text-xs font-mono shadow-editorial">
          <Clock className="w-3.5 h-3.5 text-sage" />
          <span>{lastRetrievalTime ? `Synced: ${lastRetrievalTime}` : (currentTime || 'Active')}</span>
        </div>

        {/* Manual Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center p-2 rounded-lg bg-white hover:bg-ivory-subtle border border-sage/30 text-charcoal hover:text-forest transition-all shadow-editorial disabled:opacity-50"
          title="Fetch latest Open-Meteo telemetry"
          aria-label="Fetch latest Open-Meteo telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-forest' : 'text-sage'}`} />
        </button>
      </div>
    </header>
  );
};
