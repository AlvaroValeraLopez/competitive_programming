import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { disponerArbol, nivelesDelArbol, type MedidasArbol, type NodoArbol } from './arbol.ts';

const MEDIDAS: MedidasArbol = { anchoNodo: 100, altoNodo: 40, anchoHueco: 20, separacionX: 10, separacionY: 30 };

const n = (id: string, padres: string[] = [], orden = 0): NodoArbol => ({ id, titulo: id, padres, orden });

function seSolapan(a: { x: number; ancho: number }, b: { x: number; ancho: number }) {
	return a.x < b.x + b.ancho && b.x < a.x + a.ancho;
}

describe('nivelesDelArbol', () => {
	test('cada nodo va un nivel por debajo de su padre más profundo', () => {
		const niveles = nivelesDelArbol([n('a'), n('b', ['a']), n('c', ['a']), n('d', ['b', 'c']), n('e', ['a', 'd'])]);
		assert.deepEqual(Object.fromEntries(niveles), { a: 0, b: 1, c: 1, d: 2, e: 3 });
	});

	test('los padres que no están en el árbol no cuentan, y un ciclo es un error', () => {
		assert.equal(nivelesDelArbol([n('x', ['fuera'])]).get('x'), 0);
		assert.throws(() => nivelesDelArbol([n('a', ['b']), n('b', ['a'])]), /ciclo/);
	});
});

describe('disponerArbol', () => {
	const nodos = [n('a', [], 1), n('b', ['a'], 2), n('c', ['a'], 3), n('d', ['b', 'c'], 4), n('e', ['a', 'd'], 5), n('f', [], 6)];
	const arbol = disponerArbol(nodos, MEDIDAS);
	const caja = (id: string) => arbol.nodos.find((c) => c.id === id)!;

	test('coloca todos los nodos, cada fila a su altura', () => {
		assert.equal(arbol.nodos.length, nodos.length);
		for (const c of arbol.nodos) assert.equal(c.y, c.nivel * (MEDIDAS.altoNodo + MEDIDAS.separacionY));
		assert.equal(arbol.alto, 4 * MEDIDAS.altoNodo + 3 * MEDIDAS.separacionY);
	});

	test('las tarjetas de una misma fila no se solapan y caben en el ancho', () => {
		for (const a of arbol.nodos) {
			assert.ok(a.x >= 0 && a.x + a.ancho <= arbol.ancho + 1e-9);
			for (const b of arbol.nodos) if (a !== b && a.nivel === b.nivel) assert.ok(!seSolapan(a, b), `${a.id} y ${b.id}`);
		}
	});

	test('cada relación va del borde inferior del padre al superior del hijo', () => {
		assert.equal(arbol.aristas.length, 6);
		for (const arista of arbol.aristas) {
			const padre = caja(arista.desde);
			const hijo = caja(arista.hasta);
			const numeros = arista.trazado.match(/-?\d+(\.\d+)?/g)!.map(Number);
			assert.deepEqual(numeros.slice(0, 2), [padre.x + padre.ancho / 2, padre.y + padre.alto]);
			assert.deepEqual(numeros.slice(-2), [hijo.x + hijo.ancho / 2, hijo.y]);
		}
	});

	test('una relación larga atraviesa las filas intermedias por un hueco, sin tocar tarjetas', () => {
		// a (nivel 0) → e (nivel 3) atraviesa las filas 1 y 2.
		const larga = arbol.aristas.find((a) => a.desde === 'a' && a.hasta === 'e')!;
		// Cada tramo vertical acaba en el borde inferior de la fila que atraviesa.
		const verticales = [...larga.trazado.matchAll(/L (-?[\d.]+) (-?[\d.]+)/g)].map((m) => ({
			x: Number(m[1]),
			fila: (Number(m[2]) - MEDIDAS.altoNodo) / (MEDIDAS.altoNodo + MEDIDAS.separacionY),
		}));
		assert.deepEqual(verticales.map((v) => v.fila), [1, 2]);
		for (const { x, fila } of verticales) {
			for (const c of arbol.nodos.filter((c) => c.nivel === fila)) {
				assert.ok(x <= c.x || x >= c.x + c.ancho, `el hueco en x = ${x} atraviesa ${c.id}`);
			}
		}
	});

	test('ordena las filas para evitar cruces evitables', () => {
		// x1 y x2 arriba; sus hijos, en orden inverso de partida. Sin reordenar, las dos líneas se cruzan.
		const cruce = disponerArbol([n('x1', [], 1), n('x2', [], 2), n('h2', ['x2'], 3), n('h1', ['x1'], 4)], MEDIDAS);
		const x = (id: string) => cruce.nodos.find((c) => c.id === id)!.x;
		assert.equal(Math.sign(x('x1') - x('x2')), Math.sign(x('h1') - x('h2')));
	});

	test('un árbol vacío no ocupa nada', () => {
		assert.deepEqual(disponerArbol([], MEDIDAS), { ancho: 0, alto: 0, nodos: [], aristas: [] });
	});
});
