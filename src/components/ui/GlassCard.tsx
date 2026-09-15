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
    subtle: 'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200/60 dark:border-neutral-800/60',
    medium: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
    high: 'bg-white/95 dark:bg-neutral-950/90 backdrop-blur-2xl border border-neutral-200 dark:border-neutral-750 shadow-xl'
  };

  const hoverClasses = hoverEffect 
    ? 'transition-all duration-300 hover:border-neutral-400 dark:hover:border-neutral-700 hover:shadow-lg hover:-translate-y-0.5' 
    : '';

  return (
    <div
      className={`rounded-2xl ${intensityMap[intensity]} transition-[background-color,border-color,box-shadow] duration-200 ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
