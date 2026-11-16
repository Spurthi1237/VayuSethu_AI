import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldAlert, 
  Users, 
  Baby, 
  Activity, 
  Home,
  Clock,
  Sparkles,
  RefreshCw,
  Bot
} from 'lucide-react';
import { HEALTH_ADVISORIES } from '../../data/mockAirQualityData';
import type { HealthAdvice } from '../../types/airQuality';
import { 
  generateDemographicHealthAdvisory, 
  type TelemetryContext 
} from '../../services/geminiService';

interface HealthAdvisorSectionProps {
  telemetryContext?: TelemetryContext;
}

export const HealthAdvisorSection: React.FC<HealthAdvisorSectionProps> = ({ telemetryContext }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>(HEALTH_ADVISORIES[0].id);
  const [aiAdvisory, setAiAdvisory] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const activeAdvice = HEALTH_ADVISORIES.find((a) => a.id === selectedGroup) || HEALTH_ADVISORIES[0];

  const getGroupIcon = (group: HealthAdvice['group']) => {
    switch (group) {
      case 'General Public':
        return Users;
      case 'Children & Seniors':
        return Baby;
      case 'Sensitive Respiratory':
        return HeartPulse;
      case 'Outdoor Athletes':
        return Activity;
      default:
        return Users;
    }
  };

  const handleGenerateAiAdvisory = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const result = await generateDemographicHealthAdvisory(activeAdvice.group, telemetryContext);
      setAiAdvisory((prev) => ({
        ...prev,
        [activeAdvice.group]: result,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate advisory from Gemini.';
      setAiError(msg);
    } finally {
      setLoadingAi(false);
    }
  };

  const currentAiText = aiAdvisory[activeAdvice.group];

  return (
    <div className="space-y-6">
      {/* Top Health Risk Overview Banner */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F9F4EB] border border-[#E2C79F] text-[#8F5E1F] text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-[#8F5E1F]" />
                Current City Risk Assessment: {telemetryContext?.category || 'Moderate Precaution'}
              </span>
              <span className="text-xs text-charcoal-muted font-mono">ICMR / WHO Atmospheric Guidelines</span>
            </div>
            <h2 
              className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Public Health & Respiratory Advisory
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-1 leading-relaxed">
              Clinical exposure precautions tailored dynamically to real-time particulate indices (AQI {telemetryContext?.aqi ?? 138} • PM2.5 {telemetryContext?.pm25 ?? 68.4} µg/m³) across Bengaluru.
            </p>
          </div>

          {/* Quick Indicator Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-ivory-subtle border border-sage/25">
              <div className="text-[10px] text-charcoal-muted uppercase font-bold">Mask Protocol</div>
              <div className="text-sm font-bold text-forest mt-1">In Traffic Belts</div>
              <div className="text-[10px] text-charcoal-muted">N95 recommended</div>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-subtle border border-sage/25">
              <div className="text-[10px] text-charcoal-muted uppercase font-bold">Outdoor Cardio</div>
              <div className="text-sm font-bold text-forest mt-1">Early Afternoon</div>
              <div className="text-[10px] text-charcoal-muted">Avoid 7:30–9:30 AM</div>
            </div>

            <div className="p-3.5 rounded-xl bg-ivory-subtle border border-sage/25 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-charcoal-muted uppercase font-bold">Home Aeration</div>
              <div className="text-sm font-bold text-forest mt-1">13:00–16:00 IST</div>
              <div className="text-[10px] text-charcoal-muted">Max thermal lift</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demographic Segment Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {HEALTH_ADVISORIES.map((adv) => {
          const Icon = getGroupIcon(adv.group);
          const isSelected = selectedGroup === adv.id;

          return (
            <button
              key={adv.id}
              onClick={() => setSelectedGroup(adv.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-sage-soft border-forest/40 shadow-sm'
                  : 'bg-white border-sage/25 hover:border-sage/40 hover:bg-ivory-light shadow-editorial'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-forest' : 'bg-ivory-subtle text-sage'}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{
                    backgroundColor: adv.riskLevel.includes('High') ? '#FAECE8' : '#F9F4EB',
                    color: adv.riskLevel.includes('High') ? '#963723' : '#8F5E1F',
                  }}
                >
                  {adv.riskLevel}
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-charcoal font-serif">{adv.group}</div>
              <div className="text-[11px] text-charcoal-muted mt-1 truncate">
                {adv.headline}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Advisory Detail Card */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ivory gap-4">
          <div>
            <div className="text-[11px] font-bold text-sage uppercase tracking-wider">
              Health Protocol Profile • {activeAdvice.group}
            </div>
            <h3 
              className="text-xl sm:text-2xl font-bold text-forest mt-1 font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {activeAdvice.headline}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-ivory-subtle border border-sage/30 text-xs text-charcoal">
              <span className="text-charcoal-muted">Mask: </span>
              <strong className="text-forest font-semibold">{activeAdvice.maskRecommendation}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-ivory-subtle border border-sage/30 text-xs text-charcoal">
              <span className="text-charcoal-muted">Outdoor Exertion: </span>
              <strong className="text-forest font-semibold">{activeAdvice.outdoorActivityRating}</strong>
            </div>

            {/* Gemini Live Advisory Trigger */}
            <button
              onClick={handleGenerateAiAdvisory}
              disabled={loadingAi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-forest text-ivory hover:bg-[#071b15] transition-all text-xs font-semibold shadow-sm border border-[#1b4336] disabled:opacity-50"
            >
              {loadingAi ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  Synthesizing with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Generate Live Gemini Advisory
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gemini Generated Real-Time Advisory Section */}
        {currentAiText && (
          <div className="mt-6 p-5 rounded-xl bg-[#04100C] text-ivory border border-[#1b4336] shadow-md animate-fadeIn">
            <div className="flex items-center justify-between mb-3 border-b border-[#1b4336] pb-2">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-serif font-bold text-emerald-300">
                  Gemini Live Clinical Advisory for {activeAdvice.group}
                </span>
              </div>
              <span className="text-[10px] text-sage-light font-mono bg-[#0c2e23] px-2 py-0.5 rounded">
                Real-Time Synthesized
              </span>
            </div>
            <div className="text-xs space-y-2 text-sage-light leading-relaxed whitespace-pre-line font-sans">
              {currentAiText}
            </div>
          </div>
        )}

        {aiError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            ⚠️ {aiError}
          </div>
        )}

        {/* Detailed Guidelines Checklist */}
        <div className="mt-6">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-4">
            Standard Clinical & Environmental Measures
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeAdvice.guidelines.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-ivory-light border border-sage/20 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-md bg-forest text-ivory flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                  {idx + 1}
                </div>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Indoor Air Quality Best Practices Strip */}
        <div className="mt-6 pt-6 border-t border-ivory grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-ivory-subtle border border-sage/25 flex items-start gap-3">
            <Home className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <div className="text-xs font-bold text-forest font-serif">Indoor HEPA Filtration Protocol</div>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                Position true HEPA units centrally, away from exterior doors. Maintain fan speed at level 2 during sleep cycles to achieve 4+ Air Changes per Hour (ACH).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-ivory-subtle border border-sage/25 flex items-start gap-3">
            <Clock className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <div className="text-xs font-bold text-forest font-serif">Bengaluru Ventilation Schedule</div>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                Keep roadside windows firmly latched between 07:30–10:30 AM and 18:00–21:30 PM. Aerate dwelling rooms during the 13:00–16:00 solar convective window.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
