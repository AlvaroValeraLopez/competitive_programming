/**
 * Plugin de rehype que envuelve cada <table> del contenido en un
 * <div class="tabla">. El contenedor da el marco y, en pantallas estrechas,
 * el desplazamiento horizontal, sin que la tabla deje de ocupar todo el ancho.
 *
 * Sin dependencias, para poder probarlo con `node --test`.
 */

interface Nodo {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: Nodo[];
}

const esTabla = (nodo: Nodo) => nodo.type === 'element' && nodo.tagName === 'table';

const esContenedor = (nodo: Nodo) =>
	nodo.type === 'element' &&
	nodo.tagName === 'div' &&
	Array.isArray(nodo.properties?.className) &&
	(nodo.properties.className as unknown[]).includes('tabla');

function envolver(nodo: Nodo): void {
	if (!nodo.children || esContenedor(nodo)) return;
	nodo.children = nodo.children.map((hijo) => {
		if (esTabla(hijo)) {
			return { type: 'element', tagName: 'div', properties: { className: ['tabla'] }, children: [hijo] };
		}
		envolver(hijo);
		return hijo;
	});
}

export function envolverTablas() {
	return (arbol: Nodo) => {
		envolver(arbol);
	};
}
