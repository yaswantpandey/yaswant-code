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
    subtle: 'bg-[#FFF9FA] border border-[#110508]/8 text-[#110508]',
    medium: 'bg-white border border-[#110508]/10 text-[#110508]',
    high:   'bg-white border border-[#FD1843]/18 text-[#110508]',
  };

  const hoverClasses = hoverEffect
    ? 'transition-colors duration-200 hover:border-[#FD1843]/30'
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
