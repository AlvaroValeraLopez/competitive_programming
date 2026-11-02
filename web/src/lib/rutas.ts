// Los datos de cada track, a partir del contenido: su ruta de conceptos por
// niveles, los ejercicios que usan esos conceptos y las áreas que recorre. Los
// usan el catálogo de tracks y las páginas de cada track.
import { DOMINIOS } from './menu';
import { obtenerPaginas, type PaginaContenido } from './paginas';
import { obtenerGrafo } from './relaciones';
import { ejerciciosQueUsan, rutaDeDominio, TRACKS, type PasoDeRuta, type Track } from './tracks';

export type ConceptoConPadres = PaginaContenido & { titulo: string; padres: string[] };
export type EjercicioConPadres = PaginaContenido & { padres: string[] };

export interface DatosTrack {
	track: Track;
	/** Los conceptos de la ruta, por niveles. */
	ruta: PasoDeRuta<ConceptoConPadres>[][];
	conceptos: ConceptoConPadres[];
	ejercicios: EjercicioConPadres[];
	/** Las áreas del dominio que tienen algún concepto. */
	areas: string[];
}

export async function obtenerTracks(): Promise<DatosTrack[]> {
	const { problemas, conceptos } = await obtenerPaginas();
	const grafo = await obtenerGrafo();
	const padresDe = (id: string) => grafo.nodos.get(id)?.padres ?? [];
	const todosLosConceptos = conceptos.map((c) => ({ ...c, titulo: c.etiqueta, padres: padresDe(c.id) }));
	const todosLosEjercicios = problemas.map((p) => ({ ...p, padres: padresDe(p.id) }));

	return TRACKS.map((track) => {
		const ruta = rutaDeDominio(todosLosConceptos, track.dominio);
		const suyos = ruta.flat().map((p) => p.concepto);
		const areas = (DOMINIOS.find((d) => d.nombre === track.dominio)?.areas ?? []).filter((a) =>
			suyos.some((c) => c.area === a),
		);
		return {
			track,
			ruta,
			conceptos: suyos,
			ejercicios: ejerciciosQueUsan(todosLosEjercicios, suyos.map((c) => c.id)),
			areas,
		};
	});
}

export function urlDeTrack(track: Track, pestana?: 'aprender' | 'practicar'): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	return `${base}/tracks/${track.slug}/${pestana ? `${pestana}/` : ''}`;
}
