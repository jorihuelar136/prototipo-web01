import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
const dbPath = path.join(process.cwd(), 'data', 'app.db');
const db = new Database(dbPath);
const countRow = db.prepare('SELECT COUNT(*) as c FROM role_definitions').get();
const count = countRow ? countRow.c : 0;
if (count.c > 0) { console.log('Roles already exist, skipping'); process.exit(0);} 
const now = new Date().toISOString();
const seed = db.prepare('INSERT INTO role_definitions (id,name,description,menu_options,created_at) VALUES (?,?,?,?,?)');
function role(name, desc, menus) { seed.run(crypto.randomUUID(), name, desc, menus.join(','), now); }
role('user','Usuario básico',['dashboard','crecimiento','profile']);
role('mentor','Mentor con acceso a recursos',['dashboard','crecimiento','profile','recursos','miprogreso']);
role('lider','Líder con acceso mentoría',['dashboard','crecimiento','profile','recursos','miprogreso','mentoria']);
role('admin','Administrador completo',['dashboard','crecimiento','profile','recursos','miprogreso','mentoria','comunidad','administracion','mentor_mis_mentees']);
console.log('Seeded default roles');