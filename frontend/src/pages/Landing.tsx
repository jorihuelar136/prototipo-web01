import { useEffect, useRef, useState } from 'react';

// Imágenes hero centradas en Jesucristo / discipulado masculino (rutas locales)
const heroImages = [
  {
    url: '/hero/hero1.jpg',
    alt: 'Cruz iluminada al amanecer frente al mar',
    verse: 'Velad, estad firmes en la fe; portaos varonilmente, y esforzaos. Todas vuestras cosas sean hechas con amor.',
    reference: '1 Corintios 16:13-14'
  },
  {
    url: '/hero/hero2.jpg',
    alt: 'Círculo de hombres orando juntos con Biblias abiertas',
    verse: 'Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.',
    reference: 'Proverbios 27:17'
  },
  {
    url: '/hero/hero3.jpg',
    alt: 'Hombre contemplando una cruz en la cima de una montaña',
    verse: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.',
    reference: 'Josué 1:9'
  },
  {
    url: '/hero/hero4.jpg',
    alt: 'Grupo de hombres estudiando la Biblia en mesa de madera',
    verse: 'Lo que has oído de mí ante muchos testigos, esto encarga a hombres fieles que sean idóneos para enseñar también a otros.',
    reference: '2 Timoteo 2:2'
  }
];

// Configuración centralizada del hero para facilitar ajustes
const HERO_ROTATION_MS = 7000; // duración de cada slide
const HERO_TRANSITION_MS = 1600; // coincide con duration fade para suavidad
const HERO_PROGRESS_OFFSET = 200; // ms de margen para reinicio visual

