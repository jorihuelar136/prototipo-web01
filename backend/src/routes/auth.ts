import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserStore } from '../models/UserStore.js';
import { signTokens, verifyToken } from '../services/token.js';
import db from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
const getRefreshStmt = db.prepare('SELECT token FROM refresh_tokens WHERE token = ?');
const deleteUserRefreshStmt = db.prepare('DELETE FROM refresh_tokens WHERE user_id = ?');

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string()
    .min(10)
    .regex(/[0-9]/, 'Debe incluir número')
    .regex(/[A-ZÁÉÍÓÚÑ]/, 'Debe incluir mayúscula')
    .regex(/[a-záéíóúñ]/, 'Debe incluir minúscula')
    .regex(/[!@#$%^&*._+-]/, 'Debe incluir símbolo'),
  phone: z.string().min(7).max(20).optional(),
  reason: z.enum(['economico','familia','vicio','crecimiento','cambio']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Comprobar disponibilidad de email (sin autenticación)
router.get('/check-email', (req: Request, res: Response) => {
  const email = (req.query.email as string || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'MISSING_EMAIL' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'INVALID_FORMAT' });
  try {
    const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as {id:string}|undefined;
    res.json({ email, available: !row });
  } catch {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  try {
  const user = await UserStore.create(parsed.data.email.toLowerCase(), parsed.data.name, parsed.data.password, parsed.data.phone, parsed.data.reason);
  try { deleteUserRefreshStmt.run(user.id); } catch {}
  const tokens = signTokens(user);
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, roles: user.roles, phone: user.phone, reason: user.reason, mentorId: user.mentorId }, ...tokens });
  } catch (e: any) {
    if (e.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'EMAIL_EXISTS' });
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const user = await UserStore.verify(parsed.data.email.toLowerCase(), parsed.data.password);
  if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  try { deleteUserRefreshStmt.run(user.id); } catch {}
  const tokens = signTokens(user);
  res.json({ user: { id: user.id, email: user.email, name: user.name, roles: user.roles }, ...tokens });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'MISSING_REFRESH' });
  try {
  const decoded = verifyToken(refreshToken) as any;
    if (decoded.type !== 'refresh') return res.status(400).json({ error: 'INVALID_REFRESH' });
  const exists = getRefreshStmt.get(refreshToken);
  if (!exists) return res.status(401).json({ error: 'REFRESH_NOT_FOUND' });
    const user = await UserStore.getById(decoded.sub);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  try { db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken); } catch {}
  const tokens = signTokens(user);
    res.json({ user: { id: user.id, email: user.email, name: user.name, roles: user.roles }, ...tokens });
  } catch (e) {
    return res.status(401).json({ error: 'INVALID_REFRESH' });
  }
});

// Debug/List users (autenticado). Útil para inspeccionar roles actuales.
router.get('/debug-users', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await UserStore.list();
    res.json(users.map(u => ({ id: u.id, email: u.email, name: u.name, roles: u.roles, createdAt: u.createdAt })));
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Promover a admin. Permite:
// - Si ya existe un admin, sólo un admin puede promover.
// - Si no existe admin aún, cualquier usuario autenticado puede auto-promoverse (bootstrap).
const promoteSchema = z.object({ userId: z.string().uuid() });
router.post('/promote-admin', requireAuth, (req: AuthRequest, res: Response) => {
  const parsed = promoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const targetId = parsed.data.userId;
  try {
    const rows = db.prepare('SELECT id,roles FROM users').all() as Array<{id:string;roles:string}>;
    const hasAdmin = rows.some(r => r.roles.split(',').includes('admin'));
    const requesterIsAdmin = (req.user!.roles || []).includes('admin');
    if (hasAdmin && !requesterIsAdmin) return res.status(403).json({ error: 'FORBIDDEN' });
    const target = rows.find(r => r.id === targetId);
    if (!target) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    const roleSet = new Set(target.roles.split(',').filter(Boolean));
    roleSet.add('admin');
    const updatedRoles = Array.from(roleSet).join(',');
    db.prepare('UPDATE users SET roles = ? WHERE id = ?').run(updatedRoles, targetId);
    res.json({ id: targetId, roles: updatedRoles.split(',') });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// Obtener perfil propio
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const row = db.prepare('SELECT id,email,name,roles,created_at,avatar,phone,reason,mentor_id FROM users WHERE id = ?').get(req.user!.sub) as any;
    if (!row) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    const roles = row.roles.split(',').filter(Boolean);
    // Obtener definición de menú para cada rol y hacer unión (Set)
  const defs = db.prepare(`SELECT name,menu_options FROM role_definitions WHERE name IN (${roles.map((r:string)=>`?`).join(',') || "''"})`).all(...roles) as Array<{name:string;menu_options:string}>;
    const menuSet = new Set<string>();
    defs.forEach(d => d.menu_options.split(',').filter(Boolean).forEach(m => menuSet.add(m)));
    const allowedMenus = Array.from(menuSet);
    res.json({ id: row.id, email: row.email, name: row.name, roles, createdAt: row.created_at, avatar: row.avatar || null, phone: row.phone || null, reason: row.reason || null, mentorId: row.mentor_id || null, allowedMenus });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

// ---- Role definitions maintenance (admin) ----
import crypto from 'crypto';
import { requireAuth as reqAuth, AuthRequest as AReq } from '../middleware/auth.js'; // already imported above but ensure types
// z ya importado arriba, no repetir
const roleSchema = z.object({
  name: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/),
  description: z.string().min(3).optional(),
  menu_options: z.array(z.string()).min(1)
});

// List roles
router.get('/roles', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const rows = db.prepare('SELECT id,name,description,menu_options,created_at FROM role_definitions ORDER BY name').all() as Array<any>;
    res.json(rows.map(r => ({ id:r.id, name:r.name, description:r.description || '', menuOptions: r.menu_options.split(',').filter(Boolean), createdAt: r.created_at })));
  } catch { res.status(500).json({ error: 'SERVER_ERROR' }); }
});

// Create role
router.post('/roles', requireAuth, async (req: AuthRequest, res: Response) => {
  // Only admin can create
  if (!req.user!.roles.includes('admin')) return res.status(403).json({ error:'FORBIDDEN' });
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'INVALID_DATA', issues: parsed.error.issues });
  try {
    const exists = db.prepare('SELECT id FROM role_definitions WHERE name = ?').get(parsed.data.name);
    if (exists) return res.status(409).json({ error:'ROLE_EXISTS' });
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO role_definitions (id,name,description,menu_options,created_at) VALUES (?,?,?,?,?)').run(id, parsed.data.name, parsed.data.description || '', parsed.data.menu_options.join(','), now);
    res.status(201).json({ id });
  } catch { res.status(500).json({ error:'SERVER_ERROR' }); }
});

