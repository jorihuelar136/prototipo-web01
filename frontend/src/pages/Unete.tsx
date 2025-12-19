import { useState } from 'react';

interface RutaItem {
  nivel: string;
  preparacion: string[];
  responsabilidades: string[];
  color: string;
}

const rutasNoPastor: RutaItem[] = [
  {
    nivel: 'Discípulo Nivel 1',
    preparacion: ['Cursos 1 al 3 de la Red', 'Discipulado Cristiano Básico', 'Mentoreo personalizado'],
    responsabilidades: ['Aprobar los cursos 1 al 3', 'Culminar Discipulado básico', 'Insertarse a la vida de comunidad en la iglesia'],
    color: 'from-blue-50 to-blue-100'
  },
  {
    nivel: 'Discípulo Nivel 2',
    preparacion: ['Cursos 4 al 6 de la Red', 'Discipulado Cristiano de Santificación', 'Mentoreo personalizado'],
    responsabilidades: ['Aprobar los cursos 4 al 6', 'Culminar Discipulado de Santificación', 'Ser parte de la vida de iglesia', 'Encargado de 2 alumnos Nivel 1'],
    color: 'from-purple-50 to-purple-100'
  },
  {
    nivel: 'Maestro',
    preparacion: ['Cursos 6 al 10 de la Red', 'Discipulado Cristiano de Servicio', 'Mentoreo personalizado'],
    responsabilidades: ['Aprobar los cursos 6 al 10', 'Culminar Discipulado de Servicio', 'Servir activamente en la iglesia', 'Encargado de 2 alumnos Nivel 2', 'Sirve en la organización de eventos', 'Buen testimonio familiar'],
    color: 'from-orange-50 to-orange-100'
  },
  {
    nivel: 'Comisionado',
    preparacion: [],
    responsabilidades: ['Maestro Principal de cursos', 'Sirve en la organización de eventos', 'Promueve la expansión del ministerio', 'Encargado de alumnos Nivel 3 según asignación', 'Buen testimonio (irreprensible)'],
    color: 'from-red-50 to-red-100'
  }
];

const rutasPastor: RutaItem[] = [
  {
    nivel: 'Discípulo Nivel 2',
    preparacion: ['Cursos 1 al 10 de la Red', 'Mentoreo personalizado'],
    responsabilidades: [],
    color: 'from-purple-50 to-purple-100'
  },
  {
    nivel: 'Maestro',
    preparacion: [],
    responsabilidades: ['Maestro Principal de cursos aprobados', 'Cumplir reglas de los cursos y rendir cuentas'],
    color: 'from-orange-50 to-orange-100'
  },
  {
    nivel: 'Comisionado',
    preparacion: [],
    responsabilidades: ['Maestro Principal de cursos', 'Sirve en la organización de eventos', 'Promueve la expansión del ministerio', 'Encargado de alumnos Nivel 3 según asignación', 'Buen testimonio (irreprensible)'],
    color: 'from-red-50 to-red-100'
  }
];

