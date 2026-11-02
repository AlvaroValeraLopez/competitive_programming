/**
 * Soluciones de los ejercicios: archivos del repositorio, en cualquier carpeta y
 * en cualquier lenguaje. Cada página de ejercicio las lista en su frontmatter
 * (`soluciones`), con la ruta desde la raíz del repositorio, y la web las lee al
 * compilar, así el código nunca se duplica.
 *
 * Lógica pura salvo `leerSolucion`, que lee del disco; sin Astro, para poder
 * probarla con `node --test`.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';

export interface Lenguaje {
	nombre: string;
	/** Identificador para el resaltado de sintaxis (Expressive Code / Shiki). */
	resaltado: string;
}

/** Lenguajes según la extensión del archivo. */
export const LENGUAJES: Record<string, Lenguaje> = {
	'.js': { nombre: 'JavaScript', resaltado: 'js' },
	'.mjs': { nombre: 'JavaScript', resaltado: 'js' },
	'.ts': { nombre: 'TypeScript', resaltado: 'ts' },
	'.py': { nombre: 'Python', resaltado: 'python' },
	'.c': { nombre: 'C', resaltado: 'c' },
	'.h': { nombre: 'C', resaltado: 'c' },
	'.cpp': { nombre: 'C++', resaltado: 'cpp' },
	'.java': { nombre: 'Java', resaltado: 'java' },
};

/** El lenguaje de un archivo, por su extensión. Falla si la extensión no es conocida. */
export function lenguajeDe(archivo: string): Lenguaje {
	const lenguaje = LENGUAJES[extname(archivo).toLowerCase()];
	if (!lenguaje) {
		throw new Error(
			`No sé en qué lenguaje está «${archivo}» (extensiones conocidas: ${Object.keys(LENGUAJES).join(', ')})`,
		);
	}
	return lenguaje;
}

/** El nombre del archivo, sin carpetas: lo que se muestra como título del bloque de código. */
export function nombreDeArchivo(archivo: string): string {
	return basename(archivo);
}

/**
 * La raíz del repositorio: la primera carpeta, subiendo desde `desde`, que
 * contiene `.git`. No depende de dónde esté la web dentro del repositorio.
 */
export function raizDelRepositorio(desde: string = process.cwd()): string {
	let carpeta = resolve(desde);
	for (;;) {
		if (existsSync(join(carpeta, '.git'))) return carpeta;
		const padre = dirname(carpeta);
		if (padre === carpeta) throw new Error(`No hay ningún repositorio git por encima de ${desde}`);
		carpeta = padre;
	}
}

/**
 * La ruta absoluta de una solución, comprobando que es relativa a la raíz del
 * repositorio y que no se sale de ella.
 */
export function rutaDeSolucion(archivo: string, raiz: string): string {
	if (isAbsolute(archivo)) throw new Error(`La ruta de una solución es relativa a la raíz del repositorio: «${archivo}»`);
	const ruta = resolve(raiz, normalize(archivo));
	const desdeRaiz = relative(raiz, ruta);
	if (desdeRaiz.startsWith('..') || desdeRaiz.split(sep).includes('..')) {
		throw new Error(`La solución «${archivo}» está fuera del repositorio`);
	}
	return ruta;
}

/** El código de una solución. Falla, con un mensaje claro, si el archivo no existe. */
export function leerSolucion(archivo: string, raiz: string = raizDelRepositorio()): string {
	const ruta = rutaDeSolucion(archivo, raiz);
	if (!existsSync(ruta) || !statSync(ruta).isFile()) {
		throw new Error(`La solución «${archivo}» no existe en el repositorio (${ruta})`);
	}
	return readFileSync(ruta, 'utf8');
}
