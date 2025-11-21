import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/UserStore.js';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

export interface Tokens { accessToken: string; refreshToken: string; }

const insertRefreshStmt = db.prepare(`INSERT INTO refresh_tokens (token,user_id,created_at) VALUES (?,?,?)`);

export function signTokens(user: User): Tokens {
  const payload = { sub: user.id, email: user.email, roles: user.roles };
  const accessToken = jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: JWT_EXPIRES as any });
  const refreshToken = jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET as jwt.Secret, { expiresIn: JWT_REFRESH_EXPIRES as any });
  try {
    insertRefreshStmt.run(refreshToken, user.id, new Date().toISOString());
  } catch (e) {
    console.error('Error guardando refresh token', e);
  }
  return { accessToken, refreshToken };
}
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
