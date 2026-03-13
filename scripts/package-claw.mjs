#!/usr/bin/env node
/**
 * package-claw.mjs — Export your OpenClaw configuration as a ClawMarket artifact
 *
 * Usage:
 *   node scripts/package-claw.mjs --name "My Claw" --openclaw /path/to/openclaw
 *
 * What it packages:
 *   workspace/   IDENTITY.md, SOUL.md, USER.md, TOOLS.md, HEARTBEAT.md, BOOTSTRAP.md
 *   skills/      selected skill directories (each has SKILL.md)
 *   memory/      Claude Code project memory files
 *   CLAUDE.md    project-level instructions
 *   manifest.json
 */

import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, basename, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function getArg(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}
function hasFlag(flag) { return args.includes(flag); }

// ── Readline helper ───────────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout });
function ask(question, defaultVal = '') {
  return new Promise(resolve => {
    const hint = defaultVal ? ` [${defaultVal}]` : '';
    rl.question(`${question}${hint}: `, ans => resolve(ans.trim() || defaultVal));
  });
}
function askMulti(question) {
  return new Promise(resolve => {
    rl.question(`${question} (comma-separated): `, ans => {
      resolve(ans.split(',').map(s => s.trim()).filter(Boolean));
    });
  });
}

// ── File helpers ──────────────────────────────────────────────────────────────
function safeRead(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function addDirToZip(zip, dirPath, zipPrefix) {
  if (!existsSync(dirPath)) return 0;
  let count = 0;
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const full = join(dirPath, entry.name);
    const zipPath = zipPrefix ? `${zipPrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      count += addDirToZip(zip, full, zipPath);
    } else {
      zip.addFile(zipPath, readFileSync(full));
      count++;
    }
  }
  return count;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🦀 ClawMarket — OpenClaw Packager\n');

  // Locate openclaw root
  const defaultClawRoot = getArg('--openclaw') ||
    (existsSync(join(homedir(), 'labs/openclaw')) ? join(homedir(), 'labs/openclaw') : '');
  const clawRoot = await ask('OpenClaw root directory', defaultClawRoot);
  if (!existsSync(clawRoot)) {
    console.error(`❌ Directory not found: ${clawRoot}`);
    process.exit(1);
  }

  // Basic metadata
  const name        = await ask('Claw name', getArg('--name') || '');
  const description = await ask('Description (what does it do?)');
  const personality = await ask('Personality (aggressive/balanced/defensive/creative/analytical/helper)', 'balanced');
  const skills_list = await askMulti('Skill tags (e.g. web search, code gen, trading)');
  const tags        = await askMulti('Category tags (e.g. finance, devtools, productivity)');
  const priceStr    = await ask('Price in USD (0 for free)', '0');
  const price       = Math.round(parseFloat(priceStr || '0') * 100);

  // Password for the zip
  const usePassword = await ask('Password-protect zip? (y/n)', 'y');
  let password = '';
  if (usePassword.toLowerCase() === 'y') {
    password = await ask('Set zip password (buyer will receive this after purchase)');
    if (!password) {
      console.log('⚠  No password set — zip will be unprotected.');
    }
  }

  // Output path
  const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  const outDir = getArg('--out') || join(process.cwd(), 'exports');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${safeName}.clawpkg`);

  console.log('\n📦 Scanning OpenClaw directory…\n');

  const zip = new AdmZip();
  const manifest = {
    version: '1.0',
    name,
    description,
    personality,
    skills: skills_list,
    tags,
    price,
    author: process.env.USER || 'unknown',
    created_at: new Date().toISOString(),
    contents: {},
  };

  // ── 1. workspace/ files ────────────────────────────────────────────────────
  const workspaceDir = join(clawRoot, 'workspace');
  const workspaceFiles = ['IDENTITY.md', 'SOUL.md', 'USER.md', 'TOOLS.md', 'HEARTBEAT.md', 'BOOTSTRAP.md', 'AGENTS.md'];
  const includedWorkspace = [];
  for (const f of workspaceFiles) {
    const p = join(workspaceDir, f);
    const content = safeRead(p);
    if (content) {
      zip.addFile(`workspace/${f}`, Buffer.from(content));
      includedWorkspace.push(f);
    }
  }
  manifest.contents.workspace = includedWorkspace;
  if (includedWorkspace.length) console.log(`  ✓ workspace/  (${includedWorkspace.join(', ')})`);

  // ── 2. Skills ──────────────────────────────────────────────────────────────
  const skillsDir = join(clawRoot, 'skills');
  const availableSkills = existsSync(skillsDir)
    ? readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
    : [];

  let selectedSkills = [];
  if (availableSkills.length > 0) {
    console.log(`\n  Available skills (${availableSkills.length}):`);
    availableSkills.forEach((s, i) => console.log(`    ${i + 1}. ${s}`));
    const sel = await ask('\n  Include skills? (numbers comma-separated, "all", or leave empty to skip)', '');
    if (sel.toLowerCase() === 'all') {
      selectedSkills = availableSkills;
    } else if (sel) {
      selectedSkills = sel.split(',').map(s => {
        const n = parseInt(s.trim()) - 1;
        return availableSkills[n];
      }).filter(Boolean);
    }

    for (const skill of selectedSkills) {
      const skillPath = join(skillsDir, skill);
      const n = addDirToZip(zip, skillPath, `skills/${skill}`);
      console.log(`  ✓ skills/${skill}  (${n} file${n !== 1 ? 's' : ''})`);
    }
    manifest.contents.skills = selectedSkills;
  }

  // ── 3. Claude Code project memory ─────────────────────────────────────────
  const claudeProjectsDir = join(homedir(), '.claude', 'projects');
  const allMemoryProjects = [];
  if (existsSync(claudeProjectsDir)) {
    for (const proj of readdirSync(claudeProjectsDir, { withFileTypes: true })) {
      if (!proj.isDirectory()) continue;
      const memDir = join(claudeProjectsDir, proj.name, 'memory');
      if (existsSync(memDir)) allMemoryProjects.push({ name: proj.name, path: memDir });
    }
  }
  if (allMemoryProjects.length > 0) {
    console.log(`\n  Claude Code project memories (${allMemoryProjects.length}):`);
    allMemoryProjects.forEach((p, i) => console.log(`    ${i + 1}. ${p.name}`));
    const sel = await ask('\n  Include memories? (numbers, "all", or empty to skip)', '');
    let selectedMems = [];
    if (sel.toLowerCase() === 'all') selectedMems = allMemoryProjects;
    else if (sel) {
      selectedMems = sel.split(',').map(s => allMemoryProjects[parseInt(s.trim()) - 1]).filter(Boolean);
    }
    for (const m of selectedMems) {
      const n = addDirToZip(zip, m.path, `memory/${m.name}`);
      console.log(`  ✓ memory/${m.name}  (${n} file${n !== 1 ? 's' : ''})`);
    }
    manifest.contents.memory = selectedMems.map(m => m.name);
  }

  // ── 4. Project CLAUDE.md files ────────────────────────────────────────────
  const claudeMdPaths = [];
  // openclaw root CLAUDE.md
  const rootClaudeMd = join(clawRoot, 'CLAUDE.md');
  if (existsSync(rootClaudeMd)) {
    zip.addFile('CLAUDE.md', readFileSync(rootClaudeMd));
    claudeMdPaths.push('CLAUDE.md');
    console.log('  ✓ CLAUDE.md (openclaw root)');
  }
  manifest.contents.claude_md = claudeMdPaths;

  // ── 5. Global ~/.claude/settings.json (sanitized) ─────────────────────────
  const settingsPath = join(homedir(), '.claude', 'settings.json');
  if (existsSync(settingsPath)) {
    const includeSettings = await ask('\n  Include global settings.json (hooks/permissions)? (y/n)', 'n');
    if (includeSettings.toLowerCase() === 'y') {
      try {
        const raw = JSON.parse(readFileSync(settingsPath, 'utf8'));
        // Strip sensitive env vars (API keys, tokens)
        const SENSITIVE = /key|token|secret|password|credential|auth/i;
        const sanitized = { ...raw };
        if (sanitized.env) {
          sanitized.env = Object.fromEntries(
            Object.entries(sanitized.env).filter(([k]) => !SENSITIVE.test(k))
          );
        }
        zip.addFile('settings.json', Buffer.from(JSON.stringify(sanitized, null, 2)));
        manifest.contents.settings = true;
        console.log('  ✓ settings.json (sanitized — API keys stripped)');
      } catch (e) {
        console.log('  ⚠  Could not read settings.json:', e.message);
      }
    }
  }

  // ── 6. Write manifest ──────────────────────────────────────────────────────
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2)));

  // ── 7. Write zip ──────────────────────────────────────────────────────────
  if (password) {
    zip.writeZip(outPath, password);
  } else {
    zip.writeZip(outPath);
  }

  const size = statSync(outPath).size;
  const hash = createHash('sha256').update(readFileSync(outPath)).digest('hex').slice(0, 16);

  console.log(`
✅ Package created!

   File:     ${outPath}
   Size:     ${(size / 1024).toFixed(1)} KB
   Hash:     ${hash}
   Password: ${password ? '(set — share with buyer after purchase)' : 'none'}

📤 Next: upload this .clawpkg file when listing on ClawMarket
   → http://localhost:3000/sell
`);

  rl.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
