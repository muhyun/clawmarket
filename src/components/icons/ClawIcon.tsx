/**
 * ClawIcon — SVG logo for ClawMarket.
 * Inspired by the OpenClaw pixel-art lobster mascot.
 * A lobster facing forward with two raised claws, holding a small price tag
 * to signal "marketplace".
 */

interface Props {
  size?: number;
  color?: string;
  className?: string;
}

export function ClawIcon({ size = 32, color = 'currentColor', className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ClawMarket"
    >
      {/* ── Antennae ── */}
      <line x1="22" y1="8"  x2="10" y2="2"  stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="42" y1="8"  x2="54" y2="2"  stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="10" cy="2"  r="1.8" fill={color}/>
      <circle cx="54" cy="2"  r="1.8" fill={color}/>

      {/* ── Head ── */}
      <rect x="18" y="7"  width="28" height="16" rx="6" fill={color}/>
      {/* Eyes */}
      <circle cx="25" cy="14" r="3"   fill="white"/>
      <circle cx="39" cy="14" r="3"   fill="white"/>
      <circle cx="26" cy="14" r="1.5" fill="#111"/>
      <circle cx="40" cy="14" r="1.5" fill="#111"/>
      {/* Eye shine */}
      <circle cx="27" cy="13" r="0.7" fill="white"/>
      <circle cx="41" cy="13" r="0.7" fill="white"/>

      {/* ── Body ── */}
      <rect x="16" y="21" width="32" height="22" rx="8" fill={color}/>
      {/* Body segment lines */}
      <line x1="17" y1="29" x2="47" y2="29" stroke="white" strokeWidth="1"  strokeOpacity="0.25"/>
      <line x1="17" y1="35" x2="47" y2="35" stroke="white" strokeWidth="1"  strokeOpacity="0.25"/>

      {/* ── Left arm ── */}
      <path d="M16 26 Q6 22 4 30" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Left claw — open pincer */}
      <path d="M4 30 Q0 25 2 20" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M4 30 Q1 35 4 38"  stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>

      {/* ── Right arm ── */}
      <path d="M48 26 Q58 22 60 30" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none"/>
      {/* Right claw — open pincer */}
      <path d="M60 30 Q64 25 62 20" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
      <path d="M60 30 Q63 35 60 38" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"/>

      {/* ── Walking legs ── */}
      <line x1="20" y1="41" x2="14" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="25" y1="43" x2="20" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="39" y1="43" x2="44" y2="56" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="44" y1="41" x2="50" y2="52" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>

      {/* ── Tail fan ── */}
      <path d="M24 43 Q20 52 16 56 Q22 54 28 50" fill={color} fillOpacity="0.7"/>
      <path d="M32 44 Q32 55 32 60 Q35 55 38 50" fill={color} fillOpacity="0.85"/>
      <path d="M40 43 Q44 52 48 56 Q42 54 36 50" fill={color} fillOpacity="0.7"/>

      {/* ── Price tag on right claw (marketplace signal) ── */}
      <rect x="54" y="16" width="10" height="8" rx="2" fill="white" fillOpacity="0.9"/>
      <circle cx="56.5" cy="18.5" r="1" fill="#111" fillOpacity="0.5"/>
      <line x1="57" y1="21" x2="62" y2="21" stroke="#111" strokeWidth="0.8" strokeOpacity="0.4"/>
      <line x1="57" y1="22.5" x2="61" y2="22.5" stroke="#111" strokeWidth="0.8" strokeOpacity="0.4"/>
    </svg>
  );
}

/** Wordmark: icon + "ClawMarket" text as a single SVG */
export function ClawMarketLogo({ height = 28, color = 'currentColor', className = '' }: { height?: number; color?: string; className?: string }) {
  const iconSize = height;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <ClawIcon size={iconSize} color={color} />
    </span>
  );
}
