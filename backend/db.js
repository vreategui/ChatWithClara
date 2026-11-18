// Simple local SQLite database. Good enough for a handful of family members.
// If this ever needs to scale to many users, swap better-sqlite3 for Postgres
// without changing the rest of the app much (same function names below).

const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "data", "app.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    notify_hour INTEGER DEFAULT 17,     -- 24h local hour, default 5pm
    notify_minute INTEGER DEFAULT 0,
    timezone TEXT DEFAULT 'Australia/Melbourne',
    expo_push_token TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_key TEXT NOT NULL,
    started_at TEXT DEFAULT CURRENT_TIMESTAMP,
    turn_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,         -- 'user' or 'assistant'
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  );
`);

module.exports = db;
