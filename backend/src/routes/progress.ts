import { Router } from 'express';
import db from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

router.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT course_id, percent, updated_at FROM user_course_progress WHERE user_id = ?`).all(req.user!.sub) as Array<{course_id:string;percent:number;updated_at:string}>;
    res.json(rows.map(r => ({ courseId: r.course_id, percent: r.percent, updatedAt: r.updated_at })));
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

const updateSchema = z.object({
  courseId: z.string().min(2),
  percent: z.number().int().min(0).max(100)
});

router.post('/update', requireAuth, (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const { courseId, percent } = parsed.data;
  const existing = db.prepare(`SELECT id,percent FROM user_course_progress WHERE user_id = ? AND course_id = ?`).get(req.user!.sub, courseId) as {id:string;percent:number}|undefined;
  const now = new Date().toISOString();
  try {
    let id: string;
    if (!existing) {
      id = crypto.randomUUID();
      db.prepare(`INSERT INTO user_course_progress (id,user_id,course_id,percent,updated_at) VALUES (?,?,?,?,?)`).run(id, req.user!.sub, courseId, percent, now);
    } else {
      id = existing.id;
      db.prepare(`UPDATE user_course_progress SET percent = ?, updated_at = ? WHERE id = ?`).run(percent, now, id);
    }
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'course_progress', courseId, now);
    res.json({ courseId, percent, updatedAt: now });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
