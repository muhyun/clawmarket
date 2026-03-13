'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { Artifact } from '@/types';
import { ArtifactCard } from '@/components/ui/ArtifactCard';
import { ClawTank } from '@/components/showcase/ClawTank';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [myListings, setMyListings] = useState<Artifact[]>([]);
  const [purchased, setPurchased] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'purchased' | 'listings'>('purchased');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/artifacts?sort=newest&limit=40').then(r => r.json()),
      fetch('/api/purchases').then(r => r.json()),
    ]).then(([allData, purchasedData]) => {
      const all: Artifact[] = allData.artifacts || [];
      setMyListings(all.filter(a => a.seller_id === user.id));
      setPurchased(purchasedData.artifacts || []);
    }).finally(() => setLoading(false));
  }, [user]);

  if (authLoading) return <div className="max-w-7xl mx-auto px-4 py-12 text-gray-400">Loading…</div>;
  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <p className="text-gray-300 mb-4">Sign in to view your dashboard</p>
      <Link href="/login" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg">
        Sign in
      </Link>
    </div>
  );

  const tankArtifacts = tab === 'purchased' ? purchased : myListings;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-0.5">@{user.username}</p>
        </div>
        <Link href="/sell" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg text-sm transition-colors">
          + List New Claw
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Purchased', value: purchased.length },
          { label: 'My Listings', value: myListings.length },
          { label: 'Total Sales', value: myListings.reduce((a, c) => a + c.download_count, 0) },
        ].map(s => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-800">
        {(['purchased', 'listings'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'purchased' ? `Purchased (${purchased.length})` : `My Listings (${myListings.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {tankArtifacts.length > 0 && (
            <div className="mb-6">
              <ClawTank artifacts={tankArtifacts} height={200} />
            </div>
          )}

          {tab === 'purchased' && (
            purchased.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-2">🛒</div>
                <p>No purchased claws yet</p>
                <Link href="/marketplace" className="mt-3 inline-block text-cyan-400 hover:text-cyan-300">
                  Browse marketplace →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {purchased.map(a => <ArtifactCard key={a.id} artifact={a} />)}
              </div>
            )
          )}

          {tab === 'listings' && (
            myListings.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>No listings yet</p>
                <Link href="/sell" className="mt-3 inline-block text-cyan-400 hover:text-cyan-300">
                  List your first claw →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {myListings.map(a => (
                  <div key={a.id} className="relative">
                    <ArtifactCard artifact={a} />
                    <div className="mt-2 flex gap-2">
                      <Link
                        href={`/artifact/${a.id}`}
                        className="flex-1 py-1.5 text-center text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
