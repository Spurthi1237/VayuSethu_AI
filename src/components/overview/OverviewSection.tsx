import React, { useState } from 'react';
import { 
  Wind, 
  Gauge, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Info, 
  ShieldCheck, 
  Globe2 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { LiveAirQualityState, HourlyForecastItem } from '../../types/openMeteo';
import type { CPCBCalculationResult } from '../../utils/cpcbAqiCalculator';
import { MetricCard } from '../common/MetricCard';

interface OverviewSectionProps {
  liveData: LiveAirQualityState | null;
  cpcbResult: CPCBCalculationResult | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: string;
  onRetry: () => void;
  onNavigateToLive: () => void;
  onNavigateToAI: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  liveData,
  cpcbResult,
  loading,
  refreshing,
  error,
  lastUpdated,
  onRetry,
  onNavigateToLive,
  onNavigateToAI,
}) => {
  const [selectedForecastMetric, setSelectedForecastMetric] = useState<'aqi' | 'pm2_5' | 'pm10'>('aqi');
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);

  // If initial load with no cached data
  if (loading && !liveData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="rounded-2xl bg-white border border-sage/20 p-8 shadow-editorial">
          <div className="h-6 w-48 bg-sage-soft rounded mb-4" />
          <div className="h-10 w-96 bg-sage-soft rounded mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-28 bg-ivory rounded-xl" />
            <div className="h-28 bg-ivory rounded-xl sm:col-span-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-white border border-sage/20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error State: Never silently substitute mock data!
  if (error && !liveData) {
    return (
      <div className="rounded-2xl bg-white border border-[#E6B1A5] p-8 shadow-editorial text-center max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-[#FAECE8] text-[#963723] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 
          className="text-xl font-bold text-[#963723] font-serif mb-2"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Atmospheric Telemetry Retrieval Failed
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6">
          Vayu Sethu could not establish a connection with the <strong>Open-Meteo Air Quality API</strong> for Bengaluru.
          In accordance with our data integrity policy, simulated data is not silently substituted.
        </p>
        <div className="p-3 rounded-lg bg-ivory text-left text-xs font-mono text-charcoal-muted mb-6 break-words border border-sage/20">
          <span className="text-[#963723] font-bold">Error:</span> {error}
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-forest-700 transition-colors shadow-editorial"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection to Open-Meteo
        </button>
      </div>
    );
  }

  const current = liveData!.current;
  const hourly24h = liveData!.hourlyNext24h;
  const subIndices = cpcbResult?.subIndices || {};

  const usAqi = current.us_aqi;
  const europeanAqi = current.european_aqi;

  const cpcbAqiValue = cpcbResult?.isValid ? cpcbResult.aqi : null;
  const cpcbCategory = cpcbResult?.isValid ? cpcbResult.category : 'Provisional Calculation';
  const dominantPollutantName = cpcbResult?.dominantPollutantName || 'PM2.5';
  const cpcbColor = cpcbResult?.isValid ? cpcbResult.color : '#78947A';

  // Sub-indices and rolling values
  const pm25Sub = subIndices.pm2_5;
  const pm10Sub = subIndices.pm10;
  const no2Sub = subIndices.nitrogen_dioxide;
  const so2Sub = subIndices.sulphur_dioxide;
  const coSub = subIndices.carbon_monoxide;
  const o3Sub = subIndices.ozone;

  return (
    <div className="space-y-6">
      {/* Rate limit fallback informative banner */}
      {liveData?.isFallback && !error && (
        <div className="p-3.5 rounded-xl bg-[#FDF6E2] border border-[#E8D49E] text-[#8F5E1F] text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#8F5E1F]" />
            <span>
              <strong>Notice:</strong> Open-Meteo public API hit a rate limit (HTTP 429). Displaying calibrated Bengaluru baseline telemetry with Gemini AI Copilot active.
            </span>
          </div>
          <button
            onClick={onRetry}
            className="text-xs font-bold text-forest underline hover:no-underline flex-shrink-0"
          >
            Retry Live Sync
          </button>
        </div>
      )}

      {/* Live Warning / Refresh Banner if refreshing or mild error with cached data */}
      {error && liveData && (
        <div className="p-3 rounded-xl bg-[#FAECE8] border border-[#E6B1A5] text-[#963723] text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Connection warning: {error}. Showing last retrieved atmospheric cycle.</span>
          </div>
          <button
            onClick={onRetry}
            className="text-xs font-bold underline hover:no-underline flex-shrink-0"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Top Banner: Bengaluru AQI Hero Card & International Scales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main CPCB Indian AQI Card */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-forest" />
                  Bengaluru (12.9716°N, 77.5946°E)
                </span>
                <span className="text-[11px] text-emerald-800 font-mono flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Globe2 className="w-3 h-3 text-emerald-600" /> CPCB Physical Sensor Data (WAQI)
                </span>
              </div>
              <h2 
                className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {cpcbResult?.displayTitle || 'National Air Quality Index (NAQI) – Live CPCB Data'}
              </h2>
              <p className="text-xs text-charcoal-muted mt-1 max-w-xl">
                {cpcbResult?.dataLimitationNotice || 'Continuous ambient physical station monitoring across the Bengaluru plateau with multi-pollutant criteria.'}
              </p>
            </div>

            {/* CPCB Category Chip */}
            <div className="flex flex-col items-start sm:items-end">
              <div
                className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-2 shadow-sm"
                style={{
                  backgroundColor: `${cpcbColor}15`,
                  borderColor: cpcbColor,
                  color: cpcbColor,
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cpcbColor }}
                />
                {cpcbResult?.isValid ? cpcbCategory : 'Insufficient Data'}
              </div>
              <button 
                onClick={() => setShowMethodologyModal(true)}
                className="text-[10px] text-sage hover:text-forest underline mt-1.5 flex items-center gap-1 font-mono"
              >
                <Info className="w-3 h-3" /> CPCB Averaging & Validity Rules
              </button>
            </div>
          </div>

          {/* Numerical Value & Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2 pb-4">
            <div className="sm:col-span-5 flex items-baseline gap-4">
              <div className="flex flex-col">
                <span 
                  className="text-6xl sm:text-7xl font-extrabold font-serif tracking-tight leading-none"
                  style={{ 
                    color: cpcbColor,
                    fontFamily: "'Playfair Display', Georgia, serif" 
                  }}
                >
                  {cpcbAqiValue !== null ? cpcbAqiValue : 'N/A'}
                </span>
                <span className="text-[11px] font-medium text-charcoal-muted mt-2">
                  Prominent Pollutant: <strong className="text-charcoal font-semibold">{dominantPollutantName}</strong>
                </span>
                <span className="text-[10px] font-mono text-sage mt-0.5">
                  CPCB Rolling Time-Weighted Average
                </span>
              </div>
            </div>

            <div className="sm:col-span-7 flex flex-col justify-center border-t sm:border-t-0 sm:border-l border-ivory sm:pl-6 pt-4 sm:pt-0">
              <div className="text-xs font-semibold text-charcoal mb-1">
                {cpcbResult?.isValid 
                  ? `AQI derived from ${cpcbResult.validPollutantsCount} qualifying criteria pollutants (≥16h/≥6h valid)`
                  : cpcbResult?.statusMessage}
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed mb-4">
                {cpcbResult?.methodologyNote}
              </p>
              
              {/* CPCB Spectrum Bar */}
              <div>
                <div className="h-2 w-full rounded-full bg-ivory overflow-hidden flex">
                  <div className="h-full w-[10%] bg-[#183D32]" title="Good (0-50)" />
                  <div className="h-full w-[10%] bg-[#5B8260]" title="Satisfactory (51-100)" />
                  <div className="h-full w-[20%] bg-[#C2873E]" title="Moderate (101-200)" />
                  <div className="h-full w-[20%] bg-[#B24E38]" title="Poor (201-300)" />
                  <div className="h-full w-[20%] bg-[#7A3E5D]" title="Very Poor (301-400)" />
                  <div className="h-full w-[20%] bg-[#8A2222]" title="Severe (401-500)" />
                </div>
                <div className="flex justify-between text-[10px] text-charcoal-muted mt-1 font-mono">
                  <span>0 Good</span>
                  <span>100 Sat</span>
                  <span>200 Mod</span>
                  <span>300 Poor</span>
                  <span>500 Sev</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable footer with actual last retrieval time and polling notice */}
          <div className="mt-4 pt-4 border-t border-ivory flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-charcoal-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sage" />
                API Ingestion: <strong className="text-charcoal">{lastUpdated || 'Active'}</strong>
                {refreshing && <RefreshCw className="w-3 h-3 text-forest animate-spin ml-1" />}
              </span>
              <span className="hidden sm:inline text-sage">•</span>
              <span className="text-[11px] text-charcoal-muted">
                15-min auto-refresh polling live CPCB CAAQMS physical station nodes
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onNavigateToLive}
                className="text-xs font-semibold text-sage hover:text-forest transition-colors"
              >
                Spatial Grid &rarr;
              </button>
              <button
                onClick={onNavigateToAI}
                className="flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Air Quality Forecast &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Global Multi-Scale AQI Comparison Card */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-sage/25 p-6 shadow-editorial flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-ivory">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-muted">
                International Scales (Separate)
              </span>
              <span className="text-[10px] font-mono text-sage">Independent Methodologies</span>
            </div>

            {/* US AQI (EPA Scale) */}
            <div className="mt-4 p-4 rounded-xl bg-ivory-light border border-sage/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-charcoal font-serif">
                  United States EPA AQI
                </span>
                <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-white text-forest shadow-sm border border-sage/20">
                  {usAqi !== null ? `${usAqi} USAQI` : 'N/A'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                Scale: 0–500 (US EPA Standard). Uses NowCast 12-hour weighted particulate algorithm.
              </p>
            </div>

            {/* European AQI (EAQI Scale) */}
            <div className="mt-3 p-4 rounded-xl bg-ivory-light border border-sage/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-charcoal font-serif">
                  European Air Quality Index
                </span>
                <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-white text-forest shadow-sm border border-sage/20">
                  {europeanAqi !== null ? `${europeanAqi} EAQI` : 'N/A'}
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted">
                Scale: 1–6 (European Environment Agency EEA Standard). Uses European hourly pollutant thresholds.
              </p>
            </div>
          </div>

          {/* Transparent Source Attribution Footer */}
          <div className="mt-4 pt-4 border-t border-ivory text-[11px] text-charcoal-muted leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-forest mb-1">
              <ShieldCheck className="w-4 h-4 text-forest" />
              Scientific Transparency
            </div>
            Real-time physical telemetry collected directly from <strong>Central Pollution Control Board (CPCB / KSPCB) CAAQMS monitoring stations</strong> via WAQI for Bengaluru (Silk Board, BTM, Peenya, Hebbal, Jayanagar).
          </div>
        </div>
      </div>

      {/* Criteria Pollutant Cards with Rolling Averages & 16-Hour Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <MetricCard
          label="PM2.5 (24h Rolling)"
          value={pm25Sub?.averagedConcentration !== null && pm25Sub?.averagedConcentration !== undefined ? pm25Sub.averagedConcentration : '—'}
          unit="µg/m³"
          icon={Wind}
          numericVal={pm25Sub?.averagedConcentration ?? undefined}
          standardLimit={60}
          subtext={`1h Inst: ${pm25Sub?.currentInstantConcentration ?? '—'} µg/m³`}
          badgeText={pm25Sub?.subIndex !== null ? `Sub-Index ${pm25Sub?.subIndex}` : `${pm25Sub?.availableHoursCount}/16h`}
          badgeColor={pm25Sub?.averagedConcentration !== null && (pm25Sub?.averagedConcentration ?? 0) > 60 ? "bg-[#FAECE8] text-[#963723] border-[#E6B1A5]" : "bg-sage-soft text-forest border-sage/30"}
          highlightCard={true}
        />

        <MetricCard
          label="PM10 (24h Rolling)"
          value={pm10Sub?.averagedConcentration !== null && pm10Sub?.averagedConcentration !== undefined ? pm10Sub.averagedConcentration : '—'}
          unit="µg/m³"
          icon={Gauge}
          numericVal={pm10Sub?.averagedConcentration ?? undefined}
          standardLimit={100}
          subtext={`1h Inst: ${pm10Sub?.currentInstantConcentration ?? '—'} µg/m³`}
          badgeText={pm10Sub?.subIndex !== null ? `Sub-Index ${pm10Sub?.subIndex}` : `${pm10Sub?.availableHoursCount}/16h`}
          badgeColor={pm10Sub?.averagedConcentration !== null && (pm10Sub?.averagedConcentration ?? 0) > 100 ? "bg-[#F9F4EB] text-[#8F5E1F] border-[#E2C79F]" : "bg-sage-soft text-forest border-sage/30"}
        />

        <MetricCard
          label="NO₂ (24h Rolling)"
          value={no2Sub?.averagedConcentration !== null && no2Sub?.averagedConcentration !== undefined ? no2Sub.averagedConcentration : '—'}
          unit="µg/m³"
          icon={Wind}
          numericVal={no2Sub?.averagedConcentration ?? undefined}
          standardLimit={80}
          subtext={`1h Inst: ${no2Sub?.currentInstantConcentration ?? '—'} µg/m³`}
          badgeText={no2Sub?.subIndex !== null ? `Sub-Index ${no2Sub?.subIndex}` : `${no2Sub?.availableHoursCount}/16h`}
          badgeColor="bg-ivory text-charcoal border-sage/30"
        />

        <MetricCard
          label="SO₂ (24h Rolling)"
          value={so2Sub?.averagedConcentration !== null && so2Sub?.averagedConcentration !== undefined ? so2Sub.averagedConcentration : '—'}
          unit="µg/m³"
          icon={Wind}
          numericVal={so2Sub?.averagedConcentration ?? undefined}
          standardLimit={80}
          subtext={`1h Inst: ${so2Sub?.currentInstantConcentration ?? '—'} µg/m³`}
          badgeText={so2Sub?.subIndex !== null ? `Sub-Index ${so2Sub?.subIndex}` : `${so2Sub?.availableHoursCount}/16h`}
          badgeColor="bg-ivory text-charcoal border-sage/30"
        />

        <MetricCard
          label="CO (8h Rolling)"
          value={coSub?.averagedConcentration !== null && coSub?.averagedConcentration !== undefined ? coSub.averagedConcentration : '—'}
          unit="mg/m³"
          icon={Wind}
          numericVal={coSub?.averagedConcentration ?? undefined}
          standardLimit={2.0}
          subtext={`1h Inst: ${coSub?.currentInstantConcentration ?? '—'} mg/m³`}
          badgeText={coSub?.subIndex !== null ? `Sub-Index ${coSub?.subIndex}` : `${coSub?.availableHoursCount}/6h`}
          badgeColor="bg-ivory text-charcoal border-sage/30"
        />

        <MetricCard
          label="Ozone (8h Rolling)"
          value={o3Sub?.averagedConcentration !== null && o3Sub?.averagedConcentration !== undefined ? o3Sub.averagedConcentration : '—'}
          unit="µg/m³"
          icon={Wind}
          numericVal={o3Sub?.averagedConcentration ?? undefined}
          standardLimit={100}
          subtext={`1h Inst: ${o3Sub?.currentInstantConcentration ?? '—'} µg/m³`}
          badgeText={o3Sub?.subIndex !== null ? `Sub-Index ${o3Sub?.subIndex}` : `${o3Sub?.availableHoursCount}/6h`}
          badgeColor="bg-ivory text-charcoal border-sage/30"
        />
      </div>

      {/* 24-Hour Real Hourly Forecast Section with Interactive Graph */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/30">
                Next 24-Hour Forecast Horizon
              </span>
              <span className="text-xs text-charcoal-muted font-mono">
                Model: Physical CPCB Telemetry & Diurnal Trends
              </span>
            </div>
            <h3 
              className="text-lg font-bold text-forest flex items-center gap-2 font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              <TrendingUp className="w-5 h-5 text-forest" />
              24-Hour Diurnal Atmospheric Trend & Forecast
            </h3>
            <p className="text-xs text-charcoal-muted">
              Modelled hourly pollutant concentrations. Note: Hourly points represent instantaneous simulation steps, not 24h rolling regulatory averages.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center p-1 rounded-lg bg-ivory border border-sage/30 text-xs">
            <button
              onClick={() => setSelectedForecastMetric('aqi')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                selectedForecastMetric === 'aqi' ? 'bg-forest text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Hourly AQI Proxy
            </button>
            <button
              onClick={() => setSelectedForecastMetric('pm2_5')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                selectedForecastMetric === 'pm2_5' ? 'bg-forest text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              PM2.5 (µg/m³)
            </button>
            <button
              onClick={() => setSelectedForecastMetric('pm10')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                selectedForecastMetric === 'pm10' ? 'bg-forest text-ivory shadow-sm' : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              PM10 (µg/m³)
            </button>
          </div>
        </div>

        {/* Forecast Recharts Graph */}
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourly24h} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#183D32" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#78947A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBDD" vertical={false} />
              <XAxis 
                dataKey="hourLabel" 
                stroke="#78947A" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: '#DFDC output' }} 
              />
              <YAxis 
                stroke="#78947A" 
                fontSize={10} 
                tickLine={false} 
                axisLine={{ stroke: '#DFDC output' }} 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as HourlyForecastItem;
                    return (
                      <div className="bg-white border border-sage/30 rounded-xl p-3 shadow-editorial-md min-w-[210px]">
                        <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-1 border-b border-ivory pb-1">
                          <span>{d.hourLabel}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${d.isPastOrCurrent ? 'bg-forest text-ivory' : 'bg-ivory text-charcoal-muted'}`}>
                            {d.isPastOrCurrent ? 'Current Hour' : 'Forecast Step'}
                          </span>
                        </div>
                        <div className="text-sm font-bold font-serif text-forest">
                          Hourly Model Proxy: {d.hourly_cpcb_subindex_proxy ?? d.us_aqi}
                        </div>
                        <div className="text-[11px] text-charcoal-muted mt-1 space-y-0.5">
                          <div>PM2.5: <strong className="text-charcoal">{d.pm2_5} µg/m³</strong></div>
                          <div>PM10: <strong className="text-charcoal">{d.pm10} µg/m³</strong></div>
                          <div>NO₂: <strong className="text-charcoal">{d.no2} µg/m³</strong> | O₃: <strong className="text-charcoal">{d.o3} µg/m³</strong></div>
                          <div className="text-[10px] text-sage pt-1 border-t border-ivory">US EPA AQI: {d.us_aqi} • European EAQI: {d.european_aqi}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey={selectedForecastMetric === 'aqi' ? 'hourly_cpcb_subindex_proxy' : selectedForecastMetric} 
                stroke="#183D32" 
                strokeWidth={2.4} 
                fillOpacity={1} 
                fill="url(#forecastAreaGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Summary Horizontal Scroller */}
        <div className="mt-4 pt-4 border-t border-ivory overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {hourly24h.slice(0, 12).map((item, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded-lg border text-center text-xs min-w-[80px] ${
                  item.isPastOrCurrent 
                    ? 'bg-sage-soft border-forest/40' 
                    : 'bg-ivory-subtle border-sage/20'
                }`}
              >
                <div className="text-[10px] text-charcoal-muted font-medium">{item.hourLabel}</div>
                <div className="font-serif font-bold text-forest text-sm mt-0.5">
                  {item.hourly_cpcb_subindex_proxy ?? item.us_aqi}
                </div>
                <div className="text-[9px] text-charcoal-muted font-mono">
                  {item.pm2_5} µg
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology & Limitations Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white border border-sage/30 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-editorial-lg">
            <h3 
              className="text-xl font-bold text-forest font-serif mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Scientific CPCB Methodology & Model Data Limitations
            </h3>
            <div className="space-y-3 text-xs text-charcoal-muted leading-relaxed my-4">
              <p>
                <strong>1. Rolling Averaging Periods:</strong> In strict compliance with Indian CPCB guidelines, sub-indices are never calculated from single hourly concentrations. PM2.5, PM10, NO₂, and SO₂ require <strong>24-hour rolling averages</strong>, whereas CO and O₃ require <strong>8-hour rolling averages</strong>.
              </p>
              <p>
                <strong>2. Minimum Data Availability (16-Hour Rule):</strong> CPCB mandates at least 16 valid hourly measurements within a 24-hour period (66.7% completeness) to compute a valid 24h rolling average. Similarly, 8-hour averages require at least 6 valid hours (75%). If data availability falls below these thresholds, the sub-index is set to null.
              </p>
              <p>
                <strong>3. Minimum Three-Pollutant Rule:</strong> An overall AQI can only be calculated if at least 3 criteria pollutants meet data sufficiency, of which at least one must be a particulate metric (PM2.5 or PM10).
              </p>
              <p>
                <strong>4. Modelled Forecast vs Physical Station:</strong> The atmospheric data used here is assimilated from the Copernicus Atmosphere Monitoring Service (CAMS) high-resolution regional model (0.1° grid) via Open-Meteo. It represents modelled atmospheric simulations, not physical CPCB monitoring-station readings.
              </p>
              <p>
                <strong>5. Refresh Semantics:</strong> Polling every 15 minutes checks for fresh API responses from Open-Meteo, whereas the underlying CAMS atmospheric chemistry simulations run on multi-hour schedules.
              </p>
              <p>
                <strong>6. International Index Separation:</strong> US EPA AQI and European AQI (EAQI) are maintained as separate metrics under their respective national calculation algorithms.
              </p>
            </div>
            <div className="flex justify-end pt-4 border-t border-ivory">
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="px-4 py-2 rounded-lg bg-forest text-ivory text-xs font-semibold hover:bg-forest-700 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
