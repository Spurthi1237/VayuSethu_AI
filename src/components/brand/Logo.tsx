import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'emblem' | 'sidebar';
  lightText?: boolean;
}

/**
 * Standalone Emblem SVG faithfully replicating:
 * - Flowing air currents on the left (Vayu)
 * - Elegant bridge arch with vertical pillars on the right (Sethu)
 * - Bengaluru cityscape silhouette in muted sage
 * - Two nature leaves sprouting upwards
 * - Sweeping halo arc in muted gold (#B9A47A)
 */
export const VayuSethuEmblem: React.FC<{ className?: string; lightMode?: boolean }> = ({
  className = "w-12 h-12",
}) => {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vayu Sethu Emblem"
    >
      <defs>
        {/* Subtle gradients adhering strictly to the brand palette */}
        <linearGradient id="forestWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#255949" />
          <stop offset="100%" stopColor="#183D32" />
        </linearGradient>
        <linearGradient id="sageWave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9CB49E" />
          <stop offset="100%" stopColor="#78947A" />
        </linearGradient>
        <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4C5A0" />
          <stop offset="100%" stopColor="#B9A47A" />
        </linearGradient>
      </defs>

      {/* 1. Muted Gold Halo Arc sweeping over the top right */}
      <path
        d="M 90 20 A 55 55 0 0 1 178 95"
        stroke="url(#goldArc)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 2. City Skyline Silhouette in Muted Sage (Behind Bridge) */}
      <path
        d="M 115 88 L 115 72 L 121 72 L 121 88 M 123 88 L 123 64 L 128 64 L 128 58 L 131 54 L 134 58 L 134 64 L 139 64 L 139 88 M 141 88 L 141 68 L 146 68 L 146 88 M 148 88 L 148 76 L 153 76 L 153 88"
        stroke="#78947A"
        strokeWidth="1.8"
        fill="#78947A"
        opacity="0.45"
      />

      {/* 3. Dual Leaves Sprouting at the top left */}
      {/* Left Leaf */}
      <path
        d="M 80 50 C 65 30, 75 10, 95 18 C 98 35, 90 52, 80 50 Z"
        fill="#2A5C4C"
      />
      <path
        d="M 76 43 C 83 32, 87 23, 93 19"
        stroke="#EDEBDD"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Right Leaf */}
      <path
        d="M 92 48 C 92 28, 108 14, 122 24 C 120 40, 105 52, 92 48 Z"
        fill="#183D32"
      />
      <path
        d="M 96 44 C 103 35, 111 28, 119 25"
        stroke="#EDEBDD"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* 4. Flowing Air Current Waves (Vayu) on the left */}
      {/* Top Sage Wave */}
      <path
        d="M 52 46 C 70 42, 88 56, 108 55 C 122 55, 134 62, 145 68 C 132 64, 118 60, 104 60 C 84 60, 68 49, 52 46 Z"
        fill="url(#sageWave)"
      />
      {/* Mid Wave */}
      <path
        d="M 44 60 C 62 55, 80 72, 102 70 C 122 68, 140 76, 155 86 C 138 80, 118 75, 98 76 C 78 77, 62 65, 44 60 Z"
        fill="#2D6655"
      />
      {/* Dynamic S-curve Wave */}
      <path
        d="M 50 78 C 65 72, 78 86, 96 86 C 114 86, 128 80, 144 86 C 126 83, 110 88, 92 88 C 76 88, 62 78, 50 78 Z"
        fill="#183D32"
      />
      {/* Lower swirling air current */}
      <path
        d="M 62 82 C 48 85, 42 96, 50 106 C 60 116, 80 114, 98 106 C 82 110, 66 110, 58 102 C 50 94, 55 86, 62 82 Z"
        fill="url(#sageWave)"
      />

      {/* 5. Elegant Bridge Arch (Sethu) on the right */}
      {/* Upper Arch Curve */}
      <path
        d="M 85 110 C 105 80, 135 60, 178 98 C 158 84, 130 82, 102 110 Z"
        fill="#183D32"
      />
      {/* Lower Arch Curve */}
      <path
        d="M 98 114 C 115 76, 145 74, 172 108 C 150 94, 126 94, 108 114 Z"
        fill="#275647"
      />

      {/* Bridge Vertical Pillars */}
      <line x1="118" y1="88" x2="118" y2="108" stroke="#EDEBDD" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="128" y1="82" x2="128" y2="106" stroke="#EDEBDD" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="138" y1="80" x2="138" y2="104" stroke="#EDEBDD" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="148" y1="83" x2="148" y2="103" stroke="#EDEBDD" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="158" y1="89" x2="158" y2="103" stroke="#EDEBDD" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />

      {/* Base Arch Solid Footing */}
      <path
        d="M 82 112 C 104 102, 130 98, 185 114 C 145 106, 115 110, 82 112 Z"
        fill="#112C24"
      />
    </svg>
  );
};

