import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { DIFICULTADES, ID_DIFICULTADES, nombreDeDificultad, rangoDeDificultad } from './dificultad.ts';

describe('dificultad', () => {
	test('tres niveles, de la más fácil a la más difícil', () => {
		assert.deepEqual(ID_DIFICULTADES, ['facil', 'media', 'dificil']);
		assert.deepEqual(DIFICULTADES.map((d) => nombreDeDificultad(d.id)), ['Fácil', 'Media', 'Difícil']);
	});

	test('el rango ordena de fácil a difícil, y lo desconocido va al final', () => {
		assert.deepEqual(['dificil', 'facil', 'media'].sort((a, b) => rangoDeDificultad(a) - rangoDeDificultad(b)), [
			'facil',
			'media',
			'dificil',
		]);
		assert.equal(rangoDeDificultad(undefined), 3);
	});
});
