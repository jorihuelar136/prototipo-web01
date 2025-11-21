import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// Listar mentees del mentor autenticado (usuarios cuyo mentor_id = mentor.sub)
router.get('/mentees', requireAuth, requireRole('mentor','admin'), (req: AuthRequest, res) => {
  try {
    const mentorId = req.user!.sub;
    // Incluir conteo rápido de pasos pendientes/aprobados para facilitar vista del mentor
    const rows = db.prepare(`SELECT id, email, name, created_at, reason FROM users WHERE mentor_id = ? ORDER BY created_at DESC`).all(mentorId) as Array<{id:string;email:string;name:string;created_at:string;reason:string|null}>;
    const result = rows.map(r => {
      const counts = db.prepare(`SELECT 
        SUM(CASE WHEN completed_at IS NULL THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN mentor_review_status = 'approved' THEN 1 ELSE 0 END) AS approved
      FROM growth_plan_steps WHERE user_id = ?`).get(r.id) as {pending:number|null;approved:number|null}|undefined;
      return ({ id: r.id, email: r.email, name: r.name, createdAt: r.created_at, reason: r.reason, pendingSteps: counts?.pending||0, approvedSteps: counts?.approved||0 });
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Obtener plan de crecimiento de un mentee específico (sólo si mentor_id coincide)
router.get('/mentees/:id/plan', requireAuth, requireRole('mentor','admin'), (req: AuthRequest, res) => {
  const menteeId = req.params.id;
  try {
    const mentorId = req.user!.sub;
    const mentee = db.prepare(`SELECT id, mentor_id, reason FROM users WHERE id = ?`).get(menteeId) as {id:string;mentor_id:string|null;reason:string|null}|undefined;
    if (!mentee) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (mentee.mentor_id !== mentorId) return res.status(403).json({ error: 'FORBIDDEN' });
    const steps = db.prepare(`SELECT id,step_order,category,title,description,recommended_resources,completed_at,mentor_review_status,mentor_score,mentor_comment,reviewed_at FROM growth_plan_steps WHERE user_id = ? ORDER BY step_order ASC`).all(menteeId) as Array<any>;
    res.json({ menteeId, reason: mentee.reason, steps: steps.map(s => ({
      id: s.id,
      order: s.step_order,
      category: s.category,
      title: s.title,
      description: s.description,
      resources: (s.recommended_resources||'').split(',').filter(Boolean),
      completedAt: s.completed_at || null,
      reviewStatus: s.mentor_review_status || 'pending',
      reviewScore: s.mentor_score ?? null,
      reviewComment: s.mentor_comment || null,
      reviewedAt: s.reviewed_at || null
    })) });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Revisar (aprobar / rechazar) un paso y opcionalmente asignar score y comentario
const reviewSchema = z.object({
  status: z.enum(['approved','rejected']),
  score: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(2).max(500).optional()
});
router.post('/review-step/:stepId', requireAuth, requireRole('mentor','admin'), (req: AuthRequest, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const stepId = req.params.stepId;
  try {
    const mentorId = req.user!.sub;
    const step = db.prepare(`SELECT id, user_id, completed_at FROM growth_plan_steps WHERE id = ?`).get(stepId) as {id:string;user_id:string;completed_at:string|null}|undefined;
    if (!step) return res.status(404).json({ error: 'STEP_NOT_FOUND' });
    const mentee = db.prepare(`SELECT id, mentor_id FROM users WHERE id = ?`).get(step.user_id) as {id:string;mentor_id:string|null}|undefined;
    if (!mentee) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    if (mentee.mentor_id !== mentorId) return res.status(403).json({ error: 'FORBIDDEN' });
    // Si aprueba y el paso no está completado, marcarlo como completado automáticamente
    let completionTime: string|null = step.completed_at;
    if (!completionTime && parsed.data.status === 'approved') {
      completionTime = new Date().toISOString();
      db.prepare(`UPDATE growth_plan_steps SET completed_at = ? WHERE id = ?`).run(completionTime, stepId);
    }
    // Si intenta rechazar sin estar completado, permitir (no exige completion) pero no setea completed_at
    const now = new Date().toISOString();
    db.prepare(`UPDATE growth_plan_steps SET mentor_review_status = ?, mentor_score = ?, mentor_comment = ?, reviewed_at = ?, reviewer_id = ? WHERE id = ?`).run(
      parsed.data.status,
      parsed.data.score ?? null,
      parsed.data.comment ?? null,
      now,
      mentorId,
      stepId
    );
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), mentorId, parsed.data.status === 'approved' ? 'mentor_step_approved' : 'mentor_step_rejected', stepId, now);
  const updated = db.prepare(`SELECT id, step_order, category, title, description, recommended_resources, completed_at, mentor_review_status, mentor_score, mentor_comment, reviewed_at FROM growth_plan_steps WHERE id = ?`).get(stepId) as any;
    res.json({ id: updated.id, order: updated.step_order, category: updated.category, title: updated.title, description: updated.description, resources: (updated.recommended_resources||'').split(',').filter(Boolean), completedAt: updated.completed_at, reviewStatus: updated.mentor_review_status, reviewScore: updated.mentor_score ?? null, reviewComment: updated.mentor_comment || null, reviewedAt: updated.reviewed_at || null });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