export default function Unete() {
  const [tipo, setTipo] = useState<'noPastor' | 'pastor'>('noPastor');
  const rutas = tipo === 'noPastor' ? rutasNoPastor : rutasPastor;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Únete a la Red</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">Descubre tu ruta de formación y crecimiento en semejanza a Cristo. Elige tu camino según tu contexto y comienza hoy.</p>
        </div>
      </section>

      {/* Toggle Pastor/No Pastor */}
      <section className="py-8 px-6 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="text-sm text-gray-600 font-medium">Selecciona tu tipo de formación:</span>
          <div className="flex gap-3">
            <button
              onClick={() => setTipo('noPastor')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                tipo === 'noPastor'
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              No soy Pastor
            </button>
            <button
              onClick={() => setTipo('pastor')}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                tipo === 'pastor'
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              Soy Pastor
            </button>
          </div>
        </div>
      </section>

      {/* Timeline Cards */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Desktop Timeline */}
          <div className="hidden md:grid gap-6" style={{ gridTemplateColumns: `repeat(${rutas.length}, 1fr)` }}>
            {rutas.map((ruta, idx) => (
              <div key={idx} className="relative">
                {/* Card */}
                <div className={`bg-gradient-to-br ${ruta.color} border-2 border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition min-h-[400px] flex flex-col`}>
                  {/* Nivel */}
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{ruta.nivel}</h2>
                    <div className="h-1 w-12 bg-primary-600 rounded mt-2" />
                  </div>

                  {/* Preparación */}
                  {ruta.preparacion.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Preparación</h3>
                      <ul className="space-y-2">
                        {ruta.preparacion.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-primary-600 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Responsabilidades */}
                  {ruta.responsabilidades.length > 0 && (
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Responsabilidades & Logros</h3>
                      <ul className="space-y-2">
                        {ruta.responsabilidades.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Arrow connector */}
                  {idx < rutas.length - 1 && (
                    <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl hidden lg:block">
                      →
                    </div>
                  )}
                </div>

                {/* Vertical line for mobile */}
                {idx < rutas.length - 1 && (
                  <div className="md:hidden h-8 bg-gradient-to-b from-primary-600 to-primary-400 mx-auto w-1 my-2" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="md:hidden space-y-6">
            {rutas.map((ruta, idx) => (
              <div key={idx}>
                <div className={`bg-gradient-to-br ${ruta.color} border-2 border-gray-200 rounded-xl p-5 shadow-md`}>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{ruta.nivel}</h2>
                  <div className="h-1 w-8 bg-primary-600 rounded mb-4" />

                  {ruta.preparacion.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Preparación</h3>
                      <ul className="space-y-1">
                        {ruta.preparacion.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-primary-600 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ruta.responsabilidades.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Responsabilidades & Logros</h3>
                      <ul className="space-y-1">
                        {ruta.responsabilidades.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-green-600 font-bold mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {idx < rutas.length - 1 && (
                  <div className="h-6 flex justify-center pt-2">
                    <div className="text-primary-600 text-xl">↓</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-lg text-white/90 mb-8">Regístrate hoy y accede a cursos, mentoría personalizada y una comunidad de hombres enfocados en crecer en semejanza a Cristo.</p>
          <a
            href={`${import.meta.env.BASE_URL}register`}
            className="inline-block px-10 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition hover:scale-105"
          >
            Crear Cuenta Ahora
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                <summary className="font-semibold text-gray-800 flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary-600 group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const faqs = [
  {
    q: '¿Cuál es la diferencia entre ser Pastor y No Pastor?',
    a: 'Los pastores ingresan con mayor aceleración en el programa (niveles 2-4), mientras que los no-pastores avanzan progresivamente desde Nivel 1. Ambas rutas culminan con responsabilidades de liderazgo y maestría en la Red.'
  },
  {
    q: '¿Cuánto tiempo toma completar cada nivel?',
    a: 'El tiempo varía según dedicación personal y disponibilidad. En promedio, cada nivel toma entre 6 a 12 meses completar cursos, discipulado y responsabilidades asignadas.'
  },
  {
    q: '¿Necesito tener experiencia previa?',
    a: 'No. La Red está diseñada para hombres en cualquier punto de su caminar con Cristo. Comenzamos desde Discipulado Cristiano Básico y construimos desde ahí.'
  },
  {
    q: '¿Qué implica "Mentoreo personalizado"?',
    a: 'Es acompañamiento regular (semanal o quincenal) de un mentor que te ayuda a aplicar lo aprendido, resolver desafíos personales y crecer en carácter.'
  },
  {
    q: '¿Cuáles son los próximos pasos después de registrarme?',
    a: 'Después de crear cuenta: (1) Completa tu perfil, (2) Participa en orientación inicial, (3) Conoce tu mentor asignado, (4) Comienza Curso 1.'
  }
];
