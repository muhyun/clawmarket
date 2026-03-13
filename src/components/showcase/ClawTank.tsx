'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Artifact } from '@/types';
import { ClawCreature } from './ClawCreature';

interface Props {
  artifacts: Artifact[];
  height?: number;
}

export function ClawTank({ artifacts, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height });
  const router = useRouter();

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDims({ width: containerRef.current.offsetWidth, height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [height]);

  // Animated bubbles
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (i * 137 + 23) % 90 + 5,
    delay: (i * 0.7) % 4,
    size: (i % 3) + 4,
    duration: 3 + (i % 3),
  }));

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-950 via-blue-950/60 to-slate-950"
      style={{ height }}
    >
      {/* Water caustics overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(ellipse 80px 40px at 20% 30%, cyan 0%, transparent 70%),
            radial-gradient(ellipse 60px 30px at 70% 60%, #0ff 0%, transparent 70%),
            radial-gradient(ellipse 100px 50px at 50% 10%, #006 0%, transparent 80%)`,
          animation: 'caustic 8s ease-in-out infinite alternate',
        }}
      />

      {/* Tank walls shimmer */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />

      {/* Sand / floor */}
      <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-yellow-900/30 to-transparent" />

      {/* Bubbles */}
      {bubbles.map(b => (
        <div
          key={b.id}
          className="absolute rounded-full border border-cyan-300/30 bg-cyan-200/5"
          style={{
            left: `${b.x}%`,
            bottom: '-20px',
            width: b.size,
            height: b.size,
            animation: `bubble ${b.duration}s ${b.delay}s ease-in infinite`,
          }}
        />
      ))}

      {/* Label */}
      <div className="absolute top-3 left-4 text-xs text-cyan-400/60 font-mono tracking-widest uppercase select-none">
        Claw Tank — {artifacts.length} specimen{artifacts.length !== 1 ? 's' : ''}
      </div>

      {/* Creatures */}
      {dims.width > 0 && artifacts.map(artifact => (
        <ClawCreature
          key={artifact.id}
          artifact={artifact}
          containerWidth={dims.width}
          containerHeight={height - 32}
          onClick={() => router.push(`/artifact/${artifact.id}`)}
          scale={0.9}
        />
      ))}

      {artifacts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-cyan-400/40 text-sm font-mono">
          [ Tank is empty — be the first to register a claw ]
        </div>
      )}

      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-${height}px) scale(1.5); opacity: 0; }
        }
        @keyframes caustic {
          0% { transform: scale(1) translateX(0); }
          100% { transform: scale(1.1) translateX(20px); }
        }
      `}</style>
    </div>
  );
}
