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
    subtle: 'bg-white/60 backdrop-blur-md border border-[#FD1843]/10 text-[#110508]',
    medium: 'bg-white/85 backdrop-blur-xl border border-[#FD1843]/14 shadow-[0_4px_24px_rgba(253,24,67,0.07)] text-[#110508]',
    high:   'bg-white/92 backdrop-blur-2xl border border-[#FD1843]/18 shadow-xl text-[#110508]'
  };

  const hoverClasses = hoverEffect
    ? 'transition-all duration-300 hover:border-[#FD1843]/30 hover:shadow-[0_8px_32px_rgba(253,24,67,0.12)] hover:-translate-y-0.5'
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
