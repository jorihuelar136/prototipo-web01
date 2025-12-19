import { Link, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const onHero = pathname === '/';
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  const { user, initialized } = useAuth();
  const isAuthed = !!user;
  // Si ya está autenticado y estamos en /login mostrar redirección inmediata sin botón "Ir al panel" visible en login.
  if (initialized && isAuthed && pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition backdrop-blur ${onHero && !solid && !isAuthed ? 'bg-transparent' : 'bg-white/90 shadow'}`}>
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        {/* Logo/Icon - Home Link */}
        <Link to={isAuthed ? '/dashboard' : '/'} className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span className="font-display font-bold text-sm md:text-base text-primary-700">RHI</span>
        </Link>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {!isAuthed && (
            <>
              <Link to="/red" className="hover:text-primary-600">La Red</Link>
              
              {/* Submenu Enseñanzas */}
              <div 
                className="relative group"
                onMouseEnter={() => setOpenSubmenu('ensenanzas')}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                <button className="hover:text-primary-600 flex items-center gap-1">
                  Enseñanzas
                  <span className="text-xs">▼</span>
                </button>
                {openSubmenu === 'ensenanzas' && (
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                    <Link to="/cursos-hombria" className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600">Cursos de Hombría</Link>
                    <Link to="/materiales" className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600">Materiales</Link>
                  </div>
                )}
              </div>
              
              {/* Submenu Eventos */}
              <div 
                className="relative group"
                onMouseEnter={() => setOpenSubmenu('eventos')}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                <button className="hover:text-primary-600 flex items-center gap-1">
                  Eventos
                  <span className="text-xs">▼</span>
                </button>
                {openSubmenu === 'eventos' && (
                  <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20">
                    <Link to="/conferencias" className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600">Conferencias</Link>
                    <Link to="/encuentros" className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600">Encuentros</Link>
                  </div>
                )}
              </div>
              
              <Link to="/unete" className="hover:text-primary-600">Únete</Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">Acceder</Link>
              <Link to="/register" className="rounded bg-primary-600 text-white px-4 py-2 hover:bg-primary-500 shadow transition">Crear Cuenta</Link>
            </>
          )}
          {isAuthed && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
                <span className="text-xs font-semibold text-primary-700">{user.name}</span>
                <span className="text-[10px] text-primary-600">{user.email}</span>
              </div>
              {/* En rutas públicas distintas a /login permitir botón para ir al panel */}
              {pathname !== '/login' && <Link to="/dashboard" className="text-xs px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-500 shadow">Panel</Link>}
            </div>
          )}
        </div>
        {/* Mobile toggle */}
        <div className="md:hidden">
          <button onClick={() => setOpen(o => !o)} className="p-2 rounded bg-primary-600 text-white focus:outline-none" aria-label="menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-white/95 backdrop-blur shadow-sm">
          <div className="px-6 pt-2 pb-6 space-y-3 text-sm font-medium">
            {!isAuthed && (
              <>
                <Link to="/red" className="block hover:text-primary-600">La Red</Link>
                <div>
                  <button onClick={() => setOpenSubmenu(openSubmenu === 'ensenanzas' ? null : 'ensenanzas')} className="w-full text-left hover:text-primary-600 flex items-center justify-between">
                    Enseñanzas
                    <span className={`text-xs transform transition ${openSubmenu === 'ensenanzas' ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openSubmenu === 'ensenanzas' && (
                    <div className="pl-4 mt-2 space-y-2 border-l border-primary-200">
                      <Link to="/cursos-hombria" className="block hover:text-primary-600">Cursos de Hombría</Link>
                      <Link to="/materiales" className="block hover:text-primary-600">Materiales</Link>
                    </div>
                  )}
                </div>
                <div>
                  <button onClick={() => setOpenSubmenu(openSubmenu === 'eventos' ? null : 'eventos')} className="w-full text-left hover:text-primary-600 flex items-center justify-between">
                    Eventos
                    <span className={`text-xs transform transition ${openSubmenu === 'eventos' ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {openSubmenu === 'eventos' && (
                    <div className="pl-4 mt-2 space-y-2 border-l border-primary-200">
                      <Link to="/conferencias" className="block hover:text-primary-600">Conferencias</Link>
                      <Link to="/encuentros" className="block hover:text-primary-600">Encuentros</Link>
                    </div>
                  )}
                </div>
                <Link to="/unete" className="block hover:text-primary-600">Únete</Link>
                <Link to="/login" className="block hover:text-primary-600">Acceder</Link>
                <Link to="/register" className="inline-block rounded bg-primary-600 text-white px-4 py-2 hover:bg-primary-500 shadow transition">Crear Cuenta</Link>
              </>
            )}
            {isAuthed && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">{user.email}</div>
                <Link to="/dashboard" className="block text-primary-600">Dashboard</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
