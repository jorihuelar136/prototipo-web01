import Database from 'better-sqlite3';
const db = new Database('data/app.db');
const rows = db.prepare('SELECT id,email,roles,created_at FROM users ORDER BY created_at ASC').all();
console.log(rows);