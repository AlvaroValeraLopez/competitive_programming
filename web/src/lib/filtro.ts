/**
 * Filtro de la lista de ejercicios, desde varias vistas a la vez: por texto,
 * por dificultad, por tema (el área de sus conceptos: «Teoría de números»…),
 * por conceptos y por fuente. Dentro de un grupo basta con cumplir una de las
 * opciones elegidas; entre grupos hay que cumplirlos todos. Con conceptos
 * elegidos, salen antes los ejercicios que usan más de ellos.
 *
 * El filtro se guarda en la dirección (`?dificultad=facil&tema=teoria-de-numeros&conceptos=a,b&q=…`)
 * para poder enlazar una selección, por ejemplo desde la página de cada concepto.
 *
 * Lógica pura, sin Astro ni DOM, para poder probarla con `node --test`. La
 * usa el script del navegador de ListaProblemas.astro.
 */
import { normalizar } from './menu.ts';

/** Los grupos de opciones del filtro; el nombre de cada uno es su parámetro en la dirección. */
export const GRUPOS = ['dificultad', 'tema', 'conceptos', 'fuente'] as const;
export type Grupo = (typeof GRUPOS)[number];

/** «fuente»: por fuente y número, el orden de la página; «dificultad»: de la más fácil a la más difícil. */
export const ORDENES = ['fuente', 'dificultad'] as const;
export type Orden = (typeof ORDENES)[number];

export interface Filtro {
	/** Texto del buscador, tal cual lo escribió el usuario. */
	consulta: string;
	/** Las opciones elegidas en cada grupo: «facil», «teoria-de-numeros», «suma-de-gauss», «project-euler»… */
	seleccion: Record<Grupo, string[]>;
	orden: Orden;
}

export interface Candidato {
	/** Posición en el orden por fuente y número. */
	posicion: number;
	/** Su número, si su fuente los numera. */
	numero?: number;
	/** Rango de su dificultad, de la más fácil (0) en adelante. */
	rango: number;
	/** Número, título, descripción y temas, ya normalizados (ver `normalizar`). */
	texto: string;
	/** Las opciones de cada grupo que cumple. */
	valores: Record<Grupo, string[]>;
}

const sinSeleccion = (): Record<Grupo, string[]> =>
	Object.fromEntries(GRUPOS.map((g) => [g, []])) as unknown as Record<Grupo, string[]>;

export const FILTRO_VACIO: Filtro = { consulta: '', seleccion: sinSeleccion(), orden: 'fuente' };

/** Un filtro con las opciones indicadas y el resto vacío. */
export function crearFiltro(partes: { consulta?: string; seleccion?: Partial<Record<Grupo, string[]>>; orden?: Orden } = {}): Filtro {
	return {
		consulta: partes.consulta ?? '',
		seleccion: { ...sinSeleccion(), ...partes.seleccion },
		orden: partes.orden ?? 'fuente',
	};
}

/** Si el filtro deja fuera algún ejercicio (el orden no cuenta). */
export function hayFiltro(filtro: Filtro): boolean {
	return filtro.consulta.trim() !== '' || GRUPOS.some((g) => filtro.seleccion[g].length > 0);
}

/**
 * Cuánto encaja un ejercicio con el filtro: `null` si no encaja; si encaja,
 * cuántos de los conceptos elegidos usa (0 si no se ha elegido ninguno).
 *
 * El texto se busca palabra a palabra, sin tildes; un número solo encaja con
 * el ejercicio de ese número.
 */
export function puntuacion(candidato: Candidato, filtro: Filtro): number | null {
	const consulta = normalizar(filtro.consulta.trim());
	if (consulta) {
		const encaja = /^\d+$/.test(consulta)
			? candidato.numero === Number(consulta)
			: consulta.split(/\s+/).every((palabra) => candidato.texto.includes(palabra));
		if (!encaja) return null;
	}
	for (const grupo of GRUPOS) {
		const elegidas = filtro.seleccion[grupo];
		if (elegidas.length > 0 && !elegidas.some((o) => candidato.valores[grupo].includes(o))) return null;
	}
	return filtro.seleccion.conceptos.filter((c) => candidato.valores.conceptos.includes(c)).length;
}

