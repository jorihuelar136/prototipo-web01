import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.js';

export interface AuthRequest extends Request {
  user?: { sub: string; email: string; roles: string[] };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // @ts-ignore - headers type until types installed
  const auth = (req as any).headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  try {
    const token = auth.substring(7);
    const decoded = verifyToken(token) as any;
    // roles puede venir como string 'user,admin' o array; normalizar a array
    const rawRoles = decoded.roles;
    const rolesArray = Array.isArray(rawRoles)
      ? rawRoles.filter(Boolean)
      : (typeof rawRoles === 'string' ? rawRoles.split(',').map((r:string)=>r.trim()).filter(Boolean) : []);
    req.user = { sub: decoded.sub, email: decoded.email, roles: rolesArray };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHORIZED' });
    const has = req.user.roles.some(r => roles.includes(r));
    if (!has) return res.status(403).json({ error: 'FORBIDDEN', needed: roles });
    next();
  };
}
