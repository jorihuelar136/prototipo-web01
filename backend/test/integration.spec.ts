import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import request from 'node:http';
import type { AddressInfo } from 'node:net';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// Import route modules directly
import authRoutes from '../src/routes/auth.js';
import growthRoutes from '../src/routes/growth.js';
// We cannot easily reuse singleton db without refactor; create isolated in-memory db and monkey-patch ../src/db.js default export.

// Hack: dynamic override of cached module export for db.ts consumers.
// This relies on Node's module cache; we replace the exported object with our in-memory Database instance before routes execute queries.
// NOTE: Works because vitest runs in ESM and we imported routes after overriding? We imported routes already, so statements executed against real file DB.
// To ensure isolation, we will skip monkey patch now; instead we spin up ephemeral files? Simplicity: use existing file-based db but clean relevant tables before each test.
// If isolation becomes an issue, refactor app to export factory in future.

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/growth', growthRoutes);

let server: any; let baseURL: string;

// Helper performing HTTP via fetch since Node18 has global fetch; fallback to built-in for convenience.
async function http(method: string, path: string, body?: any, token?: string) {
  const url = baseURL + path;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: res.status, json };
}

// Direct DB access to seed/clean using singleton export
import db from '../src/db.js';

beforeAll(() => {
  server = app.listen(0);
  const addr = server.address() as AddressInfo;
  baseURL = `http://127.0.0.1:${addr.port}`;
});

beforeEach(() => {
  // Truncate tables impacting tests
  db.exec('DELETE FROM users;');
  db.exec('DELETE FROM growth_plan_steps;');
  db.exec('DELETE FROM refresh_tokens;');
});

async function createUser(email: string, password: string, reason?: string) {
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();
  db.prepare(`INSERT INTO users (id,email,name,password_hash,roles,created_at,phone,reason,mentor_id) VALUES (?,?,?,?,?,?,?,?,?)`).run(id,email,email.split('@')[0],hash,'user',createdAt,null,reason||null,null);
  if (reason) {
    // Minimal steps (simulate plan generation) direct insert
    db.prepare(`INSERT INTO growth_plan_steps (id,user_id,step_order,category,title,description,recommended_resources,created_at) VALUES (?,?,?,?,?,?,?,?)`).run(crypto.randomUUID(), id, 1, 'Test', 'Primer paso', 'Desc', 'res1', createdAt);
  }
  return id;
}

describe('Auth check-email', () => {
  it('returns available true for unused email', async () => {
    const resp = await http('GET', `/auth/check-email?email=${encodeURIComponent('nuevo@test.com')}`);
    expect(resp.status).toBe(200);
    expect(resp.json.available).toBe(true);
  });
  it('returns available false for existing email', async () => {
    await createUser('existe@test.com','Secret123!');
    const resp = await http('GET', `/auth/check-email?email=${encodeURIComponent('existe@test.com')}`);
    expect(resp.status).toBe(200);
    expect(resp.json.available).toBe(false);
  });
  it('rejects invalid format', async () => {
    const resp = await http('GET', `/auth/check-email?email=correo-invalido`);
    expect(resp.status).toBe(400);
    expect(resp.json.error).toBe('INVALID_FORMAT');
  });
  it('rejects missing email', async () => {
    const resp = await http('GET', `/auth/check-email`);
    expect(resp.status).toBe(400);
    expect(resp.json.error).toBe('MISSING_EMAIL');
  });
});

async function registerViaAPI(email: string, password: string, reason?: string) {
  const body: any = { email, name: 'Test', password, phone: '1234567' };
  if (reason) body.reason = reason;
  const resp = await http('POST','/auth/register', body);
  return resp;
}

describe('Growth plan retrieval', () => {
  it('returns steps when user has reason and plan', async () => {
    const r = await registerViaAPI('conplan@test.com','SecretPass1!', 'crecimiento');
    expect(r.status).toBe(201);
    const token = r.json.accessToken;
    const plan = await http('GET','/api/growth/plan', undefined, token);
    expect(plan.status).toBe(200);
    expect(plan.json.reason).toBe('crecimiento');
    expect(Array.isArray(plan.json.steps)).toBe(true);
    expect(plan.json.steps.length).toBeGreaterThan(0);
  });
  it('returns empty steps and null reason when user lacks reason', async () => {
    const r = await registerViaAPI('sinplan@test.com','SecretPass1!');
    expect(r.status).toBe(201);
    const token = r.json.accessToken;
    const plan = await http('GET','/api/growth/plan', undefined, token);
    expect(plan.status).toBe(200);
    expect(plan.json.reason).toBeNull();
    expect(plan.json.steps.length).toBe(0);
  });
});
