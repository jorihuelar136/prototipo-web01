import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import shortsRoutes from './routes/shorts.js';
import dashboardRoutes from './routes/dashboard.js';
import growthRoutes from './routes/growth.js';
import prayerRoutes from './routes/prayer.js';
import progressRoutes from './routes/progress.js';
import adminRoutes from './routes/admin.js';
import mentoriaRoutes from './routes/mentoria.js';
import mentorRoutes from './routes/mentor.js';
import instagramRoutes from './routes/instagram.js';

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/api', contentRoutes);
app.use('/api/shorts', shortsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/prayer', prayerRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentoria', mentoriaRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/instagram', instagramRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
