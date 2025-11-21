import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Verse { text: string; reference: string }
interface Event { id: string; title: string; date: string }
interface Course { id: string; title: string; level: string }
interface Progress { coursesCompleted: number; eventsAttended: number; mentorshipSessions: number }
interface Activity { id: string; kind: string; description: string; at: string }

interface DashboardData {
  verseOfDay: Verse;
  nextEvents: Event[];
  recommendedCourses: Course[];
  progress: Progress;
  recentActivity: Activity[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, initialized } = useAuth();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!initialized || !user) return; // esperar verificación completa
      setLoading(true); setError(null);
      try {
        const resp = await axios.get('/api/dashboard', { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')||''}` } });
        if (!cancelled) setData(resp.data);
      } catch (e: any) {
        if (cancelled) return;
        if (e.response?.status === 401) setError('No autorizado. Vuelve a iniciar sesión.');
        else setError(e.message || 'Fallo inesperado');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, initialized]);

  // (El plan de crecimiento se movió a /crecimiento)

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        {loading && <span className="text-xs text-gray-400 animate-pulse">Cargando...</span>}
      </div>
      {error && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}
      {data && (
        <>
          {/* Verse of the Day */}
          <div className="rounded-xl border bg-white shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex-1">
              <p className="italic text-gray-700 leading-relaxed text-sm md:text-base">“{data.verseOfDay.text}”</p>
              <p className="mt-2 text-[11px] font-semibold tracking-wide uppercase text-primary-600">{data.verseOfDay.reference}</p>
            </div>
            <div className="flex gap-4">
              <StatCard label="Cursos" value={data.progress.coursesCompleted} icon="📘" />
              <StatCard label="Eventos" value={data.progress.eventsAttended} icon="📅" />
              <StatCard label="Mentoría" value={data.progress.mentorshipSessions} icon="🧭" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Próximos Eventos */}
            <Widget title="Próximos Eventos">
              <ul className="space-y-3 text-sm">
                {data.nextEvents.map(e => (
                  <li key={e.id} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{e.title}</span>
                    <span className="text-[11px] text-gray-500">{e.date}</span>
                  </li>
                ))}
                {!data.nextEvents.length && <li className="text-xs text-gray-400">Sin eventos.</li>}
              </ul>
            </Widget>
            {/* Cursos Recomendados */}
            <Widget title="Cursos Recomendados">
              <ul className="space-y-3 text-sm">
                {data.recommendedCourses.map(c => (
                  <li key={c.id} className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{c.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100">{c.level}</span>
                  </li>
                ))}
                {!data.recommendedCourses.length && <li className="text-xs text-gray-400">Sin cursos recomendados.</li>}
              </ul>
            </Widget>
            {/* Actividad Reciente */}
            <Widget title="Actividad Reciente">
              <ul className="space-y-3 text-sm">
                {data.recentActivity.map(a => (
                  <li key={a.id} className="flex items-start gap-2">
                    <span className="text-gray-500 text-[11px] mt-0.5">{new Date(a.at).toLocaleTimeString()}</span>
                    <span className="flex-1 text-gray-700">{a.description}</span>
                  </li>
                ))}
                {!data.recentActivity.length && <li className="text-xs text-gray-400">Sin actividad reciente.</li>}
              </ul>
            </Widget>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-24 h-24 rounded-lg border border-gray-100 bg-white shadow-sm">
      <span className="text-xl mb-1" aria-hidden>{icon}</span>
      <span className="text-lg font-semibold text-gray-700">{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
    </div>
  );
}

function Widget({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm p-5 flex flex-col">
      <h3 className="text-sm font-semibold mb-4 tracking-wide text-gray-700">{title}</h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}
