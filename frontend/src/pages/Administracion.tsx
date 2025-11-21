import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface AdminUser { id:string; email:string; name:string; roles:string[]; createdAt:string; avatar?:string|null; reason?:string|null; phone?:string|null; motivoId?:string|null; categoriaId?:string|null; planId?:string|null }
interface Template { id:string; motivoId?:string|null; categoriaId?:string|null; planId?:string|null; stepOrder:number; title:string; description:string; resources:string[] }
interface CatalogItem { id:string; nombre:string; descripcion:string; activo:boolean; createdAt:string; nivel?:string|null }

const REASONS = [
  { value:'economico', label:'Económico' },
  { value:'familia', label:'Familia' },
  { value:'vicio', label:'Vicio' },
  { value:'crecimiento', label:'Crecimiento' },
  { value:'cambio', label:'Cambio' }
];

export default function Administracion() {
  const { user } = useAuth();
  // Toast notifications
  const [toasts, setToasts] = useState<Array<{id:number; type:'success'|'error'|'info'; message:string}>>([]);
  function pushToast(type:'success'|'error'|'info', message:string) {
    const id = Date.now()+Math.random();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }
  // Confirm modal
  const [confirmState, setConfirmState] = useState<null | { message:string; onConfirm:() => void; confirmLabel?:string; cancelLabel?:string }>(null);
  function openConfirm(message:string, onConfirm:()=>void, confirmLabel='Confirmar', cancelLabel='Cancelar') { setConfirmState({ message, onConfirm, confirmLabel, cancelLabel }); }
  function closeConfirm() { setConfirmState(null); }
  const [section, setSection] = useState<'usuarios'|'plantillas'|'roles'|'motivos'|'categorias'|'planes'>('usuarios');
  const [rolesDef, setRolesDef] = useState<Array<{id:string;name:string;description:string;menuOptions:string[]}>>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [roleForm, setRoleForm] = useState({ name:'', description:'', menuOptions:[] as string[], isEditing:false });
  const MENU_OPTIONS = ['dashboard','crecimiento','profile','recursos','miprogreso','mentoria','comunidad','administracion','mentor_mis_mentees'];
  async function loadRoles() {
    setLoadingRoles(true);
    try { const r = await axios.get('/auth/roles'); setRolesDef(r.data); } catch {} finally { setLoadingRoles(false); }
  }
  useEffect(()=>{ if (user?.roles.includes('admin')) loadRoles(); },[user]);
  // Usuarios
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string|null>(null);
  const [selected, setSelected] = useState<AdminUser|null>(null);
  const [pwd, setPwd] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [updatingRoles, setUpdatingRoles] = useState(false);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
      setUsersError(null);
    } catch { setUsersError('Error cargando usuarios'); } finally { setLoadingUsers(false); }
  }
  useEffect(() => { if (user?.roles.includes('admin')) loadUsers(); }, [user]);

  async function loadUserDetail(id:string) {
    try { const r = await axios.get(`/api/admin/users/${id}`); if (selected && selected.id === id) { setSelected(r.data); setEditPhone(r.data.phone || ''); } } catch {}
  }

  async function updateRoles(id:string, roles:string[]) {
    setUpdatingRoles(true);
    try {
      await axios.post(`/api/admin/users/${id}/roles`, { roles });
      await loadUsers();
      pushToast('success','Roles actualizados');
    } catch (e:any) {
      pushToast('error', e?.response?.data?.error || 'Error actualizando roles');
    } finally { setUpdatingRoles(false); }
  }

  async function resetPassword(id:string) {
    if (!pwd) { pushToast('error','Ingresa un password temporal'); return; }
    try {
      await axios.post(`/api/admin/users/${id}/reset-password`, { password: pwd });
      pushToast('success','Password reseteado');
      setPwd('');
    } catch (e:any) { pushToast('error', e?.response?.data?.error || 'Error al resetear'); }
  }

  async function deleteUser(id:string) {
    openConfirm('¿Eliminar usuario? Esta acción es permanente.', async () => {
      try {
        await axios.delete(`/api/admin/users/${id}`);
        await loadUsers();
        if (selected?.id === id) setSelected(null);
        pushToast('success','Usuario eliminado');
      } catch (e:any) { pushToast('error', e?.response?.data?.error || 'Error eliminando usuario'); }
    }, 'Eliminar', 'Cancelar');
  }

  // Plantillas
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplError, setTplError] = useState<string|null>(null);
  const [editingTpl, setEditingTpl] = useState<Template|null>(null);
  const [formTpl, setFormTpl] = useState({ stepOrder:1, title:'', description:'', resources:'', motivoId:'', categoriaId:'', planId:'' });
  const [savingTpl, setSavingTpl] = useState(false);

  async function loadTemplates() {
    setTplLoading(true);
    try {
      const res = await axios.get('/api/admin/growth-templates');
      setTemplates(res.data.map((r:any)=>({
        id: r.id,
        stepOrder: r.stepOrder,
        title: r.title,
        description: r.description,
        resources: r.resources,
        motivoId: r.motivoId || null,
        categoriaId: r.categoriaId || null,
        planId: r.planId || null
      })));
      setTplError(null);
    } catch { setTplError('Error cargando plantillas'); } finally { setTplLoading(false); }
  }
  useEffect(() => { if (user?.roles.includes('admin')) loadTemplates(); }, [user]);

  function resetTplForm() { setFormTpl({ stepOrder:1, title:'', description:'', resources:'', motivoId:'', categoriaId:'', planId:'' }); setEditingTpl(null); }

  async function saveTemplate(e:React.FormEvent) {
    e.preventDefault(); setSavingTpl(true);
    try {
  const payload:any = { reason: 'economico', step_order: formTpl.stepOrder, category: 'Cursos', plan_level: 'Plan básico', title: formTpl.title, description: formTpl.description, recommended_resources: formTpl.resources.split(',').map(s=>s.trim()).filter(Boolean) };
  payload.motivo_id = formTpl.motivoId || null;
  payload.categoria_id = formTpl.categoriaId || null;
  payload.plan_id = formTpl.planId || null;
      if (editingTpl) {
        const r = await axios.put(`/api/admin/growth-templates/${editingTpl.id}`, payload);
        pushToast('success','Plantilla actualizada');
        if (r.data?.detail) pushToast('info', r.data.detail);
      } else {
        const r = await axios.post('/api/admin/growth-templates', payload);
        pushToast('success','Plantilla creada');
        if (r.data?.detail) pushToast('info', r.data.detail);
      }
      await loadTemplates(); resetTplForm();
    } catch (e:any) {
      pushToast('error', e?.response?.data?.detail || e?.response?.data?.error || 'Error guardando plantilla');
    } finally { setSavingTpl(false); }
  }

  async function deleteTemplate(id:string) {
    openConfirm('¿Eliminar plantilla?', async () => {
      try {
        await axios.delete(`/api/admin/growth-templates/${id}`);
        await loadTemplates();
        pushToast('success','Plantilla eliminada');
      } catch (e:any) { pushToast('error', e?.response?.data?.error || 'Error eliminando'); }
    }, 'Eliminar', 'Cancelar');
  }

  // ----------------- Catálogos: Motivos / Categorías / Planes -----------------
  // Motivos
  const [motivos, setMotivos] = useState<CatalogItem[]>([]);
  const [motivoLoading, setMotivoLoading] = useState(false);
  const [motivoError, setMotivoError] = useState<string|null>(null);
  const [motivoForm, setMotivoForm] = useState<{ id?:string; nombre:string; descripcion:string; activo:boolean }>({ nombre:'', descripcion:'', activo:true });
  const [savingMotivo, setSavingMotivo] = useState(false);
  async function loadMotivos() {
    setMotivoLoading(true);
    try {
      const res = await axios.get('/api/admin/motivos');
      setMotivos(res.data);
      setMotivoError(null);
    } catch { setMotivoError('Error cargando motivos'); } finally { setMotivoLoading(false); }
  }
  function resetMotivoForm(){ setMotivoForm({ id:undefined, nombre:'', descripcion:'', activo:true }); }
  async function saveMotivo(e:React.FormEvent){ e.preventDefault(); if(!motivoForm.nombre.trim()) { pushToast('error','Nombre requerido'); return; } setSavingMotivo(true); try {
    const payload = { nombre:motivoForm.nombre.trim(), descripcion:motivoForm.descripcion, activo:motivoForm.activo };
    if (motivoForm.id) { await axios.put(`/api/admin/motivos/${motivoForm.id}`, payload); pushToast('success','Motivo actualizado'); }
    else { await axios.post('/api/admin/motivos', payload); pushToast('success','Motivo creado'); }
    await loadMotivos(); resetMotivoForm();
  } catch(e:any){ pushToast('error', e?.response?.data?.error || 'Error guardando motivo'); } finally { setSavingMotivo(false); } }
  async function deleteMotivo(id:string){ openConfirm('¿Desactivar motivo?', async ()=>{ try { await axios.delete(`/api/admin/motivos/${id}`); await loadMotivos(); pushToast('success','Motivo desactivado'); } catch(e:any){ pushToast('error', e?.response?.data?.error || 'Error'); } }, 'Desactivar', 'Cancelar'); }

  // Categorías
  const [categorias, setCategorias] = useState<CatalogItem[]>([]);
  const [categoriaLoading, setCategoriaLoading] = useState(false);
  const [categoriaError, setCategoriaError] = useState<string|null>(null);
  const [categoriaForm, setCategoriaForm] = useState<{ id?:string; nombre:string; descripcion:string; activo:boolean }>({ nombre:'', descripcion:'', activo:true });
  const [savingCategoria, setSavingCategoria] = useState(false);
  async function loadCategorias(){ setCategoriaLoading(true); try { const res = await axios.get('/api/admin/categorias'); setCategorias(res.data); setCategoriaError(null);} catch { setCategoriaError('Error cargando categorías'); } finally { setCategoriaLoading(false);} }
  function resetCategoriaForm(){ setCategoriaForm({ id:undefined, nombre:'', descripcion:'', activo:true }); }
  async function saveCategoria(e:React.FormEvent){ e.preventDefault(); if(!categoriaForm.nombre.trim()){ pushToast('error','Nombre requerido'); return; } setSavingCategoria(true); try { const payload={ nombre:categoriaForm.nombre.trim(), descripcion:categoriaForm.descripcion, activo:categoriaForm.activo }; if(categoriaForm.id){ await axios.put(`/api/admin/categorias/${categoriaForm.id}`, payload); pushToast('success','Categoría actualizada'); } else { await axios.post('/api/admin/categorias', payload); pushToast('success','Categoría creada'); } await loadCategorias(); resetCategoriaForm(); } catch(e:any){ pushToast('error', e?.response?.data?.error || 'Error guardando categoría'); } finally { setSavingCategoria(false); } }
  async function deleteCategoria(id:string){ openConfirm('¿Desactivar categoría?', async ()=>{ try { await axios.delete(`/api/admin/categorias/${id}`); await loadCategorias(); pushToast('success','Categoría desactivada'); } catch(e:any){ pushToast('error', e?.response?.data?.error || 'Error'); } }, 'Desactivar', 'Cancelar'); }

  // Planes
  const [planes, setPlanes] = useState<CatalogItem[]>([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string|null>(null);
  const [planForm, setPlanForm] = useState<{ id?:string; nombre:string; nivel:string; descripcion:string; activo:boolean }>({ nombre:'', nivel:'', descripcion:'', activo:true });
  const [savingPlan, setSavingPlan] = useState(false);
  async function loadPlanes(){ setPlanLoading(true); try { const res = await axios.get('/api/admin/planes'); setPlanes(res.data); setPlanError(null);} catch { setPlanError('Error cargando planes'); } finally { setPlanLoading(false);} }
  function resetPlanForm(){ setPlanForm({ id:undefined, nombre:'', nivel:'', descripcion:'', activo:true }); }
  async function savePlan(e:React.FormEvent){ e.preventDefault(); if(!planForm.nombre.trim()){ pushToast('error','Nombre requerido'); return; } setSavingPlan(true); try { const payload={ nombre:planForm.nombre.trim(), nivel:planForm.nivel||undefined, descripcion:planForm.descripcion, activo:planForm.activo }; if(planForm.id){ await axios.put(`/api/admin/planes/${planForm.id}`, payload); pushToast('success','Plan actualizado'); } else { await axios.post('/api/admin/planes', payload); pushToast('success','Plan creado'); } await loadPlanes(); resetPlanForm(); } catch(e:any){ pushToast('error', e?.response?.data?.error || 'Error guardando plan'); } finally { setSavingPlan(false); } }
  async function deletePlan(id:string){ openConfirm('¿Desactivar plan?', async ()=>{ try { await axios.delete(`/api/admin/planes/${id}`); await loadPlanes(); pushToast('success','Plan desactivado'); } catch(e:any){ pushToast('error', e?.response?.data?.error || 'Error'); } }, 'Desactivar', 'Cancelar'); }

  // Auto-load según sección activa
  useEffect(()=>{
    if(!user?.roles.includes('admin')) return;
    if(section==='motivos') loadMotivos();
    else if(section==='categorias') loadCategorias();
    else if(section==='planes') loadPlanes();
    else if(section==='usuarios') { // garantizar disponibilidad para RegenerarPlan
      if(motivos.length===0) loadMotivos();
      if(categorias.length===0) loadCategorias();
      if(planes.length===0) loadPlanes();
    }
  },[section,user]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Administración</h2>
      <p className="text-gray-600 mb-6 text-sm">Gestión de usuarios y plan de crecimiento.</p>
      {!user?.roles.includes('admin') && <div className="p-4 border rounded bg-yellow-50 text-xs">No tienes permiso para ver este panel.</div>}
      {user?.roles.includes('admin') && (
        <>
          <div className="mb-6 flex gap-2">
            <button onClick={()=>setSection('usuarios')} className={`px-3 py-1.5 rounded text-xs font-medium border ${section==='usuarios'?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 hover:bg-gray-50'}`}>Usuarios</button>
            <button onClick={()=>setSection('plantillas')} className={`px-3 py-1.5 rounded text-xs font-medium border ${section==='plantillas'?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 hover:bg-gray-50'}`}>Plan de Crecimiento</button>
            <button onClick={()=>setSection('roles')} className={`px-3 py-1.5 rounded text-xs font-medium border ${section==='roles'?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 hover:bg-gray-50'}`}>Roles</button>
            <button onClick={()=>setSection('motivos')} className={`px-3 py-1.5 rounded text-xs font-medium border ${section==='motivos'?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 hover:bg-gray-50'}`}>Motivos</button>
            <button onClick={()=>setSection('categorias')} className={`px-3 py-1.5 rounded text-xs font-medium border ${section==='categorias'?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 hover:bg-gray-50'}`}>Categorías</button>
            <button onClick={()=>setSection('planes')} className={`px-3 py-1.5 rounded text-xs font-medium border ${section==='planes'?'bg-primary-600 text-white border-primary-600':'bg-white text-gray-600 hover:bg-gray-50'}`}>Planes</button>
          </div>
          {section==='roles' && (
            <div className="mb-8 p-4 border rounded bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Definición de Roles</h3>
                <button onClick={loadRoles} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Refrescar</button>
              </div>
              {loadingRoles && <p className="text-[10px] text-gray-500">Cargando roles...</p>}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold mb-1">Nombre (clave)</label>
                    <input value={roleForm.name} onChange={e=>setRoleForm(f=>({...f,name:e.target.value}))} className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1">Descripción</label>
                    <input value={roleForm.description} onChange={e=>setRoleForm(f=>({...f,description:e.target.value}))} className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold mb-1">Opciones de menú</label>
                    <div className="flex flex-wrap gap-2">
                      {MENU_OPTIONS.map(opt => {
                        const active = roleForm.menuOptions.includes(opt);
                        return <button type="button" key={opt} onClick={()=>setRoleForm(f=>({...f,menuOptions: active ? f.menuOptions.filter(x=>x!==opt) : [...f.menuOptions,opt]}))} className={`px-2 py-1 rounded border text-[10px] ${active?'bg-primary-600 text-white border-primary-600':'bg-gray-100 text-gray-600'}`}>{opt}</button>;
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {roleForm.isEditing ? (
                      <button disabled={!roleForm.name || roleForm.menuOptions.length===0} onClick={async ()=>{
                        try { await axios.put(`/auth/roles/${roleForm.name}`, { description: roleForm.description, menu_options: roleForm.menuOptions }); setRoleForm({ name:'', description:'', menuOptions:[], isEditing:false }); await loadRoles(); pushToast('success','Rol actualizado'); }
                        catch (e:any) { pushToast('error', e?.response?.data?.error || 'Error actualizando rol'); }
                      }} className="px-3 py-1 rounded bg-indigo-600 text-white text-xs disabled:opacity-40">Actualizar rol</button>
                    ) : (
                      <button disabled={!roleForm.name || roleForm.menuOptions.length===0} onClick={async ()=>{
                        try { await axios.post('/auth/roles', { name: roleForm.name, description: roleForm.description, menu_options: roleForm.menuOptions }); setRoleForm({ name:'', description:'', menuOptions:[], isEditing:false }); await loadRoles(); pushToast('success','Rol creado'); }
                        catch (e:any) { pushToast('error', e?.response?.data?.error || 'Error creando rol'); }
                      }} className="px-3 py-1 rounded bg-primary-600 text-white text-xs disabled:opacity-40">Crear rol</button>
                    )}
                    <button type="button" onClick={()=>setRoleForm({ name:'', description:'', menuOptions:[], isEditing:false })} className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs">Limpiar</button>
                  </div>
                </div>
                <div className="max-h-72 overflow-auto border rounded">
                  <table className="min-w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="p-2 text-left">Rol</th>
                        <th className="p-2 text-left">Menú</th>
                        <th className="p-2 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rolesDef.map(r => (
                        <tr key={r.id} className="hover:bg-gray-50 border-b">
                          <td className="p-2 align-top font-medium">{r.name}</td>
                          <td className="p-2 align-top">{r.menuOptions.join(', ')}</td>
                          <td className="p-2 align-top space-x-1">
                            <button onClick={()=>{ setRoleForm({ name:r.name, description:r.description, menuOptions:r.menuOptions, isEditing:true }); }} className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Editar</button>
                            <button onClick={()=> openConfirm('¿Eliminar rol?', async ()=>{ try { await axios.delete(`/auth/roles/${r.name}`); await loadRoles(); pushToast('success','Rol eliminado'); } catch(e:any) { pushToast('error', e?.response?.data?.error||'Error eliminando rol'); } }, 'Eliminar', 'Cancelar')} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                      {rolesDef.length===0 && !loadingRoles && <tr><td colSpan={3} className="p-3 text-center text-xs text-gray-500">Sin roles</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-gray-500">La asignación de roles a usuarios se gestiona en la sección Usuarios.</p>
            </div>
          )}
          {section==='usuarios' && (
            <div className="space-y-6">
              <div className="p-4 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Usuarios ({users.length})</h3>
                  <button onClick={loadUsers} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Refrescar</button>
                </div>
                {loadingUsers && <div className="text-xs text-gray-500">Cargando...</div>}
                {usersError && <div className="text-xs text-red-600">{usersError}</div>}
                <div className="overflow-auto max-h-[340px] text-xs">
                  <table className="min-w-full border text-[11px] border-collapse table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 border text-left">Nombre</th>
                        <th className="p-2 border text-left">Email</th>
                        <th className="p-2 border text-left">Teléfono</th>
                        <th className="p-2 border text-left">Roles</th>
                        <th className="p-2 border text-left">Creado</th>
                        <th className="p-2 border text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(u)}>
                          <td className="p-2 border align-top">{u.name}</td>
                          <td className="p-2 border align-top break-all">{u.email}</td>
                          <td className="p-2 border align-top">{u.phone || '-'}</td>
                          <td className="p-2 border align-top">{u.roles.join(', ')}</td>
                          <td className="p-2 border align-top">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-2 border align-top space-x-1">
                            <button onClick={(e) => { e.stopPropagation(); deleteUser(u.id); }} className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {selected && (
                <div className="p-4 border rounded bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">Usuario seleccionado</h3>
                    <button onClick={() => setSelected(null)} className="text-xs text-gray-500">Cerrar</button>
                  </div>
                  <p className="text-xs mb-2">{selected.name} ({selected.email}) {selected.phone && <span className="ml-2 text-gray-600">📱 {selected.phone}</span>}</p>
                  <div className="flex items-end gap-2 mb-3">
                    <div>
                      <label className="block text-[10px] font-medium mb-1">Teléfono</label>
                      <input value={editPhone} onChange={e=>setEditPhone(e.target.value)} className="border rounded px-2 py-1 text-xs" placeholder="+59170000000" />
                    </div>
                    <button disabled={savingUser} onClick={async ()=>{
                      setSavingUser(true);
                      try {
                        await axios.post(`/api/admin/users/${selected.id}/update`, { phone: editPhone });
                        await loadUserDetail(selected.id);
                        pushToast('success','Teléfono actualizado');
                      } catch (e:any) { pushToast('error', e?.response?.data?.error || 'Error actualizando teléfono'); } finally { setSavingUser(false); }
                    }} className="px-3 py-1 rounded bg-indigo-600 text-white text-xs disabled:opacity-40">{savingUser?'...':'Guardar'}</button>
                  </div>
                  {selected.reason ? (
                    <p className="text-[10px] mb-3 text-primary-700">Motivo actual del plan: <span className="font-semibold">{selected.reason}</span></p>
                  ) : (
                    <p className="text-[10px] mb-3 text-gray-500">Usuario sin motivo asignado.</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rolesDef.map(rObj => {
                      const r = rObj.name;
                      const active = selected.roles.includes(r);
                      return (
                        <button
                          key={r}
                          disabled={updatingRoles}
                          onClick={() => {
                            const next = active ? selected.roles.filter(x=>x!==r) : [...new Set([...selected.roles,r])];
                            updateRoles(selected.id, next); setSelected({...selected, roles: next});
                          }}
                          className={`px-2 py-1 rounded text-[11px] border ${active ? 'bg-primary-600 text-white border-primary-600' : 'bg-gray-100 text-gray-600'}`}
                        >{r}</button>
                      );
                    })}
                  </div>
                  <div className="flex items-end gap-2 mb-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-medium mb-1">Nuevo password</label>
                      <input value={pwd} onChange={e=>setPwd(e.target.value)} type="text" className="w-full border rounded px-2 py-1 text-xs" placeholder="Temporal" />
                    </div>
                    <button disabled={!pwd} onClick={() => resetPassword(selected.id)} className="px-3 py-1 rounded bg-blue-600 text-white text-xs disabled:opacity-40">Reset password</button>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3">Acciones registran actividad y aparecen en notificaciones administrativas.</p>
                  <RegenerarPlan userId={selected.id} currentMotivoId={selected.motivoId || null} onDone={() => loadUserDetail(selected.id)} />
                </div>
              )}
            </div>
          )}
          {section==='plantillas' && (
            <div className="space-y-6">
              <div className="p-4 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Plantillas Plan Crecimiento</h3>
                  <button onClick={loadTemplates} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Refrescar</button>
                </div>
                {tplLoading && <div className="text-xs text-gray-500">Cargando...</div>}
                {tplError && <div className="text-xs text-red-600">{tplError}</div>}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <form onSubmit={saveTemplate} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Motivo</label>
                        <select value={formTpl.motivoId} onChange={e=>setFormTpl(f=>({...f,motivoId:e.target.value}))} className="w-full border rounded px-2 py-1">
                          <option value="">(sin motivo)</option>
                          {motivos.filter(m=>m.activo).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold mb-1">Orden</label>
                          <input type="number" min={1} value={formTpl.stepOrder} onChange={e=>setFormTpl(f=>({...f,stepOrder: parseInt(e.target.value)||1}))} className="w-full border rounded px-2 py-1" />
                        </div>
                         <div className="flex-1">
                           <label className="block text-[10px] font-semibold mb-1">Categoría</label>
                           <select value={formTpl.categoriaId} onChange={e=>setFormTpl(f=>({...f,categoriaId:e.target.value}))} className="w-full border rounded px-2 py-1">
                             <option value="">(sin categoría)</option>
                             {categorias.filter(c=>c.activo).map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                           </select>
                         </div>
                         <div className="flex-1">
                           <label className="block text-[10px] font-semibold mb-1">Plan</label>
                           <select value={formTpl.planId} onChange={e=>setFormTpl(f=>({...f,planId:e.target.value}))} className="w-full border rounded px-2 py-1">
                             <option value="">(sin plan)</option>
                             {planes.filter(p=>p.activo).map(p => <option key={p.id} value={p.id}>{p.nombre}{p.nivel?` (${p.nivel})`:''}</option>)}
                           </select>
                         </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Título</label>
                        <input value={formTpl.title} onChange={e=>setFormTpl(f=>({...f,title:e.target.value}))} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Descripción</label>
                        <textarea value={formTpl.description} onChange={e=>setFormTpl(f=>({...f,description:e.target.value}))} rows={3} className="w-full border rounded px-2 py-1"></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold mb-1">Recursos (coma)</label>
                        <input value={formTpl.resources} onChange={e=>setFormTpl(f=>({...f,resources:e.target.value}))} className="w-full border rounded px-2 py-1" placeholder="video:intro, pdf:guia" />
                      </div>
                      <div className="flex gap-2">
                        <button disabled={savingTpl} type="submit" className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-40">{editingTpl ? 'Actualizar' : 'Crear'}</button>
                        {editingTpl && <button type="button" onClick={resetTplForm} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Cancelar</button>}
                      </div>
                    </form>
                  </div>
                  <div className="max-h-72 overflow-auto border rounded">
                    <table className="min-w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-2 text-left">Motivo</th>
                          <th className="p-2 text-left">Orden</th>
                          <th className="p-2 text-left">Categoría</th>
                          <th className="p-2 text-left">Plan</th>
                          <th className="p-2 text-left">Título</th>
                          <th className="p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {templates.map(t => {
                          const motivoNombre = t.motivoId ? (motivos.find(m=>m.id===t.motivoId)?.nombre || t.motivoId) : '-';
                          const categoriaNombre = t.categoriaId ? (categorias.find(c=>c.id===t.categoriaId)?.nombre || t.categoriaId) : '-';
                          const planNombre = t.planId ? (planes.find(p=>p.id===t.planId)?.nombre || t.planId) : '-';
                          return (
                            <tr key={t.id} className="hover:bg-gray-50 border-b">
                              <td className="p-2 align-top">{motivoNombre}</td>
                              <td className="p-2 align-top">{t.stepOrder}</td>
                              <td className="p-2 align-top">{categoriaNombre}</td>
                              <td className="p-2 align-top">{planNombre}</td>
                              <td className="p-2 align-top">{t.title}</td>
                              <td className="p-2 align-top space-x-1">
                                <button onClick={() => { setEditingTpl(t); setFormTpl({ stepOrder: t.stepOrder, title: t.title, description: t.description, resources: t.resources.join(','), motivoId: t.motivoId || '', categoriaId: t.categoriaId || '', planId: t.planId || '' }); }} className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Editar</button>
                                <button onClick={() => deleteTemplate(t.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Eliminar</button>
                              </td>
                            </tr>
                          );
                        })}
                        {templates.length===0 && !tplLoading && <tr><td colSpan={4} className="p-3 text-center text-xs text-gray-500">Sin plantillas</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-500">Las plantillas se usan al registrar nuevos usuarios para generar su plan de crecimiento.</p>
              </div>
            </div>
          )}
          {section==='motivos' && (
            <div className="space-y-6">
              <div className="p-4 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Motivos</h3>
                  <button onClick={loadMotivos} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Refrescar</button>
                </div>
                {motivoLoading && <div className="text-xs text-gray-500">Cargando...</div>}
                {motivoError && <div className="text-xs text-red-600">{motivoError}</div>}
                <div className="grid md:grid-cols-2 gap-6">
                  <form onSubmit={saveMotivo} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Nombre</label>
                      <input value={motivoForm.nombre} onChange={e=>setMotivoForm(f=>({...f,nombre:e.target.value}))} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Descripción</label>
                      <textarea value={motivoForm.descripcion} onChange={e=>setMotivoForm(f=>({...f,descripcion:e.target.value}))} rows={3} className="w-full border rounded px-2 py-1" />
                    </div>
                    <label className="inline-flex items-center gap-2 text-[10px]">
                      <input type="checkbox" checked={motivoForm.activo} onChange={e=>setMotivoForm(f=>({...f,activo:e.target.checked}))} /> Activo
                    </label>
                    <div className="flex gap-2">
                      <button disabled={savingMotivo} type="submit" className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-40">{motivoForm.id?'Actualizar':'Crear'}</button>
                      {motivoForm.id && <button type="button" onClick={resetMotivoForm} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Cancelar</button>}
                    </div>
                  </form>
                  <div className="max-h-72 overflow-auto border rounded">
                    <table className="min-w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-2 text-left">Nombre</th>
                          <th className="p-2 text-left">Estado</th>
                          <th className="p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {motivos.map(m => (
                          <tr key={m.id} className="hover:bg-gray-50 border-b">
                            <td className="p-2 align-top">{m.nombre}</td>
                            <td className="p-2 align-top">{m.activo?'Activo':'Inactivo'}</td>
                            <td className="p-2 align-top space-x-1">
                              <button onClick={()=>setMotivoForm({ id:m.id, nombre:m.nombre, descripcion:m.descripcion, activo:m.activo })} className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Editar</button>
                              <button onClick={()=>deleteMotivo(m.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Desactivar</button>
                            </td>
                          </tr>
                        ))}
                        {motivos.length===0 && !motivoLoading && <tr><td colSpan={3} className="p-3 text-center text-xs text-gray-500">Sin motivos</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-500">Motivos se usan para guiar el plan de crecimiento del usuario.</p>
              </div>
            </div>
          )}
          {section==='categorias' && (
            <div className="space-y-6">
              <div className="p-4 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Categorías</h3>
                  <button onClick={loadCategorias} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Refrescar</button>
                </div>
                {categoriaLoading && <div className="text-xs text-gray-500">Cargando...</div>}
                {categoriaError && <div className="text-xs text-red-600">{categoriaError}</div>}
                <div className="grid md:grid-cols-2 gap-6">
                  <form onSubmit={saveCategoria} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Nombre</label>
                      <input value={categoriaForm.nombre} onChange={e=>setCategoriaForm(f=>({...f,nombre:e.target.value}))} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Descripción</label>
                      <textarea value={categoriaForm.descripcion} onChange={e=>setCategoriaForm(f=>({...f,descripcion:e.target.value}))} rows={3} className="w-full border rounded px-2 py-1" />
                    </div>
                    <label className="inline-flex items-center gap-2 text-[10px]">
                      <input type="checkbox" checked={categoriaForm.activo} onChange={e=>setCategoriaForm(f=>({...f,activo:e.target.checked}))} /> Activa
                    </label>
                    <div className="flex gap-2">
                      <button disabled={savingCategoria} type="submit" className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-40">{categoriaForm.id?'Actualizar':'Crear'}</button>
                      {categoriaForm.id && <button type="button" onClick={resetCategoriaForm} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Cancelar</button>}
                    </div>
                  </form>
                  <div className="max-h-72 overflow-auto border rounded">
                    <table className="min-w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-2 text-left">Nombre</th>
                          <th className="p-2 text-left">Estado</th>
                          <th className="p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categorias.map(c => (
                          <tr key={c.id} className="hover:bg-gray-50 border-b">
                            <td className="p-2 align-top">{c.nombre}</td>
                            <td className="p-2 align-top">{c.activo?'Activa':'Inactiva'}</td>
                            <td className="p-2 align-top space-x-1">
                              <button onClick={()=>setCategoriaForm({ id:c.id, nombre:c.nombre, descripcion:c.descripcion, activo:c.activo })} className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Editar</button>
                              <button onClick={()=>deleteCategoria(c.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Desactivar</button>
                            </td>
                          </tr>
                        ))}
                        {categorias.length===0 && !categoriaLoading && <tr><td colSpan={3} className="p-3 text-center text-xs text-gray-500">Sin categorías</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-500">Categorías clasifican contenidos y pasos de crecimiento.</p>
              </div>
            </div>
          )}
          {section==='planes' && (
            <div className="space-y-6">
              <div className="p-4 border rounded bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Planes</h3>
                  <button onClick={loadPlanes} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">Refrescar</button>
                </div>
                {planLoading && <div className="text-xs text-gray-500">Cargando...</div>}
                {planError && <div className="text-xs text-red-600">{planError}</div>}
                <div className="grid md:grid-cols-2 gap-6">
                  <form onSubmit={savePlan} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Nombre</label>
                      <input value={planForm.nombre} onChange={e=>setPlanForm(f=>({...f,nombre:e.target.value}))} className="w-full border rounded px-2 py-1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Nivel</label>
                      <input value={planForm.nivel} onChange={e=>setPlanForm(f=>({...f,nivel:e.target.value}))} className="w-full border rounded px-2 py-1" placeholder="Ej: Básico / Avanzado" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1">Descripción</label>
                      <textarea value={planForm.descripcion} onChange={e=>setPlanForm(f=>({...f,descripcion:e.target.value}))} rows={3} className="w-full border rounded px-2 py-1" />
                    </div>
                    <label className="inline-flex items-center gap-2 text-[10px]">
                      <input type="checkbox" checked={planForm.activo} onChange={e=>setPlanForm(f=>({...f,activo:e.target.checked}))} /> Activo
                    </label>
                    <div className="flex gap-2">
                      <button disabled={savingPlan} type="submit" className="px-3 py-1 rounded bg-primary-600 text-white disabled:opacity-40">{planForm.id?'Actualizar':'Crear'}</button>
                      {planForm.id && <button type="button" onClick={resetPlanForm} className="px-3 py-1 rounded bg-gray-200 text-gray-700">Cancelar</button>}
                    </div>
                  </form>
                  <div className="max-h-72 overflow-auto border rounded">
                    <table className="min-w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="p-2 text-left">Nombre</th>
                          <th className="p-2 text-left">Nivel</th>
                          <th className="p-2 text-left">Estado</th>
                          <th className="p-2 text-left">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planes.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 border-b">
                            <td className="p-2 align-top">{p.nombre}</td>
                            <td className="p-2 align-top">{p.nivel || '-'}</td>
                            <td className="p-2 align-top">{p.activo?'Activo':'Inactivo'}</td>
                            <td className="p-2 align-top space-x-1">
                              <button onClick={()=>setPlanForm({ id:p.id, nombre:p.nombre, nivel:p.nivel||'', descripcion:p.descripcion, activo:p.activo })} className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Editar</button>
                              <button onClick={()=>deletePlan(p.id)} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">Desactivar</button>
                            </td>
                          </tr>
                        ))}
                        {planes.length===0 && !planLoading && <tr><td colSpan={4} className="p-3 text-center text-xs text-gray-500">Sin planes</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-gray-500">Planes sirven para agrupar niveles o trayectorias de desarrollo.</p>
              </div>
            </div>
          )}
        {/* Toast container */}
        <div className="fixed top-3 right-3 z-50 space-y-2 w-64">
          {toasts.map(t => (
            <div key={t.id} className={`px-3 py-2 rounded text-xs shadow flex items-start gap-2 ${t.type==='success'?'bg-green-600 text-white': t.type==='error'?'bg-red-600 text-white':'bg-gray-800 text-white'}`}> 
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={()=>setToasts(ts=>ts.filter(x=>x.id!==t.id))} className="text-[10px] opacity-70 hover:opacity-100">✕</button>
            </div>
          ))}
        </div>
        {/* Confirm modal */}
        {confirmState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={closeConfirm}></div>
            <div className="relative bg-white rounded shadow-lg p-4 w-[320px] text-xs">
              <p className="mb-4 text-gray-700 leading-relaxed">{confirmState.message}</p>
              <div className="flex justify-end gap-2">
                <button onClick={closeConfirm} className="px-3 py-1 rounded bg-gray-200 text-gray-700">{confirmState.cancelLabel||'Cancelar'}</button>
                <button onClick={()=>{ const fn=confirmState.onConfirm; closeConfirm(); fn(); }} className="px-3 py-1 rounded bg-red-600 text-white">{confirmState.confirmLabel||'Confirmar'}</button>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}

function RegenerarPlan({ userId, currentMotivoId, onDone }: { userId:string; currentMotivoId:string|null; onDone:() => void }) {
  const [motivoId, setMotivoId] = useState(currentMotivoId || '');
  const [force, setForce] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [motivosLocal, setMotivosLocal] = useState<CatalogItem[]>([]);
  useEffect(()=> { setMotivoId(currentMotivoId || ''); }, [currentMotivoId]);
  useEffect(()=>{
    // cargar motivos si no hay
    if(motivosLocal.length===0){
      axios.get('/api/admin/motivos').then(r=> setMotivosLocal(r.data)).catch(()=>{});
    }
  },[motivosLocal.length]);
  async function regen() {
    setLoading(true); setError(null); setResult(null);
    try {
      const payload: any = {};
      if (motivoId) payload.motivo_id = motivoId;
      if (force) payload.force = true;
      const res = await axios.post(`/api/admin/users/${userId}/regenerate-growth-plan`, payload);
      setResult(`Regenerado: ${res.data.steps.length} pasos (motivo catálogo)`);
      onDone();
    } catch (e:any) {
      setError(e?.response?.data?.error || 'Error');
    } finally { setLoading(false); }
  }
  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="text-xs font-semibold mb-2">Regenerar Plan Crecimiento</h4>
      <div className="flex flex-wrap items-end gap-2 mb-2">
        <div>
          <label className="block text-[10px] font-medium mb-1">Motivo catálogo (opcional)</label>
          <select value={motivoId} onChange={e=>setMotivoId(e.target.value)} className="border rounded px-2 py-1 text-xs">
            <option value="">(mantener actual)</option>
            {motivosLocal.filter(m=>m.activo).map(m=> <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-1 text-[10px] mb-1">
          <input type="checkbox" checked={force} onChange={e=>setForce(e.target.checked)} /> Forzar (elimina completados)
        </label>
        <button disabled={loading} onClick={regen} className="px-3 py-1 rounded bg-primary-600 text-white text-xs disabled:opacity-40">{loading ? '...' : 'Regenerar'}</button>
      </div>
      {error && <p className="text-[10px] text-red-600">{error}</p>}
      {result && <p className="text-[10px] text-green-700">{result}</p>}
      <p className="text-[10px] text-gray-500 mt-2">Recrea los pasos usando las plantillas vinculadas al motivo catálogo seleccionado.</p>
    </div>
  );
}
