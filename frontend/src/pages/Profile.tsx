import { useEffect, useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface MeResponse { id:string; email:string; name:string; roles:string[]; avatar:string|null; phone?:string|null; reason?:string|null }

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [phone, setPhone] = useState<string>('');
  const [reason, setReason] = useState<string|null>(null);
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string|null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string|null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        setLoading(true);
        const res = await axios.get<MeResponse>('/auth/me');
        setName(res.data.name);
        setEmail(res.data.email);
        setRoles(res.data.roles);
  setAvatar(res.data.avatar);
  setPhone(res.data.phone || '');
  setReason(res.data.reason || null);
        setAvatarPreview(res.data.avatar);
      } catch (e:any) {
        setError('No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  function onAvatarFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (!result.startsWith('data:image/')) {
        setError('Formato de imagen inválido');
        return;
      }
      setAvatarPreview(result);
      setAvatar(result);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name && !password && !avatar) {
      setError('No hay cambios para guardar');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {};
      if (name && name !== user?.name) payload.name = name;
      if (password) payload.password = password;
  if (avatar) payload.avatarBase64 = avatar;
      const res = await axios.post('/auth/me/update', payload);
      setSuccess('Perfil actualizado');
      setPassword('');
    } catch (e:any) {
      setError(e.response?.data?.error || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Perfil</h2>
      {loading ? <p className="animate-pulse text-gray-500">Cargando...</p> : (
        <form onSubmit={onSubmit} className="space-y-6">
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded">{success}</div>}
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border">
                {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-sm">Sin avatar</span>}
              </div>
              <label className="inline-block cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                <input type="file" accept="image/*" onChange={onAvatarFile} className="hidden" />
                Cambiar avatar
              </label>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input value={email} disabled className="w-full rounded border px-3 py-2 bg-gray-50 text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Celular</label>
                <input value={phone} disabled className="w-full rounded border px-3 py-2 bg-gray-50 text-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nueva contraseña (opcional)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Roles</label>
                <div className="flex flex-wrap gap-2">
                  {roles.map(r => <span key={r} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{r}</span>)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motivo (razón)</label>
                <input value={reason || ''} disabled className="w-full rounded border px-3 py-2 bg-gray-50 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4">
            <button type="submit" disabled={saving} className="px-5 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
