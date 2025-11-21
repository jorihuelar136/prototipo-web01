import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import { courses, events, verses } from '../data/content.js';
import db from '../db.js';

const router = Router();

// Simple progress stub (later real progress table)
function getProgress(userId: string) {
  // Placeholder: return 0s
  return { coursesCompleted: 0, eventsAttended: 0, mentorshipSessions: 0 };
}

// Recent activity stub (later from user_activity table)
function getRecentActivity(userId: string) {
  return [
    { id: 'a1', kind: 'login', description: 'Inicio de sesión exitoso', at: new Date().toISOString() }
  ];
}

router.get('/', requireAuth, (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.sub as string;
  const verseOfDay = verses[Math.floor(Date.now() / (1000*60*60*24)) % verses.length];
  const nextEvents = events.slice(0,3);
  const recommendedCourses = courses.slice(0,3);
  const progress = getProgress(userId);
  const recentActivity = getRecentActivity(userId);
  res.json({ verseOfDay, nextEvents, recommendedCourses, progress, recentActivity });
});

// Notificaciones simples: últimas actividades del usuario o de solicitudes de mentoría si es mentor/admin.
router.get('/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const isMentor = req.user!.roles.includes('mentor') || req.user!.roles.includes('admin');
    const userId = req.user!.sub;
    // Actividad propia
    const own = db.prepare(`SELECT kind, ref_id, created_at FROM user_activity WHERE user_id = ? ORDER BY created_at DESC LIMIT 15`).all(userId) as Array<{kind:string;ref_id:string;created_at:string}>;
    // Solicitudes pendientes si mentor/admin
    let pending: Array<{id:string;requester_id:string;created_at:string}> = [];
    if (isMentor) {
      pending = db.prepare(`SELECT id, requester_id, created_at FROM mentorship_requests WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10`).all() as Array<{id:string;requester_id:string;created_at:string}>;
    }
    // Formatear mensajes
    const notifications = [
      ...pending.map(p => ({ type: 'mentorship_pending', message: `Solicitud de mentoría pendiente (${p.id.slice(0,8)})`, createdAt: p.created_at })),
      ...own.map(a => ({ type: a.kind, message: mapActivity(a.kind, a.ref_id), createdAt: a.created_at }))
    ].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,25);
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Completar paso de growth plan
router.post('/complete-step/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const stepId = req.params.id;
  try {
    const step = db.prepare(`SELECT id,user_id,completed_at FROM growth_plan_steps WHERE id = ?`).get(stepId) as {id:string;user_id:string;completed_at:string|null}|undefined;
    if (!step) return res.status(404).json({ error: 'STEP_NOT_FOUND' });
    if (step.user_id !== req.user!.sub) return res.status(403).json({ error: 'FORBIDDEN' });
    if (step.completed_at) return res.status(409).json({ error: 'ALREADY_COMPLETED' });
    const now = new Date().toISOString();
    db.prepare(`UPDATE growth_plan_steps SET completed_at = ? WHERE id = ?`).run(now, stepId);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'growth_step_completed', stepId, now);
    res.json({ id: stepId, completedAt: now });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

function mapActivity(kind: string, ref: string) {
  switch (kind) {
    case 'prayer_created': return 'Creaste una petición de oración';
    case 'prayer_supported': return 'Apoyaste una petición de oración';
    case 'prayer_answered': return 'Marcaste una oración como respondida';
    case 'course_progress': return 'Actualizaste progreso de curso';
    case 'profile_updated': return 'Actualizaste tu perfil';
    case 'mentorship_requested': return 'Enviaste una solicitud de mentoría';
    case 'mentorship_accepted': return 'Aceptaste una solicitud de mentoría';
    case 'mentorship_cancelled': return 'Cancelaste tu solicitud de mentoría';
    case 'resource_created': return 'Creaste un recurso';
    case 'resource_deleted': return 'Eliminaste un recurso';
    case 'user_roles_updated': return 'Actualizaste roles de usuario';
    case 'user_created': return 'Nuevo usuario registrado';
    case 'admin_user_updated': return 'Actualizaste datos de un usuario (admin)';
    case 'admin_password_reset': return 'Reseteaste password de un usuario';
    case 'admin_user_deleted': return 'Eliminaste un usuario';
    case 'user_growth_plan_generated': return 'Plan de crecimiento generado';
    case 'growth_step_completed': return 'Completaste un paso de tu plan';
    default: return `Actividad: ${kind}`;
  }
}

export default router;