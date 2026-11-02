/**
 * Relaciones entre problemas y conceptos, y su disposición para el mapa.
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
	/** Nombre corto para el mapa. */
	etiqueta: string;
	descripcion?: string;
	numero?: number;
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
	numero?: number;
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
			numero: pagina.numero,
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

/* -------------------------------------------------------------------------- */
/* Disposición en capas (método de Sugiyama simplificado)                      */
/* -------------------------------------------------------------------------- */

export interface Medidas {
	anchoTarjeta: number;
	altoTarjeta: number;
	/** Espacio horizontal que reserva una arista larga al atravesar una capa. */
	anchoHueco: number;
	separacionX: number;
	separacionY: number;
}

export interface Caja {
	x: number;
	y: number;
	ancho: number;
	alto: number;
}

export interface NodoDispuesto extends Caja {
	id: string;
}

export interface AristaDispuesta extends Arista {
	/** Atributo `d` de un `<path>` SVG. */
	trazado: string;
	inicio: { x: number; y: number };
	fin: { x: number; y: number };
	/** Puntos por los que pasa al atravesar capas intermedias (uno por capa). */
	huecos: { x: number; yArriba: number; yAbajo: number }[];
}

export interface Disposicion {
	ancho: number;
	alto: number;
	nodos: NodoDispuesto[];
	aristas: AristaDispuesta[];
}

interface Elemento {
	clave: string;
	/** Id del nodo, o undefined si es un hueco de una arista larga. */
	nodo?: string;
	arriba: Elemento[];
	abajo: Elemento[];
	x: number;
}

/**
 * Coloca los nodos en capas según su nivel y traza las aristas. Las aristas que
 * saltan varias capas pasan por «huecos» reservados en las capas intermedias,
 * de modo que nunca atraviesan una tarjeta.
 */
export function disponer(grafo: Grafo, medidas: Medidas): Disposicion {
	const nivel = niveles(grafo);
	const numCapas = Math.max(0, ...nivel.values()) + 1;
	const capas: Elemento[][] = Array.from({ length: numCapas }, () => []);
	const elementos = new Map<string, Elemento>();

	for (const id of [...grafo.nodos.keys()].sort((a, b) => compararNodos(grafo, a, b))) {
		const elemento: Elemento = { clave: id, nodo: id, arriba: [], abajo: [], x: 0 };
		elementos.set(id, elemento);
		capas[nivel.get(id)!].push(elemento);
	}

	const cadenas = grafo.aristas.map((arista, k) => {
		const cadena = [elementos.get(arista.desde)!];
		for (let capa = nivel.get(arista.desde)! + 1; capa < nivel.get(arista.hasta)!; capa++) {
			const hueco: Elemento = { clave: `hueco:${k}:${capa}`, arriba: [], abajo: [], x: 0 };
			capas[capa].push(hueco);
			cadena.push(hueco);
		}
		cadena.push(elementos.get(arista.hasta)!);
		for (let i = 0; i + 1 < cadena.length; i++) {
			cadena[i].abajo.push(cadena[i + 1]);
			cadena[i + 1].arriba.push(cadena[i]);
		}
		return cadena;
	});

	const anchoDe = (e: Elemento) => (e.nodo ? medidas.anchoTarjeta : medidas.anchoHueco);
	const anchoCapa = (capa: Elemento[]) =>
		capa.reduce((total, e) => total + anchoDe(e), 0) + Math.max(0, capa.length - 1) * medidas.separacionX;
	const colocar = () => {
		const ancho = Math.max(...capas.map(anchoCapa));
		for (const capa of capas) {
			let x = (ancho - anchoCapa(capa)) / 2;
			for (const e of capa) {
				e.x = x + anchoDe(e) / 2;
				x += anchoDe(e) + medidas.separacionX;
			}
		}
		return ancho;
	};

	// Ordena cada capa por el baricentro de sus vecinos para reducir cruces.
	const ordenar = (capa: Elemento[], vecinos: (e: Elemento) => Elemento[]) => {
		const clave = new Map(
			capa.map((e, i) => {
				const v = vecinos(e);
				return [e, v.length ? v.reduce((s, n) => s + n.x, 0) / v.length : e.x + i * 1e-6] as const;
			}),
		);
		capa.sort((a, b) => clave.get(a)! - clave.get(b)!);
	};
	colocar();
	for (let pasada = 0; pasada < 4; pasada++) {
		for (let i = 1; i < numCapas; i++) {
			ordenar(capas[i], (e) => e.arriba);
			colocar();
		}
		for (let i = numCapas - 2; i >= 0; i--) {
			ordenar(capas[i], (e) => e.abajo);
			colocar();
		}
	}
	const ancho = colocar();

	const yArriba = (capa: number) => capa * (medidas.altoTarjeta + medidas.separacionY);
	const capaDe = new Map<Elemento, number>();
	capas.forEach((capa, i) => capa.forEach((e) => capaDe.set(e, i)));

	// Reparte los puntos de salida y de llegada a lo largo del borde de cada tarjeta.
	const puerto = (e: Elemento, vecino: Elemento, lista: Elemento[]) => {
		if (!e.nodo) return e.x;
		const ordenados = [...lista].sort((a, b) => a.x - b.x);
		const paso = medidas.anchoTarjeta / (ordenados.length + 1);
		return e.x - medidas.anchoTarjeta / 2 + paso * (ordenados.indexOf(vecino) + 1);
	};

	const aristas: AristaDispuesta[] = cadenas.map((cadena, k) => {
		const huecos: AristaDispuesta['huecos'] = [];
		const primero = cadena[0];
		const inicio = {
			x: puerto(primero, cadena[1], primero.abajo),
			y: yArriba(capaDe.get(primero)!) + medidas.altoTarjeta,
		};
		let trazado = `M ${inicio.x} ${inicio.y}`;
		let anterior = inicio;
		for (let i = 1; i < cadena.length; i++) {
			const e = cadena[i];
			const capa = capaDe.get(e)!;
			const llegada = { x: puerto(e, cadena[i - 1], e.arriba), y: yArriba(capa) };
			const medio = (anterior.y + llegada.y) / 2;
			trazado += ` C ${anterior.x} ${medio}, ${llegada.x} ${medio}, ${llegada.x} ${llegada.y}`;
			anterior = llegada;
			if (!e.nodo) {
				const abajo = yArriba(capa) + medidas.altoTarjeta;
				huecos.push({ x: e.x, yArriba: llegada.y, yAbajo: abajo });
				trazado += ` L ${e.x} ${abajo}`;
				anterior = { x: e.x, y: abajo };
			}
		}
		return { ...grafo.aristas[k], trazado, inicio, fin: anterior, huecos };
	});

	const nodos: NodoDispuesto[] = [...elementos.values()].map((e) => ({
		id: e.nodo!,
		x: e.x - medidas.anchoTarjeta / 2,
		y: yArriba(capaDe.get(e)!),
		ancho: medidas.anchoTarjeta,
		alto: medidas.altoTarjeta,
	}));

	return { ancho, alto: yArriba(numCapas - 1) + medidas.altoTarjeta, nodos, aristas };
}
