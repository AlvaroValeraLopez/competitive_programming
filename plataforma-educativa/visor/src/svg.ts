import { Position, getSmoothStepPath } from '@xyflow/react';
import { ALTO_CABECERA, ALTO_FILA } from './disposicion.ts';
import type { Esquema, Tabla } from './modelo.ts';
import { FORMA_RELACION, conAlfa, construirAristas, marca, type NodoVisor } from './visor.ts';

/**
 * Exportación a SVG vectorial, dibujado a mano a partir del esquema y de dónde está cada nodo.
 * Reproduce las medidas de `styles.css` (bordes de 1 px, cabecera de 34 px, filas de 22 px) para que
 * el SVG se vea igual que el lienzo, pero sin resaltados: es el diagrama tal cual.
 */

export interface OpcionesSvg {
  /** Ancho de un texto en una fuente CSS. En el navegador se mide con un canvas. */
  medirTexto?: (texto: string, fuente: string) => number;
}

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const FUENTE_COLUMNA = `12px ${SANS}`;
const FUENTE_COLUMNA_PK = `600 12px ${SANS}`;
const FUENTE_GRUPO = `700 15px ${MONO}`;
const MARGEN = 48;

// Trazos de los iconos de lucide (licencia ISC, https://lucide.dev): los mismos que en pantalla.
const ICONOS = {
  llave:
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  eslabon: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
  nota: '<path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><path d="M15 3v5a1 1 0 0 0 1 1h5"/>',
};

const ESTILOS = `
.grupo-nombre { font: ${FUENTE_GRUPO}; }
.grupo-nota { font: 12.5px ${SANS}; fill: #64748b; }
.tabla-nombre { font: 600 13px ${MONO}; fill: #fff; }
.columna { font: ${FUENTE_COLUMNA}; fill: #0f172a; }
.columna.pk { font: ${FUENTE_COLUMNA_PK}; }
.tipo { font: 11px ${MONO}; fill: #64748b; }
.tipo.enum { fill: #6d28d9; }
.nulo { fill: #94a3b8; }
.linea { fill: none; stroke: #94a3b8; stroke-width: 1.3; }
.linea.opcional { stroke-dasharray: 5 4; }
.marca { fill: none; stroke: #94a3b8; stroke-width: 1.5; }
.separador { stroke: #eef1f5; stroke-width: 1; }
`;

/** Aproximación para cuando no hay navegador (tests): el ancho medio de un carácter de cada fuente. */
function medidaAproximada(texto: string, fuente: string): number {
  const tamaño = Number(/(\d+(?:\.\d+)?)px/.exec(fuente)?.[1] ?? 12);
  return texto.length * tamaño * (fuente.includes('monospace') ? 0.6 : 0.56);
}

export function escaparXml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
}

const r = (n: number) => Math.round(n * 100) / 100;

/** Dónde toca la línea a la fila de una columna: en su centro, 2 px fuera del borde (el conector mide 6 px). */
function puntoDeColumna(tabla: Tabla, x: number, y: number, ancho: number, asa: string) {
  const [columna, lado] = asa.split(':');
  const fila = Math.max(0, tabla.columnas.findIndex((c) => c.nombre === columna));
  return {
    x: lado === 'i' ? x - 2 : x + ancho + 2,
    y: y + 1 + ALTO_CABECERA + fila * ALTO_FILA + (ALTO_FILA + 1) / 2,
    lado: lado === 'i' ? Position.Left : Position.Right,
  };
}

