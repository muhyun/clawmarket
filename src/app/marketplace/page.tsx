'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Artifact, ClawPersonality } from '@/types';
import { ArtifactCard } from '@/components/ui/ArtifactCard';
import { ClawTank } from '@/components/showcase/ClawTank';

const PERSONALITIES: ClawPersonality[] = ['aggressive', 'balanced', 'defensive', 'creative', 'analytical', 'helper'];

export default function MarketplacePage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [personality, setPersonality] = useState('');
  const [sort, setSort] = useState('newest');
  const [showTank, setShowTank] = useState(true);
  const [inputVal, setInputVal] = useState('');

  const fetchArtifacts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort, limit: '40' });
    if (search) params.set('search', search);
    if (personality) params.set('personality', personality);
    fetch(`/api/artifacts?${params}`)
      .then(r => r.json())
      .then(data => setArtifacts(data.artifacts || []))
      .finally(() => setLoading(false));
  }, [search, personality, sort]);

  useEffect(() => { fetchArtifacts(); }, [fetchArtifacts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputVal);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Marketplace</h1>
        <p className="text-gray-400">Discover trained OpenClaw configurations</p>
      </div>

      {/* Tank toggle */}
      <div className="mb-6">
        <button
          onClick={() => setShowTank(v => !v)}
          className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
        >
          <span>{showTank ? '▼' : '▶'}</span>
          {showTank ? 'Hide' : 'Show'} Claw Tank
        </button>
        {showTank && (
          <div className="mt-3">
            <ClawTank artifacts={artifacts} height={260} />
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Search claws..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-medium rounded-lg text-sm transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setInputVal(''); }} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm">
              ✕
            </button>
          )}
        </form>

        <select
          value={personality}
          onChange={e => setPersonality(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="">All personalities</option>
          {PERSONALITIES.map(p => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : artifacts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg">No claws found</p>
          <p className="text-sm mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{artifacts.length} result{artifacts.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artifacts.map(a => (
              <ArtifactCard key={a.id} artifact={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
