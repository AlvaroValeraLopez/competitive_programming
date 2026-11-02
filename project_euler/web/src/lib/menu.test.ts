import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { agruparConceptos, agruparProblemas, AREAS, decena, normalizar } from './menu.ts';

describe('decena', () => {
	test('agrupa de diez en diez, como las carpetas del repositorio', () => {
		assert.equal(decena(1).etiqueta, '1–10');
		assert.equal(decena(10).etiqueta, '1–10');
		assert.equal(decena(11).etiqueta, '11–20');
		assert.equal(decena(67).etiqueta, '61–70');
		assert.equal(decena(100).etiqueta, '91–100');
	});

	test('rechaza números que no son de un problema', () => {
		for (const n of [0, -3, 2.5, Number.NaN]) assert.throws(() => decena(n), /no válido/);
	});
});

describe('agruparProblemas', () => {
	test('crea solo las decenas con problemas, ordenadas', () => {
		const grupos = agruparProblemas([
			{ id: 'problemas/015', titulo: 'C', numero: 15 },
			{ id: 'problemas/001', titulo: 'A', numero: 1 },
			{ id: 'problemas/067', titulo: 'D', numero: 67 },
			{ id: 'problemas/012', titulo: 'B', numero: 12 },
		]);
		assert.deepEqual(
			grupos.map((g) => [g.etiqueta, g.problemas.map((p) => p.numero)]),
			[
				['1–10', [1]],
				['11–20', [12, 15]],
				['61–70', [67]],
			],
		);
	});

	test('con los 100 problemas salen exactamente 10 decenas de 10', () => {
		const todos = Array.from({ length: 100 }, (_, i) => ({ id: `problemas/${i + 1}`, titulo: `P${i + 1}`, numero: i + 1 }));
		const grupos = agruparProblemas(todos);
		assert.equal(grupos.length, 10);
		assert.ok(grupos.every((g) => g.problemas.length === 10));
	});

	test('falla si un problema no tiene número o está repetido', () => {
		assert.throws(() => agruparProblemas([{ id: 'problemas/x', titulo: 'X' }]), /falta el número/);
		assert.throws(
			() =>
				agruparProblemas([
					{ id: 'problemas/a', titulo: 'A', numero: 3 },
					{ id: 'problemas/b', titulo: 'B', numero: 3 },
				]),
			/el problema 3 ya está en problemas\/a/,
		);
	});
});

describe('agruparConceptos', () => {
	test('agrupa por área en el orden de AREAS y ordena dentro de cada una', () => {
		const grupos = agruparConceptos([
			{ id: 'conceptos/binomiales', titulo: 'Coeficientes binomiales', area: 'Combinatoria', orden: 4 },
			{ id: 'conceptos/gauss', titulo: 'Suma de Gauss', area: 'Sumas y series', orden: 1 },
			{ id: 'conceptos/inclusion', titulo: 'Inclusión-exclusión', area: 'Combinatoria', orden: 2 },
			{ id: 'conceptos/divisor', titulo: 'Función divisor', area: 'Teoría de números', orden: 3 },
		]);
		assert.deepEqual(
			grupos.map((g) => [g.area, g.conceptos.map((c) => c.titulo)]),
			[
				['Sumas y series', ['Suma de Gauss']],
				['Teoría de números', ['Función divisor']],
				['Combinatoria', ['Inclusión-exclusión', 'Coeficientes binomiales']],
			],
		);
	});

	test('falla si a un concepto le falta el área o tiene una que no existe', () => {
		assert.throws(() => agruparConceptos([{ id: 'conceptos/x', titulo: 'X' }]), /conceptos\/x: falta el área/);
		assert.throws(
			() => agruparConceptos([{ id: 'conceptos/y', titulo: 'Y', area: 'Teoria de numeros' }]),
			/el área «Teoria de numeros» no existe/,
		);
	});

	test('las áreas no se repiten', () => {
		assert.equal(new Set(AREAS).size, AREAS.length);
	});
});

describe('normalizar', () => {
	test('ignora mayúsculas y tildes', () => {
		assert.equal(normalizar('Función DIVISOR'), 'funcion divisor');
		assert.equal(normalizar('Múltiplos'), normalizar('multiplos'));
		assert.equal(normalizar('cuadrícula'), 'cuadricula');
	});
});
