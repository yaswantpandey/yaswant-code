import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon
}) => {
  const variantStyles = {
    neutral: 'bg-[#FFF0F3] text-[#110508]/70 border-[#FD1843]/14',
    primary: 'bg-[#FD1843] text-[#FFF9FA] font-bold border-transparent shadow-xs',
    success: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/25',
    warning: 'bg-amber-500/15 text-amber-700 border-amber-500/25',
    purple:  'bg-purple-500/15 text-purple-700 border-purple-500/25',
    outline: 'bg-transparent text-[#FD1843] border-[#FD1843]/30'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border whitespace-nowrap leading-none transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
