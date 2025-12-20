import { Link } from "react-router-dom";

export default function Materiales() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-500 text-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">Materiales de Formación</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Recursos descargables, guías de estudio, devocionales y herramientas prácticas para profundizar en tu fe y compartir con otros hombres.</p>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Recursos Disponibles</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {categorias.map((cat, i) => (
              <div key={i} className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition">
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{cat.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{cat.desc}</p>
                <ul className="space-y-2 mb-6">
                  {cat.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">
                  Explorar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Descargables */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Descargas Recomendadas</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {descargas.map((archivo, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="text-4xl mb-3">{archivo.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{archivo.title}</h3>
                <p className="text-xs text-gray-600 mb-4">{archivo.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{archivo.tipo}</span>
                  <button className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded hover:bg-purple-700">
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Usar */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Cómo Usar Estos Materiales</h2>
          <div className="space-y-6">
            {usos.map((uso, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white font-bold text-lg">
                    {i + 1}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{uso.title}</h3>
                  <p className="text-gray-600">{uso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-500 text-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">¿Necesitas Más Recursos?</h2>
          <p className="text-lg text-white/90 mb-8">Accede a nuestra biblioteca completa de materiales en la intranet con tu cuenta de miembro.</p>
          <Link to="/unete"className="inline-block px-10 py-4 bg-white text-purple-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition">
            Acceder a Biblioteca
          </Link>
        </div>
      </section>
    </div>
  );
}

const categorias = [
  {
    title: 'Guías de Estudio',
    desc: 'Materiales estructurados para profundizar en cada curso.',
    icon: '📚',
    items: ['Guías por capítulo', 'Preguntas de reflexión', 'Resúmenes ejecutivos', 'Mapas conceptuales']
  },
  {
    title: 'Devocionales',
    desc: 'Reflexiones diarias para alimentar tu espíritu.',
    icon: '🙏',
    items: ['Devocionales semanales', 'Meditaciones bíblicas', 'Oraciones guiadas', 'Testimonios']
  },
  {
    title: 'Herramientas Prácticas',
    desc: 'Recursos para aplicar lo aprendido en tu vida.',
    icon: '🛠️',
    items: ['Planes de acción', 'Cuestionarios de evaluación', 'Plantillas de mentoría', 'Matrices de seguimiento']
  },
  {
    title: 'Videos & Audios',
    desc: 'Contenido multimedia para enriquecer tu aprendizaje.',
    icon: '🎥',
    items: ['Charlas magistrales', 'Testimonios en video', 'Podcasts formativos', 'Conferencias grabadas']
  }
];

const descargas = [
  { title: 'Manual del Discípulo Nivel 1', desc: 'Completa guía para iniciar tu formación', icon: '📖', tipo: 'PDF' },
  { title: 'Plan de Lectura Anual', desc: 'Recorrido estructurado por la Biblia', icon: '📅', tipo: 'Excel' },
  { title: 'Guía de Mentoreo', desc: 'Cómo ser un mentor efectivo', icon: '👨‍🏫', tipo: 'PDF' },
  { title: 'Calendario de Eventos', desc: 'Próximos encuentros y retiros', icon: '📍', tipo: 'ICS' },
  { title: 'Devocional Mensual', desc: 'Reflexiones para cada día del mes', icon: '📝', tipo: 'PDF' },
  { title: 'Plantilla de Grupos Pequeños', desc: 'Estructura para dirigir tu grupo', icon: '👥', tipo: 'Word' }
];

const usos = [
  { title: 'Estudio Personal', desc: 'Dedica tiempo cada semana a profundizar en los materiales a tu propio ritmo.' },
  { title: 'Grupos Pequeños', desc: 'Comparte los recursos con tu grupo y dirijan sesiones de estudio juntos.' },
  { title: 'Mentoría', desc: 'Utiliza las guías como base para conversar y acompañar a tu mentorizado.' },
  { title: 'Enseñanza', desc: 'Prepara lecciones usando estos materiales para compartir con tu comunidad.' }
];
