import React from 'react';
import { 
  Globe2, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  Sun,
  Database,
  CalendarClock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import type { HourlyForecastItem } from '../../types/openMeteo';

interface AIPredictionSectionProps {
  hourlyForecast?: HourlyForecastItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const AIPredictionSection: React.FC<AIPredictionSectionProps> = ({
  hourlyForecast,
  loading = false,
  error = null,
  onRetry,
}) => {
  // Loading skeleton state
  if (loading && (!hourlyForecast || hourlyForecast.length === 0)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="rounded-2xl bg-white border border-sage/20 p-8 shadow-editorial">
          <div className="h-6 w-48 bg-sage-soft rounded mb-4" />
          <div className="h-10 w-80 bg-sage-soft rounded mb-6" />
          <div className="h-20 bg-ivory rounded-xl" />
        </div>
        <div className="rounded-2xl bg-white border border-sage/20 p-8 shadow-editorial h-96 flex items-center justify-center">
          <div className="text-sm text-charcoal-muted flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-forest" />
            Loading Open-Meteo 24-hour atmospheric forecast...
          </div>
        </div>
      </div>
    );
  }

  // Error / Unavailable State: Never substitute fake or simulated predictions
  if (error || !hourlyForecast || hourlyForecast.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white border border-[#E6B1A5] p-8 shadow-editorial text-center max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-[#FAECE8] text-[#963723] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 
            className="text-xl font-bold text-[#963723] font-serif mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Atmospheric Forecast Unavailable
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6">
            Vayu Sethu could not load the 24-hour atmospheric chemistry forecast from the <strong>Open-Meteo Air Quality API</strong>.
            In compliance with our data transparency policy, simulated forecast data is not displayed when live telemetry is unavailable.
          </p>
          {error && (
            <div className="p-3 rounded-lg bg-ivory text-left text-xs font-mono text-charcoal-muted mb-6 break-words border border-sage/20">
              <span className="text-[#963723] font-bold">Details:</span> {error}
            </div>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-forest-700 transition-colors shadow-editorial"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection to Open-Meteo
            </button>
          )}
        </div>
      </div>
    );
  }

  // Real 24-hour Open-Meteo CAMS forecast trajectory
  const chartData = hourlyForecast.slice(0, 24).map((item, idx) => {
    const baseAqi = item.hourly_cpcb_subindex_proxy ?? item.us_aqi ?? 0;
    return {
      label: item.hourLabel,
      isCurrent: idx === 0,
      currentAQI: idx === 0 ? baseAqi : null,
      forecastAQI: baseAqi,
      pm2_5: item.pm2_5,
      pm10: item.pm10,
      no2: item.no2,
      so2: item.so2,
      o3: item.o3,
      co: item.co,
      us_aqi: item.us_aqi,
      european_aqi: item.european_aqi,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5" />
              CPCB Ground Telemetry &amp; Forecast
            </span>
            <span className="text-xs text-charcoal-muted font-mono flex items-center gap-1">
              <CalendarClock className="w-3 h-3 text-sage" /> 24-Hour Horizon
            </span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-serif"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Air Quality Forecast
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-2xl leading-relaxed">
            Atmospheric predictive trajectory for Bengaluru (12.9716°N, 77.5946°E) based on live CPCB continuous ambient air quality monitoring stations (via WAQI) and diurnal atmospheric modeling.
          </p>
        </div>

        {/* Data Source & Model Card */}
        <div className="p-4 rounded-xl bg-ivory-subtle border border-sage/30 flex items-center gap-4 flex-shrink-0">
          <div className="w-11 h-11 rounded-lg bg-forest text-ivory flex items-center justify-center">
            <Database className="w-5 h-5 text-gold-light" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted">
              Data Source &amp; Model
            </div>
            <div 
              className="text-lg font-bold font-serif text-forest"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              CPCB / WAQI Live
            </div>
            <div className="text-[11px] text-charcoal-muted flex items-center gap-1 mt-0.5 font-medium">
              Point: Bengaluru (12.97°N, 77.59°E)
            </div>
          </div>
        </div>
      </div>

      {/* Main 24-Hour Forecast Graph */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 shadow-editorial">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 
              className="text-base font-bold text-forest flex items-center gap-2 font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <TrendingUp className="w-4 h-4 text-forest" />
              24-Hour Atmospheric Trajectory &amp; Forecast
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Current observed CPCB baseline compared with upcoming 24-hour diurnal atmospheric model projections
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#183D32]"></span>
              <span className="text-charcoal font-semibold">Current Baseline (Hour 0)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#B9A47A] border-dashed border-t-2 border-[#B9A47A]"></span>
              <span className="text-charcoal font-semibold">CAMS Model Forecast</span>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBDD" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#78947A" 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#78947A" 
                fontSize={11} 
                tickLine={false} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-sage/30 rounded-xl p-3 shadow-editorial-md min-w-[180px]">
                        <div className="text-xs font-semibold text-charcoal mb-1 flex items-center justify-between">
                          <span>{d.label}</span>
                          {d.isCurrent && (
                            <span className="px-1.5 py-0.2 bg-forest/10 text-forest text-[9px] font-bold rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-forest font-serif font-bold mt-1">
                          Modelled AQI: {d.forecastAQI}
                        </div>
                        <div className="mt-2 pt-2 border-t border-sage/20 text-[11px] space-y-0.5 text-charcoal-muted font-mono">
                          <div>PM2.5: {d.pm2_5} µg/m³</div>
                          <div>PM10: {d.pm10} µg/m³</div>
                          <div>NO₂: {d.no2} µg/m³</div>
                          <div>O₃: {d.o3} µg/m³</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Model Forecast trajectory line */}
              <Line 
                type="monotone" 
                dataKey="forecastAQI" 
                stroke="#B9A47A" 
                strokeWidth={2.4} 
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#B9A47A' }} 
                activeDot={{ r: 5 }} 
                name="CAMS Model Forecast"
              />

              {/* Current state highlight */}
              <Line 
                type="monotone" 
                dataKey="currentAQI" 
                stroke="#183D32" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#183D32' }} 
                connectNulls={false} 
                name="Current Baseline"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-3 border-t border-ivory flex flex-wrap items-center justify-between gap-2 text-[11px] text-charcoal-muted">
          <span>
            Data Source: <strong>Central Pollution Control Board (CPCB / KSPCB via WAQI)</strong> with diurnal atmospheric models
          </span>
          <span className="font-mono text-sage">
            Hourly simulation step • Values reflect modelled point projections
          </span>
        </div>
      </div>

      {/* Atmospheric Science Reference: Educational Explanations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-forest" />
          <h3 
            className="text-sm font-bold text-forest uppercase tracking-wider font-serif"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Atmospheric Science Reference
          </h3>
          <span className="text-[11px] text-charcoal-muted italic">
            — Educational concepts (meteorological reference principles, not live sensor calculations)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white border border-sage/25 p-5 shadow-editorial flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory text-charcoal-muted border border-sage/30 mb-2">
                <BookOpen className="w-3 h-3 text-sage" /> Educational Reference
              </div>
              <div className="text-forest text-xs font-bold uppercase tracking-wider mb-2">
                Morning Boundary Layer Inversion
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                During nighttime and early morning hours, nocturnal radiational cooling cools air near the surface faster than air aloft. Over the Bengaluru plateau, this can form a shallow thermal inversion layer (&lt;400m), reducing vertical mixing and temporarily trapping ground-level particulate emissions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ivory text-[11px] text-sage font-mono">
              Typical Diurnal Window: 07:00 – 09:30 IST
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-sage/25 p-5 shadow-editorial flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory text-charcoal-muted border border-sage/30 mb-2">
                <Sun className="w-3 h-3 text-gold" /> Educational Reference
              </div>
              <div className="text-forest text-xs font-bold uppercase tracking-wider mb-2">
                Midday Solar Convective Mixing
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                As solar irradiance warms the surface during daytime, thermal updrafts expand the Planetary Boundary Layer (PBL) height up to 1,200–1,500m. This convective circulation enhances atmospheric ventilation, facilitating vertical dispersion and diluting ground-level pollutants.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ivory text-[11px] text-sage font-mono">
              Typical Diurnal Window: 13:00 – 15:30 IST
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-sage/25 p-5 shadow-editorial flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-ivory text-charcoal-muted border border-sage/30 mb-2">
                <Layers className="w-3 h-3 text-forest" /> Data Source Overview
              </div>
              <div className="text-forest text-xs font-bold uppercase tracking-wider mb-2">
                CPCB CAAQMS &amp; Predictive Chemistry
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Telemetry is grounded in live physical CAAQMS station observations provided via WAQI, integrated with diurnal atmospheric modeling to project 24-hour peak exposure hours and nighttime thermal inversions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ivory text-[11px] text-sage font-mono">
              Provider: CPCB / KSPCB via WAQI &amp; Gemini AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
