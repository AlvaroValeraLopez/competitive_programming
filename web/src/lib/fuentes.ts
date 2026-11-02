/**
 * Fuentes de ejercicios: de dónde viene cada uno y cómo se identifica.
 *
 * Una fuente puede numerar sus ejercicios (Project Euler, Acepta el reto) o
 * identificarlos solo por su nombre (Exercism). Los ejercicios numerados se
 * agrupan por decenas; los demás, por orden alfabético.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

export interface Fuente {
	nombre: string;
	/** Si sus ejercicios tienen número. */
	numerada: boolean;
	/** Cómo se nombra un ejercicio numerado: «Problema 3», «Reto 142»… */
	prefijo?: string;
}

export const FUENTES = {
	'project-euler': { nombre: 'Project Euler', numerada: true, prefijo: 'Problema' },
	exercism: { nombre: 'Exercism', numerada: false },
} as const satisfies Record<string, Fuente>;

export type IdFuente = keyof typeof FUENTES;

/** Los identificadores de las fuentes, como tupla no vacía (para el esquema del contenido). */
export const ID_FUENTES = Object.keys(FUENTES) as [IdFuente, ...IdFuente[]];

/** Lo que precede a la etiqueta de un ejercicio: «Problema 3: » si su fuente es numerada, o nada. */
export function prefijoDeEjercicio(
	ejercicio: { fuente?: string; numero?: number },
	fuentes: Record<string, Fuente> = FUENTES,
): string {
	const fuente = ejercicio.fuente ? fuentes[ejercicio.fuente] : undefined;
	return fuente?.numerada && ejercicio.numero !== undefined ? `${fuente.prefijo ?? 'Ejercicio'} ${ejercicio.numero}: ` : '';
}

/**
 * El nombre completo de un ejercicio, como aparece en tarjetas y enlaces:
 * «Problema 3: Mayor factor primo» si su fuente es numerada, o solo la etiqueta.
 */
export function nombreDeEjercicio(
	ejercicio: { fuente?: string; numero?: number; etiqueta: string },
	fuentes: Record<string, Fuente> = FUENTES,
): string {
	return prefijoDeEjercicio(ejercicio, fuentes) + ejercicio.etiqueta;
}
