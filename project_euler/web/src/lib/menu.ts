/**
 * Agrupación de ejercicios y conceptos para el menú lateral y los catálogos:
 * los ejercicios por fuente (y, si la fuente los numera, por decenas) y los
 * conceptos por dominio y área.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

import { FUENTES, type Fuente } from './fuentes.ts';

/**
 * Dominios de los conceptos y sus áreas, en el orden en que aparecen en el menú.
 * Un ejercicio puede necesitar matemáticas (qué hay que saber), algoritmia (cómo
 * organizar el cálculo) e implementación (qué hay que tener en cuenta al
 * programarlo en un lenguaje concreto).
 */
export const DOMINIOS = [
	{ nombre: 'Matemáticas', areas: ['Sumas y series', 'Teoría de números', 'Combinatoria', 'Aritmética modular'] },
	{ nombre: 'Algoritmia', areas: ['Programación dinámica'] },
	{ nombre: 'Implementación', areas: ['Números grandes'] },
] as const;

export type Dominio = (typeof DOMINIOS)[number]['nombre'];
export type Area = (typeof DOMINIOS)[number]['areas'][number];

/** Todas las áreas, en orden, como tupla no vacía (para el esquema del contenido). */
export const AREAS = DOMINIOS.flatMap((d) => d.areas) as unknown as readonly [Area, ...Area[]];

/** El dominio al que pertenece un área. */
export function dominioDe(area: string | undefined): Dominio | undefined {
	return DOMINIOS.find((d) => (d.areas as readonly string[]).includes(area ?? ''))?.nombre;
}

export interface Entrada {
	id: string;
	titulo: string;
	/** Ejercicios: la fuente de la que viene. */
	fuente?: string;
	/** Ejercicios de una fuente numerada: su número en esa fuente. */
	numero?: number;
	/** Conceptos: su área. */
	area?: string;
	/** Orden dentro de su grupo (`sidebar.order`). */
	orden?: number;
}

export interface Decena<T extends Entrada = Entrada> {
	desde: number;
	hasta: number;
	etiqueta: string;
	problemas: T[];
}

export interface GrupoFuente<T extends Entrada = Entrada> {
	fuente: string;
	nombre: string;
	/** Fuentes numeradas: sus ejercicios por decenas. */
	decenas?: Decena<T>[];
	/** Todos sus ejercicios, ordenados por número o, si no tienen, por orden y título. */
	ejercicios: T[];
}

export interface GrupoArea<T extends Entrada = Entrada> {
	area: Area;
	conceptos: T[];
}

export interface GrupoDominio<T extends Entrada = Entrada> {
	dominio: Dominio;
	areas: GrupoArea<T>[];
}

/** La decena a la que pertenece un problema: 1–10, 11–20, …, 91–100. */
export function decena(numero: number): Omit<Decena, 'problemas'> {
	if (!Number.isInteger(numero) || numero < 1) {
		throw new Error(`Número de problema no válido: ${numero}`);
	}
	const desde = Math.floor((numero - 1) / 10) * 10 + 1;
	return { desde, hasta: desde + 9, etiqueta: `${desde}–${desde + 9}` };
}

function porDecenas<T extends Entrada>(ejercicios: T[]): Decena<T>[] {
	const decenas = new Map<number, Decena<T>>();
	for (const p of ejercicios) {
		const d = decena(p.numero!);
		if (!decenas.has(d.desde)) decenas.set(d.desde, { ...d, problemas: [] });
		decenas.get(d.desde)!.problemas.push(p);
	}
	return [...decenas.values()].sort((a, b) => a.desde - b.desde);
}

/**
 * Agrupa los ejercicios por fuente, en el orden en que están declaradas las
 * fuentes y sin fuentes vacías. Falla si a un ejercicio le falta la fuente, si
 * la fuente no existe, o si en una fuente numerada falta un número o se repite.
 */
export function agruparEjercicios<T extends Entrada>(
	ejercicios: T[],
	fuentes: Record<string, Fuente> = FUENTES,
): GrupoFuente<T>[] {
	const errores: string[] = [];
	const vistos = new Map<string, string>();
	for (const e of ejercicios) {
		const fuente = e.fuente ? fuentes[e.fuente] : undefined;
		if (!e.fuente) {
			errores.push(`${e.id}: falta la fuente del ejercicio (campo «fuente»)`);
		} else if (!fuente) {
			errores.push(`${e.id}: la fuente «${e.fuente}» no existe (fuentes: ${Object.keys(fuentes).join(', ')})`);
		} else if (fuente.numerada) {
			const clave = `${e.fuente}#${e.numero}`;
			if (e.numero === undefined) {
				errores.push(`${e.id}: falta el número del ejercicio en ${fuente.nombre} (campo «numero»)`);
			} else if (vistos.has(clave)) {
				errores.push(`${e.id}: el número ${e.numero} de ${fuente.nombre} ya está en ${vistos.get(clave)}`);
			} else {
				vistos.set(clave, e.id);
			}
		}
	}
	if (errores.length) throw new Error(`Ejercicios mal identificados:\n- ${errores.join('\n- ')}`);

	return Object.entries(fuentes)
		.map(([id, fuente]) => {
			const suyos = ejercicios.filter((e) => e.fuente === id);
			const ordenados = fuente.numerada
				? [...suyos].sort((a, b) => a.numero! - b.numero!)
				: [...suyos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.titulo.localeCompare(b.titulo, 'es'));
			return {
				fuente: id,
				nombre: fuente.nombre,
				decenas: fuente.numerada ? porDecenas(ordenados) : undefined,
				ejercicios: ordenados,
			};
		})
		.filter((grupo) => grupo.ejercicios.length > 0);
}

/**
 * Agrupa los conceptos por dominio y, dentro de cada uno, por área, en el orden
 * de `DOMINIOS` y sin grupos vacíos. Falla si a un concepto le falta el área o
 * tiene una que no existe.
 */
export function agruparConceptos<T extends Entrada>(conceptos: T[]): GrupoDominio<T>[] {
	const errores = conceptos
		.filter((c) => !dominioDe(c.area))
		.map((c) =>
			c.area
				? `${c.id}: el área «${c.area}» no existe (áreas: ${AREAS.join(', ')})`
				: `${c.id}: falta el área del concepto (campo «area»)`,
		);
	if (errores.length) throw new Error(`Conceptos sin área válida:\n- ${errores.join('\n- ')}`);

	return DOMINIOS.map((d) => ({
		dominio: d.nombre,
		areas: d.areas
			.map((area) => ({
				area,
				conceptos: conceptos
					.filter((c) => c.area === area)
					.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.titulo.localeCompare(b.titulo, 'es')),
			}))
			.filter((grupo) => grupo.conceptos.length > 0),
	})).filter((grupo) => grupo.areas.length > 0);
}

/** Texto en minúsculas y sin tildes, para buscar sin que importen los acentos. */
export function normalizar(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}
