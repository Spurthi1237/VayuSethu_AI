import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  standardLimit?: number;
  numericVal?: number;
  badgeText?: string;
  badgeColor?: string;
  highlightCard?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  subtext,
  trend,
  trendValue,
  standardLimit,
  numericVal,
  badgeText,
  badgeColor = 'bg-sage-soft text-forest border-sage/30',
  highlightCard = false,
}) => {
  const percentageOfLimit = standardLimit && numericVal ? Math.min(Math.round((numericVal / standardLimit) * 100), 200) : null;

  return (
    <div
      className={`relative rounded-xl p-5 border transition-all duration-150 ${
        highlightCard
          ? 'bg-white border-forest/30 shadow-editorial-md'
          : 'bg-white border-sage/25 hover:border-sage/40 shadow-editorial'
      }`}
    >
      {/* Top row: Label and Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted">
            {label}
          </span>
          {badgeText && (
            <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {badgeText}
            </span>
          )}
        </div>
        <div className="p-1.5 rounded-lg bg-ivory-light border border-sage/20 text-forest">
          <Icon className="w-4 h-4" strokeWidth={1.75} />
        </div>
      </div>

      {/* Main value display */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span 
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forest font-serif"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {value}
        </span>
        {unit && <span className="text-xs font-medium text-charcoal-muted">{unit}</span>}
      </div>

      {/* WHO / CPCB Standard guideline progress bar */}
      {percentageOfLimit !== null && standardLimit && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-charcoal-muted mb-1">
            <span>CPCB 24h Cap: {standardLimit} {unit}</span>
            <span className={percentageOfLimit > 100 ? 'text-[#963723] font-bold' : 'text-forest font-semibold'}>
              {percentageOfLimit}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-ivory overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentageOfLimit > 100
                  ? 'bg-gradient-to-r from-gold to-[#B24E38]'
                  : 'bg-gradient-to-r from-sage to-forest'
              }`}
              style={{ width: `${Math.min(percentageOfLimit, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer details: Trend / Subtext */}
      <div className="flex items-center justify-between text-xs text-charcoal-muted pt-2 border-t border-ivory">
        <span className="truncate">{subtext || 'Monitored guideline'}</span>
        {trend && (
          <div
            className={`flex items-center gap-0.5 font-medium text-[11px] flex-shrink-0 ${
              trend === 'up'
                ? 'text-[#963723]'
                : trend === 'down'
                ? 'text-forest'
                : 'text-charcoal-muted'
            }`}
          >
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            <span>{trendValue || ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
