import db from '../src/db.js';

interface Row { id:string; email:string; name:string; roles:string; created_at:string; }

function fetchUsers(): Row[] {
  return db.prepare('SELECT id,email,name,roles,created_at FROM users ORDER BY created_at ASC').all() as Row[];
}

function ensureAdminBootstrap(users: Row[]) {
  const hasAdmin = users.some(u => u.roles.split(',').includes('admin'));
  if (!hasAdmin && users.length) {
    const target = users[0]; // primer usuario
    const currentRoles = target.roles.split(',').filter(Boolean);
    if (!currentRoles.includes('admin')) currentRoles.unshift('admin');
    const newRoles = Array.from(new Set(currentRoles)).join(',');
    db.prepare('UPDATE users SET roles = ? WHERE id = ?').run(newRoles, target.id);
    console.log(`Promovido a admin: ${target.email}`);
  }
}

const users = fetchUsers();
if (users.length === 0) {
  console.log('No hay usuarios registrados aún.');
  process.exit(0);
}

ensureAdminBootstrap(users);
const finalUsers = fetchUsers();
console.log('Usuarios:');
console.table(finalUsers.map(u => ({ id: u.id, email: u.email, name: u.name, roles: u.roles, createdAt: u.created_at })));

// Uso opcional: npx tsx scripts/list-users.ts --promote correo@dominio
const promoteArgIndex = process.argv.indexOf('--promote');
if (promoteArgIndex !== -1 && process.argv[promoteArgIndex + 1]) {
  const email = process.argv[promoteArgIndex + 1].toLowerCase();
  const user = finalUsers.find(u => u.email.toLowerCase() === email);
  if (!user) {
    console.error('Usuario no encontrado para promover.');
    process.exit(1);
  }
  const rolesSet = new Set(user.roles.split(',').filter(Boolean));
  rolesSet.add('admin');
  const updated = Array.from(rolesSet).join(',');
  db.prepare('UPDATE users SET roles = ? WHERE id = ?').run(updated, user.id);
  console.log(`Usuario promovido manualmente a admin: ${user.email}`);
  const after = fetchUsers();
  console.table(after.map(u => ({ id: u.id, email: u.email, name: u.name, roles: u.roles, createdAt: u.created_at })));
}
