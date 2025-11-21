import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function main(){
  const [email, name, password] = process.argv.slice(2);
  if(!email || !name || !password){
    console.error('Usage: node scripts/create-user.js <email> <name> <password>');
    process.exit(1);
  }
  const db = new Database('data/app.db');
  const lower = email.trim().toLowerCase();
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(lower);
  if(exists){
    console.error('User already exists');
    process.exit(2);
  }
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password,10);
  const createdAt = new Date().toISOString();
  // first user becomes admin+user
  let roles = 'user';
  try {
    const countRow = db.prepare('SELECT COUNT(*) as c FROM users').get();
    if(countRow && countRow.c === 0) roles = 'admin,user';
  } catch {}
  db.prepare('INSERT INTO users (id,email,name,password_hash,roles,created_at) VALUES (?,?,?,?,?,?)').run(id, lower, name, hash, roles, createdAt);
  console.log('Created user', {id,email:lower,roles});
}

main();