import db from '../src/db.js';

interface UserRow { id: string; email: string; name: string; roles: string; created_at: string }
interface RefreshRow { token: string; user_id: string; created_at: string }

// Simple inspection script: list users and refresh tokens
const users = db.prepare('SELECT id,email,name,roles,created_at FROM users').all() as UserRow[];
const refreshTokens = db.prepare('SELECT token,user_id,created_at FROM refresh_tokens').all() as RefreshRow[];

console.log('Usuarios:');
for (const u of users) {
  console.log(`- ${u.id} | ${u.email} | ${u.name} | roles=${u.roles}`);
}
console.log(`Total usuarios: ${users.length}`);
console.log('\nRefresh tokens:');
for (const r of refreshTokens) {
  console.log(`- ${r.token.slice(0,20)}... | user=${r.user_id} | ${r.created_at}`);
}
console.log(`Total refresh tokens: ${refreshTokens.length}`);
