import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import L from 'leaflet';
import { analyzeSkyPhotoWithGemini, type SkyPhotoAnalysisResult } from '../../services/geminiService';

interface CrowdsourcedObservation {
  id: string;
  userName: string;
  locationName: string;
  coordinates: [number, number];
  timestamp: string;
  imageUrl: string;
  hazeLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
  estimatedAqi: string;
  pm25Range: string;
  notes: string;
}

// Pre-seeded sample crowdsourced observations across Bengaluru
const INITIAL_OBSERVATIONS: CrowdsourcedObservation[] = [
  {
    id: 'obs-cubbon',
    userName: 'Aarav K. (Cyclist)',
    locationName: 'Cubbon Park Canopy',
    coordinates: [12.9760, 77.5990],
    timestamp: '25 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
    hazeLevel: 'Low',
    estimatedAqi: '58–75',
    pm25Range: '20–35 µg/m³',
    notes: 'Clear blue zenith with sharp distant tree horizons. Minimal particulate scatter.',
  },
  {
    id: 'obs-silkboard',
    userName: 'Priya N. (Commuter)',
    locationName: 'Silk Board Flyover Horizon',
    coordinates: [12.9173, 77.6228],
    timestamp: '40 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80',
    hazeLevel: 'Heavy',
    estimatedAqi: '160–185',
    pm25Range: '85–110 µg/m³',
    notes: 'Dense amber-gray aerosol layer along road level. High diesel exhaust backscatter.',
  },
  {
    id: 'obs-peenya',
    userName: 'Kiran M. (Worker)',
    locationName: 'Peenya Industrial Zone',
    coordinates: [13.0270, 77.4940],
    timestamp: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    hazeLevel: 'Moderate',
    estimatedAqi: '135–150',
    pm25Range: '60–78 µg/m³',
    notes: 'Diffuse gray sky with low horizon contrast. Fine particulate and sulfur haze.',
  },
  {
    id: 'obs-whitefield',
    userName: 'Divya S. (Resident)',
    locationName: 'Whitefield Hope Farm Horizon',
    coordinates: [12.9698, 77.7499],
    timestamp: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    hazeLevel: 'Moderate',
    estimatedAqi: '120–140',
    pm25Range: '50–65 µg/m³',
    notes: 'Construction dust plumes visible against lower horizon.',
  },
];

