import Link from 'next/link';
import { HomeFeed } from '@/components/ui/HomeFeed';
import { ClawIcon } from '@/components/icons/ClawIcon';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <ClawIcon size={80} color="#f97316" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          The OpenClaw Marketplace
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          Buy and sell trained OpenClaw configurations — package your AI skills, memory, and personality,
          then put them to work for others.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/marketplace"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-xl transition-colors"
          >
            Browse Claws
          </Link>
          <Link
            href="/sell"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            Sell Your Claw
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
        {[
          { icon: '📦', title: 'Export & Package', desc: 'Zip your OpenClaw skills, memory, and configs into a portable artifact.' },
          { icon: '🛒', title: 'List & Sell', desc: 'Set your price, describe your claw\'s powers, and publish to the market.' },
          { icon: '🚀', title: 'Import & Deploy', desc: 'Purchase any claw and drop it straight into your OpenClaw environment.' },
        ].map(f => (
          <div key={f.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Get the tools */}
      <div className="mb-14 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Get the Tools</h2>
            <p className="text-sm text-gray-500 mt-0.5">Download the CLI scripts to package and install OpenClaw configurations</p>
          </div>
          <Link href="/guide" className="text-sm text-cyan-400 hover:text-cyan-300">Full guide →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a href="/api/downloads/package-claw" download="package-claw.mjs"
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl transition-all group">
            <span className="text-xl">📤</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm group-hover:text-cyan-300 transition-colors">package-claw.mjs</div>
              <div className="text-xs text-gray-500 truncate">Export your OpenClaw → .clawpkg</div>
            </div>
            <span className="text-gray-500 group-hover:text-cyan-400 text-xs font-mono">↓</span>
          </a>
          <a href="/api/downloads/import-claw" download="import-claw.mjs"
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-purple-500/20 hover:border-purple-500/50 rounded-xl transition-all group">
            <span className="text-xl">📥</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm group-hover:text-purple-300 transition-colors">import-claw.mjs</div>
              <div className="text-xs text-gray-500 truncate">Install a purchased .clawpkg</div>
            </div>
            <span className="text-gray-500 group-hover:text-purple-400 text-xs font-mono">↓</span>
          </a>
        </div>
      </div>

      {/* Live feed with tank */}
      <HomeFeed />
    </div>
  );
}
