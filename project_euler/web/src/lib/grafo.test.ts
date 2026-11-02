import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
	abreviatura,
	construirGrafo,
	disponer,
	niveles,
	problemasRelacionados,
	type Medidas,
	type Pagina,
} from './grafo.ts';

const MEDIDAS: Medidas = { anchoTarjeta: 220, altoTarjeta: 112, altoHueco: 20, separacionColumnas: 48, separacionFilas: 28 };

// Las relaciones actuales de la web.
const PAGINAS: Pagina[] = [
	{ id: 'conceptos/suma-de-gauss', titulo: 'Suma de los primeros n números', etiqueta: 'Suma de Gauss' },
	{ id: 'conceptos/inclusion-exclusion', titulo: 'Inclusión-exclusión', etiqueta: 'Inclusión-exclusión', requiere: ['coeficientes-binomiales'] },
	{ id: 'conceptos/funcion-divisor', titulo: 'La función divisor', etiqueta: 'Función divisor' },
	{ id: 'conceptos/coeficientes-binomiales', titulo: 'Coeficientes binomiales', etiqueta: 'Coeficientes binomiales' },
	{ id: 'problemas/001-multiplos-de-3-y-5', titulo: 'Múltiplos de 3 y 5', etiqueta: '1', numero: 1, conceptos: ['suma-de-gauss', 'inclusion-exclusion'] },
	{ id: 'problemas/012-numero-triangular-muy-divisible', titulo: 'Triangular muy divisible', etiqueta: '12', numero: 12, conceptos: ['suma-de-gauss', 'funcion-divisor'] },
	{ id: 'problemas/015-caminos-en-una-cuadricula', titulo: 'Caminos en una cuadrícula', etiqueta: '15', numero: 15, conceptos: ['coeficientes-binomiales'] },
	{ id: 'index', titulo: 'Portada', etiqueta: 'Portada' },
];

describe('construirGrafo', () => {
	test('crea una arista por cada concepto usado o requerido, e ignora otras páginas', () => {
		const grafo = construirGrafo(PAGINAS);
		assert.equal(grafo.nodos.size, 7);
		assert.equal(grafo.aristas.length, 6);
		assert.deepEqual(grafo.nodos.get('conceptos/suma-de-gauss')!.hijos.sort(), [
			'problemas/001-multiplos-de-3-y-5',
			'problemas/012-numero-triangular-muy-divisible',
		]);
		assert.deepEqual(grafo.nodos.get('conceptos/inclusion-exclusion')!.padres, ['conceptos/coeficientes-binomiales']);
	});

	test('falla si se usa un concepto que no existe, diciendo dónde', () => {
		const paginas = [...PAGINAS, { id: 'problemas/002-x', titulo: 'X', etiqueta: '2', conceptos: ['fibonacci'] }];
		assert.throws(() => construirGrafo(paginas), /problemas\/002-x: el concepto «fibonacci» no existe/);
	});

	test('falla si un problema usa «requiere» o un concepto usa «conceptos»', () => {
		assert.throws(
			() => construirGrafo([...PAGINAS, { id: 'problemas/002-x', titulo: 'X', etiqueta: '2', requiere: ['suma-de-gauss'] }]),
			/no con «requiere»/,
		);
		assert.throws(
			() => construirGrafo([...PAGINAS, { id: 'conceptos/x', titulo: 'X', etiqueta: 'X', conceptos: ['suma-de-gauss'] }]),
			/no con «conceptos»/,
		);
	});

	test('falla si los conceptos previos forman un ciclo', () => {
		const paginas: Pagina[] = [
			{ id: 'conceptos/a', titulo: 'A', etiqueta: 'A', requiere: ['b'] },
			{ id: 'conceptos/b', titulo: 'B', etiqueta: 'B', requiere: ['c'] },
			{ id: 'conceptos/c', titulo: 'C', etiqueta: 'C', requiere: ['a'] },
		];
		assert.throws(() => construirGrafo(paginas), /ciclo de conceptos previos/);
	});
});

describe('niveles', () => {
	test('un nodo está un nivel por debajo de su padre más profundo', () => {
		const nivel = niveles(construirGrafo(PAGINAS));
		assert.equal(nivel.get('conceptos/coeficientes-binomiales'), 0);
		assert.equal(nivel.get('conceptos/inclusion-exclusion'), 1);
		assert.equal(nivel.get('problemas/012-numero-triangular-muy-divisible'), 1);
		assert.equal(nivel.get('problemas/001-multiplos-de-3-y-5'), 2);
	});
});