// Update role
router.put('/roles/:name', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user!.roles.includes('admin')) return res.status(403).json({ error:'FORBIDDEN' });
  const name = req.params.name;
  const parsed = roleSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'INVALID_DATA', issues: parsed.error.issues });
  try {
    const row = db.prepare('SELECT id,name,description,menu_options FROM role_definitions WHERE name = ?').get(name) as any;
    if (!row) return res.status(404).json({ error:'ROLE_NOT_FOUND' });
    const next = { ...row, ...parsed.data };
    db.prepare('UPDATE role_definitions SET description = ?, menu_options = ? WHERE name = ?').run(next.description || '', (next.menu_options||row.menu_options).join ? next.menu_options.join(',') : next.menu_options, name);
    res.json({ updated:true });
  } catch { res.status(500).json({ error:'SERVER_ERROR' }); }
});

// Delete role (can't delete if in use by any user)
router.delete('/roles/:name', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user!.roles.includes('admin')) return res.status(403).json({ error:'FORBIDDEN' });
  const name = req.params.name;
  try {
    const inUse = db.prepare(`SELECT id FROM users WHERE roles LIKE ?`).all(`%${name}%`) as Array<{id:string}>;
    if (inUse.length > 0) return res.status(409).json({ error:'ROLE_IN_USE' });
    db.prepare('DELETE FROM role_definitions WHERE name = ?').run(name);
    res.json({ deleted: name });
  } catch { res.status(500).json({ error:'SERVER_ERROR' }); }
});

// Actualizar perfil (nombre, password opcional, avatar base64 opcional)
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
  avatarBase64: z.string().regex(/^data:image\/(png|jpeg|jpg);base64,/).optional()
});

router.post('/me/update', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_DATA', issues: parsed.error.issues });
  const { name, password, avatarBase64 } = parsed.data;
  if (!name && !password && !avatarBase64) return res.status(400).json({ error: 'NO_FIELDS' });
  try {
    const row = db.prepare('SELECT id,password_hash FROM users WHERE id = ?').get(req.user!.sub) as {id:string;password_hash:string}|undefined;
    if (!row) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    let newHash = row.password_hash;
    if (password) {
      newHash = await bcrypt.hash(password, 10);
    }
    const current = db.prepare('SELECT name,avatar FROM users WHERE id = ?').get(req.user!.sub) as {name:string;avatar:string|null};
    const nextName = name ?? current.name;
    const nextAvatar = avatarBase64 ?? current.avatar ?? null;
    db.prepare('UPDATE users SET name = ?, password_hash = ?, avatar = ? WHERE id = ?').run(nextName, newHash, nextAvatar, req.user!.sub);
    db.prepare('INSERT INTO user_activity (id,user_id,kind,ref_id,created_at) VALUES (?,?,?,?,?)').run(crypto.randomUUID(), req.user!.sub, 'profile_updated', req.user!.sub, new Date().toISOString());
    res.json({ id: req.user!.sub, name: nextName, avatar: nextAvatar });
  } catch (e) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;
