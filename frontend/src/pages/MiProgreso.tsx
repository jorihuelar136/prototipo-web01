export default function MiProgreso() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Mi Progreso</h2>
      <p className="text-gray-600 mb-6 text-sm">Resumen de tu avance espiritual y formativo.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white shadow-sm text-sm">Cursos Completados: 0</div>
        <div className="p-4 border rounded-lg bg-white shadow-sm text-sm">Eventos Asistidos: 0</div>
        <div className="p-4 border rounded-lg bg-white shadow-sm text-sm">Sesiones Mentoría: 0</div>
      </div>
    </div>
  );
}
