/**
 * Disposición del árbol de conceptos, al estilo del de Exercism: los conceptos
 * por niveles de arriba abajo (cada uno debajo de los que necesita), cada fila
 * centrada y ordenada para que las líneas se crucen lo menos posible.
 *
 * Una relación que salta varios niveles pasa por un hueco reservado en cada
 * fila intermedia, así que nunca atraviesa una tarjeta.
 *
 * Lógica pura, sin Astro, para poder probarla con `node --test`.
 */

export interface NodoArbol {
	id: string;
	titulo: string;
	orden?: number;
	/** Conceptos que necesita. Solo cuentan los que también están en el árbol. */
	padres: string[];
}

export interface MedidasArbol {
	anchoNodo: number;
	altoNodo: number;
	/** Ancho que reserva una relación larga al atravesar una fila. */
	anchoHueco: number;
	/** Separación horizontal entre elementos de una fila. */
	separacionX: number;
	/** Separación vertical entre filas. */
	separacionY: number;
}

export interface NodoColocado {
	id: string;
	nivel: number;
	x: number;
	y: number;
	ancho: number;
	alto: number;
}

export interface AristaColocada {
	desde: string;
	hasta: string;
	/** Atributo `d` de un `<path>` SVG, del centro del borde inferior del padre al del superior del hijo. */
	trazado: string;
}

export interface Arbol {
	ancho: number;
	alto: number;
	nodos: NodoColocado[];
	aristas: AristaColocada[];
}

interface Elemento {
	nodo?: string;
	arriba: Elemento[];
	abajo: Elemento[];
	/** Centro horizontal. */
	x: number;
}

/** Nivel de cada nodo: 0 si no necesita ningún nodo del árbol; si no, uno más que el más profundo de sus padres. */
export function nivelesDelArbol(nodos: NodoArbol[]): Map<string, number> {
	const porId = new Map(nodos.map((n) => [n.id, n]));
	const nivel = new Map<string, number>();
	const enCurso = new Set<string>();
	const calcular = (id: string): number => {
		if (nivel.has(id)) return nivel.get(id)!;
		if (enCurso.has(id)) throw new Error(`Los conceptos previos forman un ciclo en ${id}`);
		enCurso.add(id);
		const padres = porId.get(id)!.padres.filter((p) => porId.has(p));
		const valor = padres.length ? 1 + Math.max(...padres.map(calcular)) : 0;
		enCurso.delete(id);
		nivel.set(id, valor);
		return valor;
	};
	for (const n of nodos) calcular(n.id);
	return nivel;
}

export function disponerArbol(nodos: NodoArbol[], medidas: MedidasArbol): Arbol {
	const nivel = nivelesDelArbol(nodos);
	const ids = new Set(nodos.map((n) => n.id));
	const numFilas = nodos.length ? Math.max(...nivel.values()) + 1 : 0;
	const filas: Elemento[][] = Array.from({ length: numFilas }, () => []);
	const elementos = new Map<string, Elemento>();

	const ordenados = [...nodos].sort(
		(a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.titulo.localeCompare(b.titulo, 'es'),
	);
	for (const n of ordenados) {
		const e: Elemento = { nodo: n.id, arriba: [], abajo: [], x: 0 };
		elementos.set(n.id, e);
		filas[nivel.get(n.id)!].push(e);
	}

	// Cada relación es una cadena de elementos, con un hueco por cada fila intermedia.
	const relaciones = ordenados.flatMap((n) =>
		n.padres.filter((p) => ids.has(p)).map((p) => ({ desde: p, hasta: n.id })),
	);
	const cadenas = relaciones.map(({ desde, hasta }) => {
		const cadena = [elementos.get(desde)!];
		for (let fila = nivel.get(desde)! + 1; fila < nivel.get(hasta)!; fila++) {
			const hueco: Elemento = { arriba: [], abajo: [], x: 0 };
			filas[fila].push(hueco);
			cadena.push(hueco);
		}
		cadena.push(elementos.get(hasta)!);
		for (let i = 0; i + 1 < cadena.length; i++) {
			cadena[i].abajo.push(cadena[i + 1]);
			cadena[i + 1].arriba.push(cadena[i]);
		}
		return cadena;
	});

	const anchoDe = (e: Elemento) => (e.nodo ? medidas.anchoNodo : medidas.anchoHueco);
	const anchoFila = (fila: Elemento[]) =>
		fila.reduce((total, e) => total + anchoDe(e), 0) + Math.max(0, fila.length - 1) * medidas.separacionX;
	const colocar = () => {
		const ancho = Math.max(0, ...filas.map(anchoFila));
		for (const fila of filas) {
			let x = (ancho - anchoFila(fila)) / 2;
			for (const e of fila) {
				e.x = x + anchoDe(e) / 2;
				x += anchoDe(e) + medidas.separacionX;
			}
		}
		return ancho;
	};

	// Ordena cada fila por el baricentro de sus vecinos de la fila de al lado.
	const ordenar = (fila: Elemento[], vecinos: (e: Elemento) => Elemento[]) => {
		const clave = new Map(
			fila.map((e, i) => {
				const v = vecinos(e);
				return [e, v.length ? v.reduce((s, n) => s + n.x, 0) / v.length : e.x + i * 1e-6] as const;
			}),
		);
		fila.sort((a, b) => clave.get(a)! - clave.get(b)!);
	};
	colocar();
	for (let pasada = 0; pasada < 4; pasada++) {
		for (let i = 1; i < numFilas; i++) {
			ordenar(filas[i], (e) => e.arriba);
			colocar();
		}
		for (let i = numFilas - 2; i >= 0; i--) {
			ordenar(filas[i], (e) => e.abajo);
			colocar();
		}
	}
	const ancho = colocar();
	const alto = numFilas ? numFilas * medidas.altoNodo + (numFilas - 1) * medidas.separacionY : 0;
	const yArriba = (fila: number) => fila * (medidas.altoNodo + medidas.separacionY);

	const filaDe = new Map<Elemento, number>();
	filas.forEach((fila, i) => fila.forEach((e) => filaDe.set(e, i)));

	const aristas: AristaColocada[] = cadenas.map((cadena, k) => {
		const primero = cadena[0];
		let punto = { x: primero.x, y: yArriba(filaDe.get(primero)!) + medidas.altoNodo };
		let trazado = `M ${punto.x} ${punto.y}`;
		for (let i = 1; i < cadena.length; i++) {
			const e = cadena[i];
			const llegada = { x: e.x, y: yArriba(filaDe.get(e)!) };
			const medio = (punto.y + llegada.y) / 2;
			trazado += ` C ${punto.x} ${medio}, ${llegada.x} ${medio}, ${llegada.x} ${llegada.y}`;
			punto = llegada;
			if (!e.nodo) {
				// Atraviesa la fila por su hueco, en vertical.
				punto = { x: e.x, y: llegada.y + medidas.altoNodo };
				trazado += ` L ${punto.x} ${punto.y}`;
			}
		}
		return { ...relaciones[k], trazado };
	});

	const colocados: NodoColocado[] = ordenados.map((n) => {
		const e = elementos.get(n.id)!;
		const fila = nivel.get(n.id)!;
		return { id: n.id, nivel: fila, x: e.x - medidas.anchoNodo / 2, y: yArriba(fila), ancho: medidas.anchoNodo, alto: medidas.altoNodo };
	});

	return { ancho, alto, nodos: colocados, aristas };
}
