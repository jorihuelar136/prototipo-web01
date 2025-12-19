export default function Encuentros() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">Encuentros</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Espacios de hermandad, conexión profunda y crecimiento comunitario diseñados para fortalecer vínculos y activar ministerios locales.</p>
        </div>
      </section>

      {/* Tipos de Encuentros */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Nuestros Encuentros</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {tiposEncuentros.map((tipo, i) => (
              <div key={i} className="bg-white border-2 border-emerald-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition">
                <div className="text-5xl mb-4">{tipo.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{tipo.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{tipo.desc}</p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Características</h4>
                  <ul className="space-y-2">
                    {tipo.features.map((feature, j) => (
                      <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="w-full px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition">
                  Conocer Más
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendario */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Calendario de Encuentros</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {calendario.map((evento, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-t-4 border-emerald-600">
                <div className="text-3xl mb-3">{evento.icon}</div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">{evento.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{evento.fecha}</p>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{evento.desc}</p>
                <div className="text-xs text-gray-700 mb-4">
                  <p><span className="font-semibold">Lugar:</span> {evento.lugar}</p>
                  <p><span className="font-semibold">Hora:</span> {evento.hora}</p>
                </div>
                <button className="w-full px-3 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-lg hover:bg-emerald-700">
                  Registrarse
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonio */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Lo que Dicen Nuestros Hombres</h2>
          <div className="bg-gradient-to-r from-emerald-50 to-white rounded-xl p-8 border border-emerald-200 shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-bold text-white">JM</div>
              <div>
                <h3 className="font-bold text-gray-800">Juan Martínez</h3>
                <p className="text-sm text-gray-600">Miembro de 2 años</p>
              </div>
            </div>
            <blockquote className="text-lg text-gray-700 italic mb-4">
              "Los encuentros transformaron mi forma de entender la hermandad. No es solo asistir, es conectar de corazón con hombres que luchan por lo mismo que yo. Aquí encontré apoyo real."
            </blockquote>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-emerald-600 text-lg">★</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Por Qué Asistir */}
      <section className="py-20 px-6 bg-emerald-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">¿Por Qué Asistir a un Encuentro?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {beneficios.map((beneficio, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{beneficio.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{beneficio.title}</h3>
                <p className="text-gray-600 leading-relaxed">{beneficio.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Únete al Próximo Encuentro</h2>
          <p className="text-lg text-white/90 mb-8">Conecta con hermanos, crece en comunidad y descubre el poder de la hermandad auténtica.</p>
          <a href="/unete" className="inline-block px-10 py-4 bg-white text-emerald-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition">
            Registrarme Ahora
          </a>
        </div>
      </section>
    </div>
  );
}

const tiposEncuentros = [
  {
    title: 'Encuentro Mensual',
    desc: 'Reunión regular de la comunidad para adoración, enseñanza y conexión.',
    icon: '📅',
    features: ['Oración corporativa', 'Enseñanza práctica', 'Grupos de diálogo', 'Confesión de pecados', 'Cena de hermandad']
  },
  {
    title: 'Retiro de Fin de Semana',
    desc: 'Inmersión profunda en formación espiritual y sanidad interior.',
    icon: '⛺',
    features: ['24 horas en comunidad', 'Enseñanzas intensivas', 'Momentos de oración', 'Espacios de reflexión', 'Actividades recreativas']
  },
  {
    title: 'Encuentro Regional',
    desc: 'Gran asamblea de múltiples grupos para celebrar y visionar juntos.',
    icon: '🌍',
    features: ['Paneles de liderazgo', 'Talleres especializados', '500+ hombres', 'Red integral', 'Evaluación anual']
  },
  {
    title: 'Encuentro Temático',
    desc: 'Sesiones focalizadas en tópicos específicos de formación.',
    icon: '🎯',
    features: ['Tema específico', 'Expertos invitados', 'Pequeños grupos', 'Recursos prácticos', 'Seguimiento postevent']
  }
];

const calendario = [
  {
    title: 'Encuentro Mensual Enero',
    fecha: '12 de Enero, 2026',
    desc: 'Comienzo de año: rennovación y visión 2026 con toda la Red.',
    lugar: 'Centro Principal',
    hora: '3:00 PM - 7:00 PM',
    icon: '🎉'
  },
  {
    title: 'Retiro de Invierno',
    fecha: '24-26 de Enero, 2026',
    desc: 'Profundización espiritual en contexto de retiro con naturaleza.',
    lugar: 'Centro de Retiros Las Montañas',
    hora: 'Viernes 6PM - Domingo 3PM',
    icon: '⛺'
  },
  {
    title: 'Encuentro Temático: Paternidad',
    fecha: '8 de Febrero, 2026',
    desc: 'Sesión especial enfocada en los desafíos de ser padre hoy.',
    lugar: 'Salón de Conferencias',
    hora: '10:00 AM - 1:00 PM',
    icon: '👨‍👧‍👦'
  }
];

const beneficios = [
  {
    icon: '🤝',
    title: 'Hermandad Auténtica',
    desc: 'Conecta con hombres que comparten tu fe y luchas reales.'
  },
  {
    icon: '💪',
    title: 'Fortalecimiento Espiritual',
    desc: 'Crece en tu fe a través de enseñanza y oración corporativa.'
  },
  {
    icon: '📚',
    title: 'Crecimiento Integral',
    desc: 'Formación que toca tu carácter, emociones y espíritu.'
  }
];
