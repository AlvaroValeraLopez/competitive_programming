// Datos de las páginas de problemas y conceptos, leídos del frontmatter. Los
// usan el menú lateral, los catálogos, la portada y el mapa.
import { getCollection, type CollectionEntry } from 'astro:content';
import { dominioDe } from './menu';

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
	return id.startsWith('problemas/') ? data.title.replace(/^Problema \d+:\s*/, '') : (data.sidebar.label ?? data.title);
}

function aPagina(entrada: CollectionEntry<'docs'>): PaginaContenido {
	const { id, data } = entrada;
	return {
		id,
		href: urlDe(id),
		etiqueta: etiquetaDe(entrada),
		descripcion: data.description,
		fuente: data.fuente,
		numero: data.numero,
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
