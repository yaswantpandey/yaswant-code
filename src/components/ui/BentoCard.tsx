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
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-200 group-hover:scale-105 transition-transform duration-200">
          {icon}
        </div>
      </div>

      <div>
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {value}
        </div>

        <div className="flex items-center gap-2 mt-2">
          {change && (
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              change.trend === 'up' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : change.trend === 'down'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {change.trend === 'up' ? '↑ ' : change.trend === 'down' ? '↓ ' : '• '}
              {change.value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
