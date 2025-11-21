import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync, existsSync, copyFileSync, readdirSync } from 'fs';

// Simple singleton DB instance
// Permite separar base de datos para tests usando variable de entorno DB_PATH.
// Si DB_PATH apunta a un archivo específico lo usamos directamente; en caso contrario se usa data/app.db.
const envPath = process.env.DB_PATH;
let dbPath: string;
if (envPath) {
  dbPath = path.isAbsolute(envPath) ? envPath : path.join(process.cwd(), envPath);
} else {
  dbPath = path.join(process.cwd(), 'data', 'app.db');
}
const dataDir = path.dirname(dbPath);
// Crear carpeta data si no existe (modo idempotente)
try { mkdirSync(path.dirname(dbPath), { recursive: true }); } catch {}

// Auto-backup (simple) al iniciar: sólo para base "principal" (cuando nombre incluye app.db)
try {
  if (path.basename(dbPath) === 'app.db') {
    const backupsDir = path.join(dataDir, 'backups');
  mkdirSync(backupsDir, { recursive: true });
  if (existsSync(dbPath)) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${y}${m}${d}`;
    const existingToday = readdirSync(backupsDir).some(f => f.startsWith(`app-${datePrefix}`));
    if (!existingToday) {
      const ts = today.toISOString().replace(/[:]/g,'').replace(/\..+/, '').replace('T','-'); // YYYY-MM-DD-HHMMSS
      const backupName = `app-${ts}.db`;
      const dest = path.join(backupsDir, backupName);
      copyFileSync(dbPath, dest);
      try { console.log(`[backup] Copia creada: ${backupName}`); } catch {}
      }
      // Mantener solo últimos 10 backups para evitar acumulación
      const files = readdirSync(backupsDir).filter(f=>/^app-\d{4}-\d{2}-\d{2}-\d{6}.db$/.test(f)).sort();
      if (files.length > 10) {
        const toRemove = files.slice(0, files.length - 10);
        for (const f of toRemove) {
          try { const full = path.join(backupsDir, f); if (existsSync(full)) { require('fs').unlinkSync(full); } } catch {}
        }
      }
    }
  }
} catch {}
const db = new Database(dbPath);

// Pragmas for performance & integrity
try { db.pragma('journal_mode = WAL'); } catch {}
try { db.pragma('foreign_keys = ON'); } catch {}

// Migrations (idempotent)
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  roles TEXT NOT NULL,
  created_at TEXT NOT NULL
);`);

// Normalizar emails existentes a minúsculas (una sola vez). Usamos tabla_info para detectar columna
try {
  const rows = db.prepare(`SELECT id,email FROM users`).all() as Array<{id:string;email:string}>;
  const updateStmt = db.prepare(`UPDATE users SET email = ? WHERE id = ?`);
  let changed = 0;
  for (const r of rows) {
    const lower = r.email?.trim().toLowerCase();
    if (lower && lower !== r.email) {
      try { updateStmt.run(lower, r.id); changed++; } catch {}
    }
  }
  if (changed > 0) {
    try { console.log(`[migration] Normalizados ${changed} emails a minúsculas`); } catch {}
  }
} catch {}

// Crear índice case-insensitive auxiliar (SQLite compara texto sin collations especiales por defecto, pero garantizamos búsqueda rápida)
try { db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(email)`); } catch {}

// Añadir columna avatar si aún no existe
try {
  const info = db.prepare(`PRAGMA table_info(users)`).all() as Array<{name:string}>;
  if (!info.some(c => c.name === 'avatar')) {
    db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT`);
  }
  if (!info.some(c => c.name === 'phone')) {
    db.exec(`ALTER TABLE users ADD COLUMN phone TEXT`);
  }
  if (!info.some(c => c.name === 'reason')) {
    db.exec(`ALTER TABLE users ADD COLUMN reason TEXT`);
  }
  if (!info.some(c => c.name === 'mentor_id')) {
    db.exec(`ALTER TABLE users ADD COLUMN mentor_id TEXT REFERENCES users(id)`);
  }
  if (!info.some(c => c.name === 'motivo_id')) {
    db.exec(`ALTER TABLE users ADD COLUMN motivo_id TEXT REFERENCES motivos(id)`);
  }
  if (!info.some(c => c.name === 'categoria_id')) {
    db.exec(`ALTER TABLE users ADD COLUMN categoria_id TEXT REFERENCES categorias(id)`);
  }
  if (!info.some(c => c.name === 'plan_id')) {
    db.exec(`ALTER TABLE users ADD COLUMN plan_id TEXT REFERENCES planes(id)`);
  }
} catch {}