describe('problemasRelacionados', () => {
	test('relaciona los problemas que comparten conceptos', () => {
		const grafo = construirGrafo(PAGINAS);
		assert.deepEqual(problemasRelacionados(grafo, 'problemas/001-multiplos-de-3-y-5'), [
			{ id: 'problemas/012-numero-triangular-muy-divisible', compartidos: ['conceptos/suma-de-gauss'] },
		]);
		assert.deepEqual(problemasRelacionados(grafo, 'problemas/015-caminos-en-una-cuadricula'), []);
	});
});

describe('abreviatura', () => {
	test('usa las dos primeras letras, como Exercism', () => {
		assert.equal(abreviatura('Suma de Gauss'), 'Su');
		assert.equal(abreviatura('Función divisor'), 'Fu');
		assert.equal(abreviatura('Inclusión-exclusión'), 'In');
		assert.equal(abreviatura('números'), 'Nú');
	});
});

describe('disponer', () => {
	const grafo = construirGrafo(PAGINAS);
	const disposicion = disponer(grafo, MEDIDAS);
	const caja = new Map(disposicion.nodos.map((n) => [n.id, n]));

	test('coloca todos los nodos dentro del lienzo y sin solaparse', () => {
		assert.equal(disposicion.nodos.length, grafo.nodos.size);
		for (const a of disposicion.nodos) {
			assert.ok(a.x >= 0 && a.x + a.ancho <= disposicion.ancho + 1e-9, `${a.id} se sale por los lados`);
			assert.ok(a.y >= 0 && a.y + a.alto <= disposicion.alto + 1e-9, `${a.id} se sale por arriba o por abajo`);
			for (const b of disposicion.nodos) {
				if (a === b) continue;
				const solapan = a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto;
				assert.ok(!solapan, `${a.id} y ${b.id} se solapan`);
			}
		}
	});

	test('cada arista sale del borde derecho del padre y llega al izquierdo del hijo', () => {
		for (const arista of disposicion.aristas) {
			const padre = caja.get(arista.desde)!;
			const hijo = caja.get(arista.hasta)!;
			assert.equal(arista.inicio.x, padre.x + padre.ancho);
			assert.ok(arista.inicio.y > padre.y && arista.inicio.y < padre.y + padre.alto);
			assert.equal(arista.fin.x, hijo.x);
			assert.ok(arista.fin.y > hijo.y && arista.fin.y < hijo.y + hijo.alto);
			assert.ok(hijo.x > padre.x, `${arista.hasta} debería estar a la derecha de ${arista.desde}`);
		}
	});

	test('las aristas que saltan columnas pasan por huecos que no tocan ninguna tarjeta', () => {
		const larga = disposicion.aristas.find(
			(a) => a.desde === 'conceptos/suma-de-gauss' && a.hasta === 'problemas/001-multiplos-de-3-y-5',
		)!;
		assert.equal(larga.huecos.length, 1);
		for (const arista of disposicion.aristas) {
			for (const hueco of arista.huecos) {
				for (const n of disposicion.nodos) {
					const mismaColumna = n.x === hueco.xIzquierda;
					const dentro =
						hueco.y > n.y - MEDIDAS.separacionFilas / 2 && hueco.y < n.y + n.alto + MEDIDAS.separacionFilas / 2;
					assert.ok(!(mismaColumna && dentro), `la arista ${arista.desde} → ${arista.hasta} atraviesa ${n.id}`);
				}
			}
		}
	});

	test('el ancho solo depende del número de niveles, no del de problemas', () => {
		const anchoEsperado = (columnas: number) =>
			columnas * MEDIDAS.anchoTarjeta + (columnas - 1) * MEDIDAS.separacionColumnas;
		assert.equal(disposicion.ancho, anchoEsperado(3));
		// Cuarenta problemas más que usan la suma de Gauss: más alto, igual de ancho.
		const muchos: Pagina[] = Array.from({ length: 40 }, (_, i) => ({
			id: `problemas/${100 + i}-extra`,
			titulo: `Extra ${i}`,
			etiqueta: `${100 + i}`,
			numero: 100 + i,
			conceptos: ['suma-de-gauss'],
		}));
		const grande = disponer(construirGrafo([...PAGINAS, ...muchos]), MEDIDAS);
		assert.equal(grande.ancho, disposicion.ancho);
		assert.ok(grande.alto > disposicion.alto);
	});

	test('el resultado no depende del orden de las páginas', () => {
		const otra = disponer(construirGrafo([...PAGINAS].reverse()), MEDIDAS);
		const posiciones = (d: typeof disposicion) =>
			Object.fromEntries(d.nodos.map((n) => [n.id, [n.x, n.y]]).sort());
		assert.deepEqual(posiciones(otra), posiciones(disposicion));
	});
});
