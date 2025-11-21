import Database from 'better-sqlite3';
import crypto from 'crypto';
const emailArg = process.argv[2];
if(!emailArg){ console.error('Usage: node scripts/promote-user.js <email>'); process.exit(1); }
const email = emailArg.trim().toLowerCase();
const db = new Database('data/app.db');
const user = db.prepare('SELECT id,roles FROM users WHERE email = ?').get(email);
if(!user){ console.error('User not found'); process.exit(2); }
const rolesSet = new Set(String(user.roles).split(',').filter(Boolean));
rolesSet.add('admin');
const newRoles = Array.from(rolesSet).join(',');
db.prepare('UPDATE users SET roles = ? WHERE id = ?').run(newRoles, user.id);
try { db.prepare('INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)').run(crypto.randomUUID(), user.id, 'promoted_admin', user.id, new Date().toISOString()); } catch {}
console.log('Promoted', email, '->', newRoles);