import { useEffect, useState } from 'react';
import axios from 'axios';

interface Mentee { id:string; email:string; name:string; createdAt:string; reason:string|null; pendingSteps?:number; approvedSteps?:number }
interface Step { id:string; order:number; category:string; title:string; description:string; resources:string[]; completedAt:string|null; reviewStatus:string; reviewScore:number|null; reviewComment:string|null; reviewedAt?:string|null }

export default function MentorMentees() {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [selected, setSelected] = useState<Mentee|null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [reviewing, setReviewing] = useState<Step|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'approved'|'rejected'>('approved');
  const [score, setScore] = useState<number|''>('');
  const [comment, setComment] = useState('');
  const [planLoading, setPlanLoading] = useState(false);

  async function loadMentees() {
    setLoading(true);
    try {
      const res = await axios.get('/api/mentor/mentees');
      setMentees(res.data || []);
      setError(null);
    } catch (e:any) {
      setError('SERVER');
    } finally { setLoading(false); }
  }
  useEffect(() => { loadMentees(); }, []);

  async function openMentee(m:Mentee) {
    setSelected(m);
    setPlanLoading(true);
    try {
      const res = await axios.get(`/api/mentor/mentees/${m.id}/plan`);
      setSteps(res.data.steps || []);
    } catch { setSteps([]); }
    finally { setPlanLoading(false); }
  }

  async function submitReview() {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      await axios.post(`/api/mentor/review-step/${reviewing.id}`, {
        status,
        score: score === '' ? undefined : score,
        comment: comment.trim() || undefined
      });
      // refresh plan
      if (selected) await openMentee(selected);
      setReviewing(null);
    } catch (e:any) {
      // Optional: show error toast
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Mentoría - Mentees</h2>
        <button onClick={loadMentees} className="text-xs px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700">Refrescar</button>
      </div>
      {loading && <div className="text-xs text-gray-500">Cargando lista...</div>}
      {error && <div className="text-xs text-red-600">Error cargando mentees.</div>}
      {!loading && !error && mentees.length === 0 && <div className="text-sm text-gray-600">No tienes mentees asignados aún.</div>}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mentees.map(m => {
          const reason = m.reason || 'sin motivo';
          return (
            <div key={m.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{m.name}</h3>
              <p className="text-[11px] text-gray-600 mb-2 break-all">{m.email}</p>
              <span className="text-[10px] inline-block mb-2 bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-100">Motivo: {reason}</span>
              <div className="flex gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Pend: {m.pendingSteps ?? 0}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Aprob: {m.approvedSteps ?? 0}</span>
              </div>
              <button onClick={() => openMentee(m)} className="mt-auto text-xs px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700">Ver Plan</button>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Plan de {selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-xs px-2 py-1 rounded bg-gray-100 border hover:bg-gray-200">Cerrar</button>
          </div>
          {planLoading && <div className="text-xs text-gray-500">Cargando plan...</div>}
          {!planLoading && steps.length === 0 && <div className="text-xs text-gray-600">Sin pasos configurados.</div>}
          <ol className="space-y-4">
            {steps.map(s => (
              <li key={s.id} className="border rounded p-4 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="text-sm font-semibold flex-1 text-gray-800">{s.order}. {s.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${s.completedAt ? 'bg-green-600 text-white border-green-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{s.completedAt ? 'Completado' : 'Pendiente'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${s.reviewStatus==='approved' ? 'bg-emerald-600 text-white border-emerald-600' : s.reviewStatus==='rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}>{s.reviewStatus==='approved' ? 'Aprobado' : s.reviewStatus==='rejected' ? 'Rechazado' : 'Sin revisión'}</span>
                  {s.reviewStatus==='approved' && s.reviewScore!=null && <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white">Score {s.reviewScore}/5</span>}
                  {s.reviewStatus==='pending' && <button onClick={() => { setReviewing(s); setStatus('approved'); setScore(''); setComment(''); }} className="text-[10px] px-2 py-0.5 rounded bg-primary-600 text-white hover:bg-primary-700">Revisar</button>}
                </div>
                <p className="text-[11px] text-gray-600 mb-2 leading-relaxed">{s.description}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded border border-primary-100">{s.category}</span>
                  {s.resources.map(r => <span key={r} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{r}</span>)}
                </div>
                {s.reviewComment && <p className="mt-2 text-[11px] text-gray-700 italic">Comentario mentor: {s.reviewComment}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
            <h4 className="text-sm font-semibold mb-3">Revisar paso: {reviewing.title}</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Estado</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setStatus('approved')} className={`text-[10px] px-2 py-0.5 rounded border ${status==='approved' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>Aprobado</button>
                  <button onClick={() => setStatus('rejected')} className={`text-[10px] px-2 py-0.5 rounded border ${status==='rejected' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>Rechazado</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Score (1-5 opcional)</label>
                <input type="number" min={1} max={5} value={score} onChange={e => setScore(e.target.value ? parseInt(e.target.value,10) : '')} className="mt-1 w-20 text-xs border rounded px-2 py-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Comentario (opcional)</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="mt-1 w-full text-xs border rounded px-2 py-1" placeholder="Observaciones, recomendaciones..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button disabled={submitting} onClick={() => setReviewing(null)} className="text-xs px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200">Cancelar</button>
              <button disabled={submitting} onClick={submitReview} className="text-xs px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40">{submitting ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
