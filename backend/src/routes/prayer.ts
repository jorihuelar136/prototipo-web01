import { Router } from 'express';
import db from '../db.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(10)
});

router.post('/', requireAuth, (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  try {
    db.prepare(`INSERT INTO prayer_requests (id,user_id,title,body,status,created_at) VALUES (?,?,?,?,?,?)`).run(id, req.user!.sub, parsed.data.title, parsed.data.body, 'open', createdAt);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'prayer_created', id, createdAt);
    res.status(201).json({ id, title: parsed.data.title, body: parsed.data.body, status: 'open', createdAt });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.get('/', requireAuth, (_req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT p.*, (SELECT COUNT(*) FROM prayer_support s WHERE s.prayer_id = p.id) as supports FROM prayer_requests p ORDER BY created_at DESC`).all() as Array<{id:string;user_id:string;title:string;body:string;status:string;created_at:string;answered_at:string|null;supports:number}>;
    res.json(rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      body: r.body,
      status: r.status,
      createdAt: r.created_at,
      answeredAt: r.answered_at,
      supports: r.supports
    })));
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.post('/:id/support', requireAuth, (req: AuthRequest, res) => {
  const prayerId = req.params.id;
  const createdAt = new Date().toISOString();
  try {
    // ensure prayer exists
    const prayer = db.prepare(`SELECT id FROM prayer_requests WHERE id = ?`).get(prayerId);
    if (!prayer) return res.status(404).json({ error: 'NOT_FOUND' });
    db.prepare(`INSERT OR IGNORE INTO prayer_support (id,prayer_id,user_id,created_at) VALUES (?,?,?,?)`).run(crypto.randomUUID(), prayerId, req.user!.sub, createdAt);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'prayer_supported', prayerId, createdAt);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.post('/:id/answer', requireAuth, requireRole('mentor','admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  const answeredAt = new Date().toISOString();
  try {
    const existing = db.prepare(`SELECT id,status FROM prayer_requests WHERE id = ?`).get(id) as {id:string;status:string}|undefined;
    if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
    if (existing.status === 'answered') return res.status(409).json({ error: 'ALREADY_ANSWERED' });
    db.prepare(`UPDATE prayer_requests SET status = 'answered', answered_at = ? WHERE id = ?`).run(answeredAt, id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'prayer_answered', id, answeredAt);
    res.json({ id, status: 'answered', answeredAt });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
