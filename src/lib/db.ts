import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { hashPassword } from "@/lib/auth/password";

const DATA_DIR =
  process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "dth.sqlite");

let _db: Database.Database | null = null;

export function getDb() {
  if (_db) return _db;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  migrate(_db);
  seedIfEmpty(_db);
  return _db;
}

function columnNames(db: Database.Database, table: string): Set<string> {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return new Set(rows.map((r) => r.name));
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT,
      oauth_provider TEXT,
      oauth_subject TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      track TEXT NOT NULL,
      slug TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      quiz_score INTEGER,
      quiz_total INTEGER,
      step_index INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, track, slug)
    );
  `);

  const cols = columnNames(db, "users");
  if (!cols.has("oauth_provider")) {
    db.exec("ALTER TABLE users ADD COLUMN oauth_provider TEXT");
  }
  if (!cols.has("oauth_subject")) {
    db.exec("ALTER TABLE users ADD COLUMN oauth_subject TEXT");
  }

  // Rebuild if password_hash is still NOT NULL (older schema) so OAuth-only rows can omit it.
  const info = db.prepare("PRAGMA table_info(users)").all() as {
    name: string;
    notnull: number;
  }[];
  const pw = info.find((c) => c.name === "password_hash");
  if (pw && pw.notnull === 1) {
    db.exec(`
      BEGIN;
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        name TEXT NOT NULL,
        password_hash TEXT,
        oauth_provider TEXT,
        oauth_subject TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO users_new (id, email, name, password_hash, oauth_provider, oauth_subject, created_at)
      SELECT id, email, name, password_hash, oauth_provider, oauth_subject, created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
      COMMIT;
    `);
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS users_oauth_unique
      ON users(oauth_provider, oauth_subject)
      WHERE oauth_provider IS NOT NULL AND oauth_subject IS NOT NULL;

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      jti TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      family_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS refresh_tokens_family_idx ON refresh_tokens(family_id);
  `);
}

function seedIfEmpty(db: Database.Database) {
  if (process.env.NODE_ENV === "production") return;
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
  if (row.c > 0) return;

  const insert = db.prepare(
    "INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)",
  );
  const demo = [
    {
      email: "demo@dailytechhub.dev",
      name: "Demo Learner",
      password: "demo1234",
    },
    {
      email: "alex@example.com",
      name: "Alex Rivera",
      password: "learnfree",
    },
  ];
  const tx = db.transaction(() => {
    for (const u of demo) {
      insert.run(u.email, u.name, hashPassword(u.password));
    }
  });
  tx();
}

export type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string | null;
  oauth_provider: string | null;
  oauth_subject: string | null;
  created_at: string;
};

export type ProgressRow = {
  track: string;
  slug: string;
  completed: number;
  quiz_score: number | null;
  quiz_total: number | null;
  step_index: number | null;
  updated_at: string;
};
