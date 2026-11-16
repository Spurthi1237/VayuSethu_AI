import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, 
  Bike, 
  Footprints, 
  ShieldCheck, 
  AlertTriangle, 
  Leaf, 
  Sparkles, 
  RefreshCw, 
  Compass
} from 'lucide-react';
import L from 'leaflet';
import { getRouteAIBriefing } from '../../services/geminiService';

interface RouteOption {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  walkMinutes: number;
  cycleMinutes: number;
  fastAqi: number;
  cleanAqi: number;
  savingsPercent: number;
  fastCoordinates: [number, number][];
  cleanCoordinates: [number, number][];
  greenCoverDescription: string;
  arterialWarning: string;
}

const PRESET_ROUTES: RouteOption[] = [
  {
    id: 'route-cubbon-indiranagar',
    name: 'Cubbon Park to Indiranagar',
    origin: 'Cubbon Park (Queens Rd Gate)',
    destination: 'Indiranagar (100ft Road)',
    distanceKm: 5.4,
    walkMinutes: 65,
    cycleMinutes: 20,
    fastAqi: 158,
    cleanAqi: 74,
    savingsPercent: 53,
    fastCoordinates: [
      [12.9760, 77.5990],
      [12.9750, 77.6080],
      [12.9735, 77.6200],
      [12.9715, 77.6320],
      [12.9780, 77.6400],
    ],
    cleanCoordinates: [
      [12.9760, 77.5990],
      [12.9810, 77.6050],
      [12.9840, 77.6180],
      [12.9820, 77.6290],
      [12.9780, 77.6400],
    ],
    greenCoverDescription: 'Through Defense Colony tree canopies & Ulsoor Lake secondary perimeter.',
    arterialWarning: 'Old Airport Road & MG Road junction heavy diesel soot corridors.',
  },
  {
    id: 'route-silkboard-hsr',
    name: 'Silk Board to HSR Layout Sector 1',
    origin: 'Silk Board Junction',
    destination: 'HSR Layout Sector 1 (Agara Lake)',
    distanceKm: 3.8,
    walkMinutes: 46,
    cycleMinutes: 14,
    fastAqi: 182,
    cleanAqi: 88,
    savingsPercent: 51,
    fastCoordinates: [
      [12.9173, 77.6228],
      [12.9210, 77.6300],
      [12.9240, 77.6410],
      [12.9260, 77.6520],
    ],
    cleanCoordinates: [
      [12.9173, 77.6228],
      [12.9130, 77.6280],
      [12.9150, 77.6380],
      [12.9200, 77.6480],
      [12.9260, 77.6520],
    ],
    greenCoverDescription: 'Parallels residential service lanes & Agara Lake green conservation buffer.',
    arterialWarning: 'Outer Ring Road (ORR) major particulate & flyover dust channel.',
  },
  {
    id: 'route-jayanagar-lalbagh',
    name: 'Jayanagar to Lalbagh Botanical Gardens',
    origin: 'Jayanagar 4th Block',
    destination: 'Lalbagh West Gate',
    distanceKm: 3.2,
    walkMinutes: 38,
    cycleMinutes: 11,
    fastAqi: 135,
    cleanAqi: 62,
    savingsPercent: 54,
    fastCoordinates: [
      [12.9299, 77.5824],
      [12.9370, 77.5830],
      [12.9440, 77.5840],
      [12.9510, 77.5850],
    ],
    cleanCoordinates: [
      [12.9299, 77.5824],
      [12.9330, 77.5790],
      [12.9400, 77.5800],
      [12.9470, 77.5820],
      [12.9510, 77.5850],
    ],
    greenCoverDescription: 'Heritage shaded boulevards with mature rain trees and minimal commercial traffic.',
    arterialWarning: 'Kanakapura Main Road commercial bottlenecks.',
  },
  {
    id: 'route-hebbal-manyata',
    name: 'Hebbal to Manyata Tech Park',
    origin: 'Hebbal Bus Terminus',
    destination: 'Manyata Embassy Business Park',
    distanceKm: 4.6,
    walkMinutes: 55,
    cycleMinutes: 16,
    fastAqi: 168,
    cleanAqi: 86,
    savingsPercent: 48,
    fastCoordinates: [
      [12.0291, 77.5859],
      [12.0350, 77.5990],
      [12.0420, 77.6150],
      [12.0480, 77.6250],
    ],
    cleanCoordinates: [
      [12.0291, 77.5859],
      [12.0320, 77.5920],
      [12.0390, 77.6080],
      [12.0440, 77.6210],
      [12.0480, 77.6250],
    ],
    greenCoverDescription: 'Lakeside bypass route avoiding the elevated expressway exhaust funnel.',
    arterialWarning: 'Bellary Road & Outer Ring Road heavy truck and flyover traffic.',
  },
];

