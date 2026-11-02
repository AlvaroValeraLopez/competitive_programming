import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { SECCIONES, seccionDe } from './secciones.ts';

describe('seccionDe', () => {
	test('cada página pertenece a la sección de su carpeta', () => {
		assert.equal(seccionDe('problemas/003-mayor-factor-primo')?.nombre, 'Ejercicios');
		assert.equal(seccionDe('problemas/exercism-grains')?.nombre, 'Ejercicios');
		assert.equal(seccionDe('problemas')?.nombre, 'Ejercicios');
		assert.equal(seccionDe('conceptos/suma-de-gauss')?.nombre, 'Conceptos');
		assert.equal(seccionDe('mapa')?.nombre, 'Mapa');
	});

	test('la portada y las rutas parecidas no son de ninguna sección', () => {
		assert.equal(seccionDe('index'), undefined);
		assert.equal(seccionDe(''), undefined);
		assert.equal(seccionDe('problemasx/algo'), undefined);
	});

	test('las secciones son pocas y no se repiten', () => {
		assert.ok(SECCIONES.length <= 5);
		assert.equal(new Set(SECCIONES.map((s) => s.ruta)).size, SECCIONES.length);
	});
});
