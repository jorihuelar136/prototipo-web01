export default function Ensenanzas() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-primary-700 mb-3">Enseñanzas</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Contenido breve y estructurado para profundizar en la Palabra y aplicarla con otros hombres. Cada área impulsa crecimiento reproducible.</p>
      </header>
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {sections.map(s => (
          <div key={s.title} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="font-semibold text-lg mb-2 text-primary-700">{s.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.desc}</p>
            <ul className="space-y-2 text-xs text-gray-500">
              {s.items.map(it => <li key={it} className="flex items-start gap-2"><span className="text-primary-600">•</span><span>{it}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
      <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-display font-semibold mb-3">Formato Breve & Reproducible</h2>
        <p className="text-sm leading-relaxed text-white/90">Cada enseñanza se estructura en: Texto base, Observación, Aplicación personal y Acción reproducible para compartir con otro hombre en la semana.</p>
      </section>
    </div>
  );
}

const sections = [
  {
    title: 'Fundamentos Bíblicos',
    desc: 'Bases doctrinales esenciales para una fe sólida y vivida con coherencia diaria.',
    items: ['La Persona de Cristo', 'Identidad & Gracia', 'Autoridad de la Escritura', 'Santificación práctica']
  },
  {
    title: 'Vida Discipular',
    desc: 'Herramientas para caminar con otros, formar hábitos y multiplicar liderazgo servicial.',
    items: ['Mentoría semanal', 'Hábitos espirituales', 'Responsabilidad mutua', 'Multiplicación']
  },
  {
    title: 'Impacto & Servicio',
    desc: 'Aplicar el Evangelio en familia, trabajo y comunidad con sensibilidad y verdad.',
    items: ['Vida familiar', 'Trabajo & ética', 'Servicio comunitario', 'Testimonio público']
  }
];
