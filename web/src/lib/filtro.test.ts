import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
	alternar,
	crearFiltro,
	elegirSolo,
	escribirFiltro,
	FILTRO_VACIO,
	filtrar,
	hayFiltro,
	leerFiltro,
	puntuacion,
	recuento,
	slugDeTema,
	type Candidato,
	type Grupo,
} from './filtro.ts';
import { normalizar } from './menu.ts';

const candidato = (
	posicion: number,
	numero: number | undefined,
	texto: string,
	valores: Partial<Record<Grupo, string[]>>,
	rango = 0,
): Candidato => ({
	posicion,
	numero,
	rango,
	texto: normalizar(`${numero ?? ''} ${texto}`),
	valores: { dificultad: [], tema: [], conceptos: [], fuente: [], ...valores },
});

// Algunos ejercicios de la web.
const P1 = candidato(0, 1, 'Múltiplos de 3 y 5 Sumas Inclusión-exclusión', {
	dificultad: ['facil'],
	fuente: ['project-euler'],
	tema: ['sumas-y-series', 'combinatoria'],
	conceptos: ['suma-de-gauss', 'inclusion-exclusion'],
}, 0);
const P12 = candidato(1, 12, 'Número triangular muy divisible Divisores Números coprimos', {
	dificultad: ['dificil'],
	fuente: ['project-euler'],
	tema: ['sumas-y-series', 'teoria-de-numeros'],
	conceptos: ['suma-de-gauss', 'funcion-divisor'],
}, 2);
const P15 = candidato(2, 15, 'Caminos en una cuadrícula Combinatoria Triángulo de Pascal', {
	dificultad: ['media'],
	fuente: ['project-euler'],
	tema: ['combinatoria'],
	conceptos: ['coeficientes-binomiales'],
}, 1);
const GRAINS = candidato(3, undefined, 'Grains Potencias de 2 Desbordamiento', {
	dificultad: ['facil'],
	fuente: ['exercism'],
	tema: ['sumas-y-series', 'numeros-grandes'],
	conceptos: ['progresion-geometrica', 'enteros-de-tamano-fijo'],
}, 0);
const TODOS = [P15, GRAINS, P1, P12];
const posiciones = (lista: Candidato[]) => lista.map((c) => c.posicion);

describe('filtrar por conceptos', () => {
	test('sin filtro salen todos, en el orden de la página', () => {
		assert.deepEqual(posiciones(filtrar(TODOS, FILTRO_VACIO)), [0, 1, 2, 3]);
	});

	test('un concepto deja solo los ejercicios que lo usan', () => {
		assert.deepEqual(posiciones(filtrar(TODOS, crearFiltro({ seleccion: { conceptos: ['suma-de-gauss'] } }))), [0, 1]);
	});

	test('con varios conceptos basta con usar uno, y salen antes los que usan más', () => {
		const filtro = crearFiltro({ seleccion: { conceptos: ['funcion-divisor', 'suma-de-gauss'] } });
		assert.equal(puntuacion(P12, filtro), 2);
		assert.equal(puntuacion(P1, filtro), 1);
		assert.equal(puntuacion(P15, filtro), null);
		assert.deepEqual(posiciones(filtrar(TODOS, filtro)), [1, 0]);
	});
});

describe('filtrar desde otras vistas', () => {
	test('por dificultad, tema y fuente: basta una opción de cada grupo', () => {
		const ids = (seleccion: Partial<Record<Grupo, string[]>>) => posiciones(filtrar(TODOS, crearFiltro({ seleccion })));
		assert.deepEqual(ids({ dificultad: ['facil'] }), [0, 3]);
		assert.deepEqual(ids({ dificultad: ['media', 'dificil'] }), [1, 2]);
		assert.deepEqual(ids({ fuente: ['exercism'] }), [3]);
		assert.deepEqual(ids({ tema: ['numeros-grandes'] }), [3]);
		assert.deepEqual(ids({ tema: ['teoria-de-numeros', 'combinatoria'] }), [0, 1, 2]);
	});

	test('los grupos se combinan: hay que cumplirlos todos', () => {
		const filtro = crearFiltro({ seleccion: { dificultad: ['facil'], fuente: ['project-euler'] } });
		assert.deepEqual(posiciones(filtrar(TODOS, filtro)), [0]);
		const ninguno = crearFiltro({ seleccion: { dificultad: ['dificil'], conceptos: ['coeficientes-binomiales'] } });
		assert.deepEqual(filtrar(TODOS, ninguno), []);
	});
});

describe('filtrar por texto', () => {
	test('busca palabra a palabra y sin tildes', () => {
		const ids = (consulta: string) => posiciones(filtrar(TODOS, crearFiltro({ consulta })));
		assert.deepEqual(ids('cuadricula'), [2]);
		assert.deepEqual(ids('NÚMERO divisible'), [1]);
		assert.deepEqual(ids('divisible cuadricula'), []);
	});

	test('un número solo encaja con ese ejercicio, no con los que lo contienen', () => {
		assert.deepEqual(posiciones(filtrar(TODOS, crearFiltro({ consulta: '1' }))), [0]);
		assert.deepEqual(posiciones(filtrar(TODOS, crearFiltro({ consulta: ' 15 ' }))), [2]);
	});

	test('texto y conceptos se combinan', () => {
		const filtro = crearFiltro({ consulta: 'multiplos', seleccion: { conceptos: ['suma-de-gauss'] } });
		assert.deepEqual(posiciones(filtrar(TODOS, filtro)), [0]);
	});
});

