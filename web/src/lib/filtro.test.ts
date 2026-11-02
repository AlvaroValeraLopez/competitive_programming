import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
	alternarConcepto,
	escribirFiltro,
	FILTRO_VACIO,
	filtrar,
	hayFiltro,
	leerFiltro,
	puntuacion,
	type Candidato,
} from './filtro.ts';
import { normalizar } from './menu.ts';

const candidato = (numero: number, texto: string, conceptos: string[]): Candidato => ({
	numero,
	texto: normalizar(`${numero} ${texto}`),
	conceptos,
});

// Los problemas actuales de la web.
const P1 = candidato(1, 'Múltiplos de 3 y 5 Sumas Inclusión-exclusión', ['suma-de-gauss', 'inclusion-exclusion']);
const P12 = candidato(12, 'Número triangular muy divisible Divisores Números coprimos', ['suma-de-gauss', 'funcion-divisor']);
const P15 = candidato(15, 'Caminos en una cuadrícula Combinatoria Triángulo de Pascal', ['coeficientes-binomiales']);
const TODOS = [P15, P1, P12];
const numeros = (lista: Candidato[]) => lista.map((c) => c.numero);

describe('filtrar por conceptos', () => {
	test('sin filtro salen todos, por número', () => {
		assert.deepEqual(numeros(filtrar(TODOS, FILTRO_VACIO)), [1, 12, 15]);
	});

	test('un concepto deja solo los problemas que lo usan', () => {
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: ['suma-de-gauss'], consulta: '' })), [1, 12]);
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: ['coeficientes-binomiales'], consulta: '' })), [15]);
	});

	test('con varios conceptos basta con usar uno, y salen antes los que usan más', () => {
		const filtro = { conceptos: ['funcion-divisor', 'suma-de-gauss'], consulta: '' };
		assert.equal(puntuacion(P12, filtro), 2);
		assert.equal(puntuacion(P1, filtro), 1);
		assert.equal(puntuacion(P15, filtro), null);
		assert.deepEqual(numeros(filtrar(TODOS, filtro)), [12, 1]);
	});
});

describe('filtrar por texto', () => {
	test('busca palabra a palabra y sin tildes', () => {
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: [], consulta: 'cuadricula' })), [15]);
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: [], consulta: 'NÚMERO divisible' })), [12]);
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: [], consulta: 'divisible cuadricula' })), []);
	});

	test('un número solo encaja con ese problema, no con los que lo contienen', () => {
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: [], consulta: '1' })), [1]);
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: [], consulta: ' 15 ' })), [15]);
	});

	test('texto y conceptos se combinan', () => {
		assert.deepEqual(numeros(filtrar(TODOS, { conceptos: ['suma-de-gauss'], consulta: 'multiplos' })), [1]);
	});
});

describe('filtro en la dirección', () => {
	const conocidos = ['suma-de-gauss', 'funcion-divisor', 'coeficientes-binomiales', 'inclusion-exclusion'];

	test('lee conceptos y búsqueda, e ignora conceptos desconocidos o repetidos', () => {
		assert.deepEqual(leerFiltro('?conceptos=suma-de-gauss,fibonacci,suma-de-gauss&q=pascal', conocidos), {
			conceptos: ['suma-de-gauss'],
			consulta: 'pascal',
		});
		assert.deepEqual(leerFiltro('', conocidos), FILTRO_VACIO);
	});

	test('escribir y volver a leer da el mismo filtro', () => {
		const filtro = { conceptos: ['funcion-divisor', 'suma-de-gauss'], consulta: 'número & más' };
		assert.equal(leerFiltro(escribirFiltro(filtro), conocidos).consulta, filtro.consulta);
		assert.deepEqual(leerFiltro(escribirFiltro(filtro), conocidos), filtro);
		assert.equal(escribirFiltro({ conceptos: ['suma-de-gauss'], consulta: '' }), '?conceptos=suma-de-gauss');
		assert.equal(escribirFiltro(FILTRO_VACIO), '');
	});
});

describe('alternarConcepto y hayFiltro', () => {
	test('añade y quita conceptos', () => {
		const uno = alternarConcepto(FILTRO_VACIO, 'suma-de-gauss');
		assert.deepEqual(uno.conceptos, ['suma-de-gauss']);
		assert.ok(hayFiltro(uno));
		assert.deepEqual(alternarConcepto(uno, 'suma-de-gauss').conceptos, []);
		assert.ok(!hayFiltro({ conceptos: [], consulta: '   ' }));
	});
});
