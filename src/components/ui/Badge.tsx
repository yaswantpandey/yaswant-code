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
    neutral: 'bg-[#003832] text-[#F0EDE4]/80 border-[#F0EDE4]/15',
    primary: 'bg-[#F0EDE4] text-[#004741] font-bold border-transparent shadow-xs',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    purple: 'bg-teal-500/20 text-teal-200 border-teal-500/30',
    outline: 'bg-transparent text-[#F0EDE4]/80 border-[#F0EDE4]/25'
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
