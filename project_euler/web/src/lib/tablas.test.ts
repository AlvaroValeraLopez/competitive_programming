import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { envolverTablas } from './tablas.ts';

const tabla = () => ({ type: 'element', tagName: 'table', properties: {}, children: [] });
const parrafo = () => ({ type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text' }] });
const aplicar = (arbol: { type: string; children: unknown[] }) => {
	envolverTablas()(arbol as never);
	return arbol as { type: string; children: any[] };
};

describe('envolverTablas', () => {
	test('envuelve cada tabla en un div.tabla y deja el resto igual', () => {
		const arbol = aplicar({ type: 'root', children: [parrafo(), tabla(), parrafo()] });
		assert.deepEqual(
			arbol.children.map((n) => n.tagName),
			['p', 'div', 'p'],
		);
		assert.deepEqual(arbol.children[1].properties, { className: ['tabla'] });
		assert.equal(arbol.children[1].children[0].tagName, 'table');
	});

	test('también las tablas anidadas, por ejemplo dentro de pestañas o avisos', () => {
		const arbol = aplicar({
			type: 'root',
			children: [{ type: 'mdxJsxFlowElement', children: [{ type: 'element', tagName: 'div', children: [tabla()] }] }],
		});
		const dentro = arbol.children[0].children[0].children[0];
		assert.equal(dentro.tagName, 'div');
		assert.deepEqual(dentro.properties.className, ['tabla']);
	});

	test('no envuelve dos veces si se aplica de nuevo', () => {
		const arbol = aplicar(aplicar({ type: 'root', children: [tabla()] }));
		assert.equal(arbol.children[0].children[0].tagName, 'table');
	});
});
