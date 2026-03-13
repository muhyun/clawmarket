'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Artifact } from '@/types';
import { ClawTank } from '@/components/showcase/ClawTank';
import { ArtifactCard } from './ArtifactCard';

export function HomeFeed() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/artifacts?limit=8&sort=newest')
      .then(r => r.json())
      .then(data => setArtifacts(data.artifacts || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Showcase tank */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🌊</span> Live Claw Tank
          <span className="text-sm font-normal text-gray-500">— hover to inspect, click to view</span>
        </h2>
        <ClawTank artifacts={artifacts} height={300} />
      </div>

      {/* Recent listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Recent Listings</h2>
          <Link href="/marketplace" className="text-sm text-cyan-400 hover:text-cyan-300">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl h-52 animate-pulse" />
            ))}
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="flex justify-center mb-2 opacity-40">
              <svg width="40" height="40" viewBox="0 0 64 64" fill="none"><rect x="18" y="7" width="28" height="15" rx="6" fill="#6b7280"/><rect x="16" y="20" width="32" height="22" rx="8" fill="#6b7280"/><path d="M16 26 Q6 22 4 30" stroke="#6b7280" strokeWidth="4" strokeLinecap="round" fill="none"/><path d="M4 30 Q0 25 2 20" stroke="#6b7280" strokeWidth="3.5" strokeLinecap="round" fill="none"/><path d="M4 30 Q1 35 4 39" stroke="#6b7280" strokeWidth="3.5" strokeLinecap="round" fill="none"/><path d="M48 26 Q58 22 60 30" stroke="#6b7280" strokeWidth="4" strokeLinecap="round" fill="none"/><path d="M60 30 Q64 25 62 20" stroke="#6b7280" strokeWidth="3.5" strokeLinecap="round" fill="none"/><path d="M60 30 Q63 35 60 39" stroke="#6b7280" strokeWidth="3.5" strokeLinecap="round" fill="none"/></svg>
            </div>
            <p>No claws listed yet — be the first!</p>
            <Link href="/sell" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
              List your claw →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {artifacts.slice(0, 4).map(a => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
