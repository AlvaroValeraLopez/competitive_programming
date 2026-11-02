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
/* Disposición en columnas (método de Sugiyama simplificado)                   */
/* -------------------------------------------------------------------------- */

/*
 * Cada nivel es una columna, de izquierda a derecha: los conceptos previos a la
 * izquierda y lo que se apoya en ellos a la derecha. Dentro de cada columna las
 * tarjetas se apilan hacia abajo. Así el ancho solo depende de cuántos niveles
 * hay (que crece muy despacio) y no de cuántos problemas (que crece rápido).
 */

export interface Medidas {
	anchoTarjeta: number;
	altoTarjeta: number;
	/** Espacio vertical que reserva una arista larga al atravesar una columna. */
	altoHueco: number;
	/** Separación horizontal entre columnas. */
	separacionColumnas: number;
	/** Separación vertical entre tarjetas de la misma columna. */
	separacionFilas: number;
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
	/** Punto de salida, en el borde derecho del padre. */
	inicio: { x: number; y: number };
	/** Punto de llegada, en el borde izquierdo del hijo. */
	fin: { x: number; y: number };
	/** Tramos por los que pasa al atravesar columnas intermedias (uno por columna). */
	huecos: { y: number; xIzquierda: number; xDerecha: number }[];
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
	/** Vecinos en la columna anterior y en la siguiente. */
	previos: Elemento[];
	siguientes: Elemento[];
	/** Posición vertical del centro. */
	y: number;
}

/**
 * Coloca los nodos en columnas según su nivel y traza las aristas. Las aristas
 * que saltan varias columnas pasan por «huecos» reservados en las columnas
 * intermedias, de modo que nunca atraviesan una tarjeta.
 */
export function disponer(grafo: Grafo, medidas: Medidas): Disposicion {
	const nivel = niveles(grafo);
	const numColumnas = Math.max(0, ...nivel.values()) + 1;
	const columnas: Elemento[][] = Array.from({ length: numColumnas }, () => []);
	const elementos = new Map<string, Elemento>();

	for (const id of [...grafo.nodos.keys()].sort((a, b) => compararNodos(grafo, a, b))) {
		const elemento: Elemento = { clave: id, nodo: id, previos: [], siguientes: [], y: 0 };
		elementos.set(id, elemento);
		columnas[nivel.get(id)!].push(elemento);
	}

	const cadenas = grafo.aristas.map((arista, k) => {
		const cadena = [elementos.get(arista.desde)!];
		for (let columna = nivel.get(arista.desde)! + 1; columna < nivel.get(arista.hasta)!; columna++) {
			const hueco: Elemento = { clave: `hueco:${k}:${columna}`, previos: [], siguientes: [], y: 0 };
			columnas[columna].push(hueco);
			cadena.push(hueco);
		}
		cadena.push(elementos.get(arista.hasta)!);
		for (let i = 0; i + 1 < cadena.length; i++) {
			cadena[i].siguientes.push(cadena[i + 1]);
			cadena[i + 1].previos.push(cadena[i]);
		}
		return cadena;
	});

	const altoDe = (e: Elemento) => (e.nodo ? medidas.altoTarjeta : medidas.altoHueco);
	const altoColumna = (columna: Elemento[]) =>
		columna.reduce((total, e) => total + altoDe(e), 0) + Math.max(0, columna.length - 1) * medidas.separacionFilas;
	const colocar = () => {
		const alto = Math.max(...columnas.map(altoColumna));
		for (const columna of columnas) {
			let y = (alto - altoColumna(columna)) / 2;
			for (const e of columna) {
				e.y = y + altoDe(e) / 2;
				y += altoDe(e) + medidas.separacionFilas;
			}
		}
		return alto;
	};

	// Ordena cada columna por el baricentro de sus vecinos para reducir cruces.
	const ordenar = (columna: Elemento[], vecinos: (e: Elemento) => Elemento[]) => {
		const clave = new Map(
			columna.map((e, i) => {
				const v = vecinos(e);
				return [e, v.length ? v.reduce((s, n) => s + n.y, 0) / v.length : e.y + i * 1e-6] as const;
			}),
		);
		columna.sort((a, b) => clave.get(a)! - clave.get(b)!);
	};
	colocar();
	for (let pasada = 0; pasada < 4; pasada++) {
		for (let i = 1; i < numColumnas; i++) {
			ordenar(columnas[i], (e) => e.previos);
			colocar();
		}
		for (let i = numColumnas - 2; i >= 0; i--) {
			ordenar(columnas[i], (e) => e.siguientes);
			colocar();
		}
	}
	const alto = colocar();

	const xIzquierda = (columna: number) => columna * (medidas.anchoTarjeta + medidas.separacionColumnas);
	const columnaDe = new Map<Elemento, number>();
	columnas.forEach((columna, i) => columna.forEach((e) => columnaDe.set(e, i)));

	// Reparte los puntos de salida y de llegada a lo largo del borde de cada tarjeta.
	const puerto = (e: Elemento, vecino: Elemento, lista: Elemento[]) => {
		if (!e.nodo) return e.y;
		const ordenados = [...lista].sort((a, b) => a.y - b.y);
		const paso = medidas.altoTarjeta / (ordenados.length + 1);
		return e.y - medidas.altoTarjeta / 2 + paso * (ordenados.indexOf(vecino) + 1);
	};

	const aristas: AristaDispuesta[] = cadenas.map((cadena, k) => {
		const huecos: AristaDispuesta['huecos'] = [];
		const primero = cadena[0];
		const inicio = {
			x: xIzquierda(columnaDe.get(primero)!) + medidas.anchoTarjeta,
			y: puerto(primero, cadena[1], primero.siguientes),
		};
		let trazado = `M ${inicio.x} ${inicio.y}`;
		let anterior = inicio;
		for (let i = 1; i < cadena.length; i++) {
			const e = cadena[i];
			const izquierda = xIzquierda(columnaDe.get(e)!);
			const llegada = { x: izquierda, y: puerto(e, cadena[i - 1], e.previos) };
			const medio = (anterior.x + llegada.x) / 2;
			trazado += ` C ${medio} ${anterior.y}, ${medio} ${llegada.y}, ${llegada.x} ${llegada.y}`;
			anterior = llegada;
			if (!e.nodo) {
				const derecha = izquierda + medidas.anchoTarjeta;
				huecos.push({ y: e.y, xIzquierda: izquierda, xDerecha: derecha });
				trazado += ` L ${derecha} ${e.y}`;
				anterior = { x: derecha, y: e.y };
			}
		}
		return { ...grafo.aristas[k], trazado, inicio, fin: anterior, huecos };
	});

	const nodos: NodoDispuesto[] = [...elementos.values()].map((e) => ({
		id: e.nodo!,
		x: xIzquierda(columnaDe.get(e)!),
		y: e.y - medidas.altoTarjeta / 2,
		ancho: medidas.anchoTarjeta,
		alto: medidas.altoTarjeta,
	}));

	const ancho = numColumnas * medidas.anchoTarjeta + (numColumnas - 1) * medidas.separacionColumnas;
	return { ancho, alto, nodos, aristas };
}
