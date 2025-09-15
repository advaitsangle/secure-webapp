// manages storage w/ parameterized queries 

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create/open DB file
const dbPath = path.join(__dirname, '..', 'app.sqlite3');
export const db = new Database(dbPath);

// Initialize schema idempotently
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Prepared statements
export const stmts = {
  insertUser: db.prepare(
    `INSERT INTO users (email, password_hash) VALUES (?, ?)`
  ),
  findUserByEmail: db.prepare(
    `SELECT id, email, password_hash FROM users WHERE email = ?`
  ),
  insertSession: db.prepare(
    `INSERT INTO sessions (id, user_id) VALUES (?, ?)`
  ),
  deleteSession: db.prepare(
    `DELETE FROM sessions WHERE id = ?`
  )
};

// Utility to create a cryptographically strong session id (if desired)
export function newSessionId() {
  return crypto.randomBytes(32).toString('hex');
}