export default function Landing() {
  const [current, setCurrent] = useState(0);
  // Eliminado estado de pausa: siempre rota independientemente del cursor
  const [loadedHero, setLoadedHero] = useState<boolean[]>(() => heroImages.map(() => false)); // estado blur
  const progressRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  // Toggle entre vista de galería (imágenes derivadas) y embeds oficiales.
  const [showEmbeds, setShowEmbeds] = useState(false);

  // Rotación automática + barra de progreso suave usando rAF
  useEffect(() => {
    let cancelled = false;
    startTimeRef.current = performance.now();
    const animate = () => {
      if (cancelled) return;
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const ratio = Math.min(1, elapsed / HERO_ROTATION_MS);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${ratio})`;
      }
      if (elapsed >= HERO_ROTATION_MS + HERO_PROGRESS_OFFSET) {
        setCurrent(c => (c + 1) % heroImages.length);
        startTimeRef.current = performance.now();
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { cancelled = true; if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [current]);

  // Eliminados controles manuales (prev/next) para una experiencia limpia de rotación automática.
  // Si se requieren nuevamente, pueden reactivarse restaurando los handlers prev/next.
  const handleLoad = (idx: number) => {
    setLoadedHero(arr => {
      const next = [...arr];
      next[idx] = true;
      return next;
    });
  };
  return (
    <div className="flex flex-col">
      {/* Hero Slideshow (imágenes a la izquierda, contenido a la derecha) */}
      <section
        className="relative w-full text-white overflow-hidden min-h-[70vh] sm:min-h-[80vh] md:min-h-[90vh] lg:min-h-[95vh] pb-0"
      >
        {/* Slides full-bleed */}
        {heroImages.map((img, i) => (
          <div
            key={img.url}
            className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${i === current ? 'opacity-100' : 'opacity-0'} select-none`}
            aria-hidden={i !== current}
          >
            <img
              src={img.url}
              alt={img.alt}
              className={`w-full h-full object-cover object-center transition-transform duration-[2400ms] ${i === current ? 'scale-100' : 'scale-105'} ${loadedHero[i] ? 'blur-0' : 'blur-md scale-[102%]'}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              onLoad={() => handleLoad(i)}
              draggable={false}
            />
            {/* Degradiente lateral más enfocado para preservar color de la imagen */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 via-30% to-transparent" />
          </div>
        ))}
        {/* Overlay contenido alineado a la izquierda */}
        <div className="absolute inset-0 flex flex-col justify-end pb-40 md:pb-20">
          <div className="relative h-auto">
            <div className="mx-auto px-6 flex">
              <div className="w-full max-w-xl md:max-w-lg lg:max-w-2xl pr-0 md:pr-6 animate-[fadeSlide_0.9s_ease] bg-black/35 md:bg-black/30 backdrop-blur-sm rounded-2xl px-5 md:px-6 py-6 ring-1 ring-white/10 shadow-lg shadow-black/40 relative z-10">
                <h1 className="font-display text-4xl max-[360px]:text-3xl sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tight drop-shadow-lg">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-200 via-white to-primary-100">Red de Hombres</span>
                  <span className="block text-primary-300 max-[360px]:text-[2.1rem]">INVENCIBLE</span>
                </h1>
                <p className="mt-5 md:mt-6 font-slab text-base max-[360px]:text-[15px] sm:text-lg md:text-xl text-white/90 leading-relaxed md:max-w-lg">
                  Formando Hombres en Semejanza a Cristo.
                </p>
                <div className="mt-6 md:mt-7 flex flex-col sm:flex-row gap-4">
                  <a href="/register" className="rounded-lg bg-primary-600 hover:bg-primary-500 px-8 py-4 font-medium text-lg shadow-lg shadow-black/40 transition focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-black">Comenzar Ahora</a>
                  <a href="#vision" className="rounded-lg bg-white/10 backdrop-blur border border-white/25 px-8 py-4 font-medium text-lg hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-black">Áreas Clave</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Keyframes inline */}
        <style>{`@keyframes fadeSlide {from {opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }`}</style>
      </section>

      {/* Barra de versículo bíblico - debajo del hero */}
      <div className="relative w-full bg-gradient-to-b from-black/50 via-black/80 to-black/80 px-4 sm:px-6 py-8 text-white">
        <div className="backdrop-blur-sm bg-black/55 border-t border-white/10 px-4 sm:px-6 py-4 flex flex-col items-start" aria-live="polite">
          <p className="font-slab text-base max-[360px]:text-[14px] sm:text-lg md:text-lg lg:text-xl italic leading-relaxed text-white/90 w-full break-words">"{heroImages[current].verse}"</p>
          <p className="mt-2 text-[10px] md:text-[11px] tracking-wide text-primary-200 font-semibold uppercase">{heroImages[current].reference}</p>
        </div>
        {/* Barra de progreso */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div ref={progressRef} className="h-full origin-left bg-gradient-to-r from-primary-400 via-primary-300 to-primary-200 transition-transform will-change-transform" style={{transform:'scaleX(0)'}} />
        </div>
      </div>

      {/* Separador claro entre Hero y CTA (espacio en blanco) */}
  <div className="w-full bg-white h-14 md:h-20" aria-hidden="true" />

      {/* CTA Inmediata */}
      <section className="bg-primary-600 py-16 relative shadow-xl shadow-primary-900/20">
        <div className="mx-auto max-w-5xl px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 tracking-tight">SÉ PARTE DE LA RED</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto font-slab text-lg">Accede a formación, mentoría, eventos y comunidad privada enfocada en reflejar a Cristo.</p>
          <a href="/register" className="inline-block rounded bg-white text-primary-700 font-semibold px-10 py-4 shadow hover:shadow-lg transition">Crear Cuenta</a>
        </div>
      </section>

      {/* Value Props */}
      <section id="vision" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 text-center mb-12">Áreas Clave</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueCards.map(c => (
              <div key={c.title} className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition p-7">
                <div className="text-primary-600 mb-4 text-3xl drop-shadow-sm">{c.icon}</div>
                <h3 className="font-slab font-semibold text-lg mb-3 tracking-wide group-hover:text-primary-600 transition">{c.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-sans">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Keyframes inline */}
        <style>{`@keyframes fadeSlide {from {opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }`}</style>
      </section>

      {/* Testimonios dinámicos */}
      <Testimonios />

      {/* Galería Inspiracional dinámica desde permalinks de Instagram + opción de ver embeds */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700 text-center mb-8">Momentos de Hermandad y Servicio</h2>
          <div className="flex justify-center gap-3 mb-10">
            <button
              onClick={() => setShowEmbeds(false)}
              className={`px-4 py-2 rounded text-xs font-medium border transition ${!showEmbeds ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-primary-700 border-primary-300 hover:bg-primary-50'}`}
            >Galería</button>
            <button
              onClick={() => setShowEmbeds(true)}
              className={`px-4 py-2 rounded text-xs font-medium border transition ${showEmbeds ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-primary-700 border-primary-300 hover:bg-primary-50'}`}
            >Instagram</button>
          </div>
          {showEmbeds ? <InstagramEmbeds /> : <InstagramGallery />}
          <p className="mt-8 text-center text-[11px] text-gray-500">Si algún embed no aparece, puede deberse a políticas de Instagram o bloqueo temporal; prueba la vista Galería.</p>
        </div>
      </section>

    </div>
  );
}

const valueCards = [
  { title: 'Formación Bíblica', desc: 'Cursos y recursos para profundizar en la Palabra y aplicarla diariamente.', icon: '📖' },
  { title: 'Liderazgo Servicial', desc: 'Desarrolla habilidades de influencia humilde y liderazgo transformador.', icon: '🛠️' },
  { title: 'Mentoría y Hermandad', desc: 'Acompañamiento fraterno, grupos pequeños y apoyo en desafíos personales.', icon: '🤝' },
  { title: 'Bienestar Integral', desc: 'Enfoque en salud emocional, física y espiritual para un equilibrio sostenible.', icon: '🌿' }
];


// Lista de permalinks Instagram. Se resolverán a imagen real vía /api/instagram/image.
const instagramPermalinks = [
  'https://www.instagram.com/p/DO2Y_fSjCle/?img_index=1',
  'https://www.instagram.com/p/DM0SZffxmKt/?img_index=1',
  'https://www.instagram.com/p/DMv9GrYxuQG/?img_index=1',
  'https://www.instagram.com/p/DF5uF6cxKZZ/?img_index=1',
  'https://www.instagram.com/p/DH1lZVpRudd/',
  'https://www.instagram.com/p/DKr_gJsxSPz/?img_index=1'
];

interface ResolvedImage { permalink: string; imageUrl: string; }

// Lista de nombres esperados en public/galeria (ver README en esa carpeta)
const localGalleryImages = [
  { file: 'foto1.jpg', alt: 'Momento de hermandad 1' },
  { file: 'foto2.jpg', alt: 'Momento de hermandad 2' },
  { file: 'foto3.jpg', alt: 'Momento de hermandad 3' },
  { file: 'foto4.jpg', alt: 'Momento de hermandad 4' },
  { file: 'foto5.jpg', alt: 'Momento de hermandad 5' },
  { file: 'foto6.jpg', alt: 'Momento de hermandad 6' }
];

function InstagramGallery() {
  // Versión con imagen completa (sin recorte). Usamos object-contain dentro de un contenedor con relación 4/5.
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {localGalleryImages.map(img => (
        <figure
          key={img.file}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative w-full aspect-[4/5] flex items-center justify-center bg-white">
            <img
              src={`/galeria/${img.file}`}
              alt={img.alt}
              loading="lazy"
              className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-[1.04]"
              onError={(e) => { e.currentTarget.classList.add('opacity-50'); }}
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          </div>
          <figcaption className="absolute left-0 right-0 bottom-0 px-4 py-2 flex items-center justify-between text-[11px] tracking-wide">
            <span className="inline-flex items-center gap-1 font-medium text-white drop-shadow-sm bg-black/40 backdrop-blur px-2 py-1 rounded-md">
              {img.alt}
            </span>
          </figcaption>
          <div className="absolute -inset-px rounded-2xl ring-1 ring-transparent group-hover:ring-primary-300/60 transition" />
        </figure>
      ))}
    </div>
  );
}

// Embeds oficiales de Instagram usando blockquote + script. Requiere que el permalink sea válido y público.
function InstagramEmbeds() {
  const [processed, setProcessed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Carga del script de Instagram si no existe; luego procesa embeds.
    const ensureScript = () => {
      return new Promise<void>((resolve) => {
        if (document.getElementById('instagram-embed-script')) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.id = 'instagram-embed-script';
        s.src = 'https://www.instagram.com/embed.js';
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve(); // Incluso si falla, resolvemos para evitar bloqueo.
        document.body.appendChild(s);
      });
    };

    (async () => {
      await ensureScript();
      // Espera breve para permitir inyección inicial.
      setTimeout(() => {
        try {
          if ((window as any).instgrm?.Embeds) {
            (window as any).instgrm.Embeds.process();
            if (!cancelled) setProcessed(true);
          }
        } catch (e) {
          if (!cancelled) setErrorCount(c => c + 1);
        } finally {
          if (!cancelled) setLoading(false);
        }
      }, 50);
    })();
    return () => { cancelled = true; };
  }, [instagramPermalinks.join('|')]);

  return (
    <div>
      {loading && (
        <div className="grid md:grid-cols-2 gap-6 mb-6 animate-pulse">
          {instagramPermalinks.slice(0,4).map(p => (
            <div key={p} className="h-96 w-full rounded-xl bg-gray-200" />
          ))}
        </div>
      )}
      {!loading && errorCount > 0 && (
        <div className="mb-4 text-center text-[11px] text-amber-600">Algunos embeds pueden no cargarse (privacidad o restricciones). Usa la vista Galería si faltan.</div>
      )}
      <div className="grid md:grid-cols-2 gap-8">
        {instagramPermalinks.map(p => (
          <div key={p} className="flex flex-col items-center">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={p}
              data-instgrm-version="14"
              style={{ background: '#fff', border: 0, margin: 0, padding: 0, width: '100%', maxWidth: '540px' }}
            />
            <a
              href={p}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-[10px] text-primary-600 hover:underline"
            >Ver en Instagram</a>
          </div>
        ))}
      </div>
      {!processed && !loading && (
        <div className="mt-4 text-center text-[10px] text-gray-500">Script de embed no procesó automáticamente; intenta recargar la página.</div>
      )}
    </div>
  );
}

// (fallbackImages eliminadas: ahora usamos sólo archivos locales en /public/galeria)

function Testimonios() {
  const testimonios = [
    { quote: 'Encontré hermanos que me retan a crecer y me acompañan en cada batalla. No camino solo.', author: 'Miembro de la Red' },
    { quote: 'El liderazgo servicial que aprendí aquí transformó mi familia y mi trabajo.', author: 'Participante Programa Liderazgo' },
    { quote: 'La mentoría cambió mi perspectiva: ahora discipulo a otros.', author: 'Mentor Activo' }
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const id = setInterval(() => setIdx(i => (i + 1) % testimonios.length), 7000); return () => clearInterval(id); }, []);
  return (
    <section className="bg-gradient-to-br from-primary-50 to-white py-24">
      <div className="mx-auto max-w-4xl px-6 text-center relative">
        {testimonios.map((t, i) => (
          <div key={i} className={`transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0 absolute inset-0'}`} aria-hidden={i !== idx}>
            <blockquote className="text-xl md:text-2xl font-medium text-gray-700 italic mb-6 max-w-3xl mx-auto">
              “{t.quote}”
            </blockquote>
            <p className="text-sm text-gray-500">— {t.author}</p>
          </div>
        ))}
        <div className="mt-10 flex justify-center gap-2">
          {testimonios.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-primary-600' : 'bg-primary-200 hover:bg-primary-400'} transition`} aria-label={`Testimonio ${i+1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Componente tira de shorts estilo grid sin scroll horizontal

