import Database from 'better-sqlite3';
import { createHash } from 'crypto';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'data');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'clawmarket.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_seed TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS artifacts (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    tags TEXT NOT NULL DEFAULT '[]',
    skills TEXT NOT NULL DEFAULT '[]',
    personality TEXT NOT NULL DEFAULT 'balanced',
    file_path TEXT,
    preview_config TEXT NOT NULL DEFAULT '{}',
    download_count INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL REFERENCES users(id),
    artifact_id TEXT NOT NULL REFERENCES artifacts(id),
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(buyer_id, artifact_id)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    reviewer_id TEXT NOT NULL REFERENCES users(id),
    artifact_id TEXT NOT NULL REFERENCES artifacts(id),
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(reviewer_id, artifact_id)
  );
`);

function uuid() {
  return crypto.randomUUID();
}

// Hash a password deterministically for demo (NOT for prod)
function demoHash(pw) {
  return '$2a$10$demo' + createHash('sha256').update(pw).digest('hex').slice(0, 50);
}

const USERS = [
  { id: uuid(), email: 'alice@demo.com', username: 'alice_coder', password_hash: demoHash('demo'), avatar_seed: 'ax7b', bio: 'AI automation specialist' },
  { id: uuid(), email: 'bob@demo.com',   username: 'bob_trader',  password_hash: demoHash('demo'), avatar_seed: 'bz3k', bio: 'Finance & trading bots' },
  { id: uuid(), email: 'cara@demo.com',  username: 'cara_dev',    password_hash: demoHash('demo'), avatar_seed: 'cp9r', bio: 'DevTools enthusiast' },
];

for (const u of USERS) {
  try {
    db.prepare('INSERT INTO users (id, email, username, password_hash, avatar_seed, bio) VALUES (?, ?, ?, ?, ?, ?)').run(u.id, u.email, u.username, u.password_hash, u.avatar_seed, u.bio);
    console.log('Created user:', u.username);
  } catch { console.log('User exists:', u.username); }
}

const ARTIFACTS = [
  {
    id: uuid(), seller_id: USERS[0].id,
    name: 'TradeAutomator Pro',
    description: 'A battle-tested claw configuration for trading automation. Trained on 6 months of market patterns, with skills for technical analysis, risk management, and order execution. Plug and play with most brokerage APIs.',
    price: 1999,
    tags: JSON.stringify(['finance', 'trading', 'automation']),
    skills: JSON.stringify(['technical analysis', 'order execution', 'risk management', 'market scanner']),
    personality: 'analytical',
    download_count: 47,
  },
  {
    id: uuid(), seller_id: USERS[1].id,
    name: 'CodeReview Master',
    description: 'Ship better code faster. This claw has been trained specifically for code review workflows — it catches bugs, suggests optimizations, enforces style guides, and writes clear review comments.',
    price: 999,
    tags: JSON.stringify(['development', 'code-review', 'devtools']),
    skills: JSON.stringify(['code analysis', 'bug detection', 'style enforcement', 'PR comments']),
    personality: 'defensive',
    download_count: 123,
  },
  {
    id: uuid(), seller_id: USERS[2].id,
    name: 'CreativeWriter X',
    description: 'An imaginative claw trained on creative writing, storytelling, and content generation. Great for marketing copy, blog posts, fiction drafts, and brainstorming sessions.',
    price: 499,
    tags: JSON.stringify(['writing', 'creative', 'content']),
    skills: JSON.stringify(['storytelling', 'copywriting', 'brainstorming', 'editing']),
    personality: 'creative',
    download_count: 89,
  },
  {
    id: uuid(), seller_id: USERS[0].id,
    name: 'DevOps Sentinel',
    description: 'Keep your infrastructure healthy. Trained on monitoring, alerting, and incident response patterns. Excellent at reading logs, diagnosing issues, and generating runbooks.',
    price: 1499,
    tags: JSON.stringify(['devops', 'infrastructure', 'monitoring']),
    skills: JSON.stringify(['log analysis', 'incident response', 'runbook generation', 'alerting']),
    personality: 'defensive',
    download_count: 31,
  },
  {
    id: uuid(), seller_id: USERS[1].id,
    name: 'HelpDesk Hero',
    description: 'A friendly and patient claw trained to handle customer support tickets. Handles FAQs, escalates complex issues, and always maintains a positive tone.',
    price: 0,
    tags: JSON.stringify(['support', 'customer-service', 'helpdesk']),
    skills: JSON.stringify(['ticket triaging', 'FAQ answering', 'tone calibration', 'escalation']),
    personality: 'helper',
    download_count: 204,
  },
  {
    id: uuid(), seller_id: USERS[2].id,
    name: 'DataDig Analyst',
    description: 'Precision data analysis. This claw excels at SQL, statistical reasoning, and generating insights from raw datasets. Trained on finance, e-commerce, and product analytics scenarios.',
    price: 799,
    tags: JSON.stringify(['data', 'analytics', 'sql']),
    skills: JSON.stringify(['SQL generation', 'statistical analysis', 'chart narration', 'insight generation']),
    personality: 'analytical',
    download_count: 67,
  },
  {
    id: uuid(), seller_id: USERS[0].id,
    name: 'TaskPilot',
    description: 'Your personal productivity co-pilot. Trained to break down complex projects, schedule tasks, draft plans, and keep you focused. Like having a project manager in your terminal.',
    price: 299,
    tags: JSON.stringify(['productivity', 'planning', 'tasks']),
    skills: JSON.stringify(['task decomposition', 'scheduling', 'project planning', 'prioritization']),
    personality: 'balanced',
    download_count: 156,
  },
  {
    id: uuid(), seller_id: USERS[1].id,
    name: 'SecurityHawk',
    description: 'A security-focused claw trained on OWASP guidelines, penetration testing concepts, and vulnerability assessment. Great for code audits and security reviews.',
    price: 2499,
    tags: JSON.stringify(['security', 'pentest', 'audit']),
    skills: JSON.stringify(['code auditing', 'vuln assessment', 'OWASP checks', 'threat modeling']),
    personality: 'aggressive',
    download_count: 22,
  },
];

for (const a of ARTIFACTS) {
  try {
    db.prepare(`
      INSERT INTO artifacts (id, seller_id, name, description, price, tags, skills, personality, download_count, preview_config)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')
    `).run(a.id, a.seller_id, a.name, a.description, a.price, a.tags, a.skills, a.personality, a.download_count);
    console.log('Created artifact:', a.name);
  } catch { console.log('Artifact exists:', a.name); }
}

console.log('\nSeed complete!');
console.log('Demo users (use password "demo" to login — note: bcrypt hash is invalid for demo, create accounts via /register):');
USERS.forEach(u => console.log(`  - ${u.email} / demo`));
