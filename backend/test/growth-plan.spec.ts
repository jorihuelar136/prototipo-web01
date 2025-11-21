import { describe, it, expect, beforeAll } from 'vitest';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';

// Simple isolated in-memory schema subset for growth plan tests
let db: Database.Database;

beforeAll(() => {
  db = new Database(':memory:');
  db.exec(`CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT, name TEXT, password_hash TEXT, roles TEXT, created_at TEXT, phone TEXT, reason TEXT, mentor_id TEXT);`);
  db.exec(`CREATE TABLE growth_plan_steps (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, step_order INTEGER NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, recommended_resources TEXT, completed_at TEXT, created_at TEXT NOT NULL);`);
});

function buildSteps(reason: string) {
  switch(reason) {
    case 'crecimiento': return [ { category:'Fundación', title:'Disciplina', description:'Establecer horarios', resources:['plan:lectura'] } ];
    default: return []; }
}

async function register(email: string, name: string, password: string, reason?: string) {
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();
  db.prepare(`INSERT INTO users (id,email,name,password_hash,roles,created_at,phone,reason,mentor_id) VALUES (?,?,?,?,?,?,?,?,?)`).run(id,email,name,hash,'user',createdAt,null,reason||null,null);
  if (reason) {
    const steps = buildSteps(reason);
    const ins = db.prepare(`INSERT INTO growth_plan_steps (id,user_id,step_order,category,title,description,recommended_resources,created_at) VALUES (?,?,?,?,?,?,?,?)`);
    steps.forEach((s,i) => ins.run(crypto.randomUUID(), id, i+1, s.category, s.title, s.description, s.resources.join(','), createdAt));
  }
  return id;
}

describe('Growth Plan básico', () => {
  it('crea pasos al registrar con reason', async () => {
    const uid = await register('a@test.com','A','secret123','crecimiento');
  const rows = db.prepare(`SELECT * FROM growth_plan_steps WHERE user_id = ?`).all(uid) as any[];
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].title).toContain('Disciplina');
  });

  it('no crea pasos si falta reason', async () => {
    const uid = await register('b@test.com','B','secret123');
  const rows = db.prepare(`SELECT * FROM growth_plan_steps WHERE user_id = ?`).all(uid) as any[];
    expect(rows.length).toBe(0);
  });

  it('marca paso como completado', async () => {
    const uid = await register('c@test.com','C','secret123','crecimiento');
    const step = db.prepare(`SELECT id FROM growth_plan_steps WHERE user_id = ? ORDER BY step_order LIMIT 1`).get(uid) as {id:string};
    const now = new Date().toISOString();
    db.prepare(`UPDATE growth_plan_steps SET completed_at = ? WHERE id = ?`).run(now, step.id);
    const updated = db.prepare(`SELECT completed_at FROM growth_plan_steps WHERE id = ?`).get(step.id) as {completed_at:string|null};
    expect(updated.completed_at).toBe(now);
  });
});
