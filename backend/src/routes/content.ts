import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { courses, events } from '../data/content.js';

const router = Router();

router.get('/courses', requireAuth, (_req: Request, res: Response) => {
  res.json({ courses });
});

router.get('/events', requireAuth, (_req: Request, res: Response) => {
  res.json({ events });
});

export default router;
