import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  Car, 
  Building2, 
  Factory, 
  Flame, 
  CloudFog, 
  TrendingUp, 
  TrendingDown, 
  Minus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip
} from 'recharts';
import { POLLUTION_FACTORS } from '../../data/mockAirQualityData';

export const PollutionInsightsSection: React.FC = () => {
  const [activeFactorIndex, setActiveFactorIndex] = useState<number | null>(null);

  const getSourceIcon = (source: string) => {
    if (source.includes('Vehicular')) return Car;
    if (source.includes('Construction')) return Building2;
    if (source.includes('Industrial')) return Factory;
    if (source.includes('Biomass')) return Flame;
    return CloudFog;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-white border border-sage/25 p-6 sm:p-8 shadow-editorial">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5" />
            Urban Source Apportionment
          </span>
          <span className="text-xs text-charcoal-muted font-mono">
            Scientific Attribution Methodology
          </span>
        </div>
        <h2 
          className="text-2xl sm:text-3xl font-bold text-forest tracking-tight font-serif"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Bengaluru Atmospheric Drivers & Contributing Sectors
        </h2>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1 max-w-3xl leading-relaxed">
          Quantitative multi-sector source apportionment isolating primary particulate generators across Bengaluru’s radial corridors, industrial clusters, and mass transit construction zones.
        </p>
      </div>

      {/* Main Breakdown: Pie Attribution (Left) + Detailed Factors Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Source Share Pie Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-sage/25 p-6 shadow-editorial flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 
                className="text-base font-bold text-forest flex items-center gap-2 font-serif"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                <PieChartIcon className="w-4 h-4 text-forest" />
                Emission Source Breakdown (%)
              </h3>
            </div>
            <p className="text-xs text-charcoal-muted mb-4">
              Relative contribution to urban surface PM2.5 & PM10 loads
            </p>
          </div>

          <div className="h-[280px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={POLLUTION_FACTORS}
                  dataKey="sharePercent"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  onMouseEnter={(_, index) => setActiveFactorIndex(index)}
                  onMouseLeave={() => setActiveFactorIndex(null)}
                >
                  {POLLUTION_FACTORS.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#FFFFFF" 
                      strokeWidth={2}
                      opacity={activeFactorIndex === null || activeFactorIndex === index ? 1 : 0.6}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-sage/30 rounded-xl p-3 shadow-editorial-md z-30">
                          <div className="text-xs font-semibold text-charcoal">{d.source}</div>
                          <div className="text-base font-bold font-serif" style={{ color: d.color }}>
                            {d.sharePercent}% Total Share
                          </div>
                          <div className="text-[11px] text-charcoal-muted mt-1">
                            {d.primaryEmissions}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-charcoal-muted uppercase font-bold tracking-wider">
                {activeFactorIndex !== null ? 'Selected' : 'Primary'}
              </span>
              <span 
                className="text-2xl font-bold font-serif text-forest"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {activeFactorIndex !== null ? `${POLLUTION_FACTORS[activeFactorIndex].sharePercent}%` : '42%'}
              </span>
              <span 
                className="text-[11px] font-semibold max-w-[130px] truncate text-center"
                style={{ color: activeFactorIndex !== null ? POLLUTION_FACTORS[activeFactorIndex].color : '#963723' }}
              >
                {activeFactorIndex !== null ? POLLUTION_FACTORS[activeFactorIndex].source : 'Vehicular'}
              </span>
            </div>
          </div>

          {/* Legend chips */}
          <div className="space-y-1.5 pt-3 border-t border-ivory">
            {POLLUTION_FACTORS.map((factor, idx) => (
              <div 
                key={idx} 
                onMouseEnter={() => setActiveFactorIndex(idx)}
                onMouseLeave={() => setActiveFactorIndex(null)}
                className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeFactorIndex === idx ? 'bg-sage-soft font-semibold' : 'hover:bg-ivory-light'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: factor.color }} />
                  <span className="text-charcoal truncate">{factor.source}</span>
                </div>
                <span className="font-mono font-bold text-forest ml-2">{factor.sharePercent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Contributing Factors Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {POLLUTION_FACTORS.map((factor, idx) => {
            const Icon = getSourceIcon(factor.source);
            const isHovered = activeFactorIndex === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveFactorIndex(idx)}
                onMouseLeave={() => setActiveFactorIndex(null)}
                className={`p-4 rounded-xl border transition-all ${
                  isHovered
                    ? 'bg-sage-soft/60 border-forest/30 shadow-editorial-md'
                    : 'bg-white border-sage/25 hover:border-sage/40 shadow-editorial'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${factor.color}15`, 
                        border: `1px solid ${factor.color}30` 
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: factor.color }} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 
                          className="font-bold text-sm text-forest font-serif"
                          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                          {factor.source}
                        </h4>
                        <span 
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded shadow-sm"
                          style={{ backgroundColor: `${factor.color}15`, color: factor.color }}
                        >
                          {factor.sharePercent}%
                        </span>
                      </div>
                      <div className="text-[11px] text-charcoal-muted mt-0.5">
                        Key Criteria Compounds: <strong className="text-charcoal font-semibold">{factor.primaryEmissions}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto text-xs font-mono">
                    <span className="text-charcoal-muted">Peak: {factor.peakPeriod}</span>
                    <div className="flex items-center gap-1 font-semibold">
                      {factor.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#B24E38]" />}
                      {factor.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-forest" />}
                      {factor.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-charcoal-muted" />}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-charcoal-muted leading-relaxed mt-3 pt-3 border-t border-ivory">
                  {factor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
