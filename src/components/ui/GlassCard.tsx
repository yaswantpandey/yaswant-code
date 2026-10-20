import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  intensity?: 'subtle' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  intensity = 'medium',
  ...props
}) => {
  const intensityMap = {
    subtle: 'bg-paper border border-ink/8 text-ink',
    medium: 'bg-white border border-ink/10 text-ink',
    high:   'bg-white border border-brand/18 text-ink',
  };

  const hoverClasses = hoverEffect
    ? 'transition-colors duration-200 hover:border-brand/30'
    : '';

  return (
    <div
      className={`rounded-xl ${intensityMap[intensity]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