describe('ordenar', () => {
	test('por dificultad: de la más fácil a la más difícil, y en el orden de la página si empatan', () => {
		assert.deepEqual(posiciones(filtrar(TODOS, crearFiltro({ orden: 'dificultad' }))), [0, 3, 2, 1]);
	});

	test('los que usan más conceptos elegidos siguen saliendo antes', () => {
		const filtro = crearFiltro({ orden: 'dificultad', seleccion: { conceptos: ['funcion-divisor', 'suma-de-gauss'] } });
		assert.deepEqual(posiciones(filtrar(TODOS, filtro)), [1, 0]);
	});
});

describe('filtro en la dirección', () => {
	const conocidas = {
		conceptos: ['suma-de-gauss', 'funcion-divisor', 'coeficientes-binomiales'],
		dificultad: ['facil', 'media', 'dificil'],
		tema: ['teoria-de-numeros'],
	};

	test('lee cada grupo, la búsqueda y el orden, e ignora opciones desconocidas o repetidas', () => {
		const filtro = leerFiltro('?conceptos=suma-de-gauss,fibonacci,suma-de-gauss&dificultad=muy-dificil,media&q=pascal&orden=dificultad', conocidas);
		assert.deepEqual(filtro.seleccion.conceptos, ['suma-de-gauss']);
		assert.deepEqual(filtro.seleccion.dificultad, ['media']);
		assert.deepEqual(filtro.seleccion.fuente, []);
		assert.equal(filtro.consulta, 'pascal');
		assert.equal(filtro.orden, 'dificultad');
		assert.deepEqual(leerFiltro('', conocidas), FILTRO_VACIO);
		assert.equal(leerFiltro('?orden=al-azar', conocidas).orden, 'fuente');
	});

	test('escribir y volver a leer da el mismo filtro', () => {
		const filtro = crearFiltro({
			consulta: 'número & más',
			seleccion: { conceptos: ['funcion-divisor', 'suma-de-gauss'], dificultad: ['dificil'], tema: ['teoria-de-numeros'] },
			orden: 'dificultad',
		});
		assert.deepEqual(leerFiltro(escribirFiltro(filtro), conocidas), filtro);
		assert.equal(escribirFiltro(crearFiltro({ seleccion: { conceptos: ['suma-de-gauss'] } })), '?conceptos=suma-de-gauss');
		assert.equal(escribirFiltro(FILTRO_VACIO), '');
	});
});

describe('alternar y hayFiltro', () => {
	test('añade y quita opciones de un grupo', () => {
		const uno = alternar(FILTRO_VACIO, 'dificultad', 'facil');
		assert.deepEqual(uno.seleccion.dificultad, ['facil']);
		assert.ok(hayFiltro(uno));
		assert.deepEqual(alternar(uno, 'dificultad', 'facil').seleccion.dificultad, []);
		assert.deepEqual(FILTRO_VACIO.seleccion.dificultad, []);
		assert.ok(!hayFiltro(crearFiltro({ consulta: '   ', orden: 'dificultad' })));
	});

	test('elegirSolo deja una opción, o ninguna', () => {
		const dos = crearFiltro({ seleccion: { dificultad: ['facil', 'media'], fuente: ['exercism'] } });
		assert.deepEqual(elegirSolo(dos, 'dificultad', 'dificil').seleccion.dificultad, ['dificil']);
		assert.deepEqual(elegirSolo(dos, 'dificultad').seleccion.dificultad, []);
		assert.deepEqual(elegirSolo(dos, 'dificultad').seleccion.fuente, ['exercism']);
	});
});

describe('recuento', () => {
	test('cuántos quedarían eligiendo solo esa opción, con el resto del filtro igual', () => {
		const facil = crearFiltro({ seleccion: { dificultad: ['facil'] } });
		assert.equal(recuento(TODOS, facil, 'tema', 'sumas-y-series'), 2);
		assert.equal(recuento(TODOS, facil, 'tema', 'teoria-de-numeros'), 0);
		assert.equal(recuento(TODOS, facil, 'fuente', 'exercism'), 1);
	});

	test('en su propio grupo no cuenta lo ya elegido, y sin opción da el total de ese grupo', () => {
		const media = crearFiltro({ seleccion: { dificultad: ['media'] } });
		assert.equal(recuento(TODOS, media, 'dificultad', 'facil'), 2);
		assert.equal(recuento(TODOS, media, 'dificultad'), 4);
		assert.equal(recuento(TODOS, crearFiltro({ consulta: 'cuadricula' }), 'dificultad'), 1);
	});
});

describe('slugDeTema', () => {
	test('quita tildes, mayúsculas y signos', () => {
		assert.equal(slugDeTema('Teoría de números'), 'teoria-de-numeros');
		assert.equal(slugDeTema('Números grandes'), 'numeros-grandes');
		assert.equal(slugDeTema('Programación dinámica'), 'programacion-dinamica');
	});
});
