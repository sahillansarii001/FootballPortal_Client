import React from 'react';

interface FootballPortalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideTextOnMobile?: boolean;
  showText?: boolean;
}

export const FootballPortalLogo: React.FC<FootballPortalLogoProps> = ({
  className = '',
  size = 'md',
  hideTextOnMobile = false,
  showText = true,
}) => {
  const iconDimensions =
    size === 'sm'
      ? 'w-7 h-7 p-1'
      : size === 'lg'
      ? 'w-11 h-11 p-1.5'
      : 'w-9 h-9 p-1.5';

  const textStyles =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-xl sm:text-2xl'
      : 'text-base sm:text-lg';

  return (
    <div className={`flex items-center gap-2 select-none group ${className}`}>
      {/* Shield Icon with Classic Soccer Ball */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-xs shrink-0 border border-emerald-400/40 group-hover:scale-105 transition-transform`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-full h-full drop-shadow-xs"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Soccer ball outer circle */}
          <circle cx="12" cy="12" r="9.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
          {/* Center pentagon */}
          <polygon
            points="12,8 15.5,10.5 14.2,14.5 9.8,14.5 8.5,10.5"
            fill="#0f172a"
            stroke="#0f172a"
            strokeWidth="0.5"
          />
          {/* Seam lines radiating from pentagon to circle */}
          <line x1="12" y1="2.5" x2="12" y2="8" stroke="#0f172a" strokeWidth="1.4" />
          <line x1="20" y1="7.8" x2="15.5" y2="10.5" stroke="#0f172a" strokeWidth="1.4" />
          <line x1="17.2" y1="18.2" x2="14.2" y2="14.5" stroke="#0f172a" strokeWidth="1.4" />
          <line x1="6.8" y1="18.2" x2="9.8" y2="14.5" stroke="#0f172a" strokeWidth="1.4" />
          <line x1="4" y1="7.8" x2="8.5" y2="10.5" stroke="#0f172a" strokeWidth="1.4" />
        </svg>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div
          className={`flex items-center gap-1 font-black tracking-tight leading-none ${
            hideTextOnMobile ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <span className={`${textStyles} text-slate-900 tracking-tight font-extrabold uppercase`}>
            FOOTBALL
          </span>
          <span className={`${textStyles} text-blue-600 tracking-tight font-extrabold uppercase`}>
            PORTAL
          </span>
        </div>
      )}
    </div>
  );
};
