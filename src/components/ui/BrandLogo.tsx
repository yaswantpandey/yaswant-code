import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  brandName?: string;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  brandName = 'Yaswant Code',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7',  text: 'text-sm',  sub: 'text-[9px]'  },
    md: { icon: 'w-9 h-9',  text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11',text: 'text-lg',  sub: 'text-[11px]' },
    xl: { icon: 'w-14 h-14',text: 'text-xl',  sub: 'text-xs'     },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Emblem SVG Icon — pink brand mark */}
      <div className={`relative ${currentSize.icon} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
        <svg
          viewBox="0 0 128 128"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FD1843" />
              <stop offset="50%"  stopColor="#E5102F" />
              <stop offset="100%" stopColor="#C5102E" />
            </linearGradient>

            <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FFF9FA" />
              <stop offset="50%"  stopColor="#FFE0E8" />
              <stop offset="100%" stopColor="#FFCCD5" />
            </linearGradient>

            <radialGradient id="logoGlow" cx="50%" cy="45%" r="60%">
              <stop offset="0%"   stopColor="#FFF9FA" stopOpacity="0.25" />
              <stop offset="70%"  stopColor="#FD1843" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FD1843" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="logoBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FFF9FA" stopOpacity="0.60" />
              <stop offset="50%"  stopColor="#E5102F" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#FFCCD5" stopOpacity="0.50" />
            </linearGradient>
          </defs>

          {/* Squircle Base */}
          <rect x="6" y="6" width="116" height="116" rx="28"
            fill="url(#logoBgGrad)"
            stroke="url(#logoBorderGrad)"
            strokeWidth="2.5"
          />
          <rect x="8" y="8" width="112" height="112" rx="26" fill="url(#logoGlow)" />

          {/* Tech Monogram: Y + Code Chevrons */}
          <g>
            <path d="M 32 36 L 56 64 L 64 64 L 46 36 Z" fill="url(#logoPrimaryGrad)" />
            <path d="M 96 36 L 72 64 L 64 64 L 82 36 Z" fill="url(#logoPrimaryGrad)" />
            <rect x="58" y="60" width="12" height="38" rx="6" fill="url(#logoPrimaryGrad)" />
            <circle cx="64" cy="62" r="5" fill="#ffffff" />
            <path d="M 36 68 L 28 77 L 36 86"
              fill="none" stroke="#FFF9FA" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.80"
            />
            <path d="M 92 68 L 100 77 L 92 86"
              fill="none" stroke="#FFE0E8" strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.80"
            />
          </g>
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-extrabold tracking-tight text-ink group-hover:text-accent transition-colors flex items-center gap-1.5`}>
            <span>{brandName.split(' ')[0]}</span>
            {brandName.split(' ').slice(1).length > 0 && (
              <span className="text-accent">
                {brandName.split(' ').slice(1).join(' ')}
              </span>
            )}
          </span>
          <span className={`${currentSize.sub} text-ink/50 font-mono tracking-wider uppercase -mt-0.5 font-semibold hidden sm:inline-block`}>
            ENGINEERING LMS
          </span>
        </div>
      )}
    </div>
  );
};