/**
 * Full Horizontal Logo:
 * - Emblem + Classical Serif "VAYU SETHU" + "AI • AIR INTELLIGENCE" + motto
 */
export const VayuSethuHorizontalLogo: React.FC<{
  className?: string;
  lightText?: boolean;
  showMotto?: boolean;
}> = ({
  className = "h-14",
  lightText = false,
  showMotto = true,
}) => {
  const primaryTextColor = lightText ? "#EDEBDD" : "#183D32";
  const subTextColor = lightText ? "#B9A47A" : "#78947A";
  const ruleColor = lightText ? "rgba(237, 235, 221, 0.25)" : "rgba(120, 148, 122, 0.4)";
  const mottoColor = lightText ? "#D9CCA9" : "#292E2A";

  return (
    <div className={`flex items-center gap-4 ${className} select-none`}>
      <VayuSethuEmblem className="h-full w-auto aspect-[5/4] flex-shrink-0" />
      <div className="flex flex-col justify-center">
        {/* Classical Serif Wordmark */}
        <div className="flex items-center tracking-[0.14em] font-serif font-semibold leading-none">
          <span
            className="text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.16em]"
            style={{ 
              color: primaryTextColor,
              fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
              textShadow: lightText ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            VAYU SETHU
          </span>
        </div>

        {/* Subtitle with flanked rules */}
        <div className="flex items-center gap-2 mt-1.5">
          <div className="h-[1px] w-6 sm:w-10 flex-grow" style={{ backgroundColor: ruleColor }} />
          <span
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] font-sans"
            style={{ color: subTextColor }}
          >
            AI • AIR INTELLIGENCE
          </span>
          <div className="h-[1px] w-6 sm:w-10 flex-grow" style={{ backgroundColor: ruleColor }} />
        </div>

        {/* Motto in refined italic */}
        {showMotto && (
          <div
            className="text-[11px] sm:text-xs italic tracking-wide mt-1 font-serif hidden sm:block opacity-90"
            style={{ color: mottoColor }}
          >
            One platform. Every breath accounted for.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact Logo for Sidebar & Header Navigation
 */
export const VayuSethuSidebarLogo: React.FC<{
  isCollapsed: boolean;
}> = ({ isCollapsed }) => {
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center w-full py-1">
        <VayuSethuEmblem className="w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 w-full py-1 select-none">
      <VayuSethuEmblem className="w-11 h-11 flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-base font-extrabold uppercase tracking-[0.14em] text-ivory truncate"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            VAYU SETHU
          </span>
          <span className="text-[9px] font-bold tracking-widest px-1 py-0.2 rounded bg-gold/20 text-gold-light border border-gold/30">
            AI
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-medium tracking-wider text-sage-light uppercase truncate">
          <span>Air Intelligence</span>
          <span>•</span>
          <span className="text-gold">Bengaluru</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Logo Export
 */
export const Logo: React.FC<LogoProps> = ({
  className = "h-12",
  variant = 'horizontal',
  lightText = false,
}) => {
  switch (variant) {
    case 'emblem':
      return <VayuSethuEmblem className={className} />;
    case 'sidebar':
      return <VayuSethuSidebarLogo isCollapsed={false} />;
    case 'full':
    case 'horizontal':
    default:
      return <VayuSethuHorizontalLogo className={className} lightText={lightText} showMotto={variant === 'full'} />;
  }
};
