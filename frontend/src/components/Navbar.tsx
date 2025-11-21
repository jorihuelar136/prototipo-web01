import { Link, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const [solid, setSolid] = useState(false);
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
        <Link to={isAuthed ? '/dashboard' : '/'} className="font-display font-semibold text-lg text-primary-600"></Link>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {!isAuthed && (
            <>
              <Link to="/red" className="hover:text-primary-600">La Red</Link>
              <Link to="/courses" className="hover:text-primary-600">Enseñanzas</Link>
              <Link to="/events" className="hover:text-primary-600">Eventos</Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600">Acceder</Link>
              <Link to="/register" className="rounded bg-primary-600 text-white px-4 py-2 hover:bg-primary-500 shadow transition">Unete</Link>
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
                <Link to="/courses" className="block hover:text-primary-600">Enseñanzas</Link>
                <Link to="/events" className="block hover:text-primary-600">Eventos</Link>
                <Link to="/login" className="block hover:text-primary-600">Acceder</Link>
                <Link to="/register" className="inline-block rounded bg-primary-600 text-white px-4 py-2 hover:bg-primary-500 shadow transition">Regístrate</Link>
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
