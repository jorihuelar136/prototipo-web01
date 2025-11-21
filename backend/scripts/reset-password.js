import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const [emailArg, newPass] = process.argv.slice(2);
if(!emailArg || !newPass){
  console.error('Usage: node scripts/reset-password.js <email> <newPassword>');
  process.exit(1);
}
const email = emailArg.trim().toLowerCase();

// Password policy (mirror of Zod rules)
function valid(p){
  return p.length >= 10 && /[0-9]/.test(p) && /[A-ZÁÉÍÓÚÑ]/.test(p) && /[a-záéíóúñ]/.test(p) && /[!@#$%^&*._+-]/.test(p);
}
if(!valid(newPass)){
  console.error('Password does not meet policy: length>=10, number, uppercase, lowercase, symbol');
  process.exit(2);
}

const db = new Database('data/app.db');
const user = db.prepare('SELECT id,password_hash FROM users WHERE email = ?').get(email);
if(!user){
  console.error('User not found');
  process.exit(3);
}
async function run(){
  const hash = await bcrypt.hash(newPass,10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  try { db.prepare('INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)').run(crypto.randomUUID(), user.id, 'password_reset_script', user.id, new Date().toISOString()); } catch {}
  console.log('Password updated for', email);
}
run();