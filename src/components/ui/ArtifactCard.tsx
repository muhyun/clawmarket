'use client';

import Link from 'next/link';
import type { Artifact, ClawPersonality } from '@/types';

const PERSONALITY_STYLES: Record<ClawPersonality, { badge: string; dot: string }> = {
  aggressive: { badge: 'bg-red-500/20 text-red-300 border-red-500/30',   dot: 'bg-red-400' },
  balanced:   { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',  dot: 'bg-blue-400' },
  defensive:  { badge: 'bg-green-500/20 text-green-300 border-green-500/30', dot: 'bg-green-400' },
  creative:   { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  analytical: { badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', dot: 'bg-yellow-400' },
  helper:     { badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
};

const PERSONALITY_EMOJI: Record<ClawPersonality, string> = {
  aggressive: '⚡', balanced: '⚖️', defensive: '🛡', creative: '✨', analytical: '🔬', helper: '🤝',
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-0.5">({count})</span>
    </div>
  );
}

export function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const ps = PERSONALITY_STYLES[artifact.personality] || PERSONALITY_STYLES.balanced;
  const emoji = PERSONALITY_EMOJI[artifact.personality] || '🤖';

  return (
    <Link href={`/artifact/${artifact.id}`} className="group block">
      <div className="relative bg-gray-900/60 border border-gray-700/50 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-gray-900/80 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10 h-full flex flex-col">
        {artifact.is_purchased && (
          <div className="absolute top-3 right-3 bg-green-500/20 border border-green-500/40 text-green-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            OWNED
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${ps.badge}` }}>
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight truncate group-hover:text-cyan-300 transition-colors">
              {artifact.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">by @{artifact.seller_username}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 flex-1 mb-3">
          {artifact.description}
        </p>

        {/* Skills */}
        {artifact.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artifact.skills.slice(0, 3).map(skill => (
              <span key={skill} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">
                {skill}
              </span>
            ))}
            {artifact.skills.length > 3 && (
              <span className="text-[10px] text-gray-600">+{artifact.skills.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${ps.badge}`}>
              {artifact.personality}
            </span>
          </div>
          <div className="text-right">
            <div className="font-bold text-sm text-white">
              {artifact.price === 0 ? (
                <span className="text-green-400">Free</span>
              ) : (
                <span>${(artifact.price / 100).toFixed(2)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Rating + downloads */}
        <div className="flex items-center justify-between mt-2">
          {(artifact.review_count ?? 0) > 0 ? (
            <StarRating rating={artifact.avg_rating ?? 0} count={artifact.review_count ?? 0} />
          ) : (
            <span className="text-xs text-gray-600">No reviews yet</span>
          )}
          <span className="text-[10px] text-gray-600">{artifact.download_count} downloads</span>
        </div>
      </div>
    </Link>
  );
}