export const SmartRouteOptimizerSection: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(PRESET_ROUTES[0].id);
  const [mode, setMode] = useState<'walking' | 'cycling'>('walking');
  const [activePathView, setActivePathView] = useState<'clean' | 'both'>('both');

  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const activeRoute = PRESET_ROUTES.find((r) => r.id === selectedRouteId) || PRESET_ROUTES[0];

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<{ clean?: L.Polyline; fast?: L.Polyline }>({});
  const markersRef = useRef<L.Marker[]>([]);

  // Calculate particulate inhaled estimate (in micrograms µg)
  // Inhalation rate: walking ~ 12 Liters/min (0.012 m³/min), cycling ~ 25 Liters/min (0.025 m³/min)
  const durationMinutes = mode === 'walking' ? activeRoute.walkMinutes : activeRoute.cycleMinutes;
  const minuteBreathingM3 = mode === 'walking' ? 0.012 : 0.025;
  const fastDoseUg = Math.round(activeRoute.fastAqi * 0.72 * minuteBreathingM3 * durationMinutes);
  const cleanDoseUg = Math.round(activeRoute.cleanAqi * 0.72 * minuteBreathingM3 * durationMinutes);
  const doseSavedUg = fastDoseUg - cleanDoseUg;

  // Initialize Route Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: activeRoute.cleanCoordinates[0],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;

      setTimeout(() => map.invalidateSize(), 200);
    }
  }, []);

  // Update Route Polylines and Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old polylines & markers
    if (polylinesRef.current.clean) polylinesRef.current.clean.remove();
    if (polylinesRef.current.fast) polylinesRef.current.fast.remove();
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. Draw Clean Route (Emerald Green Glow)
    const cleanLine = L.polyline(activeRoute.cleanCoordinates, {
      color: '#10B981',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
    }).addTo(map);

    cleanLine.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <strong style="color: #059669;">🌿 Clean-Air Eco Route</strong><br>
        Average AQI: <strong>${activeRoute.cleanAqi}</strong> (Low Particulate)<br>
        <em>${activeRoute.greenCoverDescription}</em>
      </div>
    `);

    // 2. Draw Fast Route (Coral/Red dashed line)
    const fastLine = L.polyline(activeRoute.fastCoordinates, {
      color: '#E11D48',
      weight: 4,
      dashArray: '6, 8',
      opacity: activePathView === 'both' ? 0.75 : 0,
    }).addTo(map);

    fastLine.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 4px;">
        <strong style="color: #E11D48;">⚠️ Standard Arterial Route</strong><br>
        Average AQI: <strong>${activeRoute.fastAqi}</strong> (High Exposure)<br>
        <em>${activeRoute.arterialWarning}</em>
      </div>
    `);

    polylinesRef.current = { clean: cleanLine, fast: fastLine };

    // 3. Add Start and End Pins
    const startIcon = L.divIcon({
      className: 'route-start-pin',
      html: `
        <div style="
          width: 24px; height: 24px; background: #183D32; border: 2.5px solid #FFFFFF;
          border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: bold;
        ">A</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const endIcon = L.divIcon({
      className: 'route-end-pin',
      html: `
        <div style="
          width: 24px; height: 24px; background: #10B981; border: 2.5px solid #FFFFFF;
          border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 10px; font-weight: bold;
        ">B</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const startMarker = L.marker(activeRoute.cleanCoordinates[0], { icon: startIcon }).addTo(map);
    startMarker.bindPopup(`<strong>Origin:</strong> ${activeRoute.origin}`);

    const endMarker = L.marker(activeRoute.cleanCoordinates[activeRoute.cleanCoordinates.length - 1], { icon: endIcon }).addTo(map);
    endMarker.bindPopup(`<strong>Destination:</strong> ${activeRoute.destination}`);

    markersRef.current = [startMarker, endMarker];

    // Fit map bounds to encompass both paths
    const bounds = cleanLine.getBounds().extend(fastLine.getBounds());
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [activeRoute, activePathView]);

  const handleGenerateAiBriefing = async () => {
    setLoadingAi(true);
    try {
      const text = await getRouteAIBriefing(
        activeRoute.origin,
        activeRoute.destination,
        mode,
        activeRoute.fastAqi,
        activeRoute.cleanAqi,
        activeRoute.savingsPercent
      );
      setAiBriefing(text);
    } catch (err: unknown) {
      setAiBriefing('Failed to retrieve route briefing from Gemini.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Navigation className="w-3.5 h-3.5" />
                Urban Exposure Minimization
              </span>
              <span className="text-xs text-charcoal-muted font-mono">Pedestrian &amp; Cyclist Inhalation Protection</span>
            </div>
            <h2 
              className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Smart Clean-Air Route Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl leading-relaxed">
              Dynamically bypasses toxic vehicular exhaust funnels and road re-carpeting dust. Navigates commuters through Bengaluru's tree-lined avenues, park borders, and residential corridors.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-ivory border border-sage/30 self-start md:self-auto">
            <button
              onClick={() => setMode('walking')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'walking'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Footprints className="w-4 h-4" />
              Walking / Jogging
            </button>
            <button
              onClick={() => setMode('cycling')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'cycling'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              <Bike className="w-4 h-4" />
              Cycling Commute
            </button>
          </div>
        </div>
      </div>

      {/* Preset Route Selectors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PRESET_ROUTES.map((route) => {
          const isSelected = selectedRouteId === route.id;
          return (
            <button
              key={route.id}
              onClick={() => {
                setSelectedRouteId(route.id);
                setAiBriefing(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-sage-soft border-forest/40 shadow-sm'
                  : 'bg-white border-sage/25 hover:border-sage/40 hover:bg-ivory-light shadow-editorial'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-forest flex items-center gap-1">
                  <Compass className="w-3 h-3 text-sage" /> {route.distanceKm} km
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  -{route.savingsPercent}% PM2.5
                </span>
              </div>
              <div className="font-serif font-bold text-xs sm:text-sm text-charcoal truncate">
                {route.name}
              </div>
              <div className="text-[11px] text-charcoal-muted mt-1 truncate">
                {route.origin} &rarr; {route.destination}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Comparison Cards (Left) + Interactive Route Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Exposure Metric Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Clean-Air Route Card */}
          <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500 shadow-editorial relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
              Recommended Eco-Route
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-forest font-serif">Clean-Air Route</h3>
                <span className="text-xs text-charcoal-muted font-medium">
                  {mode === 'walking' ? `${activeRoute.walkMinutes} mins` : `${activeRoute.cycleMinutes} mins`} • {activeRoute.distanceKm} km
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">Exposure AQI</div>
                <div className="text-2xl font-bold font-serif text-emerald-700">{activeRoute.cleanAqi}</div>
                <div className="text-[10px] text-emerald-800">Satisfactory baseline</div>
              </div>
              <div>
                <div className="text-[10px] text-emerald-800 font-bold uppercase">Total Inhaled Dose</div>
                <div className="text-2xl font-bold font-mono text-emerald-700">{cleanDoseUg} µg</div>
                <div className="text-[10px] text-emerald-800">PM2.5 lung load</div>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              <strong>Green Buffer:</strong> {activeRoute.greenCoverDescription}
            </p>
          </div>

          {/* Fast Arterial Route Card */}
          <div className="p-5 rounded-2xl bg-white border border-rose-300 shadow-editorial">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-charcoal font-serif">Arterial Route (Avoid)</h3>
                  <span className="text-xs text-charcoal-muted font-medium">
                    {mode === 'walking' ? `${Math.max(10, activeRoute.walkMinutes - 5)} mins` : `${Math.max(5, activeRoute.cycleMinutes - 3)} mins`} (Slightly faster, but high toxicity)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3 p-3 rounded-xl bg-rose-50/60 border border-rose-200">
              <div>
                <div className="text-[10px] text-rose-800 font-bold uppercase">Exposure AQI</div>
                <div className="text-2xl font-bold font-serif text-rose-700">{activeRoute.fastAqi}</div>
                <div className="text-[10px] text-rose-800">Moderate / Poor Corridor</div>
              </div>
              <div>
                <div className="text-[10px] text-rose-800 font-bold uppercase">Total Inhaled Dose</div>
                <div className="text-2xl font-bold font-mono text-rose-700">{fastDoseUg} µg</div>
                <div className="text-[10px] text-rose-800">High diesel soot load</div>
              </div>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              <strong>Toxicity Driver:</strong> {activeRoute.arterialWarning}
            </p>
          </div>

          {/* Clean-Air Inhalation Savings Pill */}
          <div className="p-4 rounded-xl bg-forest text-ivory flex items-center justify-between border border-[#235747]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <div className="text-xs font-bold font-serif">Clean Air Inhalation Savings</div>
                <div className="text-[11px] text-sage-light">
                  Avoids <strong>{doseSavedUg} µg</strong> of PM2.5 deposition in lung alveoli
                </div>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-300">-{activeRoute.savingsPercent}%</span>
          </div>

          {/* Gemini AI Route Briefing Trigger */}
          <div className="p-4 rounded-xl bg-white border border-sage/25 shadow-editorial">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-forest font-serif">Gemini Commute Intelligence</span>
              </div>
              <button
                onClick={handleGenerateAiBriefing}
                disabled={loadingAi}
                className="px-3 py-1.5 rounded-lg bg-forest text-ivory hover:bg-[#071b15] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {loadingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                Analyze with Gemini
              </button>
            </div>

            {aiBriefing && (
              <div className="mt-3 p-3.5 rounded-lg bg-[#04100C] text-sage-light text-xs leading-relaxed whitespace-pre-line border border-[#1b4336] animate-fadeIn">
                {aiBriefing}
              </div>
            )}
          </div>
        </div>

        {/* Right: Leaflet Route Map */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between bg-white border border-sage/25 rounded-xl px-4 py-2 text-xs">
            <span className="font-serif font-bold text-forest">Bengaluru Micro-Corridor Map</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePathView('both')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activePathView === 'both' ? 'bg-forest text-ivory font-semibold' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Compare Both Paths
              </button>
              <button
                onClick={() => setActivePathView('clean')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activePathView === 'clean' ? 'bg-emerald-600 text-ivory font-semibold' : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                Eco-Path Only
              </button>
            </div>
          </div>

          <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-sage/30 bg-ivory shadow-editorial">
            <div ref={mapContainerRef} className="w-full h-full light-map z-10" />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-sage/30 rounded-lg p-3 shadow-editorial-md text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-forest mb-1.5">
                Route Legend
              </div>
              <div className="space-y-1.5 text-[11px] text-charcoal">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 rounded bg-[#10B981]"></span>
                  <span>Clean-Air Eco Route (-{activeRoute.savingsPercent}% PM2.5)</span>
                </div>
                {activePathView === 'both' && (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 border-b-2 border-dashed border-[#E11D48]"></span>
                    <span>Standard Arterial Highway (High Exposure)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
