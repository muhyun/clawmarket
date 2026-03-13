'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import type { Artifact, ClawPersonality } from '@/types';

const PERSONALITY_COLORS: Record<ClawPersonality, { primary: string; glow: string; emoji: string }> = {
  aggressive: { primary: '#ff4444', glow: '#ff000066', emoji: '⚡' },
  balanced:   { primary: '#44aaff', glow: '#0066ff44', emoji: '⚖️' },
  defensive:  { primary: '#44dd88', glow: '#00ff6644', emoji: '🛡' },
  creative:   { primary: '#cc44ff', glow: '#aa00ff44', emoji: '✨' },
  analytical: { primary: '#ffcc44', glow: '#ffaa0044', emoji: '🔬' },
  helper:     { primary: '#ff9944', glow: '#ff660044', emoji: '🤝' },
};

interface Props {
  artifact: Artifact;
  containerWidth: number;
  containerHeight: number;
  onClick?: () => void;
  scale?: number;
}

export function ClawCreature({ artifact, containerWidth, containerHeight, onClick, scale = 1 }: Props) {
  const colors = PERSONALITY_COLORS[artifact.personality] || PERSONALITY_COLORS.balanced;
  const size = 56 * scale;

  const seed = artifact.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const initX = useMemo(() => ((seed * 137) % Math.max(1, containerWidth - size)), [seed, containerWidth, size]);
  const initY = useMemo(() => ((seed * 193) % Math.max(1, containerHeight - size)), [seed, containerHeight, size]);

  const posRef = useRef({ x: initX, y: initY });
  const velRef = useRef({
    x: (((seed * 31) % 20) - 10) * 0.04 * scale,
    y: (((seed * 47) % 20) - 10) * 0.04 * scale,
  });
  const [pos, setPos] = useState({ x: initX, y: initY });
  const frameRef = useRef<number>(0);
  const [hovered, setHovered] = useState(false);
  const [bobPhase, setBobPhase] = useState(seed % 628);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      const p = posRef.current;
      const v = velRef.current;

      p.x += v.x;
      p.y += v.y;

      const maxX = containerWidth - size;
      const maxY = containerHeight - size;
      if (p.x <= 0) { p.x = 0; v.x = Math.abs(v.x); }
      if (p.x >= maxX) { p.x = maxX; v.x = -Math.abs(v.x); }
      if (p.y <= 0) { p.y = 0; v.y = Math.abs(v.y); }
      if (p.y >= maxY) { p.y = maxY; v.y = -Math.abs(v.y); }

      if (frame % 2 === 0) {
        setBobPhase(ph => (ph + 1) % 628);
        setPos({ x: p.x, y: p.y });
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [containerWidth, containerHeight, size]);

  const bobY = Math.sin(bobPhase * 0.02) * 4;
  // gentle sway left/right instead of flip
  const swayDeg = Math.sin(bobPhase * 0.015) * 6;

  return (
    <div
      className="absolute cursor-pointer select-none"
      style={{
        left: pos.x,
        top: pos.y + bobY,
        width: size,
        height: size,
        transform: `rotate(${swayDeg}deg)`,
        transformOrigin: 'top center',
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      title={artifact.name}
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-full blur-md opacity-70 transition-opacity"
        style={{ background: colors.glow, opacity: hovered ? 1 : 0.4, borderRadius: '50%' }} />

      {/* Lobster body — matches OpenClaw mascot style */}
      <svg width={size} height={size} viewBox="0 0 64 64" style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Antennae (animated bob) ── */}
        <line x1="22" y1="8"  x2="10" y2="2"  stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
        <line x1="42" y1="8"  x2="54" y2="2"  stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
        <circle cx="10" cy="2" r="1.5" fill={colors.primary} fillOpacity="0.7"/>
        <circle cx="54" cy="2" r="1.5" fill={colors.primary} fillOpacity="0.7"/>

        {/* ── Head ── */}
        <rect x="18" y="7" width="28" height="15" rx="6" fill={colors.primary}/>

        {/* ── Eyes ── */}
        <circle cx="25" cy="14" r="3.5" fill="white"/>
        <circle cx="39" cy="14" r="3.5" fill="white"/>
        <circle cx="26" cy="14" r="2"   fill="#0f172a"/>
        <circle cx="40" cy="14" r="2"   fill="#0f172a"/>
        {/* Eye shine */}
        <circle cx="27" cy="13" r="0.8" fill="white"/>
        <circle cx="41" cy="13" r="0.8" fill="white"/>

        {/* ── Body ── */}
        <rect x="16" y="20" width="32" height="22" rx="8" fill={colors.primary}/>
        {/* Body segment lines */}
        <line x1="17" y1="28" x2="47" y2="28" stroke="white" strokeWidth="1" strokeOpacity="0.2"/>
        <line x1="17" y1="34" x2="47" y2="34" stroke="white" strokeWidth="1" strokeOpacity="0.2"/>
        {/* Skill dots on body */}
        {artifact.skills.slice(0, 4).map((_, i) => (
          <circle key={i} cx={22 + i * 6} cy="31" r="1.5" fill="white" fillOpacity={0.7 - i * 0.1}/>
        ))}

        {/* ── Left arm + open pincer claw ── */}
        <path d="M16 26 Q6 22 4 30" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M4 30 Q0 25 2 20" stroke={colors.primary} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M4 30 Q1 35 4 39"  stroke={colors.primary} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <circle cx="4" cy="30" r="2.5" fill={colors.primary} fillOpacity="0.5"/>

        {/* ── Right arm + open pincer claw ── */}
        <path d="M48 26 Q58 22 60 30" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" fill="none"/>
        <path d="M60 30 Q64 25 62 20" stroke={colors.primary} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M60 30 Q63 35 60 39" stroke={colors.primary} strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <circle cx="60" cy="30" r="2.5" fill={colors.primary} fillOpacity="0.5"/>

        {/* ── Walking legs ── */}
        <line x1="20" y1="40" x2="13" y2="52" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
        <line x1="25" y1="42" x2="19" y2="55" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
        <line x1="39" y1="42" x2="45" y2="55" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>
        <line x1="44" y1="40" x2="51" y2="52" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.8"/>

        {/* ── Tail fan ── */}
        <path d="M23 42 Q18 52 14 57 Q21 54 27 50 Z" fill={colors.primary} fillOpacity="0.65"/>
        <path d="M32 43 Q32 55 32 60 Q35 55 38 50 Z" fill={colors.primary} fillOpacity="0.8"/>
        <path d="M41 42 Q46 52 50 57 Q43 54 37 50 Z" fill={colors.primary} fillOpacity="0.65"/>

        {/* ── Glow between claws (personality indicator) ── */}
        <ellipse cx="32" cy="30" rx="9" ry="4" fill={colors.primary} fillOpacity="0.08"/>
      </svg>

      {/* Tooltip on hover */}
      {hovered && (
        <div
          className="absolute bg-gray-900/95 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap pointer-events-none shadow-xl"
          style={{
            bottom: '110%',
            left: '50%',
            transform: `translateX(-50%) rotate(${-swayDeg}deg)`,
            minWidth: 140,
          }}
        >
          <div className="font-semibold text-sm mb-0.5">{artifact.name}</div>
          <div className="text-gray-400 flex gap-1.5 items-center">
            <span>{colors.emoji} {artifact.personality}</span>
            <span>·</span>
            <span className="text-green-400 font-medium">
              {artifact.price === 0 ? 'Free' : `$${(artifact.price / 100).toFixed(2)}`}
            </span>
          </div>
          {artifact.skills.length > 0 && (
            <div className="text-gray-500 mt-1">{artifact.skills.slice(0, 2).join(', ')}</div>
          )}
          <div className="text-gray-600 mt-1 text-[10px]">Click to view</div>
        </div>
      )}
    </div>
  );
}
