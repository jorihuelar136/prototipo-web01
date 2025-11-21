import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import axios from 'axios';

interface IntranetLayoutProps { children: ReactNode }

function NotificationBell() {
  const { user, initialized } = useAuth();
  const isAdmin = !!user?.roles.includes('admin');
  const [items, setItems] = useState<Array<{id?:string;type?:string;message:string;createdAt:string;read?:boolean}>>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [marking, setMarking] = useState(false);

  async function fetchNotifications() {
    if (!initialized || !user) return; // esperar a auth inicializado
    try {
      if (isAdmin) {
        // Forzar header explícito por robustez temprana
        const res = await axios.get('/api/admin/notifications?page=1&pageSize=25', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` } });
        // Map enriched admin notifications to bell item shape
        const mapped = res.data.items.map((a:any) => ({ id: a.id, type: a.kind, message: mapAdminKind(a.kind), createdAt: a.createdAt, read: a.read }));
        setItems(mapped);
      } else {
        const res = await axios.get('/api/dashboard/notifications', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` } });
        setItems(res.data); // legacy simple
      }
      setError(null);
    } catch (e:any) {
      setError('Error');
    }
  }
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, initialized, user]);

  async function markAllRead() {
    if (!isAdmin) return;
    const unreadIds = items.filter(i => !i.read && i.id).map(i => i.id as string);
    if (unreadIds.length === 0) return;
    setMarking(true);
    try {
      await axios.post('/api/admin/notifications/read', { ids: unreadIds });
      setItems(items.map(i => ({ ...i, read: true })));
    } catch {/* ignore */} finally { setMarking(false); }
  }

  // Admin mapping for enriched kinds (fallback keeps existing simple messages)
  function mapAdminKind(kind: string) {
    switch (kind) {
      case 'user_created': return 'Nuevo usuario registrado';
      case 'admin_user_updated': return 'Datos de usuario actualizados (admin)';
      case 'admin_password_reset': return 'Password reseteado (admin)';
      case 'admin_user_deleted': return 'Usuario eliminado (admin)';
      case 'user_roles_updated': return 'Roles actualizados';
      case 'user_growth_plan_generated': return 'Plan de crecimiento generado';
      case 'growth_step_completed': return 'Paso de crecimiento completado';
      default: return `Actividad: ${kind}`;
    }
  }

  const unreadCount = isAdmin ? items.filter(i => !i.read).length : items.length;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o=>!o)} className="relative p-2 rounded-full hover:bg-gray-100" aria-label="Notificaciones">
        <span>🔔</span>
        {unreadCount > 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 rounded-full">{unreadCount}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border rounded shadow z-10">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Notificaciones</span>
            <div className="flex items-center gap-2">
              {isAdmin && <button disabled={marking || unreadCount===0} onClick={markAllRead} className="text-[10px] px-2 py-1 rounded bg-primary-600 text-white disabled:opacity-40">Leer todo</button>}
              <button onClick={() => setItems([])} className="text-[10px] text-gray-500 hover:text-gray-700">Limpiar</button>
            </div>
          </div>
          {error && <div className="p-3 text-xs text-red-600">{error}</div>}
          {items.length === 0 && !error && <div className="p-4 text-xs text-gray-500">Sin notificaciones</div>}
          {items.map((n,i) => (
            <div key={i} className={`px-3 py-2 border-b last:border-b-0 ${n.read === false ? 'bg-primary-50' : 'bg-white'}`}>
              <p className="text-xs"><span className="font-semibold">{n.message}</span></p>
              <p className="text-[10px] text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function IntranetLayout({ children }: IntranetLayoutProps) {
  const { user, logout, initialized } = useAuth();
    const MENU_MAP: Record<string,{to:string;label:string;icon:string}> = {
      dashboard: { to:'/dashboard', label:'Dashboard', icon:'\ud83c\udfe0' },
      crecimiento: { to:'/crecimiento', label:'Crecimiento', icon:'\ud83c\udf31' },
      profile: { to:'/profile', label:'Perfil', icon:'\ud83d\udc64' },
      recursos: { to:'/recursos', label:'Recursos', icon:'\ud83d\udcda' },
      miprogreso: { to:'/miprogreso', label:'Mi Progreso', icon:'\ud83d\udcc8' },
      mentoria: { to:'/mentoria', label:'Mentor\u00eda', icon:'\ud83e\udded' },
      comunidad: { to:'/comunidad', label:'Comunidad', icon:'\ud83d\udcac' },
      administracion: { to:'/administracion', label:'Administración', icon:'\u2699\ufe0f' },
      mentor_mis_mentees: { to:'/mentor', label:'Mis Mentees', icon:'\ud83e\uddd1\u200d\ud83c\udfeb' }
    };
    const allowed = user?.allowedMenus || [];
    const links = allowed.map(k => MENU_MAP[k]).filter(Boolean);
  if (!initialized) {
    return <div className="w-full flex items-center justify-center py-32 text-sm text-gray-500">Cargando sesión...</div>;
  }
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 hidden md:flex flex-col border-r border-gray-200 bg-white">
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold tracking-tight text-primary-700">Red de Hombres</h1>
          <p className="text-[11px] text-gray-500">Intranet</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span>{l.icon}</span>{l.label}
            </NavLink>
          ))}
        </nav>
        {/* Removed per new global logout design */}
      </aside>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <span className="font-semibold text-primary-700">Intranet</span>
        <div className="flex items-center gap-3 text-xs">
          <button onClick={logout} className="text-red-600">Cerrar sesión</button>
        </div>
      </div>
      <main className="flex-1 flex flex-col md:ml-0 pt-14 md:pt-0">
        <header className="hidden md:flex items-center justify-between px-6 h-16 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-[11px] text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={logout} className="px-4 py-2 text-xs rounded bg-red-600 text-white hover:bg-red-700 shadow">Cerrar sesión</button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
