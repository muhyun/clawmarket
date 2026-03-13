import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'clawmarket.db');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
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

    CREATE INDEX IF NOT EXISTS idx_artifacts_seller ON artifacts(seller_id);
    CREATE INDEX IF NOT EXISTS idx_artifacts_created ON artifacts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_artifact ON purchases(artifact_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_artifact ON reviews(artifact_id);
  `);
}

export default getDb;
