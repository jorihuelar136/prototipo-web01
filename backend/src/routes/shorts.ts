import { Router, Request, Response } from 'express';
import { readFileSync, statSync } from 'fs';
import path from 'path';

const router = Router();

// Carga inicial del JSON (Opción C)
const dataPath = path.join(process.cwd(), 'src', 'data', 'shorts.json');
let cache: any[] = [];
let etag = '';
let lastMtime = 0;
function buildEtag(content: string, mtimeMs: number) {
  const base = Buffer.from(content).toString('base64').slice(0,16);
  return `W/"${base}-${mtimeMs}"`;
}
function loadShorts() {
  try {
    const stats = statSync(dataPath);
    const raw = readFileSync(dataPath, 'utf-8');
    cache = JSON.parse(raw);
    lastMtime = stats.mtimeMs;
    etag = buildEtag(raw, lastMtime);
  } catch (err) {
    console.error('Error cargando shorts.json', err);
  }
}
loadShorts();

router.get('/', (req: Request, res: Response) => {
  if (!cache.length) {
    return res.status(500).json({ error: 'No hay shorts disponibles' });
  }
  // Soporte ETag
  const ifNoneMatch = req.headers['if-none-match'];
  if (ifNoneMatch && ifNoneMatch === etag) {
    return res.status(304).end();
  }
  res.setHeader('ETag', etag);
  // Cache-Control: permitir cache por 5 minutos y validación condicional luego
  res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  res.json(cache);
});

export default router;
