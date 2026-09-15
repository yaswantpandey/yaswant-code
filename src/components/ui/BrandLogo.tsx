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
    sm: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'w-9 h-9', text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 'w-11 h-11', text: 'text-lg', sub: 'text-[11px]' },
    xl: { icon: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Emblem SVG Icon */}
      <div className={`relative ${currentSize.icon} shrink-0 transition-transform duration-200 group-hover:scale-105`}>
        <svg
          viewBox="0 0 128 128"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBgGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#090d16" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>

            <linearGradient id="logoPrimaryGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <radialGradient id="logoGlowComp" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="logoBorderGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#334155" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Squircle Base */}
          <rect
            x="6"
            y="6"
            width="116"
            height="116"
            rx="28"
            fill="url(#logoBgGradComp)"
            stroke="url(#logoBorderGradComp)"
            strokeWidth="2.5"
          />
          <rect x="8" y="8" width="112" height="112" rx="26" fill="url(#logoGlowComp)" />

          {/* Tech Monogram: Futuristic Y + Code Chevrons */}
          <g>
            {/* Left Bracket Wing */}
            <path d="M 32 36 L 56 64 L 64 64 L 46 36 Z" fill="url(#logoPrimaryGradComp)" />

            {/* Right Bracket Wing */}
            <path d="M 96 36 L 72 64 L 64 64 L 82 36 Z" fill="url(#logoPrimaryGradComp)" />

            {/* Vertical Stem */}
            <rect x="58" y="60" width="12" height="38" rx="6" fill="url(#logoPrimaryGradComp)" />

            {/* Center Apex Node */}
            <circle cx="64" cy="62" r="5" fill="#ffffff" />

            {/* Code Bracket Highlights */}
            <path
              d="M 36 68 L 28 77 L 36 86"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.85"
            />
            <path
              d="M 92 68 L 100 77 L 92 86"
              fill="none"
              stroke="#34d399"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.85"
            />
          </g>
        </svg>
      </div>

      {/* Typography Label */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-extrabold tracking-tight text-neutral-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors flex items-center gap-1`}>
            <span>{brandName.split(' ')[0]}</span>
            {brandName.split(' ').slice(1).length > 0 && (
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                {brandName.split(' ').slice(1).join(' ')}
              </span>
            )}
          </span>
          <span className={`${currentSize.sub} text-neutral-400 font-mono tracking-wider uppercase -mt-0.5 font-semibold`}>
            ENGINEERING LMS
          </span>
        </div>
      )}
    </div>
  );
};
