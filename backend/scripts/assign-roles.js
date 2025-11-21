import Database from 'better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'data', 'app.db');
const db = new Database(dbPath);
const email = 'jorihuelar136@gmail.com'.toLowerCase();
const user = db.prepare('SELECT id, roles FROM users WHERE email = ?').get(email);
if (!user) {
  console.error('User not found for email', email);
  process.exit(1);
}
// Combine existing roles with desired ones
const desired = ['user','admin'];
const current = (user.roles||'').split(',').map(s=>s.trim()).filter(Boolean);
const merged = Array.from(new Set([...current, ...desired]));
const rolesStr = merged.join(',');
try {
  db.prepare('UPDATE users SET roles = ? WHERE id = ?').run(rolesStr, user.id);
  console.log('Updated roles for', email, '->', rolesStr);
} catch (e) { console.error('Error updating roles', e); process.exit(1);}