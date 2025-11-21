// Fuente centralizada de shorts (Opción B)
// Sustituye los videoId por los IDs reales de tus YouTube Shorts.
// Puedes añadir/quitar elementos sin tocar el componente.
// TODO: Mantener este listado sincronizado con backend shorts.json.

export interface ShortItem {
  id: string;
  videoId: string;
  title: string;
}

export const localShorts: ShortItem[] = [
  { id: 's1', videoId: 'HheINZgIY_U', title: 'Liderazgo servicial' },
  { id: 's2', videoId: 'F_Xpte9hHkw', title: 'Identidad en Cristo' },
  { id: 's3', videoId: 'IqNwpeZEnag', title: 'Hermandad auténtica' },
  { id: 's4', videoId: '6JFj_sjjdVQ', title: 'Disciplina espiritual' },
  { id: 's5', videoId: 'tNDN_InVUsc', title: 'Mentoría transformadora' }
];

// Nota: Si deseas más, agrega objetos aquí y copia a backend/src/data/shorts.json.
