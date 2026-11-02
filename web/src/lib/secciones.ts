/**
 * Las secciones de la cabecera: pocas, y cada página pertenece a una.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

export interface Seccion {
	/** Carpeta de contenido de la sección (y su ruta). */
	ruta: string;
	nombre: string;
}

export const SECCIONES: readonly Seccion[] = [
	{ ruta: 'conceptos', nombre: 'Conceptos' },
	{ ruta: 'problemas', nombre: 'Ejercicios' },
	{ ruta: 'mapa', nombre: 'Mapa' },
];

/** La sección a la que pertenece una página, por su identificador («problemas/003-…»). */
export function seccionDe(id: string, secciones: readonly Seccion[] = SECCIONES): Seccion | undefined {
	return secciones.find((s) => id === s.ruta || id.startsWith(`${s.ruta}/`));
}
