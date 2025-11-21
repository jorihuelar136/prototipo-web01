import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Request } from 'express';

const router = Router();

router.get('/users', requireAuth, requireRole('admin'), (_req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT id,email,name,roles,created_at,reason,phone,motivo_id,categoria_id,plan_id FROM users ORDER BY created_at DESC`).all() as Array<{id:string;email:string;name:string;roles:string;created_at:string;reason:string|null;phone:string|null;motivo_id:string|null;categoria_id:string|null;plan_id:string|null}>;
    res.json(rows.map(r => ({ id: r.id, email: r.email, name: r.name, roles: r.roles.split(',').filter(Boolean), createdAt: r.created_at, reason: r.reason || null, phone: r.phone || null, motivoId: r.motivo_id || null, categoriaId: r.categoria_id || null, planId: r.plan_id || null })));
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Obtener un usuario específico (para panel admin)
router.get('/users/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  try {
    const row = db.prepare(`SELECT id,email,name,roles,created_at,avatar,reason,phone,motivo_id,categoria_id,plan_id FROM users WHERE id = ?`).get(id) as any;
    if (!row) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json({ id: row.id, email: row.email, name: row.name, roles: row.roles.split(',').filter(Boolean), createdAt: row.created_at, avatar: row.avatar || null, reason: row.reason || null, phone: row.phone || null, motivoId: row.motivo_id || null, categoriaId: row.categoria_id || null, planId: row.plan_id || null });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Actualizar datos básicos (nombre, email) - email requiere unicidad
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(7).max(20).regex(/^[+0-9 ()-]+$/,'INVALID_PHONE').optional()
});
router.post('/users/:id/update', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  // Permitir actualizar únicamente el teléfono; validar que al menos un campo fue enviado
  if (!parsed.data.name && !parsed.data.email && !parsed.data.phone) return res.status(400).json({ error: 'NO_FIELDS' });
  const id = req.params.id;
  const existing = db.prepare(`SELECT id,email,name,roles,phone FROM users WHERE id = ?`).get(id) as {id:string;email:string;name:string;roles:string;phone:string|null}|undefined;
  if (!existing) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  try {
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const taken = db.prepare(`SELECT id FROM users WHERE email = ?`).get(parsed.data.email) as {id:string}|undefined;
      if (taken) return res.status(409).json({ error: 'EMAIL_EXISTS' });
    }
    const nextName = parsed.data.name ?? existing.name;
    const nextEmail = parsed.data.email ?? existing.email;
  const rawPhone = parsed.data.phone !== undefined ? parsed.data.phone : existing.phone;
  const canonicalPhone = rawPhone ? rawPhone.replace(/[^+0-9]/g,'') : null; // quitar espacios y símbolos excepto +
    db.prepare(`UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?`).run(nextName, nextEmail, canonicalPhone, id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'admin_user_updated', id, new Date().toISOString());
    res.json({ id, email: nextEmail, name: nextName, phone: canonicalPhone });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Reset de password (genera nuevo hash a un password temporal)
const resetPwdSchema = z.object({ password: z.string().min(8) });
router.post('/users/:id/reset-password', requireAuth, requireRole('admin'), async (req: AuthRequest, res) => {
  const parsed = resetPwdSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const id = req.params.id;
  const existing = db.prepare(`SELECT id FROM users WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!existing) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  try {
    const newHash = await bcrypt.hash(parsed.data.password, 10);
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(newHash, id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'admin_password_reset', id, new Date().toISOString());
    res.json({ id, reset: true });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Eliminar usuario (hard delete) - evitar borrar si es el único admin
router.delete('/users/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  const row = db.prepare(`SELECT id,roles FROM users WHERE id = ?`).get(id) as {id:string;roles:string}|undefined;
  if (!row) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  try {
    // Protección: evitar eliminar cuenta principal admin salvo ?force=true
    const primaryEmail = process.env.PRIMARY_ADMIN_EMAIL?.trim().toLowerCase();
    if (primaryEmail) {
      const emailRow = db.prepare(`SELECT email FROM users WHERE id = ?`).get(id) as {email:string}|undefined;
      if (emailRow && emailRow.email.trim().toLowerCase() === primaryEmail && req.query.force !== 'true') {
        return res.status(409).json({ error: 'PRIMARY_ADMIN_PROTECTED' });
      }
    }
    const admins = db.prepare(`SELECT id FROM users WHERE roles LIKE '%admin%'`).all() as Array<{id:string}>;
    const isAdmin = row.roles.split(',').includes('admin');
    if (isAdmin && admins.length === 1) return res.status(409).json({ error: 'LAST_ADMIN' });
    db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'admin_user_deleted', id, new Date().toISOString());
    res.json({ deleted: id });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Listado enriquecido de actividades (notificaciones) con leído/no leído
router.get('/notifications', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const page = parseInt((req.query.page as string) || '1', 10);
  const pageSize = Math.min(parseInt((req.query.pageSize as string) || '25', 10), 100);
  const offset = (page - 1) * pageSize;
  try {
    const activities = db.prepare(`SELECT ua.id, ua.user_id, ua.kind, ua.ref_id, ua.created_at, u.name as actor_name FROM user_activity ua JOIN users u ON ua.user_id = u.id ORDER BY ua.created_at DESC LIMIT ? OFFSET ?`).all(pageSize, offset) as Array<{id:string;user_id:string;kind:string;ref_id:string|null;created_at:string;actor_name:string}>;
    const reads = db.prepare(`SELECT activity_id FROM notification_reads WHERE user_id = ? AND activity_id IN (${activities.map(a=>`'${a.id}'`).join(',') || "''"})`).all(req.user!.sub) as Array<{activity_id:string}>;
    const readSet = new Set(reads.map(r => r.activity_id));
    res.json({ page, pageSize, items: activities.map(a => ({ id: a.id, kind: a.kind, refId: a.ref_id, createdAt: a.created_at, actor: { id: a.user_id, name: a.actor_name }, read: readSet.has(a.id) })) });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Marcar notificaciones como leídas
const readSchema = z.object({ ids: z.array(z.string().uuid()).min(1) });
router.post('/notifications/read', requireAuth, (req: AuthRequest, res) => {
  const parsed = readSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const now = new Date().toISOString();
  try {
    const insert = db.prepare(`INSERT OR IGNORE INTO notification_reads (id,user_id,activity_id,read_at) VALUES (?,?,?,?)`);
    const transaction = db.transaction((ids: string[]) => {
      for (const id of ids) insert.run(crypto.randomUUID(), req.user!.sub, id, now);
    });
    transaction(parsed.data.ids);
    res.json({ marked: parsed.data.ids });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// ---------------- Growth Plan Templates (admin) ----------------
// Nuevo esquema: motivo_id requerido, campos legacy reason/category/plan_level quedan internos (deprecated)
const tplSchema = z.object({
  motivo_id: z.string().uuid(),
  categoria_id: z.string().uuid().optional(),
  plan_id: z.string().uuid().optional(),
  step_order: z.number().int().min(1).max(50),
  title: z.string().min(3),
  description: z.string().min(5),
  recommended_resources: z.array(z.string()).optional()
});

// Normaliza valores legacy o variantes singulares/plurales para category
// Legacy normalizer mantenido por compatibilidad al actualizar filas existentes.
function normalizeCategory(_c: any): 'Cursos' | 'Eventos' | 'Discipulado' { return 'Cursos'; }

router.get('/growth-templates', requireAuth, requireRole('admin'), (_req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT id, step_order, title, description, recommended_resources, motivo_id, categoria_id, plan_id FROM growth_plan_templates ORDER BY step_order`).all() as Array<any>;
    res.json(rows.map(r => ({
      id: r.id,
      stepOrder: r.step_order,
      title: r.title,
      description: r.description,
      resources: (r.recommended_resources || '').split(',').filter(Boolean),
      motivoId: r.motivo_id || null,
      categoriaId: r.categoria_id || null,
      planId: r.plan_id || null
    })));
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});

router.post('/growth-templates', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = tplSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error:'INVALID_DATA', issues: parsed.error.issues });
  }
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    db.prepare(`INSERT INTO growth_plan_templates (id,reason,step_order,category,plan_level,title,description,recommended_resources,created_at,motivo_id,categoria_id,plan_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id,
      'deprecated', // reason legacy placeholder
      parsed.data.step_order,
      'Cursos', // categoría legacy placeholder
      null,
      parsed.data.title,
      parsed.data.description,
      (parsed.data.recommended_resources||[]).join(','),
      now,
      parsed.data.motivo_id,
      parsed.data.categoria_id || null,
      parsed.data.plan_id || null
    );
    res.status(201).json({ id });
  } catch (e:any) {
    console.error('[growth-templates:create] Error', e);
    res.status(500).json({ error:'SERVER_ERROR', detail: e?.message || 'UNKNOWN' });
  }
});

router.put('/growth-templates/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const propagate = !!req.query.propagate || req.body.propagateIncomplete === true;
  const parsed = tplSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'INVALID_DATA', issues: parsed.error.issues });
  const id = req.params.id;
  const existing = db.prepare(`SELECT * FROM growth_plan_templates WHERE id = ?`).get(id) as any;
  if (!existing) return res.status(404).json({ error:'NOT_FOUND' });
  try {
    const next = { ...existing, ...parsed.data };
    // Validar campos mínimos
    if (!next.title || !next.description) return res.status(400).json({ error:'MISSING_FIELDS' });
    db.prepare(`UPDATE growth_plan_templates SET step_order=?, title=?, description=?, recommended_resources=?, motivo_id=?, categoria_id=?, plan_id=? WHERE id = ?`).run(
      next.step_order,
      next.title,
      next.description,
      (next.recommended_resources||'').join ? next.recommended_resources.join(',') : next.recommended_resources,
      req.body.motivo_id || existing.motivo_id || null,
      req.body.categoria_id || existing.categoria_id || null,
      req.body.plan_id || existing.plan_id || null,
      id
    );
    if (propagate) {
      const upd = db.prepare(`UPDATE growth_plan_steps SET step_order=?, title=?, description=?, recommended_resources=? WHERE template_id = ? AND completed_at IS NULL`);
      upd.run(next.step_order, next.title, next.description, (next.recommended_resources||'').join ? next.recommended_resources.join(',') : next.recommended_resources, id);
    }
    res.json({ id, propagated: propagate });
  } catch (e:any) {
    console.error('[growth-templates:update] Error', e);
    res.status(500).json({ error:'SERVER_ERROR', detail: e?.message || 'UNKNOWN' });
  }
});

// Regenerar plan de crecimiento de un usuario según plantillas actuales (admin)
// Elimina pasos existentes y los vuelve a crear. No toca pasos ya completados: opcional se puede forzar.
// Regenerar plan usando sólo motivo_id (catálogo). Si usuario aún no tiene motivo_id pero tiene reason legacy, intentar mapearlo.
const regenSchema = z.object({ motivo_id: z.string().uuid().optional(), force: z.boolean().optional() });
router.post('/users/:id/regenerate-growth-plan', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = regenSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const userId = req.params.id;
  const user = db.prepare(`SELECT id, motivo_id, reason FROM users WHERE id = ?`).get(userId) as {id:string;motivo_id:string|null;reason:string|null}|undefined;
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  let motivoId = parsed.data.motivo_id || user.motivo_id;
  // Intentar mapear legacy reason -> motivo catálogo si aún no hay motivoId
  if (!motivoId && user.reason) {
    const m = db.prepare(`SELECT id FROM motivos WHERE LOWER(nombre) LIKE ?`).get(`%${user.reason.toLowerCase()}%`) as {id:string}|undefined;
    if (m) {
      motivoId = m.id;
      db.prepare(`UPDATE users SET motivo_id = ? WHERE id = ?`).run(motivoId, userId);
    }
  }
  if (!motivoId) return res.status(400).json({ error: 'NO_MOTIVO_ID' });
  try {
    if (parsed.data.motivo_id && parsed.data.motivo_id !== user.motivo_id) {
      db.prepare(`UPDATE users SET motivo_id = ? WHERE id = ?`).run(parsed.data.motivo_id, userId);
    }
    const templateRows = db.prepare(`SELECT id as template_id, step_order, title, description, recommended_resources FROM growth_plan_templates WHERE motivo_id = ? ORDER BY step_order ASC`).all(motivoId) as Array<any>;
    if (!templateRows.length) return res.status(409).json({ error: 'NO_TEMPLATES' });
    if (parsed.data.force) {
      db.prepare(`DELETE FROM growth_plan_steps WHERE user_id = ?`).run(userId);
    } else {
      db.prepare(`DELETE FROM growth_plan_steps WHERE user_id = ? AND completed_at IS NULL`).run(userId);
    }
    const now = new Date().toISOString();
    const ins = db.prepare(`INSERT INTO growth_plan_steps (id,user_id,step_order,category,title,description,recommended_resources,template_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)`);
    const tx = db.transaction(() => {
      templateRows.forEach(r => {
        ins.run(crypto.randomUUID(), userId, r.step_order, 'Cursos', r.title, r.description, (r.recommended_resources||''), r.template_id, now);
      });
    });
    tx();
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'admin_growth_plan_regenerated', userId, now);
    const steps = db.prepare(`SELECT id, step_order, category, title, description, recommended_resources, completed_at, mentor_review_status, mentor_score, mentor_comment FROM growth_plan_steps WHERE user_id = ? ORDER BY step_order ASC`).all(userId) as Array<any>;
    res.json({ userId, motivoId, steps: steps.map(s => ({ id:s.id, order:s.step_order, category:s.category, title:s.title, description:s.description, resources:(s.recommended_resources||'').split(',').filter(Boolean), completedAt: s.completed_at, reviewStatus: s.mentor_review_status || 'pending', reviewScore: s.mentor_score ?? null, reviewComment: s.mentor_comment || null })) });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

const rolesSchema = z.object({ roles: z.array(z.string()).min(1) });
router.post('/users/:id/roles', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = rolesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const userId = req.params.id;
  const existing = db.prepare(`SELECT id FROM users WHERE id = ?`).get(userId) as {id:string}|undefined;
  if (!existing) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  try {
    db.prepare(`UPDATE users SET roles = ? WHERE id = ?`).run(parsed.data.roles.join(','), userId);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'user_roles_updated', userId, new Date().toISOString());
    res.json({ id: userId, roles: parsed.data.roles });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

const resourceSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.string().min(2),
  url: z.string().url(),
  tags: z.array(z.string()).default([])
});

router.post('/resources', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = resourceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  try {
    db.prepare(`INSERT INTO resources (id,title,description,type,url,tags,published_at,created_at) VALUES (?,?,?,?,?,?,?,?)`).run(id, parsed.data.title, parsed.data.description ?? '', parsed.data.type, parsed.data.url, parsed.data.tags.join(','), now, now);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'resource_created', id, now);
    res.status(201).json({ id, ...parsed.data, publishedAt: now, createdAt: now });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.delete('/resources/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  const existing = db.prepare(`SELECT id FROM resources WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    db.prepare(`DELETE FROM resources WHERE id = ?`).run(id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'resource_deleted', id, new Date().toISOString());
    res.json({ deleted: id });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;

// ---------------- Catálogos: Motivos / Categorías / Planes ----------------

// Schemas compartidos
const baseCatalogSchema = z.object({
  nombre: z.string().min(3).max(80),
  descripcion: z.string().max(500).optional(),
  activo: z.boolean().optional()
});
const planSchema = baseCatalogSchema.extend({
  nivel: z.string().min(2).max(50).optional()
});

// Utilidad para mapear fila -> objeto JSON
function catalogRow(r: any) {
  return { id: r.id, nombre: r.nombre, descripcion: r.descripcion || '', activo: !!r.activo, createdAt: r.created_at };
}

// Motivos
router.get('/motivos', requireAuth, requireRole('admin'), (_req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM motivos ORDER BY nombre ASC`).all();
    res.json(rows.map(catalogRow));
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});
router.post('/motivos', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = baseCatalogSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO motivos (id,nombre,descripcion,activo,created_at) VALUES (?,?,?,?,?)`).run(id, parsed.data.nombre.trim(), parsed.data.descripcion || '', parsed.data.activo === false ? 0 : 1, now);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'motivo_created', id, now);
    res.status(201).json({ id });
  } catch (e:any) {
    if (e?.message?.includes('UNIQUE')) return res.status(409).json({ error: 'NAME_EXISTS' });
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});
router.put('/motivos/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = baseCatalogSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const id = req.params.id;
  const row = db.prepare(`SELECT id FROM motivos WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    const existing = db.prepare(`SELECT * FROM motivos WHERE id = ?`).get(id) as any;
    const next = { ...existing, ...parsed.data };
    db.prepare(`UPDATE motivos SET nombre=?, descripcion=?, activo=? WHERE id = ?`).run(next.nombre, next.descripcion || '', next.activo === false ? 0 : 1, id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'motivo_updated', id, new Date().toISOString());
    res.json({ id });
  } catch (e:any) {
    if (e?.message?.includes('UNIQUE')) return res.status(409).json({ error: 'NAME_EXISTS' });
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});
router.delete('/motivos/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  const row = db.prepare(`SELECT id FROM motivos WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    // Soft delete -> activo=0; bloquear si ya está inactivo
    const m = db.prepare(`SELECT activo FROM motivos WHERE id = ?`).get(id) as {activo:number};
    if (m.activo === 0) return res.json({ id, inactive: true });
    db.prepare(`UPDATE motivos SET activo=0 WHERE id = ?`).run(id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'motivo_deleted', id, new Date().toISOString());
    res.json({ id, inactive: true });
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});

// Categorías
router.get('/categorias', requireAuth, requireRole('admin'), (_req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM categorias ORDER BY nombre ASC`).all();
    res.json(rows.map(catalogRow));
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});
router.post('/categorias', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = baseCatalogSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO categorias (id,nombre,descripcion,activo,created_at) VALUES (?,?,?,?,?)`).run(id, parsed.data.nombre.trim(), parsed.data.descripcion || '', parsed.data.activo === false ? 0 : 1, now);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'categoria_created', id, now);
    res.status(201).json({ id });
  } catch (e:any) {
    if (e?.message?.includes('UNIQUE')) return res.status(409).json({ error: 'NAME_EXISTS' });
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});
router.put('/categorias/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = baseCatalogSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const id = req.params.id;
  const row = db.prepare(`SELECT id FROM categorias WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    const existing = db.prepare(`SELECT * FROM categorias WHERE id = ?`).get(id) as any;
    const next = { ...existing, ...parsed.data };
    db.prepare(`UPDATE categorias SET nombre=?, descripcion=?, activo=? WHERE id = ?`).run(next.nombre, next.descripcion || '', next.activo === false ? 0 : 1, id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'categoria_updated', id, new Date().toISOString());
    res.json({ id });
  } catch (e:any) {
    if (e?.message?.includes('UNIQUE')) return res.status(409).json({ error: 'NAME_EXISTS' });
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});
router.delete('/categorias/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  const row = db.prepare(`SELECT id FROM categorias WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    const c = db.prepare(`SELECT activo FROM categorias WHERE id = ?`).get(id) as {activo:number};
    if (c.activo === 0) return res.json({ id, inactive: true });
    db.prepare(`UPDATE categorias SET activo=0 WHERE id = ?`).run(id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'categoria_deleted', id, new Date().toISOString());
    res.json({ id, inactive: true });
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});

// Planes
router.get('/planes', requireAuth, requireRole('admin'), (_req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`SELECT * FROM planes ORDER BY nombre ASC`).all() as Array<{id:string;nombre:string;nivel:string|null;descripcion:string|null;activo:number;created_at:string}>;
    res.json(rows.map(r => ({ id: r.id, nombre: r.nombre, nivel: r.nivel || null, descripcion: r.descripcion || '', activo: !!r.activo, createdAt: r.created_at })));
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});
router.post('/planes', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO planes (id,nombre,nivel,descripcion,activo,created_at) VALUES (?,?,?,?,?,?)`).run(id, parsed.data.nombre.trim(), parsed.data.nivel || null, parsed.data.descripcion || '', parsed.data.activo === false ? 0 : 1, now);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'plan_created', id, now);
    res.status(201).json({ id });
  } catch (e:any) {
    if (e?.message?.includes('UNIQUE')) return res.status(409).json({ error: 'NAME_EXISTS' });
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});
router.put('/planes/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const parsed = planSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const id = req.params.id;
  const row = db.prepare(`SELECT id FROM planes WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    const existing = db.prepare(`SELECT * FROM planes WHERE id = ?`).get(id) as any;
    const next = { ...existing, ...parsed.data };
    db.prepare(`UPDATE planes SET nombre=?, nivel=?, descripcion=?, activo=? WHERE id = ?`).run(next.nombre, next.nivel || null, next.descripcion || '', next.activo === false ? 0 : 1, id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'plan_updated', id, new Date().toISOString());
    res.json({ id });
  } catch (e:any) {
    if (e?.message?.includes('UNIQUE')) return res.status(409).json({ error: 'NAME_EXISTS' });
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});
router.delete('/planes/:id', requireAuth, requireRole('admin'), (req: AuthRequest, res) => {
  const id = req.params.id;
  const row = db.prepare(`SELECT id FROM planes WHERE id = ?`).get(id) as {id:string}|undefined;
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  try {
    const p = db.prepare(`SELECT activo FROM planes WHERE id = ?`).get(id) as {activo:number};
    if (p.activo === 0) return res.json({ id, inactive: true });
    db.prepare(`UPDATE planes SET activo=0 WHERE id = ?`).run(id);
    db.prepare(`INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)`).run(crypto.randomUUID(), req.user!.sub, 'plan_deleted', id, new Date().toISOString());
    res.json({ id, inactive: true });
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});

