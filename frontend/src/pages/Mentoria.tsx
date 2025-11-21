import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface RequestItem { id:string; requesterId:string; mentorId:string|null; status:string; createdAt:string; updatedAt:string }

export default function Mentoria() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [error, setError] = useState<string|null>(null);
  const [creating, setCreating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string|null>(null);
  const [note, setNote] = useState('');

  const isMentor = user?.roles.includes('mentor') || user?.roles.includes('admin');
  // Si es mentor no debe ver el bloque para crear solicitud.

  async function load() {
    setError(null);
    try {
      setLoading(true);
      const res = await axios.get<RequestItem[]>('/api/mentoria');
      setRequests(res.data);
    } catch (e:any) {
      setError('No se pudo cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createRequest() {
    if (!note.trim()) { setError('Agrega una nota'); return; }
    setCreating(true);
    setError(null);
    try {
      await axios.post('/api/mentoria/request', { note });
      setNote('');
      load();
    } catch (e:any) {
      setError(e.response?.data?.error || 'Error creando solicitud');
    } finally {
      setCreating(false);
    }
  }

  async function accept(id:string) {
    setAcceptingId(id);
    setError(null);
    try {
      await axios.post('/api/mentoria/accept', { requestId: id });
      await refreshProfile(); // Puede haber cambio de rol mentor
      load();
    } catch (e:any) {
      setError(e.response?.data?.error || 'Error aceptando');
    } finally {
      setAcceptingId(null);
    }
  }

  async function cancel(id:string) {
    setError(null);
    try {
      await axios.post('/api/mentoria/cancel', { requestId: id });
      load();
    } catch (e:any) {
      setError(e.response?.data?.error || 'Error cancelando');
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Mentoría</h2>
      <p className="text-gray-600 mb-6 text-sm">Solicita acompañamiento o acepta solicitudes si eres mentor.</p>
      {error && <div className="mb-4 bg-red-100 text-red-700 px-4 py-2 rounded text-sm">{error}</div>}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {!isMentor && (
          <div className="p-5 border rounded-lg bg-white shadow-sm md:col-span-2 flex flex-col">
            <h3 className="font-medium mb-2">Solicitar Mentor</h3>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Explica brevemente tu necesidad..." className="w-full border rounded p-2 text-sm mb-3 min-h-[90px]" />
            <button disabled={creating} onClick={createRequest} className="self-start px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">
              {creating ? 'Enviando...' : 'Enviar solicitud'}
            </button>
            <p className="text-xs text-gray-500 mt-2">Sólo una solicitud pendiente a la vez.</p>
          </div>
        )}
        <div className="p-5 border rounded-lg bg-white shadow-sm">
          <h3 className="font-medium mb-2">Tu rol</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {user?.roles.map(r => <span key={r} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{r}</span>)}
          </div>
          {isMentor ? (
            <p className="text-xs text-gray-500">Eres mentor. Gestiona solicitudes pendientes; no puedes enviar una propia.</p>
          ) : (
            <p className="text-xs text-gray-500">Al aceptar una solicitud como admin se te añade rol mentor automáticamente.</p>
          )}
        </div>
      </div>
      <h3 className="font-semibold mb-3">Solicitudes</h3>
      {loading ? <p className="text-gray-500 text-sm">Cargando...</p> : (
        <div className="space-y-3">
          {requests.length === 0 && <p className="text-sm text-gray-500">No hay solicitudes aún.</p>}
          {requests.map(r => {
            const own = r.requesterId === user?.id;
            return (
              <div key={r.id} className="border rounded p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm"><span className="font-medium">Estado:</span> {r.status}</p>
                  <p className="text-xs text-gray-500">ID: {r.id}</p>
                  <p className="text-xs text-gray-500">Solicitante: {r.requesterId.slice(0,8)}{own && ' (tú)'}</p>
                  {r.mentorId && <p className="text-xs text-gray-500">Mentor: {r.mentorId.slice(0,8)}</p>}
                </div>
                <div className="flex gap-2">
                  {own && r.status === 'pending' && (
                    <button onClick={() => cancel(r.id)} className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200">Cancelar</button>
                  )}
                  {!own && isMentor && r.status === 'pending' && (
                    <button disabled={acceptingId === r.id} onClick={() => accept(r.id)} className="px-3 py-1 text-xs rounded bg-green-600 text-white disabled:opacity-50">
                      {acceptingId === r.id ? 'Aceptando...' : 'Aceptar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
