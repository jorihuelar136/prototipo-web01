export default function Conferencias() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-500 text-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">Conferencias</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Eventos de formación intensiva y exhortación diseñados para impulsar transformación profunda en la vida de nuestros hombres.</p>
        </div>
      </section>

      {/* Próximas Conferencias */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Próximas Conferencias</h2>
          <div className="space-y-6">
            {conferencias.map((conf, i) => (
              <div key={i} className="bg-white border-l-4 border-amber-600 rounded-lg shadow-md hover:shadow-lg transition p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{conf.title}</h3>
                    <p className="text-gray-600 mb-4">{conf.desc}</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><span className="font-semibold">📅 Fecha:</span> {conf.fecha}</p>
                      <p><span className="font-semibold">📍 Lugar:</span> {conf.lugar}</p>
                      <p><span className="font-semibold">⏱️ Hora:</span> {conf.hora}</p>
                      <p><span className="font-semibold">👨‍💼 Expositor:</span> {conf.expositor}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-800 mb-3">Contenido a Tratar</h4>
                    <ul className="space-y-2 mb-6">
                      {conf.temas.map((tema, j) => (
                        <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-amber-600 font-bold">→</span>
                          <span>{tema}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition">
                        Registrarse
                      </button>
                      <button className="px-6 py-2 border-2 border-amber-600 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anteriores */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Conferencias Anteriores</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {anteriores.map((anterior, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6">
                <h3 className="font-bold text-gray-800 mb-2">{anterior.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{anterior.fecha}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{anterior.desc}</p>
                <button className="text-sm text-amber-600 font-semibold hover:text-amber-700">
                  Ver Galería →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impacto */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Impacto de Nuestras Conferencias</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {impactos.map((impacto, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4 font-bold text-amber-600">{impacto.numero}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{impacto.title}</h3>
                <p className="text-sm text-gray-600">{impacto.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-600 to-amber-500 text-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">No Te Pierdas la Próxima Conferencia</h2>
          <p className="text-lg text-white/90 mb-8">Espacios limitados. Regístrate hoy para asegurar tu lugar.</p>
          <a href="/unete" className="inline-block px-10 py-4 bg-white text-amber-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition">
            Registrarme Ahora
          </a>
        </div>
      </section>
    </div>
  );
}

const conferencias = [
  {
    title: 'Identidad Inquebrantable en Cristo',
    desc: 'Conferencia intensiva sobre identidad cristiana en un mundo que intenta redefinirte.',
    fecha: '15 de Diciembre, 2025',
    lugar: 'Sede Principal',
    hora: '9:00 AM - 1:00 PM',
    expositor: 'Pastor Carlos Mendez',
    temas: ['Quién soy en Cristo', 'Libertad de la aprobación humana', 'Vivir conforme a tu identidad', 'Testimonio público']
  },
  {
    title: 'Liderazgo que Sirve',
    desc: 'Formación en liderazgo humilde, servicial y transformador.',
    fecha: '22 de Diciembre, 2025',
    lugar: 'Centro de Retiros',
    hora: '8:00 AM - 5:00 PM',
    expositor: 'Prof. David Romero',
    temas: ['Principios de liderazgo bíblico', 'Gestión de equipos', 'Comunicación efectiva', 'Modelo de Cristo']
  }
];

const anteriores = [
  { title: 'Santidad Práctica para Hombres Modernos', fecha: 'Octubre 2025', desc: 'Exploración profunda de cómo vivir santidad en contexto urbano actual.' },
  { title: 'Familia: El Primer Ministerio', fecha: 'Septiembre 2025', desc: 'Impacto transformador del Evangelio en nuestras familias.' },
  { title: 'Multiplicación de Discípulos', fecha: 'Agosto 2025', desc: 'Modelos prácticos para formar a otros hombres en fe.' }
];

const impactos = [
  { numero: '500+', title: 'Hombres Impactados', desc: 'En las últimas 5 conferencias' },
  { numero: '95%', title: 'Satisfacción', desc: 'Participantes recomendarían asistir' },
  { numero: '200+', title: 'Transformaciones', desc: 'Historias de cambio registradas' }
];
