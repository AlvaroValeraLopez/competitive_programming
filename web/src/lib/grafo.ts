/**
 * Relaciones entre problemas y conceptos.
 *
 * Las relaciones se declaran en el frontmatter: cada problema lista los
 * conceptos que usa (`conceptos`) y cada concepto los conceptos que necesita
 * (`requiere`). Una arista A → B significa «B se apoya en A».
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

export type Tipo = 'concepto' | 'problema';

export interface Pagina {
	/** Identificador de la página: «problemas/001-…» o «conceptos/suma-de-gauss». */
	id: string;
	titulo: string;
	/** Nombre corto, para listas y tarjetas. */
	etiqueta: string;
	descripcion?: string;
	/** Solo problemas: su fuente y, si la fuente los numera, su número. */
	fuente?: string;
	numero?: number;
	/** Solo conceptos: su dominio (matemáticas, algoritmia o implementación). */
	dominio?: string;
	temas?: string[];
	/** Solo problemas: conceptos que usa (sin el prefijo «conceptos/»). */
	conceptos?: string[];
	/** Solo conceptos: conceptos previos (sin el prefijo «conceptos/»). */
	requiere?: string[];
}

export interface Nodo {
	id: string;
	tipo: Tipo;
	titulo: string;
	etiqueta: string;
	descripcion?: string;
	fuente?: string;
	numero?: number;
	dominio?: string;
	temas: string[];
	/** Nodos en los que se apoya. */
	padres: string[];
	/** Nodos que se apoyan en él. */
	hijos: string[];
}

export interface Arista {
	desde: string;
	hasta: string;
}

export interface Grafo {
	nodos: Map<string, Nodo>;
	aristas: Arista[];
}

const PREFIJOS: Record<Tipo, string> = { concepto: 'conceptos/', problema: 'problemas/' };

export function tipoDe(id: string): Tipo | undefined {
	if (id.startsWith(PREFIJOS.concepto)) return 'concepto';
	if (id.startsWith(PREFIJOS.problema)) return 'problema';
	return undefined;
}

/** Construye el grafo y comprueba que todas las referencias existen y que no hay ciclos. */
export function construirGrafo(paginas: Pagina[]): Grafo {
	const nodos = new Map<string, Nodo>();
	for (const pagina of paginas) {
		const tipo = tipoDe(pagina.id);
		if (!tipo) continue;
		nodos.set(pagina.id, {
			id: pagina.id,
			tipo,
			titulo: pagina.titulo,
			etiqueta: pagina.etiqueta,
			descripcion: pagina.descripcion,
			fuente: pagina.fuente,
			numero: pagina.numero,
			dominio: pagina.dominio,
			temas: pagina.temas ?? [],
			padres: [],
			hijos: [],
		});
	}

	const errores: string[] = [];
	const aristas: Arista[] = [];
	for (const pagina of paginas) {
		const nodo = nodos.get(pagina.id);
		if (!nodo) continue;
		if (nodo.tipo === 'problema' && pagina.requiere?.length) {
			errores.push(`${pagina.id}: un problema declara sus conceptos con «conceptos», no con «requiere»`);
		}
		if (nodo.tipo === 'concepto' && pagina.conceptos?.length) {
			errores.push(`${pagina.id}: un concepto declara sus conceptos previos con «requiere», no con «conceptos»`);
		}
		const referencias = (nodo.tipo === 'problema' ? pagina.conceptos : pagina.requiere) ?? [];
		for (const slug of new Set(referencias)) {
			const padre = PREFIJOS.concepto + slug;
			if (!nodos.has(padre)) {
				errores.push(`${pagina.id}: el concepto «${slug}» no existe (no hay ${padre}.mdx)`);
			} else if (padre === pagina.id) {
				errores.push(`${pagina.id}: un concepto no puede requerirse a sí mismo`);
			} else {
				aristas.push({ desde: padre, hasta: pagina.id });
				nodo.padres.push(padre);
				nodos.get(padre)!.hijos.push(pagina.id);
			}
		}
	}

	const ciclo = buscarCiclo(nodos);
	if (ciclo) errores.push(`Hay un ciclo de conceptos previos: ${ciclo.join(' → ')}`);
	if (errores.length) {
		throw new Error(`Relaciones entre páginas incorrectas:\n- ${errores.join('\n- ')}`);
	}
	return { nodos, aristas };
}

function buscarCiclo(nodos: Map<string, Nodo>): string[] | undefined {
	const estado = new Map<string, 'visitando' | 'hecho'>();
	const camino: string[] = [];
	const visitar = (id: string): string[] | undefined => {
		if (estado.get(id) === 'hecho') return undefined;
		if (estado.get(id) === 'visitando') return [...camino.slice(camino.indexOf(id)), id];
		estado.set(id, 'visitando');
		camino.push(id);
		for (const padre of nodos.get(id)!.padres) {
			const ciclo = visitar(padre);
			if (ciclo) return ciclo;
		}
		camino.pop();
		estado.set(id, 'hecho');
		return undefined;
	};
	for (const id of nodos.keys()) {
		const ciclo = visitar(id);
		if (ciclo) return ciclo.reverse();
	}
	return undefined;
}

/** Nivel de cada nodo: 0 si no se apoya en nada; si no, uno más que su padre más profundo. */
export function niveles(grafo: Grafo): Map<string, number> {
	const nivel = new Map<string, number>();
	const calcular = (id: string): number => {
		if (!nivel.has(id)) {
			const padres = grafo.nodos.get(id)!.padres;
			nivel.set(id, padres.length ? 1 + Math.max(...padres.map(calcular)) : 0);
		}
		return nivel.get(id)!;
	};
	for (const id of grafo.nodos.keys()) calcular(id);
	return nivel;
}

/** Otros problemas que comparten algún concepto con `id`, con los conceptos compartidos. */
export function problemasRelacionados(grafo: Grafo, id: string): { id: string; compartidos: string[] }[] {
	const nodo = grafo.nodos.get(id);
	if (!nodo) return [];
	const compartidos = new Map<string, string[]>();
	for (const concepto of nodo.padres) {
		for (const otro of grafo.nodos.get(concepto)!.hijos) {
			if (otro === id || grafo.nodos.get(otro)!.tipo !== 'problema') continue;
			compartidos.set(otro, [...(compartidos.get(otro) ?? []), concepto]);
		}
	}
	return [...compartidos]
		.map(([otro, conceptos]) => ({ id: otro, compartidos: conceptos }))
		.sort((a, b) => b.compartidos.length - a.compartidos.length || compararNodos(grafo, a.id, b.id));
}

/** Abreviatura de dos letras, como los iconos de los conceptos de Exercism: «Suma de Gauss» → «Su». */
export function abreviatura(texto: string): string {
	const letras = [...texto.normalize('NFC')].filter((c) => /\p{L}/u.test(c));
	return letras.slice(0, 2).join('').replace(/^./, (c) => c.toUpperCase());
}

export function compararNodos(grafo: Grafo, a: string, b: string): number {
	const na = grafo.nodos.get(a)!;
	const nb = grafo.nodos.get(b)!;
	if (na.tipo !== nb.tipo) return na.tipo === 'concepto' ? -1 : 1;
	return (na.numero ?? 0) - (nb.numero ?? 0) || na.etiqueta.localeCompare(nb.etiqueta, 'es');
}