db.exec(`CREATE TABLE IF NOT EXISTS refresh_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

// Intranet feature tables
db.exec(`CREATE TABLE IF NOT EXISTS prayer_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  answered_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

db.exec(`CREATE TABLE IF NOT EXISTS prayer_support (
  id TEXT PRIMARY KEY,
  prayer_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(prayer_id, user_id),
  FOREIGN KEY(prayer_id) REFERENCES prayer_requests(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

db.exec(`CREATE TABLE IF NOT EXISTS mentorship_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL,
  mentor_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(requester_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(mentor_id) REFERENCES users(id) ON DELETE SET NULL
);`);

db.exec(`CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  tags TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL
);`);

db.exec(`CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

db.exec(`CREATE TABLE IF NOT EXISTS community_replies (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

db.exec(`CREATE TABLE IF NOT EXISTS community_reactions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(post_id, user_id, type),
  FOREIGN KEY(post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

db.exec(`CREATE TABLE IF NOT EXISTS user_activity (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  ref_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

// Tabla para estado de notificaciones leídas por cada usuario sobre actividades (many-to-many)
db.exec(`CREATE TABLE IF NOT EXISTS notification_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  read_at TEXT NOT NULL,
  UNIQUE(user_id, activity_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(activity_id) REFERENCES user_activity(id) ON DELETE CASCADE
);`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);`);

db.exec(`CREATE TABLE IF NOT EXISTS user_course_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  percent INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, course_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

// Plan de crecimiento: pasos predefinidos según reason del usuario
db.exec(`CREATE TABLE IF NOT EXISTS growth_plan_steps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_resources TEXT,
  template_id TEXT,
  completed_at TEXT,
  mentor_review_status TEXT, -- pending|approved|rejected
  mentor_score INTEGER, -- 1-5 opcional
  mentor_comment TEXT,
  reviewed_at TEXT,
  reviewer_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);`);

db.exec(`CREATE INDEX IF NOT EXISTS idx_growth_user ON growth_plan_steps(user_id);`);
// Asegurar columnas de review si tabla ya existía sin ellas
try {
  const cols = db.prepare(`PRAGMA table_info(growth_plan_steps)`).all() as Array<{name:string}>;
  const ensure = (name:string, sql:string) => { if (!cols.some(c=>c.name===name)) { db.exec(sql); } };
  ensure('mentor_review_status', `ALTER TABLE growth_plan_steps ADD COLUMN mentor_review_status TEXT`);
  ensure('mentor_score', `ALTER TABLE growth_plan_steps ADD COLUMN mentor_score INTEGER`);
  ensure('mentor_comment', `ALTER TABLE growth_plan_steps ADD COLUMN mentor_comment TEXT`);
  ensure('reviewed_at', `ALTER TABLE growth_plan_steps ADD COLUMN reviewed_at TEXT`);
  ensure('reviewer_id', `ALTER TABLE growth_plan_steps ADD COLUMN reviewer_id TEXT REFERENCES users(id)`);
  ensure('template_id', `ALTER TABLE growth_plan_steps ADD COLUMN template_id TEXT`);
} catch {}

// Plantillas de planes de crecimiento (para mantenimiento admin)
db.exec(`CREATE TABLE IF NOT EXISTS growth_plan_templates (
  id TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  category TEXT NOT NULL,
  plan_level TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommended_resources TEXT,
  created_at TEXT NOT NULL
);`);
// Ensure plan_level column exists in case table was created earlier without it
try {
  const tplCols = db.prepare(`PRAGMA table_info(growth_plan_templates)`).all() as Array<{name:string}>;
  if (!tplCols.some(c=>c.name==='plan_level')) {
    db.exec(`ALTER TABLE growth_plan_templates ADD COLUMN plan_level TEXT`);
  }
  if (!tplCols.some(c=>c.name==='motivo_id')) {
    db.exec(`ALTER TABLE growth_plan_templates ADD COLUMN motivo_id TEXT REFERENCES motivos(id)`);
  }
  if (!tplCols.some(c=>c.name==='categoria_id')) {
    db.exec(`ALTER TABLE growth_plan_templates ADD COLUMN categoria_id TEXT REFERENCES categorias(id)`);
  }
  if (!tplCols.some(c=>c.name==='plan_id')) {
    db.exec(`ALTER TABLE growth_plan_templates ADD COLUMN plan_id TEXT REFERENCES planes(id)`);
  }
} catch {}
db.exec(`CREATE INDEX IF NOT EXISTS idx_growth_templates_reason ON growth_plan_templates(reason);`);

// Definiciones de roles (mantenimiento dinámico de permisos/menu)
db.exec(`CREATE TABLE IF NOT EXISTS role_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  menu_options TEXT NOT NULL, -- coma separada de claves de menú
  created_at TEXT NOT NULL
);`);
// Sembrar roles por defecto si tabla vacía
try {
  const count = db.prepare(`SELECT COUNT(*) as c FROM role_definitions`).get() as {c:number};
  if (count.c === 0) {
    try { console.log('[seed] role_definitions vacío, sembrando roles por defecto'); } catch {}
    const now = new Date().toISOString();
    const seed = db.prepare(`INSERT INTO role_definitions (id,name,description,menu_options,created_at) VALUES (?,?,?,?,?)`);
    const seedRole = (n:string,d:string,m:string[]) => seed.run(require('crypto').randomUUID(), n, d, m.join(','), now);
    seedRole('user','Usuario básico',['dashboard','crecimiento','profile']);
    seedRole('mentor','Mentor con acceso a recursos',['dashboard','crecimiento','profile','recursos','miprogreso']);
    seedRole('lider','Líder con acceso mentoría',['dashboard','crecimiento','profile','recursos','miprogreso','mentoria']);
    seedRole('admin','Administrador completo',['dashboard','crecimiento','profile','recursos','miprogreso','mentoria','comunidad','administracion','mentor_mis_mentees']);
    try { console.log('[seed] roles por defecto creados'); } catch {}
  }
} catch {}

// Helpful indexes for common queries
db.exec(`CREATE INDEX IF NOT EXISTS idx_prayer_user ON prayer_requests(user_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_mentorship_status ON mentorship_requests(status);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity(user_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_progress_user ON user_course_progress(user_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_motivo ON users(motivo_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_categoria ON users(categoria_id);`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan_id);`);

// Catálogos: motivos, categorias, planes (soft delete via campo activo INTEGER 1/0)
db.exec(`CREATE TABLE IF NOT EXISTS motivos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);`);
db.exec(`CREATE TABLE IF NOT EXISTS categorias (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);`);
db.exec(`CREATE TABLE IF NOT EXISTS planes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  nivel TEXT,
  descripcion TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);`);


export default db;