export function generarSvg(esquema: Esquema, nodos: NodoVisor[], opciones: OpcionesSvg = {}): string {
  const medir = opciones.medirTexto ?? medidaAproximada;
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const absoluta = (n: NodoVisor) => {
    const padre = n.parentId ? porId.get(n.parentId) : undefined;
    return { x: n.position.x + (padre?.position.x ?? 0), y: n.position.y + (padre?.position.y ?? 0) };
  };
  const visibles = nodos.filter((n) => !n.hidden);

  // Los límites: los grupos visibles y las tablas que no están en ningún grupo.
  const cajas = visibles
    .filter((n) => n.type === 'grupo' || !n.parentId)
    .map((n) => ({ ...absoluta(n), ancho: n.width ?? 0, alto: n.height ?? 0 }));
  const minX = Math.min(0, ...cajas.map((c) => c.x)) - MARGEN;
  const minY = Math.min(0, ...cajas.map((c) => c.y)) - MARGEN;
  const maxX = Math.max(0, ...cajas.map((c) => c.x + c.ancho)) + MARGEN;
  const maxY = Math.max(0, ...cajas.map((c) => c.y + c.alto)) + MARGEN;
  const ancho = Math.ceil(maxX - minX);
  const alto = Math.ceil(maxY - minY);

  const recortes: string[] = [];
  const grupos: string[] = [];
  const relaciones: string[] = [];
  const tablas: string[] = [];

  for (const n of visibles) {
    if (n.type !== 'grupo') continue;
    const { grupo } = n.data;
    const { x, y } = absoluta(n);
    const w = n.width ?? 0;
    const h = n.height ?? 0;
    const id = `recorte-grupo-${recortes.length}`;
    recortes.push(`<clipPath id="${id}"><rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="14"/></clipPath>`);
    const xNombre = x + 19.5;
    const xNota = xNombre + medir(grupo.nombre, FUENTE_GRUPO) + 12;
    grupos.push(
      `<g>` +
        `<rect x="${r(x + 0.75)}" y="${r(y + 0.75)}" width="${r(w - 1.5)}" height="${r(h - 1.5)}" rx="14" fill="${conAlfa(grupo.color, 0.06)}" stroke="${conAlfa(grupo.color, 0.4)}" stroke-width="1.5"/>` +
        `<g clip-path="url(#${id})">` +
        `<text class="grupo-nombre" x="${r(xNombre)}" y="${r(y + 30)}" fill="${grupo.color}">${escaparXml(grupo.nombre)}</text>` +
        (grupo.nota ? `<text class="grupo-nota" x="${r(xNota)}" y="${r(y + 30)}">${escaparXml(grupo.nota)}</text>` : '') +
        `</g>` +
        (grupo.nota ? `<title>${escaparXml(grupo.nota)}</title>` : '') +
        `</g>`,
    );
  }

  const tablasPorNombre = new Map(esquema.tablas.map((t) => [t.nombre, t]));
  for (const a of construirAristas(esquema, nodos)) {
    if (a.hidden || !a.sourceHandle || !a.targetHandle) continue;
    const origen = porId.get(a.source)!;
    const destino = porId.get(a.target)!;
    const po = absoluta(origen);
    const pd = absoluta(destino);
    const s = puntoDeColumna(tablasPorNombre.get(a.source)!, po.x, po.y, origen.width ?? 0, a.sourceHandle);
    const t = puntoDeColumna(tablasPorNombre.get(a.target)!, pd.x, pd.y, destino.width ?? 0, a.targetHandle);
    const [ruta] = getSmoothStepPath({
      sourceX: s.x,
      sourceY: s.y,
      sourcePosition: s.lado,
      targetX: t.x,
      targetY: t.y,
      targetPosition: t.lado,
      ...FORMA_RELACION,
    });
    const relacion = a.data!.relacion;
    const marcas = `${marca(s.x, s.y, s.lado, relacion.origen.cardinalidad)} ${marca(t.x, t.y, t.lado, relacion.destino.cardinalidad)}`;
    relaciones.push(
      `<g><path class="linea${relacion.opcional ? ' opcional' : ''}" d="${ruta}"/><path class="marca" d="${marcas}"/></g>`,
    );
  }

  for (const n of visibles) {
    if (n.type !== 'tabla') continue;
    const { tabla, color } = n.data;
    const { x, y } = absoluta(n);
    const w = n.width ?? 0;
    const h = n.height ?? 0;
    const id = `recorte-tabla-${recortes.length}`;
    recortes.push(`<clipPath id="${id}"><rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="8"/></clipPath>`);
    const partes: string[] = [
      `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="#fff"/>`,
      `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${1 + ALTO_CABECERA}" fill="${color}"/>`,
      `<text class="tabla-nombre" x="${r(x + 11)}" y="${r(y + 1 + ALTO_CABECERA / 2)}" dominant-baseline="central">${escaparXml(tabla.nombre)}</text>`,
    ];
    if (tabla.nota)
      partes.push(`<use href="#icono-nota" x="${r(x + w - 24)}" y="${r(y + 1 + ALTO_CABECERA / 2 - 6.5)}" width="13" height="13" color="#fff" opacity="0.85"/>`);

    tabla.columnas.forEach((c, i) => {
      const arriba = y + 1 + ALTO_CABECERA + i * ALTO_FILA;
      const centro = arriba + (ALTO_FILA + 1) / 2;
      partes.push(`<line class="separador" x1="${r(x)}" x2="${r(x + w)}" y1="${r(arriba + 0.5)}" y2="${r(arriba + 0.5)}"/>`);
      if (c.pk || c.esFk)
        partes.push(
          `<use href="#icono-${c.pk ? 'llave' : 'eslabon'}" x="${r(x + 9)}" y="${r(centro - 6)}" width="12" height="12" color="${c.pk ? '#d97706' : '#4f46e5'}"/>`,
        );
      const xNombre = x + 28;
      partes.push(
        `<text class="columna${c.pk ? ' pk' : ''}" x="${r(xNombre)}" y="${r(centro)}" dominant-baseline="central">${escaparXml(c.nombre)}</text>`,
      );
      if (c.nota) {
        const fin = xNombre + medir(c.nombre, c.pk ? FUENTE_COLUMNA_PK : FUENTE_COLUMNA);
        partes.push(`<circle cx="${r(fin + 6.5)}" cy="${r(centro)}" r="2.5" fill="#4f46e5"/>`);
      }
      partes.push(
        `<text class="tipo${c.enumNombre ? ' enum' : ''}" x="${r(x + w - 11)}" y="${r(centro)}" text-anchor="end" dominant-baseline="central">${escaparXml(c.tipo)}${c.noNula ? '' : '<tspan class="nulo">?</tspan>'}</text>`,
      );
    });

    tablas.push(
      `<g>` +
        `<g clip-path="url(#${id})">${partes.join('')}</g>` +
        `<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${r(w - 1)}" height="${r(h - 1)}" rx="8" fill="none" stroke="#d5dae2"/>` +
        (tabla.nota ? `<title>${escaparXml(tabla.nota)}</title>` : '') +
        `</g>`,
    );
  }

  const iconos = Object.entries(ICONOS)
    .map(
      ([nombre, trazos]) =>
        `<symbol id="icono-${nombre}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</symbol>`,
    )
    .join('');
  const titulo = esquema.proyecto?.nombre ?? 'Esquema';

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(minX)} ${r(minY)} ${ancho} ${alto}" width="${ancho}" height="${alto}">`,
    `<title>${escaparXml(titulo)}</title>`,
    `<style>${ESTILOS}</style>`,
    `<defs>${iconos}${recortes.join('')}</defs>`,
    `<rect x="${r(minX)}" y="${r(minY)}" width="${ancho}" height="${alto}" fill="#fff"/>`,
    `<g id="grupos">${grupos.join('')}</g>`,
    `<g id="relaciones">${relaciones.join('')}</g>`,
    `<g id="tablas">${tablas.join('')}</g>`,
    '</svg>',
    '',
  ].join('\n');
}
