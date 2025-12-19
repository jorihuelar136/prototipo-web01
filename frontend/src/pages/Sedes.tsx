import { useSearchParams } from 'react-router-dom';

const sedesData = {
  peru: {
    nombre: 'Perú',
    sedes: [
      {
        ciudad: 'Lima - Surco',
        direccion: 'Batallón Callao Sur 296 - Urb Las Gardenías',
        lider: 'Wilson Bacón'
      },
      {
        ciudad: 'Lima - San Juan Lurigancho',
        direccion: 'Templo del Áspero',
        lider: 'Ps. David Guevara'
      },
      {
        ciudad: 'Lima - San Juan Lurigancho',
        direccion: 'Av. Pirámide del Sol Nº',
        lider: 'Carlos Sosa'
      },
      {
        ciudad: 'Trujillo',
        direccion: '',
        lider: 'Ps. Víctor García'
      },
      {
        ciudad: 'Trujillo',
        direccion: '',
        lider: 'Jonatan García'
      },
      {
        ciudad: 'Chiclayo',
        direccion: 'Calle 7 de Enero Nº',
        lider: 'César Vásquez'
      },
      {
        ciudad: 'Iquitos',
        direccion: '',
        lider: 'Cristian Utia'
      }
    ]
  },
  mexico: {
    nombre: 'México',
    sedes: [
      {
        ciudad: 'Ciudad de México',
        direccion: 'Sede Principal',
        lider: 'Por confirmar'
      }
    ]
  },
  venezuela: {
    nombre: 'Venezuela',
    sedes: [
      {
        ciudad: 'Caracas',
        direccion: 'Sede Principal',
        lider: 'Por confirmar'
      }
    ]
  },
  bolivia: {
    nombre: 'Bolivia',
    sedes: [
      {
        ciudad: 'La Paz',
        direccion: 'Sede Principal',
        lider: 'Por confirmar'
      }
    ]
  }
};

export default function Sedes() {
  const [searchParams] = useSearchParams();
  const paisParam = searchParams.get('pais') || 'peru';
  const sede = sedesData[paisParam as keyof typeof sedesData] || sedesData.peru;

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-4xl md:text-5xl mb-4">Nuestras Sedes</h1>
          <p className="text-lg text-primary-100">Encuentra la sede más cercana a ti y únete a nuestra comunidad de hombres</p>
        </div>
      </section>

      {/* Selector de Países */}
      <section className="py-12 border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-2xl font-bold mb-6">Selecciona tu país</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sedesData).map(([key, data]) => (
              <a
                key={key}
                href={`${import.meta.env.BASE_URL}sedes?pais=${key}`}
                className={`p-4 rounded-lg text-center font-semibold transition ${
                  paisParam === key
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {data.nombre}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sedes del País Seleccionado */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold mb-12">Sedes en {sede.nombre}</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {sede.sedes.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-primary-700 mb-2">{item.ciudad}</h3>
                  {item.direccion && (
                    <p className="text-gray-600 text-sm mb-3">
                      📍 {item.direccion}
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Líder de la sede:</p>
                  <p className="text-lg font-semibold text-gray-800">{item.lider}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-primary-50 border-l-4 border-primary-600 p-8 rounded">
            <h3 className="text-2xl font-bold mb-2">¿No encuentras tu ciudad?</h3>
            <p className="text-gray-700 mb-4">Si quieres iniciar una sede en tu ciudad o traer a Red de Hombres Invencible a tu comunidad, contáctanos. Estamos expandiendo nuestro alcance.</p>
            <a
              href="mailto:info@redhombres.org"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded font-semibold hover:bg-primary-700 transition"
            >
              Contacta con nosotros
            </a>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold mb-12">¿Qué pasa en una sede?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🙏</div>
              <h3 className="text-xl font-bold mb-2">Formación Espiritual</h3>
              <p className="text-gray-600 text-sm">Estudios bíblicos, prédicas y reflexiones profundas sobre carácter cristiano y hombría.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Comunidad Auténtica</h3>
              <p className="text-gray-600 text-sm">Encuentros fraternales, mentoría, accountability groups y relaciones significativas entre hermanos.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-2">Impacto Integral</h3>
              <p className="text-gray-600 text-sm">Crecimiento en familia, trabajo, iglesia y sociedad. Somos hombres que transforman nuestras esferas.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
