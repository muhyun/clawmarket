'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import type { ClawPersonality } from '@/types';

const PERSONALITIES: { value: ClawPersonality; label: string; emoji: string; desc: string }[] = [
  { value: 'aggressive', label: 'Aggressive', emoji: '⚡', desc: 'Fast, bold, takes initiative' },
  { value: 'balanced',   label: 'Balanced',   emoji: '⚖️', desc: 'Versatile and well-rounded' },
  { value: 'defensive',  label: 'Defensive',  emoji: '🛡',  desc: 'Careful, thorough, safe' },
  { value: 'creative',   label: 'Creative',   emoji: '✨', desc: 'Imaginative and experimental' },
  { value: 'analytical', label: 'Analytical', emoji: '🔬', desc: 'Data-driven and precise' },
  { value: 'helper',     label: 'Helper',     emoji: '🤝', desc: 'Supportive and user-focused' },
];

export default function SellPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [personality, setPersonality] = useState<ClawPersonality>('balanced');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [pkgFile, setPkgFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return <div className="max-w-2xl mx-auto px-4 py-12 text-gray-400">Loading…</div>;
  if (!user) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <p className="text-gray-300 mb-4">Sign in to list your OpenClaw</p>
      <Link href="/login" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg">
        Sign in
      </Link>
    </div>
  );

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) { setError('Name and description are required'); return; }
    setError('');
    setSubmitting(true);
    try {
      const priceInCents = Math.round(parseFloat(price || '0') * 100);
      const res = await fetch('/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), price: priceInCents, personality, skills, tags }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to list artifact'); return; }

      // Upload .clawpkg file if provided
      if (pkgFile) {
        setUploadProgress('Uploading package file…');
        const fd = new FormData();
        fd.append('file', pkgFile);
        const upRes = await fetch(`/api/artifacts/${data.id}/upload`, { method: 'POST', body: fd });
        if (!upRes.ok) {
          const upData = await upRes.json();
          setError(`Listed but upload failed: ${upData.error}`);
          return;
        }
        setUploadProgress('');
      }

      router.push(`/artifact/${data.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">List your OpenClaw</h1>
        <p className="text-gray-400 mt-1">Package your trained configuration and sell it to the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Claw Name *</label>
          <input
            value={name} onChange={e => setName(e.target.value)} required maxLength={80}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            placeholder="e.g. TradeBot Pro, CodeReview Master, TaskPilot..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)} required rows={4}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Describe what your claw can do, what skills it has, what problems it solves..."
          />
        </div>

        {/* Personality */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Personality</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PERSONALITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPersonality(p.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                  personality === p.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-white'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
                }`}
              >
                <span className="text-base">{p.emoji}</span>
                <div>
                  <div className="font-medium text-xs">{p.label}</div>
                  <div className="text-[10px] text-gray-500 leading-tight">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Skills / Capabilities</label>
          <div className="flex gap-2">
            <input
              value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              placeholder="e.g. web search, code generation..."
            />
            <button type="button" onClick={addSkill} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full">
                  {s}
                  <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))} className="hover:text-white ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
          <div className="flex gap-2">
            <input
              value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
              placeholder="e.g. automation, finance, devtools..."
            />
            <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                  #{t}
                  <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-white ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              placeholder="0.00"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Set to $0 to make it free</p>
        </div>

        {/* Package file */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Package File <span className="text-gray-500 font-normal">(.clawpkg or .zip)</span>
          </label>
          <div className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors ${
            pkgFile ? 'border-cyan-500/60 bg-cyan-500/5' : 'border-gray-700 hover:border-gray-500'
          }`}>
            <input
              type="file"
              accept=".clawpkg,.zip"
              onChange={e => setPkgFile(e.target.files?.[0] ?? null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {pkgFile ? (
              <div className="text-sm text-cyan-400">
                <div className="font-medium">{pkgFile.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{(pkgFile.size / 1024).toFixed(1)} KB</div>
                <button type="button" onClick={() => setPkgFile(null)} className="text-xs text-gray-500 hover:text-red-400 mt-1">remove</button>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                <div className="text-2xl mb-1">📦</div>
                <div>Drop your <code className="text-gray-400">.clawpkg</code> file here, or click to browse</div>
                <div className="text-xs mt-1">
                  Generate it with: <code className="text-cyan-500">node scripts/package-claw.mjs</code>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">Optional — you can upload after listing. Max 50 MB.</p>
        </div>

        {uploadProgress && <p className="text-sm text-cyan-400">{uploadProgress}</p>}

        <button
          type="submit" disabled={submitting}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-gray-950 font-bold rounded-xl transition-colors text-sm"
        >
          {submitting ? 'Publishing…' : 'Publish Claw to Market'}
        </button>
      </form>
    </div>
  );
}
