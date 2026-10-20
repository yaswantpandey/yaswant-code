import React from 'react';
import { GlassCard } from './GlassCard';

interface BentoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  change,
  icon,
  className = '',
  onClick
}) => {
  return (
    <GlassCard
      hoverEffect={!!onClick}
      onClick={onClick}
      className={`p-5 flex flex-col justify-between relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-ink/60 tracking-wide uppercase">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-surface-2 border border-brand/14 flex items-center justify-center text-accent group-hover:scale-105 transition-transform duration-200">
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-ink">
          {value}
        </div>

        <div className="flex items-center gap-2 mt-2">
          {change && (
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              change.trend === 'up'
                ? 'bg-emerald-500/15 text-emerald-700'
                : change.trend === 'down'
                ? 'bg-rose-500/15 text-rose-600'
                : 'bg-surface-2 text-ink/60'
            }`}>
              {change.trend === 'up' ? '↑ ' : change.trend === 'down' ? '↓ ' : '• '}
              {change.value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-ink/55 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
