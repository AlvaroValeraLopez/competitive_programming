/**
 * Filtro de la página de problemas: por conceptos (uno o varios) y por texto.
 * El filtro se guarda en la dirección (`?conceptos=a,b&q=…`) para poder
 * enlazar una selección, por ejemplo desde la página de cada concepto.
 *
 * Lógica pura, sin Astro ni DOM, para poder probarla con `node --test`. La
 * usa el script del navegador de ListaProblemas.astro.
 */
import { normalizar } from './menu.ts';

export interface Filtro {
	/** Slugs de los conceptos elegidos («suma-de-gauss»…). */
	conceptos: string[];
	/** Texto del buscador, tal cual lo escribió el usuario. */
	consulta: string;
}

export interface Candidato {
	numero: number;
	/** Número, título, descripción y temas, ya normalizados (ver `normalizar`). */
	texto: string;
	/** Slugs de los conceptos que usa el problema. */
	conceptos: string[];
}

export const FILTRO_VACIO: Filtro = { conceptos: [], consulta: '' };

export function hayFiltro(filtro: Filtro): boolean {
	return filtro.conceptos.length > 0 || filtro.consulta.trim() !== '';
}

/**
 * Cuánto encaja un problema con el filtro: `null` si no encaja; si encaja,
 * cuántos de los conceptos elegidos usa (0 si no se ha elegido ninguno).
 *
 * Con varios conceptos elegidos basta con que use uno; los que usan más
 * salen antes. El texto se busca palabra a palabra, sin tildes; un número
 * solo encaja con el problema de ese número.
 */
export function puntuacion(candidato: Candidato, filtro: Filtro): number | null {
	const consulta = normalizar(filtro.consulta.trim());
	if (consulta) {
		const encaja = /^\d+$/.test(consulta)
			? candidato.numero === Number(consulta)
			: consulta.split(/\s+/).every((palabra) => candidato.texto.includes(palabra));
		if (!encaja) return null;
	}
	if (filtro.conceptos.length === 0) return 0;
	const usados = filtro.conceptos.filter((c) => candidato.conceptos.includes(c)).length;
	return usados > 0 ? usados : null;
}

/** Los candidatos que encajan, del más al menos relevante (y por número si empatan). */
export function filtrar<T extends Candidato>(candidatos: T[], filtro: Filtro): T[] {
	return candidatos
		.map((c) => ({ c, p: puntuacion(c, filtro) }))
		.filter((x): x is { c: T; p: number } => x.p !== null)
		.sort((a, b) => b.p - a.p || a.c.numero - b.c.numero)
		.map((x) => x.c);
}

/** Lee el filtro de la dirección. Ignora conceptos desconocidos y repetidos. */
export function leerFiltro(busqueda: string, conocidos: Iterable<string>): Filtro {
	const params = new URLSearchParams(busqueda);
	const validos = new Set(conocidos);
	const conceptos = [
		...new Set(
			(params.get('conceptos') ?? '')
				.split(',')
				.map((c) => c.trim())
				.filter((c) => validos.has(c)),
		),
	];
	return { conceptos, consulta: params.get('q') ?? '' };
}

/** La parte `?…` de la dirección para un filtro (vacía si no hay filtro). */
export function escribirFiltro(filtro: Filtro): string {
	const partes: string[] = [];
	if (filtro.conceptos.length) partes.push(`conceptos=${filtro.conceptos.map(encodeURIComponent).join(',')}`);
	if (filtro.consulta.trim()) partes.push(`q=${encodeURIComponent(filtro.consulta.trim())}`);
	return partes.length ? `?${partes.join('&')}` : '';
}

/** Añade el concepto al filtro si no estaba, o lo quita si estaba. */
export function alternarConcepto(filtro: Filtro, concepto: string): Filtro {
	const conceptos = filtro.conceptos.includes(concepto)
		? filtro.conceptos.filter((c) => c !== concepto)
		: [...filtro.conceptos, concepto];
	return { ...filtro, conceptos };
}
