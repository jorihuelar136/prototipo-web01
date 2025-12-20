import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { localShorts, ShortItem } from '../data/shorts';
import VideoModal from './VideoModal';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';
  const [shorts, setShorts] = useState<ShortItem[]>(localShorts);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [openShort, setOpenShort] = useState<ShortItem | null>(null);
  const [thumbLoaded, setThumbLoaded] = useState<Record<string, boolean>>({});

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/shorts');
        if (!resp.ok) throw new Error('No se pudo obtener shorts');
        const data = await resp.json();
        if (!cancelled && Array.isArray(data) && data.length) setShorts(data);
      } catch (e: any) {
        // Mantener shorts locales en caso de error
      } finally {
        if (!cancelled) setLoadingRemote(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <footer className="bg-gray-950 text-white pt-12 pb-12">
      <div className="mx-auto max-w-6xl px-6">
        {isHome ? (
          <>
            {/* Back to Top Button */}
            <div className="flex justify-end mb-8">
              <button
                onClick={scrollToTop}
                aria-label="Ir al inicio"
                className="p-3 rounded-full bg-primary-600 hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                </svg>
              </button>
            </div>

            {/* Tira de Shorts */}
            <div className="mb-20">
              <h3 className="font-display text-xl mb-4">Shorts / Clips</h3>
              <p className="text-xs text-gray-400 mb-3">Momentos rápidos de formación y exhortación. Haz clic para reproducir sin salir de la página.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {shorts.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setOpenShort(s)}
                    className="group relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label={`Reproducir ${s.title}`}
                  >
                    {!thumbLoaded[s.id] && (
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700" />
                    )}
                    <img
                      src={`https://img.youtube.com/vi/${s.videoId}/hqdefault.jpg`}
                      alt={s.title}
                      onLoad={() => setThumbLoaded(prev => ({ ...prev, [s.id]: true }))}
                      className={`h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${thumbLoaded[s.id] ? 'opacity-100' : 'opacity-0'}`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white/90 drop-shadow-sm text-left overflow-hidden">
                      {s.title}
                    </span>
                    <span className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-white/15 backdrop-blur p-1 text-white shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M10 8l6 4-6 4V8z"/></svg>
                    </span>
                  </button>
                ))}
              </div>
              {!loadingRemote && <VideoModal short={openShort} onClose={() => setOpenShort(null)} />}
            </div>

            {/* Grid de 4 columnas (menu completo) */}
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              {/* Sedes */}
              <div>
                <h3 className="font-display text-lg mb-4 text-primary-400">Sedes RHI</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><Link to="/sedes?pais=peru" className="hover:text-primary-400 transition">Perú</Link></li>
                  <li><Link to="/sedes?pais=mexico" className="hover:text-primary-400 transition">México</Link></li>
                  <li><Link to="/sedes?pais=venezuela" className="hover:text-primary-400 transition">Venezuela</Link></li>
                  <li><Link to="/sedes?pais=bolivia" className="hover:text-primary-400 transition">Bolivia</Link></li>
                </ul>
              </div>

              {/* Recursos */}
              <div>
                <h3 className="font-display text-lg mb-4 text-primary-400">Recursos</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-primary-400 transition">Prédicas</a></li>
                  <li><Link to="/ensenanzas" className="hover:text-primary-400 transition">Enseñanzas</Link></li>
                  <li><Link to="/cursos-hombria" className="hover:text-primary-400 transition">Cursos</Link></li>
                  <li><Link to="/materiales" className="hover:text-primary-400 transition">Materiales</Link></li>
                </ul>
              </div>

              {/* Contactos */}
              <div>
                <h3 className="font-display text-lg mb-4 text-primary-400">Contactos</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="mailto:info@redhombres.org" className="hover:text-primary-400 transition">Envía un mensaje</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Invita a RHI a tu evento</a></li>
                  <li><Link to="/unete" className="hover:text-primary-400 transition">Únete a la comunidad</Link></li>
                </ul>
              </div>

              {/* Servicios */}
              <div>
                <h3 className="font-display text-lg mb-4 text-primary-400">Servicios</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><a href="#" className="hover:text-primary-400 transition">Ayuda Social</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Consejería Familiar</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Asesorías Profesionales</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition">Haz una donación</a></li>
                </ul>
              </div>
            </div>
          </>
        ) : null}
        {/* full menu only appears above when isHome is true */}

        {/* Social Links */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <p className="text-sm text-gray-400 mb-4">Conecta con nosotros</p>
          <div className="flex gap-4">
            <a href="https://www.youtube.com/channel/UCBCOOT3I47Qiy47Dlb2cGug" aria-label="YouTube" className="p-2 rounded bg-white/10 hover:bg-primary-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M10 15l5.19-3L10 9v6z"/><path d="M21.8 8s-.2-1.43-.82-2.06c-.78-.82-1.66-.82-2.06-.87C16.41 5 12 5 12 5h0s-4.41 0-6.92.07c-.4.05-1.28.05-2.06.87C2.4 6.57 2.2 8 2.2 8S2 9.57 2 11.14v1.72c0 1.57.2 3.14.2 3.14s.2 1.43.82 2.06c.78.82 1.8.8 2.26.9 1.64.16 6.72.21 6.72.21s4.42-.01 6.93-.08c.4-.05 1.28-.05 2.06-.87.62-.63.82-2.06.82-2.06s.2-1.57.2-3.14v-1.72C22 9.57 21.8 8 21.8 8z"/></svg>
            </a>
            <a href="https://www.facebook.com/reddehombresiwp/" aria-label="Facebook" className="p-2 rounded bg-white/10 hover:bg-primary-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.79c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 17 22 12z"/></svg>
            </a>
            <a href="https://www.instagram.com/reddehombresiwp/" aria-label="Instagram" className="p-2 rounded bg-white/10 hover:bg-primary-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10z"/><circle cx="12" cy="12" r="3.2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 text-xs text-gray-400 flex flex-col sm:flex-row justify-between gap-4">
          <span>© {new Date().getFullYear()} Red de Hombres Invencible. Todos los derechos reservados.</span>
          <span>Hombría es semejanza a Cristo.</span>
        </div>
      </div>
    </footer>
  );
}
