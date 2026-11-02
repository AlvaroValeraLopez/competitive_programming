// Datos de las páginas de problemas y conceptos, leídos del frontmatter. Los
// usan los catálogos, la portada y los tracks.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Dificultad } from './dificultad';
import { FUENTES } from './fuentes';
import { dominioDe } from './menu';
import { lenguajeDe } from './soluciones';

export interface PaginaContenido {
	id: string;
	href: string;
	/** Nombre corto: «Múltiplos de 3 y 5», «Suma de Gauss». */
	etiqueta: string;
	descripcion?: string;
	/** Ejercicios: la fuente de la que vienen (ver fuentes.ts). */
	fuente?: string;
	/** Ejercicios de una fuente numerada: su número en ella. */
	numero?: number;
	/** Ejercicios: fácil, media o difícil. */
	dificultad?: Dificultad;
	/** Ejercicios: los lenguajes de sus soluciones, sin repetir. */
	lenguajes: string[];
	/** Conceptos: su área y el dominio al que pertenece. */
	area?: string;
	dominio?: string;
	/** Orden dentro de su sección (`sidebar.order`). */
	orden?: number;
	temas: string[];
}

export function urlDe(id: string): string {
	return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${id}/`;
}

export function etiquetaDe({ id, data }: CollectionEntry<'docs'>): string {
	if (!id.startsWith('problemas/')) return data.sidebar.label ?? data.title;
	// En las fuentes numeradas el título empieza por «Problema 3: », y la etiqueta es
	// lo que sigue; en las demás, la etiqueta es la del menú.
	const fuente = data.fuente ? FUENTES[data.fuente] : undefined;
	return fuente?.numerada ? data.title.replace(/^[^:]*\d+:\s*/, '') : (data.sidebar.label ?? data.title);
}

function aPagina(entrada: CollectionEntry<'docs'>): PaginaContenido {
	const { id, data } = entrada;
	if (id.startsWith('problemas/') && !data.dificultad) {
		throw new Error(`El ejercicio ${id} no tiene dificultad: añade «dificultad: facil | media | dificil» a su frontmatter`);
	}
	return {
		id,
		href: urlDe(id),
		etiqueta: etiquetaDe(entrada),
		descripcion: data.description,
		fuente: data.fuente,
		numero: data.numero,
		dificultad: data.dificultad,
		lenguajes: [...new Set((data.soluciones ?? []).map((s) => lenguajeDe(s.archivo).nombre))],
		area: data.area,
		dominio: dominioDe(data.area),
		orden: data.sidebar.order,
		temas: data.temas ?? [],
	};
}

/** Problemas ordenados por número y conceptos por orden (sin las páginas de catálogo). */
export async function obtenerPaginas(): Promise<{ problemas: PaginaContenido[]; conceptos: PaginaContenido[] }> {
	const entradas = await getCollection('docs');
	const de = (carpeta: string) =>
		entradas
			.filter(({ id }) => id.startsWith(`${carpeta}/`))
			.map(aPagina)
			.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.etiqueta.localeCompare(b.etiqueta, 'es'));
	return { problemas: de('problemas'), conceptos: de('conceptos') };
}
