import { useEffect, useState } from 'react';
import axios from 'axios';

interface GrowthStep { id:string; order:number; category:string; title:string; description:string; resources:string[]; completedAt?:string|null; reviewStatus?:string; reviewScore?:number|null; reviewComment?:string|null; stepReason?:string|null }
interface GrowthPlanResponse { reason: string|null; steps: GrowthStep[] }

export default function Crecimiento() {
  const [steps, setSteps] = useState<GrowthStep[]>([]);
  const [reason, setReason] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [completing, setCompleting] = useState<string|null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get('/api/growth/plan');
      const data: GrowthPlanResponse = res.data;
      setSteps(data.steps || []);
      setReason(data.reason || null);
      setError(null);
    } catch (e:any) {
      if (e?.response?.status === 404) {
        setError('NO_PLAN');
      } else {
        setError('SERVER');
      }
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function complete(id:string) {
    setCompleting(id);
    try {
      await axios.post(`/api/dashboard/complete-step/${id}`);
      await load();
    } catch {} finally { setCompleting(null); }
  }

  // Calcular progreso
  const total = steps.length;
  const done = steps.filter(s => s.completedAt).length;
  const pct = total ? Math.round((done/total)*100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Plan de Crecimiento</h2>
          <p className="text-sm text-gray-600">Tu ruta personalizada{reason ? <> basada en motivo <span className="font-medium text-primary-600">{reason}</span></> : ' (sin motivo definido)'}.</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-700">Progreso: {done}/{total}</span>
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-primary-500 to-green-500" style={{ width: pct+'%' }} />
          </div>
        </div>
      </div>

      {loading && <div className="text-xs text-gray-500">Cargando...</div>}
  {error === 'SERVER' && <div className="text-xs text-red-600 mb-4">Error cargando plan de crecimiento.</div>}
  {error === 'NO_PLAN' && <div className="text-xs text-gray-600 mb-4">Aún no se ha generado un plan de crecimiento para tu cuenta.</div>}

      {steps.length === 0 && !loading && !error && reason && (
        <div className="p-6 border rounded-lg bg-white text-sm text-gray-600">No hay pasos asignados aún (motivo {reason} sin plantillas configuradas).</div>
      )}
      {steps.length === 0 && !loading && !error && !reason && (
        <div className="p-6 border rounded-lg bg-white text-sm text-gray-600">No tienes motivo asignado todavía. Actualiza tu perfil o contacta a un administrador.</div>
      )}

      {steps.length > 0 && (
        <div className="relative pl-8">
          {/* Línea vertical */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-primary-400 via-primary-200 to-transparent" />
          <ol className="space-y-6">
            {steps.map((s,i) => {
              const active = !!s.completedAt;
              const review = s.reviewStatus || 'pending';
              const reviewBadge = (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border
                  ${review==='approved' ? 'bg-emerald-600 text-white border-emerald-600' : review==='rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}
                  title={s.reviewComment ? s.reviewComment : (review==='approved' ? 'Aprobado por mentor' : review==='rejected' ? 'Rechazado por mentor' : 'Pendiente de revisión')}
                >
                  {review==='approved' ? 'Aprobado' : review==='rejected' ? 'Rechazado' : 'Pendiente'}{s.reviewScore!=null && review==='approved' ? ` • ${s.reviewScore}/5` : ''}
                </span>
              );
              return (
                <li key={s.id} className="relative">
                  {/* Burbuja */}
                  <div className={`absolute -left-1.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${active ? 'bg-green-500 border-green-600 text-white shadow-lg' : 'bg-white border-primary-400 text-primary-600'} transition`}>{i+1}</div>
                  <div className={`ml-6 p-4 rounded-lg border shadow-sm ${active ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} transition` }>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 flex-1">{s.title}</h3>
                      {active ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-600 text-white">Completado</span>
                      ) : (
                        <button disabled={completing===s.id} onClick={() => complete(s.id)} className="text-[10px] px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40">{completing===s.id ? '...' : 'Marcar'}</button>
                      )}
                      {active && reviewBadge}
                    </div>
                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">{s.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-100" title="Categoría del paso">{s.category}</span>
                      {s.stepReason && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100" title="Motivo asociado al origen de la plantilla">Motivo: {s.stepReason}</span>
                      )}
                      {s.resources.map(r => <span key={r} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{r}</span>)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
