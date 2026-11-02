/**
 * La dificultad de cada ejercicio, como en las listas de Exercism: fácil,
 * media o difícil. Cada ejercicio la declara en su frontmatter (`dificultad`).
 *
 * - Fácil: basta una idea directa, o la fuerza bruta ya es suficiente.
 * - Media: hace falta un concepto que no es inmediato (la criba, la
 *   factorización, la programación dinámica…).
 * - Difícil: hay que combinar varios conceptos y pensar en la eficiencia.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

export const DIFICULTADES = [
	{ id: 'facil', nombre: 'Fácil' },
	{ id: 'media', nombre: 'Media' },
	{ id: 'dificil', nombre: 'Difícil' },
] as const;

export type Dificultad = (typeof DIFICULTADES)[number]['id'];

/** Para el esquema del contenido (`z.enum`). */
export const ID_DIFICULTADES = DIFICULTADES.map((d) => d.id) as [Dificultad, ...Dificultad[]];

export function nombreDeDificultad(dificultad: Dificultad): string {
	return DIFICULTADES.find((d) => d.id === dificultad)!.nombre;
}

/** Posición de la dificultad, de la más fácil (0) a la más difícil, para ordenar. */
export function rangoDeDificultad(dificultad: string | undefined): number {
	const i = DIFICULTADES.findIndex((d) => d.id === dificultad);
	return i === -1 ? DIFICULTADES.length : i;
}
