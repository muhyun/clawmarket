'use client';
import Link from 'next/link';

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 text-gray-950 font-bold text-sm flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 pb-8">
        <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
        <div className="text-gray-400 text-sm space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre my-2">
      {children}
    </pre>
  );
}

function FileTree({ items }: { items: { name: string; desc: string; indent?: boolean }[] }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-xs my-3 space-y-1">
      {items.map((item, i) => (
        <div key={i} className={`flex gap-3 ${item.indent ? 'pl-5' : ''}`}>
          <span className="text-cyan-400 min-w-[180px]">{item.name}</span>
          <span className="text-gray-500">{item.desc}</span>
        </div>
      ))}
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="text-4xl mb-3">📦</div>
        <h1 className="text-3xl font-bold text-white mb-2">How to Package & Sell Your OpenClaw</h1>
        <p className="text-gray-400 mb-6">
          A complete guide to exporting your trained OpenClaw configuration and listing it on ClawMarket.
        </p>

        {/* Download cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xl">📤</div>
              <div>
                <div className="font-semibold text-white text-sm">package-claw.mjs</div>
                <div className="text-xs text-gray-500">For sellers — export your claw</div>
              </div>
            </div>
            <Code>{`# Download, then run:
node package-claw.mjs`}</Code>
            <a
              href="/api/downloads/package-claw"
              download="package-claw.mjs"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg text-sm transition-colors"
            >
              ↓ Download package-claw.mjs
            </a>
          </div>

          <div className="bg-gray-900/80 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-xl">📥</div>
              <div>
                <div className="font-semibold text-white text-sm">import-claw.mjs</div>
                <div className="text-xs text-gray-500">For buyers — install a purchased claw</div>
              </div>
            </div>
            <Code>{`# Download, then run:
node import-claw.mjs my.clawpkg`}</Code>
            <a
              href="/api/downloads/import-claw"
              download="import-claw.mjs"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg text-sm transition-colors"
            >
              ↓ Download import-claw.mjs
            </a>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Requires Node.js 18+ and <code className="text-gray-500">adm-zip</code> ({' '}
          <code className="text-gray-500">npm install adm-zip</code> in the same directory).
        </p>
      </div>

      {/* What is a claw package */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-800">What goes into a .clawpkg</h2>
        <p className="text-gray-400 text-sm mb-4">
          A <code className="text-cyan-400 bg-gray-800 px-1 rounded">.clawpkg</code> is a zip archive containing
          everything needed to reproduce your trained OpenClaw in someone else&apos;s environment.
          It can include any combination of:
        </p>
        <FileTree items={[
          { name: 'manifest.json',      desc: 'Name, skills, personality, metadata' },
          { name: 'CLAUDE.md',          desc: 'Project-level instructions for Claude Code' },
          { name: 'workspace/',         desc: 'OpenClaw identity + personality files' },
          { name: '  IDENTITY.md',      desc: 'Name, creature, vibe, avatar', indent: true },
          { name: '  SOUL.md',          desc: 'Core behaviors and principles', indent: true },
          { name: '  USER.md',          desc: 'User preferences & working style', indent: true },
          { name: '  TOOLS.md',         desc: 'Preferred tools and workflows', indent: true },
          { name: '  HEARTBEAT.md',     desc: 'Recurring habits and routines', indent: true },
          { name: '  BOOTSTRAP.md',     desc: 'Startup behavior', indent: true },
          { name: 'skills/',            desc: 'OpenClaw skill directories' },
          { name: '  coding-agent/',    desc: 'Each skill has a SKILL.md', indent: true },
          { name: 'memory/',            desc: 'Claude Code project memory files' },
          { name: 'settings.json',      desc: 'Hooks & permissions (optional, sanitized)' },
        ]} />
        <p className="text-gray-500 text-xs mt-2">
          Sensitive values (API keys, tokens) are automatically stripped from settings.json during packaging.
        </p>
      </section>

      {/* Seller flow */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-800">Selling your claw</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
          <Step n={1} title="Download and set up the script">
            <p>
              Download <strong>package-claw.mjs</strong> using the button above and place it in a working directory.
              Then install its one dependency:
            </p>
            <Code>{`npm install adm-zip`}</Code>
            <p>That&apos;s it — no other setup needed.</p>
          </Step>
          <Step n={2} title="Run the packaging script">
            <p>From the ClawMarket directory, run:</p>
            <Code>{`node scripts/package-claw.mjs`}</Code>
            <p>The script will ask you interactively:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Your OpenClaw root directory (e.g. <code className="text-cyan-400">~/labs/openclaw</code>)</li>
              <li>Claw name, description, personality</li>
              <li>Which skills to include (shows a numbered list)</li>
              <li>Which Claude Code project memories to bundle</li>
              <li>Whether to include workspace files (SOUL.md, IDENTITY.md, etc.)</li>
              <li>A password to protect the zip</li>
            </ul>
            <p>Or use flags to skip prompts:</p>
            <Code>{`node scripts/package-claw.mjs \\
  --name "TradeBot Pro" \\
  --openclaw ~/labs/openclaw \\
  --out ./exports`}</Code>
            <p>The output is saved to <code className="text-cyan-400">exports/your_claw_name.clawpkg</code></p>
          </Step>
          <Step n={3} title="List it on ClawMarket">
            <p>
              Go to{' '}
              <Link href="/sell" className="text-cyan-400 hover:text-cyan-300">/sell</Link>
              , fill in the details, and upload your <code className="text-cyan-400">.clawpkg</code> file.
              Set a price (or make it free).
            </p>
            <p>
              After purchase, buyers get a <strong>Download .clawpkg</strong> button.
              Share the zip password with them separately (e.g. via a message after purchase).
            </p>
          </Step>
        </div>
      </section>

      {/* Buyer flow */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-800">Installing a purchased claw</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />
          <Step n={1} title="Get the importer script and purchase a claw">
            <p>
              Download <strong>import-claw.mjs</strong> using the button at the top of this page.
              Then buy a claw on{' '}
              <Link href="/marketplace" className="text-cyan-400 hover:text-cyan-300">the marketplace</Link>{' '}
              and click <strong>↓ Download .clawpkg</strong> on the artifact page.
            </p>
            <Code>{`npm install adm-zip   # one-time setup`}</Code>
          </Step>
          <Step n={2} title="Run the import script">
            <Code>{`node import-claw.mjs ~/Downloads/tradebot_pro.clawpkg`}</Code>
            <p>With password:</p>
            <Code>{`node import-claw.mjs tradebot_pro.clawpkg \\
  --password yourpassword \\
  --openclaw ~/labs/openclaw`}</Code>
            <p>Preview what will be installed without writing anything:</p>
            <Code>{`node import-claw.mjs tradebot_pro.clawpkg --dry-run`}</Code>
            <p>The importer will show you exactly what files will be installed and ask before overwriting anything.</p>
          </Step>
          <Step n={3} title="Restart OpenClaw">
            <p>
              Restart your OpenClaw instance. New skills will appear automatically.
              Workspace changes (SOUL.md, IDENTITY.md) take effect on the next conversation.
            </p>
          </Step>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 pb-2 border-b border-gray-800">Tips for good listings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Be specific', desc: 'Describe exactly what your claw was trained to do and what problems it solves.' },
            { icon: '🧩', title: 'List all skills', desc: 'Add every skill you include — buyers search by skill keywords.' },
            { icon: '🔒', title: 'Use a password', desc: 'Protect your work — share the password only after confirmed purchase.' },
            { icon: '🚫', title: "Don't include secrets", desc: 'The packager strips env vars, but double-check SOUL.md and USER.md for private info.' },
            { icon: '🏷', title: 'Set the right personality', desc: 'Personality affects how your claw appears in the tank and how buyers filter.' },
            { icon: '📝', title: 'Keep workspace lean', desc: 'Only include workspace files that are specific to your claw, not personal notes.' },
          ].map(t => (
            <div key={t.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="text-xl mb-1">{t.icon}</div>
              <div className="font-medium text-white text-sm">{t.title}</div>
              <div className="text-gray-500 text-xs mt-0.5">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3">
        <Link href="/sell" className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-xl text-sm transition-colors">
          List your claw →
        </Link>
        <Link href="/marketplace" className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 text-sm transition-colors">
          Browse marketplace
        </Link>
      </div>
    </div>
  );
}
