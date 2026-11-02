import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
	abreviatura,
	construirGrafo,
	niveles,
	problemasRelacionados,
	type Pagina,
} from './grafo.ts';

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
