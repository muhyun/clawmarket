#!/usr/bin/env node
/**
 * import-claw.mjs — Install a purchased OpenClaw artifact
 *
 * Usage:
 *   node scripts/import-claw.mjs myskill.clawpkg
 *   node scripts/import-claw.mjs myskill.clawpkg --password secret123
 *   node scripts/import-claw.mjs myskill.clawpkg --openclaw /path/to/openclaw --dry-run
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync, cpSync } from 'fs';
import { join, extname } from 'path';
import { homedir } from 'os';
import { createInterface } from 'readline';
import AdmZip from 'adm-zip';

const args = process.argv.slice(2);
function getArg(flag) { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; }
function hasFlag(flag) { return args.includes(flag); }

const rl = createInterface({ input: process.stdin, output: process.stdout });
function ask(q, def = '') {
  return new Promise(r => rl.question(`${q}${def ? ` [${def}]` : ''}: `, a => r(a.trim() || def)));
}

const pkgPath   = args.find(a => !a.startsWith('-'));
const dryRun    = hasFlag('--dry-run');
const skipPrompt = hasFlag('--yes');

async function main() {
  console.log('\n🦀 ClawMarket — OpenClaw Importer\n');

  if (!pkgPath || !existsSync(pkgPath)) {
    console.error('Usage: node scripts/import-claw.mjs <file.clawpkg> [--password pw] [--openclaw /path] [--dry-run]');
    process.exit(1);
  }

  // Locate openclaw root
  const defaultClawRoot = getArg('--openclaw') ||
    (existsSync(join(homedir(), 'labs/openclaw')) ? join(homedir(), 'labs/openclaw') : '');
  const clawRoot = skipPrompt ? defaultClawRoot : await ask('OpenClaw root directory', defaultClawRoot);
  if (!existsSync(clawRoot)) {
    console.error(`❌ Directory not found: ${clawRoot}`);
    process.exit(1);
  }

  // Open zip
  let zip;
  try {
    zip = new AdmZip(pkgPath);
  } catch {
    console.error('❌ Could not open package file.');
    process.exit(1);
  }

  // Try reading manifest (may need password)
  let manifest;
  let password = getArg('--password') || '';

  const tryReadManifest = () => {
    try {
      const entry = zip.getEntry('manifest.json');
      if (!entry) return null;
      const data = password ? zip.readFile(entry, password) : zip.readFile(entry);
      return data ? JSON.parse(data.toString('utf8')) : null;
    } catch { return null; }
  };

  manifest = tryReadManifest();
  if (!manifest && !password) {
    password = await ask('Package is password-protected. Enter password');
    manifest = tryReadManifest();
  }
  if (!manifest) {
    console.error('❌ Could not read manifest — wrong password or corrupt file.');
    process.exit(1);
  }

  // Show what will be installed
  console.log(`\n📦 Package: ${manifest.name}`);
  console.log(`   ${manifest.description}`);
  console.log(`   Personality: ${manifest.personality}`);
  if (manifest.skills?.length) console.log(`   Skills:      ${manifest.skills.join(', ')}`);
  console.log('\n   Contents:');

  const { contents } = manifest;
  if (contents.workspace?.length) console.log(`     workspace/  ${contents.workspace.join(', ')}`);
  if (contents.skills?.length)    console.log(`     skills/     ${contents.skills.join(', ')}`);
  if (contents.memory?.length)    console.log(`     memory/     ${contents.memory.join(', ')}`);
  if (contents.claude_md?.length) console.log(`     ${contents.claude_md.join(', ')}`);
  if (contents.settings)          console.log(`     settings.json`);

  if (dryRun) {
    console.log('\n[dry-run] Nothing written.\n');
    rl.close();
    return;
  }

  if (!skipPrompt) {
    const confirm = await ask('\nInstall? (y/n)', 'y');
    if (confirm.toLowerCase() !== 'y') { console.log('Aborted.'); rl.close(); return; }
  }

  // ── Install each component ─────────────────────────────────────────────────
  const extractEntry = (zipPath) => {
    const entry = zip.getEntry(zipPath);
    if (!entry) return null;
    return password ? zip.readFile(entry, password) : zip.readFile(entry);
  };

  const extractAll = (prefix, destDir) => {
    mkdirSync(destDir, { recursive: true });
    let count = 0;
    for (const entry of zip.getEntries()) {
      if (!entry.entryName.startsWith(prefix + '/') || entry.isDirectory) continue;
      const rel = entry.entryName.slice(prefix.length + 1);
      const dest = join(destDir, rel);
      mkdirSync(join(destDir, rel.includes('/') ? rel.split('/').slice(0,-1).join('/') : ''), { recursive: true });
      const data = password ? zip.readFile(entry, password) : zip.readFile(entry);
      if (data) { writeFileSync(dest, data); count++; }
    }
    return count;
  };

  // workspace files
  if (contents.workspace?.length) {
    const destDir = join(clawRoot, 'workspace');
    mkdirSync(destDir, { recursive: true });
    for (const f of contents.workspace) {
      const data = extractEntry(`workspace/${f}`);
      if (data) {
        // Don't overwrite existing IDENTITY/USER with empty templates
        const dest = join(destDir, f);
        const existingContent = existsSync(dest) ? readFileSync(dest, 'utf8') : '';
        if (!skipPrompt && existsSync(dest) && existingContent.trim()) {
          const ow = await ask(`  Overwrite existing workspace/${f}? (y/n)`, 'n');
          if (ow.toLowerCase() !== 'y') { console.log(`  ↷  Skipped workspace/${f}`); continue; }
        }
        writeFileSync(dest, data);
        console.log(`  ✓ workspace/${f}`);
      }
    }
  }

  // skills
  if (contents.skills?.length) {
    const destSkillsDir = join(clawRoot, 'skills');
    for (const skill of contents.skills) {
      const dest = join(destSkillsDir, skill);
      if (existsSync(dest) && !skipPrompt) {
        const ow = await ask(`  skills/${skill} already exists. Overwrite? (y/n)`, 'n');
        if (ow.toLowerCase() !== 'y') { console.log(`  ↷  Skipped skills/${skill}`); continue; }
      }
      const n = extractAll(`skills/${skill}`, dest);
      console.log(`  ✓ skills/${skill}  (${n} files)`);
    }
  }

  // memory files
  if (contents.memory?.length) {
    const claudeProjects = join(homedir(), '.claude', 'projects');
    for (const proj of contents.memory) {
      const dest = join(claudeProjects, proj, 'memory');
      mkdirSync(dest, { recursive: true });
      const n = extractAll(`memory/${proj}`, dest);
      console.log(`  ✓ ~/.claude/projects/${proj}/memory  (${n} files)`);
    }
  }

  // CLAUDE.md
  if (contents.claude_md?.includes('CLAUDE.md')) {
    const data = extractEntry('CLAUDE.md');
    if (data) {
      const dest = join(clawRoot, 'CLAUDE.md');
      if (existsSync(dest) && !skipPrompt) {
        const ow = await ask('  CLAUDE.md exists. Append instead of overwrite? (a=append/o=overwrite/s=skip)', 'a');
        if (ow === 'a') {
          const existing = readFileSync(dest, 'utf8');
          writeFileSync(dest, existing + '\n\n---\n\n' + data.toString('utf8'));
          console.log('  ✓ CLAUDE.md (appended)');
        } else if (ow === 'o') {
          writeFileSync(dest, data);
          console.log('  ✓ CLAUDE.md (overwritten)');
        } else {
          console.log('  ↷  Skipped CLAUDE.md');
        }
      } else {
        writeFileSync(dest, data);
        console.log('  ✓ CLAUDE.md');
      }
    }
  }

  // settings.json
  if (contents.settings) {
    const data = extractEntry('settings.json');
    if (data) {
      const dest = join(homedir(), '.claude', 'settings.imported.json');
      writeFileSync(dest, data);
      console.log(`  ✓ settings saved to ~/.claude/settings.imported.json`);
      console.log(`     (review and merge manually into ~/.claude/settings.json)`);
    }
  }

  console.log(`
✅ ${manifest.name} installed into ${clawRoot}

   Restart OpenClaw to apply the new configuration.
`);
  rl.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  rl.close();
  process.exit(1);
});
