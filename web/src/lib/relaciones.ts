// Grafo de relaciones construido a partir del frontmatter de las páginas.
import { getCollection } from 'astro:content';
import { construirGrafo, type Grafo } from './grafo';
import { dominioDe } from './menu';
import { etiquetaDe } from './paginas';

export { urlDe } from './paginas';

async function construir(): Promise<Grafo> {
	const entradas = await getCollection('docs');
	return construirGrafo(
		entradas.map((entrada) => {
			const { id, data } = entrada;
			return {
				id,
				titulo: data.title,
				etiqueta: etiquetaDe(entrada),
				descripcion: data.description,
				fuente: data.fuente,
				numero: data.numero,
				dominio: dominioDe(data.area),
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
