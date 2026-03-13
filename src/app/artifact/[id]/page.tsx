'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { Artifact, Review, ClawPersonality } from '@/types';
import { ClawCreature } from '@/components/showcase/ClawCreature';

const PERSONALITY_COLORS: Record<ClawPersonality, string> = {
  aggressive: 'text-red-400 bg-red-500/20 border-red-500/30',
  balanced:   'text-blue-400 bg-blue-500/20 border-blue-500/30',
  defensive:  'text-green-400 bg-green-500/20 border-green-500/30',
  creative:   'text-purple-400 bg-purple-500/20 border-purple-500/30',
  analytical: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  helper:     'text-orange-400 bg-orange-500/20 border-orange-500/30',
};

const PERSONALITY_EMOJI: Record<ClawPersonality, string> = {
  aggressive: '⚡', balanced: '⚖️', defensive: '🛡', creative: '✨', analytical: '🔬', helper: '🤝',
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i} type="button"
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}
          className={`text-xl transition-colors ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-600'}`}
        >★</button>
      ))}
    </div>
  );
}

export default function ArtifactPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseMsg, setPurchaseMsg] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  // For mini showcase
  const [tankDims] = useState({ width: 280, height: 200 });

  const fetchArtifact = () => {
    fetch(`/api/artifacts/${id}`)
      .then(r => r.json())
      .then(data => setArtifact(data.artifact || null))
      .finally(() => setLoading(false));
  };

  const fetchReviews = () => {
    fetch(`/api/reviews?artifactId=${id}`)
      .then(r => r.json())
      .then(data => setReviews(data.reviews || []));
  };

  useEffect(() => { fetchArtifact(); fetchReviews(); }, [id]);

  const handlePurchase = async () => {
    if (!user) { router.push('/login'); return; }
    setPurchasing(true);
    setPurchaseMsg('');
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactId: id }),
      });
      const data = await res.json();
      if (!res.ok) { setPurchaseMsg(data.error || 'Purchase failed'); return; }
      setPurchaseMsg('Purchase successful! The artifact is now in your dashboard.');
      fetchArtifact();
    } finally {
      setPurchasing(false);
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewMsg('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactId: id, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewMsg(data.error || 'Failed to submit review'); return; }
      setReviewMsg('Review submitted!');
      setComment('');
      fetchReviews();
      fetchArtifact();
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-800 rounded w-full" />
        <div className="h-48 bg-gray-800 rounded" />
      </div>
    </div>
  );

  if (!artifact) return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center">
      <div className="text-4xl mb-3">❌</div>
      <p className="text-gray-400">Artifact not found</p>
      <Link href="/marketplace" className="mt-4 inline-block text-cyan-400">Back to marketplace</Link>
    </div>
  );

  const pStyle = PERSONALITY_COLORS[artifact.personality] || PERSONALITY_COLORS.balanced;
  const pEmoji = PERSONALITY_EMOJI[artifact.personality] || '🤖';
  const isSeller = user?.id === artifact.seller_id;
  const canPurchase = !artifact.is_purchased && !isSeller;
  const hasReviewed = reviews.some(r => r.reviewer_id === user?.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/marketplace" className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-6">
        ← Back to marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl border ${pStyle}`}>
                {pEmoji}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{artifact.name}</h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  by{' '}
                  <span className="text-cyan-400">@{artifact.seller_username}</span>
                  <span className="mx-2 text-gray-600">·</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${pStyle}`}>
                    {artifact.personality}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h2>
            <p className="text-gray-300 leading-relaxed">{artifact.description}</p>
          </div>

          {artifact.skills.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {artifact.skills.map(s => (
                  <span key={s} className="bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artifact.tags.map(t => (
                <span key={t} className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full">#{t}</span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 text-sm text-gray-400 border-t border-gray-800 pt-4">
            <span>{artifact.download_count} downloads</span>
            <span>{artifact.review_count ?? 0} reviews</span>
            {(artifact.review_count ?? 0) > 0 && (
              <span className="text-yellow-400">★ {Number(artifact.avg_rating).toFixed(1)}</span>
            )}
          </div>
        </div>

        {/* Right: purchase panel + mini showcase */}
        <div className="space-y-4">
          {/* Mini creature display */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-900 via-blue-950/50 to-slate-900 border border-cyan-500/20"
            style={{ height: 200 }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ClawCreature
                artifact={artifact}
                containerWidth={tankDims.width}
                containerHeight={tankDims.height}
                scale={1.3}
              />
            </div>
            <div className="absolute top-2 left-3 text-[10px] text-cyan-400/50 font-mono tracking-widest">SPECIMEN</div>
          </div>

          {/* Purchase card */}
          <div className="bg-gray-900/70 border border-gray-700 rounded-xl p-5">
            <div className="text-3xl font-bold text-white mb-1">
              {artifact.price === 0 ? (
                <span className="text-green-400">Free</span>
              ) : (
                `$${(artifact.price / 100).toFixed(2)}`
              )}
            </div>

            {artifact.is_purchased ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold rounded-lg text-center">
                  ✓ Owned
                </div>
                {artifact.file_path ? (
                  <a
                    href={`/api/artifacts/${artifact.id}/download`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg text-sm transition-colors"
                  >
                    ↓ Download .clawpkg
                  </a>
                ) : (
                  <div className="w-full py-2 text-xs text-gray-500 text-center border border-gray-700 rounded-lg">
                    Seller hasn&apos;t uploaded a package file yet
                  </div>
                )}
                <Link href="/dashboard" className="block w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg text-center transition-colors">
                  Go to Dashboard
                </Link>
              </div>
            ) : isSeller ? (
              <div className="space-y-2">
                <div className="w-full py-2.5 bg-gray-800 text-gray-400 text-sm rounded-lg text-center">
                  Your listing
                </div>
                {artifact.file_path ? (
                  <a href={`/api/artifacts/${artifact.id}/download`}
                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors">
                    ↓ Download your package
                  </a>
                ) : (
                  <Link href="/sell" className="block w-full py-2 text-center text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded-lg">
                    + Upload .clawpkg file
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handlePurchase} disabled={purchasing || !canPurchase}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-bold rounded-lg text-sm transition-colors"
                >
                  {purchasing ? 'Processing…' : artifact.price === 0 ? 'Get for Free' : 'Purchase'}
                </button>
                {!user && (
                  <p className="text-xs text-gray-500 text-center">
                    <Link href="/login" className="text-cyan-400">Sign in</Link> to purchase
                  </p>
                )}
              </div>
            )}

            {purchaseMsg && (
              <p className={`text-xs mt-2 text-center ${purchaseMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                {purchaseMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-10 border-t border-gray-800 pt-8">
        <h2 className="text-lg font-bold text-white mb-5">Reviews</h2>

        {artifact.is_purchased && !isSeller && !hasReviewed && (
          <form onSubmit={handleReview} className="bg-gray-900/60 border border-gray-700 rounded-xl p-5 mb-6 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Leave a review</h3>
            <StarPicker value={rating} onChange={setRating} />
            <textarea
              value={comment} onChange={e => setComment(e.target.value)}
              rows={3} placeholder="What do you think of this claw?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
            />
            <button type="submit" disabled={reviewSubmitting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-semibold rounded-lg text-sm">
              {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
            </button>
            {reviewMsg && <p className="text-xs text-green-400">{reviewMsg}</p>}
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">@{(r as Review & { reviewer_username: string }).reviewer_username}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={`text-sm ${i <= r.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-400">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
