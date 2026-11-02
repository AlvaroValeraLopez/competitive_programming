import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { nombreDeEjercicio, prefijoDeEjercicio } from './fuentes.ts';
import { agruparConceptos, agruparEjercicios, AREAS, DOMINIOS, dominioDe, normalizar } from './menu.ts';

// Un registro de prueba con una fuente numerada y otra que no lo es.
const FUENTES_PRUEBA = {
	euler: { nombre: 'Project Euler', numerada: true, prefijo: 'Problema' },
	exercism: { nombre: 'Exercism', numerada: false },
};

describe('agruparEjercicios', () => {
	test('agrupa por fuente, en el orden del registro; las numeradas, por número', () => {
		const grupos = agruparEjercicios(
			[
				{ id: 'p/grains', titulo: 'Grains', fuente: 'exercism' },
				{ id: 'p/015', titulo: 'C', fuente: 'euler', numero: 15 },
				{ id: 'p/hamming', titulo: 'Hamming', fuente: 'exercism' },
				{ id: 'p/001', titulo: 'A', fuente: 'euler', numero: 1 },
				{ id: 'p/067', titulo: 'D', fuente: 'euler', numero: 67 },
				{ id: 'p/012', titulo: 'B', fuente: 'euler', numero: 12 },
			],
			FUENTES_PRUEBA,
		);
		assert.deepEqual(
			grupos.map((g) => [g.nombre, g.ejercicios.map((e) => e.titulo)]),
			[
				['Project Euler', ['A', 'B', 'C', 'D']],
				['Exercism', ['Grains', 'Hamming']],
			],
		);
		assert.deepEqual(
			grupos[0].ejercicios.map((e) => e.numero),
			[1, 12, 15, 67],
		);
	});

	test('el mismo número puede repetirse en fuentes distintas, pero no en la misma', () => {
		const otra = { ...FUENTES_PRUEBA, acepta: { nombre: 'Acepta el reto', numerada: true } };
		assert.doesNotThrow(() =>
			agruparEjercicios(
				[
					{ id: 'p/a', titulo: 'A', fuente: 'euler', numero: 20 },
					{ id: 'p/b', titulo: 'B', fuente: 'acepta', numero: 20 },
				],
				otra,
			),
		);
		assert.throws(
			() =>
				agruparEjercicios(
					[
						{ id: 'p/a', titulo: 'A', fuente: 'euler', numero: 3 },
						{ id: 'p/b', titulo: 'B', fuente: 'euler', numero: 3 },
					],
					FUENTES_PRUEBA,
				),
			/el número 3 de Project Euler ya está en p\/a/,
		);
	});

	test('falla si falta la fuente, si no existe o si falta el número en una fuente numerada', () => {
		assert.throws(() => agruparEjercicios([{ id: 'p/x', titulo: 'X' }], FUENTES_PRUEBA), /p\/x: falta la fuente/);
		assert.throws(
			() => agruparEjercicios([{ id: 'p/y', titulo: 'Y', fuente: 'leetcode' }], FUENTES_PRUEBA),
			/la fuente «leetcode» no existe/,
		);
		assert.throws(
			() => agruparEjercicios([{ id: 'p/z', titulo: 'Z', fuente: 'euler' }], FUENTES_PRUEBA),
			/p\/z: falta el número del ejercicio en Project Euler/,
		);
		assert.doesNotThrow(() => agruparEjercicios([{ id: 'p/w', titulo: 'W', fuente: 'exercism' }], FUENTES_PRUEBA));
	});
});

describe('nombreDeEjercicio', () => {
	test('con número si la fuente lo usa, y si no, solo la etiqueta', () => {
		assert.equal(nombreDeEjercicio({ fuente: 'euler', numero: 3, etiqueta: 'Mayor factor primo' }, FUENTES_PRUEBA), 'Problema 3: Mayor factor primo');
		assert.equal(nombreDeEjercicio({ fuente: 'exercism', etiqueta: 'Grains' }, FUENTES_PRUEBA), 'Grains');
		assert.equal(nombreDeEjercicio({ fuente: 'project-euler', numero: 7, etiqueta: 'El primo número 10 001' }), 'Problema 7: El primo número 10 001');
		assert.equal(prefijoDeEjercicio({ fuente: 'euler', numero: 3 }, FUENTES_PRUEBA), 'Problema 3: ');
		assert.equal(prefijoDeEjercicio({ fuente: 'exercism' }, FUENTES_PRUEBA), '');
	});
});

describe('agruparConceptos', () => {
	test('agrupa por dominio y área en el orden de DOMINIOS y ordena dentro de cada área', () => {
		const grupos = agruparConceptos([
			{ id: 'conceptos/binomiales', titulo: 'Coeficientes binomiales', area: 'Combinatoria', orden: 4 },
			{ id: 'conceptos/precision', titulo: 'Precisión arbitraria', area: 'Números grandes', orden: 12 },
			{ id: 'conceptos/gauss', titulo: 'Suma de Gauss', area: 'Sumas y series', orden: 1 },
			{ id: 'conceptos/inclusion', titulo: 'Inclusión-exclusión', area: 'Combinatoria', orden: 2 },
			{ id: 'conceptos/optimalidad', titulo: 'Principio de optimalidad', area: 'Programación dinámica', orden: 13 },
			{ id: 'conceptos/divisor', titulo: 'Función divisor', area: 'Teoría de números', orden: 3 },
		]);
		assert.deepEqual(
			grupos.map((g) => [g.dominio, g.areas.map((a) => [a.area, a.conceptos.map((c) => c.titulo)])]),
			[
				[
					'Matemáticas',
					[
						['Sumas y series', ['Suma de Gauss']],
						['Teoría de números', ['Función divisor']],
						['Combinatoria', ['Inclusión-exclusión', 'Coeficientes binomiales']],
					],
				],
				['Algoritmia', [['Programación dinámica', ['Principio de optimalidad']]]],
				['Implementación', [['Números grandes', ['Precisión arbitraria']]]],
			],
		);
	});

	test('sin dominios ni áreas vacíos', () => {
		const grupos = agruparConceptos([{ id: 'conceptos/gauss', titulo: 'Suma de Gauss', area: 'Sumas y series' }]);
		assert.deepEqual(
			grupos.map((g) => [g.dominio, g.areas.map((a) => a.area)]),
			[['Matemáticas', ['Sumas y series']]],
		);
	});

	test('falla si a un concepto le falta el área o tiene una que no existe', () => {
		assert.throws(() => agruparConceptos([{ id: 'conceptos/x', titulo: 'X' }]), /conceptos\/x: falta el área/);
		assert.throws(
			() => agruparConceptos([{ id: 'conceptos/y', titulo: 'Y', area: 'Teoria de numeros' }]),
			/el área «Teoria de numeros» no existe/,
		);
	});

	test('cada área pertenece a un solo dominio, y ningún dominio está vacío', () => {
		assert.equal(new Set(AREAS).size, AREAS.length);
		assert.ok(DOMINIOS.every((d) => d.areas.length > 0));
		assert.equal(dominioDe('Programación dinámica'), 'Algoritmia');
		assert.equal(dominioDe('Números grandes'), 'Implementación');
		assert.equal(dominioDe('Teoría de números'), 'Matemáticas');
		assert.equal(dominioDe('No existe'), undefined);
	});
});

describe('normalizar', () => {
	test('ignora mayúsculas y tildes', () => {
		assert.equal(normalizar('Función DIVISOR'), 'funcion divisor');
		assert.equal(normalizar('Múltiplos'), normalizar('multiplos'));
		assert.equal(normalizar('cuadrícula'), 'cuadricula');
	});
});
