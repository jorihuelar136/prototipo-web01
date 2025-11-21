import { Router } from 'express';
import db from '../db.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

// Listar solicitudes propias y abiertas (si mentor/admin)
router.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const base = db.prepare(`SELECT * FROM mentorship_requests ORDER BY created_at DESC`).all() as Array<{id:string;requester_id:string;mentor_id:string|null;status:string;created_at:string;updated_at:string}>;
    const isMentor = req.user!.roles.includes('mentor') || req.user!.roles.includes('admin');
    const data = base.filter(r => r.requester_id === req.user!.sub || isMentor).map(r => ({
      id: r.id,
      requesterId: r.requester_id,
      mentorId: r.mentor_id,
      status: r.status,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Crear solicitud
const createSchema = z.object({ note: z.string().min(5).max(500) });
router.post('/request', requireAuth, (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const existingOpen = db.prepare(`SELECT id FROM mentorship_requests WHERE requester_id = ? AND status = 'pending'`).get(req.user!.sub) as {id:string}|undefined;
  if (existingOpen) return res.status(409).json({ error: 'ALREADY_PENDING', id: existingOpen.id });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    db.prepare(`INSERT INTO mentorship_requests (id,requester_id,mentor_id,status,created_at,updated_at) VALUES (?,?,?,?,?,?)`).run(id, req.user!.sub, null, 'pending', now, now);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'mentorship_requested', id, now);
    res.status(201).json({ id, status: 'pending', createdAt: now });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Aceptar solicitud (mentor/admin)
const acceptSchema = z.object({ requestId: z.string().uuid() });
router.post('/accept', requireAuth, requireRole('mentor','admin'), (req: AuthRequest, res) => {
  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const row = db.prepare(`SELECT id,status,requester_id FROM mentorship_requests WHERE id = ?`).get(parsed.data.requestId) as {id:string;status:string;requester_id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  if (row.status !== 'pending') return res.status(409).json({ error: 'NOT_PENDING' });
  const now = new Date().toISOString();
  try {
    db.prepare(`UPDATE mentorship_requests SET mentor_id = ?, status = 'accepted', updated_at = ? WHERE id = ?`).run(req.user!.sub, now, row.id);
    // Asociar mentee con el mentor en tabla users
    try {
      db.prepare(`UPDATE users SET mentor_id = ? WHERE id = ?`).run(req.user!.sub, row.requester_id);
    } catch {}
    // Promover a mentor si el que acepta es admin y no tenía rol mentor (opcional)
    if (req.user!.roles.includes('admin') && !req.user!.roles.includes('mentor')) {
      const userRow = db.prepare(`SELECT roles FROM users WHERE id = ?`).get(req.user!.sub) as {roles:string};
      const rolesSet = new Set(userRow.roles.split(',').filter(Boolean));
      rolesSet.add('mentor');
      db.prepare(`UPDATE users SET roles = ? WHERE id = ?`).run(Array.from(rolesSet).join(','), req.user!.sub);
    }
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'mentorship_accepted', row.id, now);
    res.json({ id: row.id, status: 'accepted', mentorId: req.user!.sub });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Cancelar propia solicitud
const cancelSchema = z.object({ requestId: z.string().uuid() });
router.post('/cancel', requireAuth, (req: AuthRequest, res) => {
  const parsed = cancelSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const row = db.prepare(`SELECT id,requester_id,status FROM mentorship_requests WHERE id = ?`).get(parsed.data.requestId) as {id:string;requester_id:string;status:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  if (row.requester_id !== req.user!.sub) return res.status(403).json({ error: 'FORBIDDEN' });
  if (row.status !== 'pending') return res.status(409).json({ error: 'NOT_PENDING' });
  try {
    db.prepare(`UPDATE mentorship_requests SET status = 'cancelled' WHERE id = ?`).run(row.id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'mentorship_cancelled', row.id, new Date().toISOString());
    res.json({ id: row.id, status: 'cancelled' });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
