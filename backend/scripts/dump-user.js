import Database from 'better-sqlite3';
const db = new Database('data/app.db');
const email = process.argv[2];
if(!email){ console.error('Usage: node scripts/dump-user.js <email>'); process.exit(1); }
const row = db.prepare('SELECT id,email,password_hash,roles,created_at,reason,phone FROM users WHERE email = ?').get(email.trim().toLowerCase());
console.log(row || 'NOT_FOUND');