export interface Course { id: string; title: string; level: string }
export interface Event { id: string; title: string; date: string }

export const courses: Course[] = [
  { id: 'c1', title: 'Fundamentos de la Fe', level: 'básico' },
  { id: 'c2', title: 'Liderazgo Servicial', level: 'intermedio' },
  { id: 'c3', title: 'Discipulado Avanzado', level: 'avanzado' }
];

export const events: Event[] = [
  { id: 'e1', title: 'Retiro Anual', date: '2025-11-15' },
  { id: 'e2', title: 'Taller de Mentoría', date: '2025-12-05' },
  { id: 'e3', title: 'Jornada de Servicio', date: '2026-01-20' }
];

export interface Verse { text: string; reference: string }
export const verses: Verse[] = [
  { text: 'Velad, estad firmes en la fe; portaos varonilmente, y esforzaos. Todas vuestras cosas sean hechas con amor.', reference: '1 Corintios 16:13-14' },
  { text: 'Hierro con hierro se aguza; y así el hombre aguza el rostro de su amigo.', reference: 'Proverbios 27:17' },
  { text: 'Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes.', reference: 'Josué 1:9' }
];
