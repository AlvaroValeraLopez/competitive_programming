import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

import { leerSolucion, lenguajeDe, nombreDeArchivo, raizDelRepositorio, rutaDeSolucion } from './soluciones.ts';

describe('lenguajeDe', () => {
	test('deduce el lenguaje de la extensión', () => {
		assert.equal(lenguajeDe('project_euler/problems_1_to_hundred/1_10/3_largestPrimeFactor.js').nombre, 'JavaScript');
		assert.equal(lenguajeDe('exercism/path_c/nth_prime/nthPrime.c').resaltado, 'c');
		assert.equal(lenguajeDe('acepta_el_reto/problemas_100_199/cerosDelFactorial.java').nombre, 'Java');
		assert.equal(lenguajeDe('solucion.PY').nombre, 'Python');
	});

	test('falla con una extensión desconocida', () => {
		assert.throws(() => lenguajeDe('notas.txt'), /No sé en qué lenguaje está «notas.txt»/);
	});
});

describe('nombreDeArchivo', () => {
	test('quita las carpetas y conserva los espacios', () => {
		assert.equal(nombreDeArchivo('project_euler/problems_1_to_hundred/1_10/6_ sumSquareDifference.js'), '6_ sumSquareDifference.js');
	});
});

describe('raizDelRepositorio', () => {
	test('encuentra la carpeta con .git subiendo desde la web', () => {
		const raiz = raizDelRepositorio();
		assert.ok(existsSync(join(raiz, '.git')));
		assert.ok(existsSync(join(raiz, 'project_euler')));
	});
});

describe('rutaDeSolucion', () => {
	test('resuelve rutas relativas a la raíz', () => {
		assert.equal(rutaDeSolucion('a/b/c.js', '/repo'), '/repo/a/b/c.js');
		assert.equal(rutaDeSolucion('a/./b/../c.js', '/repo'), '/repo/a/c.js');
	});

	test('no deja salir del repositorio ni usar rutas absolutas', () => {
		assert.throws(() => rutaDeSolucion('../secreto.js', '/repo'), /fuera del repositorio/);
		assert.throws(() => rutaDeSolucion('a/../../b.js', '/repo'), /fuera del repositorio/);
		assert.throws(() => rutaDeSolucion('/etc/passwd', '/repo'), /relativa a la raíz/);
	});
});

describe('leerSolucion', () => {
	test('lee una solución real del repositorio', () => {
		const codigo = leerSolucion('project_euler/problems_1_to_hundred/1_10/3_largestPrimeFactor.js');
		assert.match(codigo, /\S/);
	});

	test('falla con un mensaje claro si el archivo no existe', () => {
		assert.throws(() => leerSolucion('project_euler/no-existe.js'), /La solución «project_euler\/no-existe.js» no existe/);
	});
});
