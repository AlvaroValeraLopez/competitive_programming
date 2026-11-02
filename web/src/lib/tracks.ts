/**
 * Tracks: las rutas de aprendizaje. Cada track es un dominio de conceptos
 * (Matemáticas, Algoritmia, Implementación) y recorre sus conceptos en orden:
 * primero los que no necesitan ningún otro concepto de la ruta, después los que
 * se apoyan en ellos, y así sucesivamente. Los ejercicios de un track son los
 * que usan alguno de sus conceptos.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

import { DOMINIOS, type Dominio } from './menu.ts';

export interface Track {
	/** Ruta de la página del track: /tracks/<slug>/. */
	slug: string;
	dominio: Dominio;
	/** Lo que va dentro del icono hexagonal. */
	glifo: string;
	/** Una frase, para la tarjeta del catálogo. */
	resumen: string;
	/** Qué se aprende en la ruta, para la pestaña «Acerca de». */
	descripcion: string;
}

export const TRACKS: readonly Track[] = [
	{
		slug: 'matematicas',
		dominio: 'Matemáticas',
		glifo: 'Σ',
		resumen: 'Las ideas que convierten una búsqueda en una fórmula.',
		descripcion:
			'Sumas y series, teoría de números, combinatoria y aritmética modular: la matemática que hay detrás de cada solución eficiente. La ruta empieza por las sumas y los números primos, que no necesitan nada previo, y avanza hacia los conceptos que se apoyan en ellos, como la función divisor, los coeficientes binomiales o el orden multiplicativo.',
	},
	{
		slug: 'algoritmia',
		dominio: 'Algoritmia',
		glifo: '⤳',
		resumen: 'Cómo organizar un cálculo para no repetir trabajo.',
		descripcion:
			'Las técnicas que deciden cuánto cuesta un cálculo, más allá de la matemática del problema. La ruta empieza por el principio de optimalidad y la programación dinámica: partir un problema en subproblemas que se repiten y resolver cada uno una sola vez.',
	},
	{
		slug: 'implementacion',
		dominio: 'Implementación',
		glifo: '{ }',
		resumen: 'Lo que hay que saber del lenguaje para que la solución sea correcta.',
		descripcion:
			'Una idea correcta puede dar un resultado equivocado si el lenguaje no la representa bien. Esta ruta trata lo que hay que tener en cuenta al programar: el tamaño de los enteros y su desbordamiento, los límites de los números de coma flotante y los enteros de precisión arbitraria.',
	},
];

/** El track de una ruta /tracks/<slug>/, o `undefined` si no existe. */
export function trackPorSlug(slug: string, tracks: readonly Track[] = TRACKS): Track | undefined {
	return tracks.find((t) => t.slug === slug);
}

/** El track de un dominio. */
export function trackDeDominio(dominio: string | undefined, tracks: readonly Track[] = TRACKS): Track | undefined {
	return tracks.find((t) => t.dominio === dominio);
}

/** Un concepto, con lo mínimo para colocarlo en una ruta. */
export interface ConceptoDeRuta {
	id: string;
	titulo: string;
	dominio?: string;
	orden?: number;
	/** Conceptos en los que se apoya, de cualquier dominio. */
	padres: string[];
}

export interface PasoDeRuta<T extends ConceptoDeRuta> {
	concepto: T;
	/** Conceptos previos que pertenecen a otra ruta. */
	deOtraRuta: string[];
}

/**
 * Los conceptos de un dominio, por niveles. En el nivel 0 están los que no se
 * apoyan en ningún concepto del mismo dominio; cada uno de los demás está un
 * nivel por encima del más alto de sus conceptos previos del dominio. Los
 * previos de otros dominios no cuentan para el nivel, pero se anotan.
 */
export function rutaDeDominio<T extends ConceptoDeRuta>(conceptos: T[], dominio: string): PasoDeRuta<T>[][] {
	const delDominio = new Map(conceptos.filter((c) => c.dominio === dominio).map((c) => [c.id, c]));
	const nivel = new Map<string, number>();
	const enCurso = new Set<string>();
	const calcular = (id: string): number => {
		if (nivel.has(id)) return nivel.get(id)!;
		if (enCurso.has(id)) throw new Error(`Los conceptos previos forman un ciclo en ${id}`);
		enCurso.add(id);
		const previos = delDominio.get(id)!.padres.filter((p) => delDominio.has(p));
		const valor = previos.length ? 1 + Math.max(...previos.map(calcular)) : 0;
		enCurso.delete(id);
		nivel.set(id, valor);
		return valor;
	};

	const niveles: PasoDeRuta<T>[][] = [];
	for (const concepto of delDominio.values()) {
		const n = calcular(concepto.id);
		(niveles[n] ??= []).push({ concepto, deOtraRuta: concepto.padres.filter((p) => !delDominio.has(p)) });
	}
	for (const pasos of niveles) {
		pasos.sort(
			(a, b) =>
				(a.concepto.orden ?? 0) - (b.concepto.orden ?? 0) || a.concepto.titulo.localeCompare(b.concepto.titulo, 'es'),
		);
	}
	return niveles;
}

/** Los ejercicios que usan alguno de los conceptos indicados. */
export function ejerciciosQueUsan<T extends { padres: string[] }>(ejercicios: T[], conceptos: Iterable<string>): T[] {
	const buscados = new Set(conceptos);
	return ejercicios.filter((e) => e.padres.some((p) => buscados.has(p)));
}

/** Todos los dominios tienen su track, y ningún track apunta a un dominio inexistente. */
export function comprobarTracks(tracks: readonly Track[] = TRACKS): string[] {
	const errores: string[] = [];
	for (const d of DOMINIOS) if (!tracks.some((t) => t.dominio === d.nombre)) errores.push(`El dominio «${d.nombre}» no tiene track`);
	for (const t of tracks) if (!DOMINIOS.some((d) => d.nombre === t.dominio)) errores.push(`El track «${t.slug}» es de un dominio que no existe`);
	if (new Set(tracks.map((t) => t.slug)).size !== tracks.length) errores.push('Hay dos tracks con el mismo slug');
	return errores;
}
