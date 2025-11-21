import Database from 'better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'data', 'app.db');
const db = new Database(dbPath);
const email = 'jorihuelar136@gmail.com';
const row = db.prepare('SELECT id,email,roles FROM users WHERE email = ?').get(email);
console.log(row);