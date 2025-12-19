export default function LaRed() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">La Red de Hombres Invencible</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Servimos a Dios con el propósito de levantar a Jesucristo en la vida de todo hombre.</p>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Nuestra Visión</span>
              <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-6">Que todo hombre sea como Cristo</h2>
              <blockquote className="text-lg text-gray-700 italic border-l-4 border-primary-600 pl-6 mb-6">
                "Porque a los que antes conoció, también los predestinó para que fuesen hechos conformes a la imagen de su Hijo, para que él sea el primogénito entre muchos hermanos."
              </blockquote>
              <p className="text-sm font-semibold text-primary-700">Romanos 8:29</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-primary-600">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Objetivo Central</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold text-lg">✓</span>
                  <span>Formar hombres que reflejen el carácter de Jesucristo</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold text-lg">✓</span>
                  <span>Transformar familias, iglesias y comunidades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold text-lg">✓</span>
                  <span>Crear discípulos que discípulen a otros</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold text-lg">✓</span>
                  <span>Impactar la sociedad desde la verdad del Evangelio</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-orange-50 to-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-orange-600">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Cómo Ejecutamos</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 font-bold text-lg">→</span>
                    <span>Cursos bíblicos estructurados y reproducibles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 font-bold text-lg">→</span>
                    <span>Discipulado personalizado y mentoría</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 font-bold text-lg">→</span>
                    <span>Grupos pequeños de comunidad y responsabilidad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-600 font-bold text-lg">→</span>
                    <span>Eventos, retiros y servicio comunitario</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Nuestra Misión</span>
              <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-6">Enseñar, enseñar y enseñar hasta que todo hombre sea enseñado</h2>
              <blockquote className="text-lg text-gray-700 italic border-l-4 border-orange-600 pl-6 mb-6">
                "Lo que has oído de mí ante muchos testigos, esto encarga a hombres fieles que sean idóneos para enseñar también a otros."
              </blockquote>
              <p className="text-sm font-semibold text-primary-700">2 Timoteo 2:2</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Pilares de la Red</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg hover:border-primary-300 transition">
                <div className="text-5xl mb-4">{p.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{p.title}</h3>
                <p className="text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Live It */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Cómo Vivimos Esto</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {practices.map((p, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm border-l-4" style={{ borderColor: p.color }}>
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-2xl">{p.icon}</span> {p.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-20 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Experiencias en la Red</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-lg transition p-6 border border-gray-200">
                <div className="text-4xl mb-3">{exp.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{exp.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Eres un Hombre Invencible en Cristo</h2>
          <p className="text-lg text-white/90 mb-8">Únete a nuestra comunidad y comienza tu transformación hoy. Juntos crecemos, servimos y reflejamos a Cristo en cada aspecto de nuestras vidas.</p>
          <a href="/unete" className="inline-block px-10 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition hover:scale-105">
            Ver Ruta de Formación
          </a>
        </div>
      </section>
    </div>
  );
}

const pillars = [
  { title: 'Identidad en Cristo', desc: 'Afirmar quiénes somos según el Evangelio y no según la cultura. Cada hombre es llamado a reflejar el carácter de Jesucristo.', icon: '🕊️' },
  { title: 'Discípulos que Discipulan', desc: 'Multiplicación intencional a través de enseñanza reproducible. Uno forma a muchos, muchos forman a más.', icon: '🔁' },
  { title: 'Carácter y Servicio', desc: 'Liderazgo humilde, madurez emocional y prácticas de integridad diaria. El verdadero liderazgo sirve.', icon: '🛠️' }
];

const practices = [
  { title: 'Grupos Pequeños y Mentoría', desc: 'Acompañamiento fraterno en grupos de 2-4 personas donde compartimos luchas, oración y crecimiento real.', icon: '🤝', color: '#3b82f6' },
  { title: 'Formación Bíblica Práctica', desc: 'Cursos enfocados en transformación, no solo información. Aprendemos a vivir lo que estudiamos.', icon: '📖', color: '#f59e0b' },
  { title: 'Servicio Comunitario', desc: 'Apoyo práctico en áreas de necesidad. Somos la mano de Cristo en nuestra comunidad.', icon: '❤️', color: '#ef4444' },
  { title: 'Responsabilidad Mutua', desc: 'Cultura de exhortación amorosa donde nos cuidamos mutuamente y nos desafiamos a crecer.', icon: '⚖️', color: '#8b5cf6' }
];

const experiences = [
  { title: 'Eventos Mensuales', desc: 'Encuentros enfocados en formación intensiva, networking y activación de ministerios.', icon: '📅' },
  { title: 'Retiros de Impacto', desc: 'Espacios de retiro donde profundizamos en la Palabra, sanidad interior y recarga espiritual.', icon: '⛺' },
  { title: 'Servicio Activo', desc: 'Proyectos comunitarios donde aplicamos el Evangelio en acciones tangibles de amor.', icon: '🙌' },
  { title: 'Hermandad Profunda', desc: 'Relaciones auténticas donde nos conocemos, oramos juntos y crecemos sin máscaras.', icon: '💪' },
  { title: 'Capacitación Contínua', desc: 'Cursos, conferencias y talleres para desarrollar habilidades de liderazgo y madurez emocional.', icon: '🎓' },
  { title: 'Impacto Generacional', desc: 'Multiplicación intencional: cada hombre forma a otros para que continúe el ciclo de transformación.', icon: '🌱' }
];
