/**
 * Agrupación de problemas y conceptos para el menú lateral y los catálogos:
 * problemas por decenas y conceptos por área matemática.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

/** Áreas matemáticas de los conceptos, en el orden en que aparecen en el menú. */
export const AREAS = [
	'Sumas y series',
	'Teoría de números',
	'Combinatoria',
	'Aritmética modular',
	'Programación dinámica',
	'Números grandes',
] as const;

export type Area = (typeof AREAS)[number];

export interface Entrada {
	id: string;
	titulo: string;
	/** Problemas: su número en Project Euler. */
	numero?: number;
	/** Conceptos: su área. */
	area?: string;
	/** Conceptos: orden dentro del área (`sidebar.order`). */
	orden?: number;
}

export interface Decena<T extends Entrada = Entrada> {
	desde: number;
	hasta: number;
	etiqueta: string;
	problemas: T[];
}

export interface GrupoArea<T extends Entrada = Entrada> {
	area: Area;
	conceptos: T[];
}

/** La decena a la que pertenece un problema: 1–10, 11–20, …, 91–100. */
export function decena(numero: number): Omit<Decena, 'problemas'> {
	if (!Number.isInteger(numero) || numero < 1) {
		throw new Error(`Número de problema no válido: ${numero}`);
	}
	const desde = Math.floor((numero - 1) / 10) * 10 + 1;
	return { desde, hasta: desde + 9, etiqueta: `${desde}–${desde + 9}` };
}

/** Agrupa los problemas por decenas, ordenadas, sin decenas vacías. */
export function agruparProblemas<T extends Entrada>(problemas: T[]): Decena<T>[] {
	const errores: string[] = [];
	const vistos = new Map<number, string>();
	for (const p of problemas) {
		if (p.numero === undefined) {
			errores.push(`${p.id}: falta el número del problema (sidebar.order)`);
		} else if (vistos.has(p.numero)) {
			errores.push(`${p.id}: el problema ${p.numero} ya está en ${vistos.get(p.numero)}`);
		} else {
			vistos.set(p.numero, p.id);
		}
	}
	if (errores.length) throw new Error(`Problemas mal numerados:\n- ${errores.join('\n- ')}`);

	const decenas = new Map<number, Decena<T>>();
	for (const p of [...problemas].sort((a, b) => a.numero! - b.numero!)) {
		const d = decena(p.numero!);
		if (!decenas.has(d.desde)) decenas.set(d.desde, { ...d, problemas: [] });
		decenas.get(d.desde)!.problemas.push(p);
	}
	return [...decenas.values()].sort((a, b) => a.desde - b.desde);
}

/** Agrupa los conceptos por área, en el orden de `AREAS`, sin áreas vacías. */
export function agruparConceptos<T extends Entrada>(conceptos: T[]): GrupoArea<T>[] {
	const errores = conceptos
		.filter((c) => !AREAS.includes(c.area as Area))
		.map((c) =>
			c.area
				? `${c.id}: el área «${c.area}» no existe (áreas: ${AREAS.join(', ')})`
				: `${c.id}: falta el área del concepto (campo «area»)`,
		);
	if (errores.length) throw new Error(`Conceptos sin área válida:\n- ${errores.join('\n- ')}`);

	return AREAS.map((area) => ({
		area,
		conceptos: conceptos
			.filter((c) => c.area === area)
			.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.titulo.localeCompare(b.titulo, 'es')),
	})).filter((grupo) => grupo.conceptos.length > 0);
}

/** Texto en minúsculas y sin tildes, para buscar sin que importen los acentos. */
export function normalizar(texto: string): string {
	return texto
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}
