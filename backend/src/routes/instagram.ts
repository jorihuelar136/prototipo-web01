import { Router, Request, Response } from 'express';

// Sencillo caché en memoria con TTL para evitar scrap repetido.
interface CacheEntry { imageUrl: string; expires: number; }
const cache = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 60 * 6; // 6 horas

const router = Router();

// Utilidad para validar que es un permalink de Instagram tipo /p/...
function isValidInstagramPermalink(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (!/instagram\.com$/.test(u.hostname)) return false;
    // Permite /p/, /reel/, /stories/ etc. Principalmente /p/ para posts.
    return /\/p\//.test(u.pathname) || /\/reel\//.test(u.pathname);
  } catch {
    return false;
  }
}

function extractOgImage(html: string): string | null {
  // Busca meta og:image. Evita greedy.
  const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

router.get('/image', async (req: Request, res: Response) => {
  const permalink = (req.query.url as string | undefined)?.trim();
  if (!permalink) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }
  if (!isValidInstagramPermalink(permalink)) {
    return res.status(422).json({ error: 'Invalid Instagram permalink' });
  }

  // Cache hit
  const cached = cache.get(permalink);
  if (cached && cached.expires > Date.now()) {
    return res.json({ imageUrl: cached.imageUrl, cached: true });
  }

  try {
    // Primer intento directo.
    const primaryResp = await fetch(permalink, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Referer': 'https://www.instagram.com/'
      }
    });
    let html = '';
    if (primaryResp.ok) {
      html = await primaryResp.text();
    } else {
      console.warn('[instagram:image] primary fetch failed', primaryResp.status, permalink);
    }
    let og = html ? extractOgImage(html) : null;
    // Si no encontramos og:image, segundo intento vía snapshot proxy (r.jina.ai) que devuelve HTML plano.
    if (!og) {
      const proxyUrl = `https://r.jina.ai/${permalink}`;
      try {
        const proxyResp = await fetch(proxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36'
          }
        });
        if (proxyResp.ok) {
          const proxyHtml = await proxyResp.text();
          og = extractOgImage(proxyHtml);
          if (!og) {
            console.warn('[instagram:image] proxy og:image not found');
          }
        } else {
          console.warn('[instagram:image] proxy fetch failed', proxyResp.status);
        }
      } catch (e: any) {
        console.warn('[instagram:image] proxy error', e?.message);
      }
    }
    if (!og) {
      return res.status(404).json({ error: 'og:image not found after attempts' });
    }
    cache.set(permalink, { imageUrl: og, expires: Date.now() + TTL_MS });
    return res.json({ imageUrl: og, cached: false });
  } catch (e: any) {
    console.error('[instagram:image] unexpected error', e);
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
});

export default router;