/**
 * Cuántos candidatos quedarían si en el grupo se eligiera solo esa opción (o
 * ninguna), con el resto del filtro igual. Es el recuento que acompaña a cada
 * opción: cambia al elegir otras, y si es 0 la opción no lleva a nada.
 */
export function recuento(candidatos: Candidato[], filtro: Filtro, grupo: Grupo, opcion?: string): number {
	const probado = elegirSolo(filtro, grupo, opcion);
	return candidatos.filter((c) => puntuacion(c, probado) !== null).length;
}

/** Los candidatos que encajan: primero los que usan más conceptos elegidos, y después según el orden elegido. */
export function filtrar<T extends Candidato>(candidatos: T[], filtro: Filtro): T[] {
	const segunOrden = (a: T, b: T) =>
		(filtro.orden === 'dificultad' ? a.rango - b.rango : 0) || a.posicion - b.posicion;
	return candidatos
		.map((c) => ({ c, p: puntuacion(c, filtro) }))
		.filter((x): x is { c: T; p: number } => x.p !== null)
		.sort((a, b) => b.p - a.p || segunOrden(a.c, b.c))
		.map((x) => x.c);
}

/** Lee el filtro de la dirección. En cada grupo ignora las opciones desconocidas y las repetidas. */
export function leerFiltro(busqueda: string, conocidas: Partial<Record<Grupo, Iterable<string>>>): Filtro {
	const params = new URLSearchParams(busqueda);
	const seleccion = sinSeleccion();
	for (const grupo of GRUPOS) {
		const validas = new Set(conocidas[grupo] ?? []);
		seleccion[grupo] = [
			...new Set(
				(params.get(grupo) ?? '')
					.split(',')
					.map((o) => o.trim())
					.filter((o) => validas.has(o)),
			),
		];
	}
	const orden = ORDENES.find((o) => o === params.get('orden')) ?? 'fuente';
	return { consulta: params.get('q') ?? '', seleccion, orden };
}

/** La parte `?…` de la dirección para un filtro (vacía si no hay filtro y el orden es el de siempre). */
export function escribirFiltro(filtro: Filtro): string {
	const partes: string[] = [];
	for (const grupo of GRUPOS) {
		const elegidas = filtro.seleccion[grupo];
		if (elegidas.length) partes.push(`${grupo}=${elegidas.map(encodeURIComponent).join(',')}`);
	}
	if (filtro.consulta.trim()) partes.push(`q=${encodeURIComponent(filtro.consulta.trim())}`);
	if (filtro.orden !== 'fuente') partes.push(`orden=${filtro.orden}`);
	return partes.length ? `?${partes.join('&')}` : '';
}

/** Añade la opción al grupo si no estaba, o la quita si estaba. */
export function alternar(filtro: Filtro, grupo: Grupo, opcion: string): Filtro {
	const elegidas = filtro.seleccion[grupo];
	return {
		...filtro,
		seleccion: {
			...filtro.seleccion,
			[grupo]: elegidas.includes(opcion) ? elegidas.filter((o) => o !== opcion) : [...elegidas, opcion],
		},
	};
}

/** Deja en el grupo solo la opción indicada, o ninguna si no se indica (como unas pestañas). */
export function elegirSolo(filtro: Filtro, grupo: Grupo, opcion?: string): Filtro {
	return { ...filtro, seleccion: { ...filtro.seleccion, [grupo]: opcion ? [opcion] : [] } };
}

/** Identificador de un tema para la dirección: «Teoría de números» → «teoria-de-numeros». */
export function slugDeTema(tema: string): string {
	return normalizar(tema)
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