export const CrowdsourcedMapSection: React.FC = () => {
  const [observations, setObservations] = useState<CrowdsourcedObservation[]>(INITIAL_OBSERVATIONS);
  const [selectedObs, setSelectedObs] = useState<CrowdsourcedObservation | null>(INITIAL_OBSERVATIONS[0]);

  // Upload & Analysis State
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SkyPhotoAnalysisResult | null>(null);
  const [uploadLocation, setUploadLocation] = useState<string>('Indiranagar 100ft Road');
  const [uploadCoordinates, setUploadCoordinates] = useState<[number, number]>([12.9784, 77.6408]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 11,
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

  // Update Observation Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    observations.forEach((obs) => {
      const isSelected = selectedObs?.id === obs.id;

      const markerColor = 
        obs.hazeLevel === 'Low' ? '#10B981' : 
        obs.hazeLevel === 'Moderate' ? '#F59E0B' : '#E11D48';

      const customIcon = L.divIcon({
        className: 'crowdsource-pin',
        html: `
          <div style="
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 9999px;
            background: #FFFFFF;
            border: 3px solid ${markerColor};
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="font-size: 14px;">📷</span>
          </div>
        `,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
      });

      const marker = L.marker(obs.coordinates, { icon: customIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; width: 180px;">
          <strong style="color: #183D32;">${obs.locationName}</strong><br>
          <span style="font-size: 10px; color: #666;">by ${obs.userName} • ${obs.timestamp}</span><br>
          <div style="margin-top: 4px; padding: 2px 6px; border-radius: 4px; display: inline-block; font-weight: bold; background: ${markerColor}20; color: ${markerColor};">
            Visual AQI: ${obs.estimatedAqi} (${obs.hazeLevel} Haze)
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedObs(obs);
      });

      markersRef.current[obs.id] = marker;
    });
  }, [observations, selectedObs]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();

    reader.onload = async () => {
      const dataUrl = reader.result as string;

      // Extract raw base64 string
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || 'image/jpeg';

      setAnalyzing(true);
      try {
        const result = await analyzeSkyPhotoWithGemini(base64Data, mimeType, uploadLocation);
        setAnalysisResult(result);

        // Add to live crowdsourced map
        const newObs: CrowdsourcedObservation = {
          id: `obs-user-${Date.now()}`,
          userName: 'You (Citizen Observer)',
          locationName: uploadLocation,
          coordinates: uploadCoordinates,
          timestamp: 'Just now',
          imageUrl: dataUrl,
          hazeLevel: result.hazeLevel,
          estimatedAqi: `${result.estimatedAqiMin}–${result.estimatedAqiMax}`,
          pm25Range: `${result.estimatedPm25Min}–${result.estimatedPm25Max} µg/m³`,
          notes: result.summary,
        };

        setObservations((prev) => [newObs, ...prev]);
        setSelectedObs(newObs);

        // Fly map to observation
        mapInstanceRef.current?.flyTo(uploadCoordinates, 13);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Computer vision analysis failed.';
        setError(msg);
      } finally {
        setAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Camera className="w-3.5 h-3.5" />
                Crowdsourced Optical Surveillance
              </span>
              <span className="text-xs text-charcoal-muted font-mono">Gemini Multimodal Vision Haze Estimator</span>
            </div>
            <h2 
              className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Crowdsourced Visual Sky &amp; Haze Map
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl leading-relaxed">
              Citizen scientists upload Bengaluru sky photos. Gemini Vision AI measures optical attenuation, Rayleigh scattering, and horizon contrast loss to calculate ground particulate haze in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & CV Estimator (Left) + Interactive Visual Heatmap (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Photo Upload & AI CV Results */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Card */}
          <div className="p-5 rounded-2xl bg-white border border-sage/25 shadow-editorial">
            <h3 className="font-bold text-sm text-forest font-serif mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              Upload Sky / Horizon Photo
            </h3>
            <p className="text-xs text-charcoal-muted mb-4">
              Take a photo of the Bengaluru skyline or sky from your balcony, rooftop, or commute.
            </p>

            {/* Location selector for upload */}
            <div className="mb-3">
              <label className="text-[11px] font-bold text-charcoal-muted uppercase block mb-1">
                Observation Location:
              </label>
              <select
                value={uploadLocation}
                onChange={(e) => {
                  setUploadLocation(e.target.value);
                  if (e.target.value.includes('Indiranagar')) setUploadCoordinates([12.9784, 77.6408]);
                  else if (e.target.value.includes('Koramangala')) setUploadCoordinates([12.9352, 77.6245]);
                  else if (e.target.value.includes('Hebbal')) setUploadCoordinates([13.0291, 77.5859]);
                  else if (e.target.value.includes('Whitefield')) setUploadCoordinates([12.9698, 77.7499]);
                }}
                className="w-full text-xs p-2 rounded-lg border border-sage/30 bg-ivory text-charcoal focus:outline-none focus:ring-1 focus:ring-forest"
              >
                <option value="Indiranagar 100ft Road">Indiranagar (100ft Road)</option>
                <option value="Koramangala 5th Block">Koramangala (5th Block)</option>
                <option value="Hebbal Flyover">Hebbal (Flyover Perimeter)</option>
                <option value="Whitefield ITPL">Whitefield (ITPL Horizon)</option>
              </select>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sage/40 rounded-xl p-6 text-center hover:border-forest/60 hover:bg-ivory-light cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-6 h-6 text-forest" />
              <div className="text-xs font-semibold text-charcoal">
                Click to upload sky photo or drag &amp; drop
              </div>
              <span className="text-[10px] text-charcoal-muted">Supports JPG, PNG, WEBP</span>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* AI Analysis Result Card */}
          {analyzing && (
            <div className="p-5 rounded-2xl bg-white border border-sage/25 shadow-editorial text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-forest mx-auto" />
              <div className="text-xs font-semibold text-charcoal">
                Gemini Vision is analyzing atmospheric optical attenuation...
              </div>
              <p className="text-[11px] text-charcoal-muted">
                Evaluating sky contrast loss, Mie aerosol backscatter &amp; visibility depth
              </p>
            </div>
          )}

          {analysisResult && !analyzing && (
            <div className="p-5 rounded-2xl bg-[#04100C] text-ivory border border-[#1b4336] shadow-editorial space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b4336]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-serif font-bold text-xs text-emerald-300">
                    Gemini CV Optical Assessment
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {analysisResult.hazeLevel} Haze
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="p-2.5 rounded-lg bg-[#0c2e23] border border-[#1b4336]">
                  <div className="text-[10px] text-sage-light uppercase">Inferred Visual AQI</div>
                  <div className="text-xl font-bold font-serif text-emerald-400">
                    {analysisResult.estimatedAqiMin}–{analysisResult.estimatedAqiMax}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0c2e23] border border-[#1b4336]">
                  <div className="text-[10px] text-sage-light uppercase">Estimated PM2.5</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {analysisResult.estimatedPm25Min}–{analysisResult.estimatedPm25Max} µg
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-sage-light uppercase font-bold tracking-wider mb-1">
                  Optical Evidence:
                </div>
                <ul className="text-xs space-y-1 text-sage-light">
                  {analysisResult.opticalObservations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-sage-light leading-relaxed pt-2 border-t border-[#1b4336]">
                <strong>Citizen Advisory:</strong> {analysisResult.recommendation}
              </p>
            </div>
          )}

          {/* Selected Observation Preview */}
          {selectedObs && (
            <div className="p-5 rounded-2xl bg-white border border-sage/25 shadow-editorial space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-forest">{selectedObs.locationName}</h4>
                  <span className="text-[11px] text-charcoal-muted">Reported by {selectedObs.userName} • {selectedObs.timestamp}</span>
                </div>
                <span 
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: selectedObs.hazeLevel === 'Low' ? '#ECFDF5' : selectedObs.hazeLevel === 'Moderate' ? '#FFFBEB' : '#FFF1F2',
                    color: selectedObs.hazeLevel === 'Low' ? '#047857' : selectedObs.hazeLevel === 'Moderate' ? '#B45309' : '#BE123C',
                  }}
                >
                  {selectedObs.hazeLevel} Haze
                </span>
              </div>

              <div className="w-full h-44 rounded-xl overflow-hidden border border-sage/20 bg-ivory">
                <img 
                  src={selectedObs.imageUrl} 
                  alt={selectedObs.locationName} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-ivory-subtle border border-sage/20">
                  <span className="text-[10px] text-charcoal-muted block">Visual AQI</span>
                  <strong className="text-forest font-mono">{selectedObs.estimatedAqi}</strong>
                </div>
                <div className="p-2 rounded bg-ivory-subtle border border-sage/20">
                  <span className="text-[10px] text-charcoal-muted block">PM2.5 Estimate</span>
                  <strong className="text-forest font-mono">{selectedObs.pm25Range}</strong>
                </div>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                "{selectedObs.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Fused Interactive Leaflet Map */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between bg-white border border-sage/25 rounded-xl px-4 py-2 text-xs">
            <span className="font-serif font-bold text-forest">Bengaluru Crowdsourced Camera Observations</span>
            <span className="text-charcoal-muted">{observations.length} active sky reports</span>
          </div>

          <div className="relative w-full h-[580px] rounded-2xl overflow-hidden border border-sage/30 bg-ivory shadow-editorial">
            <div ref={mapContainerRef} className="w-full h-full light-map z-10" />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm border border-sage/30 rounded-lg p-3 shadow-editorial-md text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-forest mb-1.5">
                Visual Haze Legend
              </div>
              <div className="space-y-1.5 text-[11px] text-charcoal">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                  <span>Clear Sky (Low Haze • AQI 0–100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                  <span>Moderate Particulate Haze (AQI 101–150)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E11D48]"></span>
                  <span>Heavy Smog / Industrial Soot (AQI 151+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
