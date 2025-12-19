export default function CursosHombrĺa() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">Cursos de Hombría</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">Formación estructurada y progresiva diseñada para llevar a cada hombre a ser semejante a Cristo en carácter, liderazgo y servicio.</p>
        </div>
      </section>

      {/* Cursos Grid */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Niveles de Formación</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cursos.map((curso, i) => (
              <div key={i} className="group bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-300 transition">
                <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-4xl">{curso.icon}</div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{curso.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{curso.desc}</p>
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Contenido</h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {curso.contenido.map((item, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-primary-600">▸</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button className="w-full px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition text-sm">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metodología */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center">Metodología de Enseñanza</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {metodologia.map((paso, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4 font-bold text-primary-600">{i + 1}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{paso.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{paso.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Comienza tu Formación Hoy</h2>
          <p className="text-lg text-white/90 mb-8">Elige el nivel que corresponde a tu caminar actual y avanza en semejanza a Cristo.</p>
          <a href="/unete" className="inline-block px-10 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition">
            Registrarse Ahora
          </a>
        </div>
      </section>
    </div>
  );
}

const cursos = [
  {
    title: 'Curso 1-3: Discipulado Básico',
    desc: 'Fundamentos del seguimiento a Cristo y vida cristiana práctica.',
    icon: '📖',
    contenido: ['Quién es Jesús', 'La Salvación', 'La Biblia', 'Oración básica']
  },
  {
    title: 'Curso 4-6: Discipulado de Santificación',
    desc: 'Transformación de carácter y madurez emocional en Cristo.',
    icon: '✨',
    contenido: ['Identidad en Cristo', 'Dominio propio', 'Perdón', 'Santidad práctica']
  },
  {
    title: 'Curso 6-10: Discipulado de Servicio',
    desc: 'Liderazgo servicial y multiplicación de discípulos.',
    icon: '🙌',
    contenido: ['Liderazgo cristiano', 'Mentoría', 'Servicio', 'Multiplicación']
  },
  {
    title: 'Curso Avanzado: Maestría',
    desc: 'Formación de maestros y facilitadores de la Red.',
    icon: '🎓',
    contenido: ['Pedagogía bíblica', 'Facilitación', 'Evaluación', 'Mentoría avanzada']
  },
  {
    title: 'Especialización: Familia',
    desc: 'Aplicación integral del Evangelio en la vida familiar.',
    icon: '👨‍👩‍👧‍👦',
    contenido: ['Rol del padre', 'Comunicación familiar', 'Disciplina con amor', 'Legado familiar']
  },
  {
    title: 'Especialización: Liderazgo',
    desc: 'Desarrollo de habilidades de liderazgo transformador.',
    icon: '🏆',
    contenido: ['Visión y misión', 'Gestión de equipos', 'Toma de decisiones', 'Resolución de conflictos']
  }
];

const metodologia = [
  { title: 'Enseñanza', desc: 'Exposición clara de la Palabra con aplicación práctica.' },
  { title: 'Discusión', desc: 'Diálogo grupal para profundizar la comprensión.' },
  { title: 'Aplicación', desc: 'Reflexión personal sobre cómo vivir lo aprendido.' },
  { title: 'Acción', desc: 'Tareas reproducibles para compartir con otros.' }
];
