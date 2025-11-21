import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// Obtener plan de crecimiento del usuario autenticado
router.get('/plan', requireAuth, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.sub;
    const user = db.prepare(`SELECT reason FROM users WHERE id = ?`).get(userId) as {reason:string|null}|undefined;
    const reason = user?.reason || null;
    // Incluir el motivo original de cada paso (derivado de la plantilla) para identificar claramente el origen
    const rows = db.prepare(`
      SELECT s.id, s.step_order, s.category, s.title, s.description, s.recommended_resources, s.completed_at,
             s.mentor_review_status, s.mentor_score, s.mentor_comment,
             t.reason AS template_reason
      FROM growth_plan_steps s
      LEFT JOIN growth_plan_templates t ON s.template_id = t.id
      WHERE s.user_id = ?
      ORDER BY s.step_order ASC
    `).all(userId) as Array<{id:string;step_order:number;category:string;title:string;description:string;recommended_resources:string|null;completed_at:string|null;mentor_review_status:string|null;mentor_score:number|null;mentor_comment:string|null;template_reason:string|null}>;
    const growthPlan = rows.map(r => ({
      id: r.id,
      order: r.step_order,
      category: r.category,
      title: r.title,
      description: r.description,
      resources: (r.recommended_resources||'').split(',').filter(Boolean),
      completedAt: r.completed_at,
      reviewStatus: r.mentor_review_status || 'pending',
      reviewScore: r.mentor_score,
      reviewComment: r.mentor_comment,
      stepReason: r.template_reason || reason || null
    }));
    res.json({ reason, steps: growthPlan });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;