import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { comprobarTracks, ejerciciosQueUsan, rutaDeDominio, TRACKS, trackDeDominio, trackPorSlug } from './tracks.ts';

describe('TRACKS', () => {
	test('hay un track por dominio, con slugs distintos', () => {
		assert.deepEqual(comprobarTracks(), []);
		assert.deepEqual(
			TRACKS.map((t) => t.slug),
			['matematicas', 'algoritmia', 'implementacion'],
		);
	});

	test('se encuentran por slug y por dominio', () => {
		assert.equal(trackPorSlug('algoritmia')?.dominio, 'Algoritmia');
		assert.equal(trackPorSlug('no-existe'), undefined);
		assert.equal(trackDeDominio('Implementación')?.slug, 'implementacion');
	});

	test('detecta un dominio sin track o un track repetido', () => {
		const sinAlgoritmia = TRACKS.filter((t) => t.dominio !== 'Algoritmia');
		assert.deepEqual(comprobarTracks(sinAlgoritmia), ['El dominio «Algoritmia» no tiene track']);
		assert.ok(comprobarTracks([...TRACKS, TRACKS[0]]).includes('Hay dos tracks con el mismo slug'));
	});
});

// Una ruta de prueba: B y C se apoyan en A; D en B y C; E en D y en X, de otro dominio.
const conceptos = [
	{ id: 'c/d', titulo: 'D', dominio: 'M', orden: 4, padres: ['c/b', 'c/c'] },
	{ id: 'c/a', titulo: 'A', dominio: 'M', orden: 1, padres: [] },
	{ id: 'c/c', titulo: 'C', dominio: 'M', orden: 3, padres: ['c/a'] },
	{ id: 'c/b', titulo: 'B', dominio: 'M', orden: 2, padres: ['c/a'] },
	{ id: 'c/e', titulo: 'E', dominio: 'M', orden: 5, padres: ['c/d', 'c/x'] },
	{ id: 'c/x', titulo: 'X', dominio: 'I', orden: 6, padres: [] },
];

describe('rutaDeDominio', () => {
	test('coloca cada concepto un nivel por encima de su previo más alto del dominio', () => {
		const ruta = rutaDeDominio(conceptos, 'M');
		assert.deepEqual(
			ruta.map((nivel) => nivel.map((p) => p.concepto.titulo)),
			[['A'], ['B', 'C'], ['D'], ['E']],
		);
	});

	test('los previos de otro dominio no cuentan para el nivel, pero se anotan', () => {
		const ruta = rutaDeDominio(conceptos, 'M');
		assert.deepEqual(ruta[3][0].deOtraRuta, ['c/x']);
		assert.deepEqual(ruta[0][0].deOtraRuta, []);
		// En su propio dominio, X no necesita nada.
		assert.deepEqual(
			rutaDeDominio(conceptos, 'I').map((nivel) => nivel.map((p) => p.concepto.titulo)),
			[['X']],
		);
	});

	test('un dominio sin conceptos da una ruta vacía, y un ciclo es un error', () => {
		assert.deepEqual(rutaDeDominio(conceptos, 'Z'), []);
		const ciclo = [
			{ id: 'a', titulo: 'A', dominio: 'M', padres: ['b'] },
			{ id: 'b', titulo: 'B', dominio: 'M', padres: ['a'] },
		];
		assert.throws(() => rutaDeDominio(ciclo, 'M'), /ciclo/);
	});
});

describe('ejerciciosQueUsan', () => {
	test('se queda con los ejercicios que usan alguno de los conceptos', () => {
		const ejercicios = [
			{ id: 'p/1', padres: ['c/a'] },
			{ id: 'p/2', padres: ['c/x'] },
			{ id: 'p/3', padres: ['c/b', 'c/x'] },
		];
		assert.deepEqual(
			ejerciciosQueUsan(ejercicios, ['c/a', 'c/b']).map((e) => e.id),
			['p/1', 'p/3'],
		);
		assert.deepEqual(ejerciciosQueUsan(ejercicios, []), []);
	});
});
