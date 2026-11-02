// Grafo de relaciones construido a partir del frontmatter de las páginas.
import { getCollection } from 'astro:content';
import { construirGrafo, type Grafo } from './grafo';

async function construir(): Promise<Grafo> {
	const entradas = await getCollection('docs');
	return construirGrafo(
		entradas.map(({ id, data }) => {
			const esProblema = id.startsWith('problemas/');
			return {
				id,
				titulo: data.title,
				etiqueta: esProblema ? data.title.replace(/^Problema \d+:\s*/, '') : (data.sidebar.label ?? data.title),
				descripcion: data.description,
				numero: esProblema ? data.sidebar.order : undefined,
				temas: data.temas,
				conceptos: data.conceptos,
				requiere: data.requiere,
			};
		}),
	);
}

let grafo: Promise<Grafo> | undefined;

/** El grafo se construye una vez por compilación (en desarrollo, en cada petición). */
export function obtenerGrafo(): Promise<Grafo> {
	if (import.meta.env.DEV) return construir();
	grafo ??= construir();
	return grafo;
}

export function urlDe(id: string): string {
	return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${id}/`;
}
