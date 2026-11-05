import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs/lib/elk-api';
import type { Esquema, Relacion, Tabla } from './modelo.ts';

// Medidas fijas en CSS (styles.css): así se puede colocar una tabla antes de dibujarla.
export const ALTO_CABECERA = 34;
export const ALTO_FILA = 22;
const BORDES = 2;

export const RELLENO_GRUPO = { arriba: 56, lados: 28, abajo: 28 };
const SEPARACION_GRUPOS = 90;
const ANCHO_MAX_FILA = 3600;

export interface Punto {
  x: number;
  y: number;
}

export interface Medidas {
  ancho: number;
  alto: number;
}

export type Caja = Punto & Medidas;

export interface Disposicion {
  grupos: Record<string, Caja>;
  /** Posición de cada tabla: relativa a su grupo si tiene, absoluta si no. */
  tablas: Record<string, Punto>;
}

/** Lo que se guarda en `esquema.posiciones.json`. */
export interface PosicionesGuardadas {
  grupos: Record<string, Punto>;
  tablas: Record<string, Punto & { grupo: string | null }>;
}

export function medidasTabla(tabla: Tabla): Medidas {
  const largo = (textos: string[]) => Math.max(0, ...textos.map((t) => t.length));
  const filas = 40 + largo(tabla.columnas.map((c) => c.nombre)) * 6.9 + 20 + largo(tabla.columnas.map((c) => c.tipo)) * 6.7;
  const cabecera = 44 + tabla.nombre.length * 8;
  return {
    ancho: Math.min(420, Math.max(220, Math.ceil(Math.max(filas, cabecera) / 10) * 10)),
    alto: ALTO_CABECERA + tabla.columnas.length * ALTO_FILA + BORDES,
  };
}

export function medidasDe(esquema: Esquema): Record<string, Medidas> {
  return Object.fromEntries(esquema.tablas.map((t) => [t.nombre, medidasTabla(t)]));
}

const elk = new ELK();

/** Coloca un conjunto de tablas por capas: las referenciadas a la izquierda, las que las referencian a la derecha. */
async function disponerBloque(tablas: Tabla[], relaciones: Relacion[], medidas: Record<string, Medidas>) {
  const dentro = new Set(tablas.map((t) => t.nombre));
  const aristas = new Map<string, { origen: string; destino: string }>();
  for (const r of relaciones) {
    const { origen, destino } = { origen: r.destino.tabla, destino: r.origen.tabla };
    if (origen !== destino && dentro.has(origen) && dentro.has(destino)) aristas.set(`${origen}>${destino}`, { origen, destino });
  }
  const grafo: ElkNode = {
    id: 'bloque',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '32',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
      'elk.spacing.componentComponent': '48',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    },
    children: tablas.map((t) => ({ id: t.nombre, width: medidas[t.nombre].ancho, height: medidas[t.nombre].alto })),
    edges: [...aristas.entries()].map(([id, a]) => ({ id, sources: [a.origen], targets: [a.destino] })),
  };
  const hijos = (await elk.layout(grafo)).children ?? [];
  // ELK añade su propio margen y da decimales: se lleva todo a la esquina y a píxeles enteros.
  const minX = Math.min(...hijos.map((h) => h.x ?? 0));
  const minY = Math.min(...hijos.map((h) => h.y ?? 0));
  const posiciones: Record<string, Punto> = {};
  for (const h of hijos) posiciones[h.id] = { x: Math.round((h.x ?? 0) - minX), y: Math.round((h.y ?? 0) - minY) };
  const ancho = Math.max(...hijos.map((h) => posiciones[h.id].x + medidas[h.id].ancho));
  const alto = Math.max(...hijos.map((h) => posiciones[h.id].y + medidas[h.id].alto));
  return { posiciones, ancho, alto };
}

/** Disposición automática de todo el esquema: cada grupo por capas, y los grupos en filas en el orden del archivo. */
export async function disponer(esquema: Esquema): Promise<Disposicion> {
  const medidas = medidasDe(esquema);
  const porNombre = new Map(esquema.tablas.map((t) => [t.nombre, t]));
  const bloques: { grupo: string | null; tablas: Tabla[] }[] = esquema.grupos.map((g) => ({
    grupo: g.nombre,
    tablas: g.tablas.map((n) => porNombre.get(n)).filter((t): t is Tabla => Boolean(t)),
  }));
  const sueltas = esquema.tablas.filter((t) => t.grupo === null);
  if (sueltas.length) bloques.push({ grupo: null, tablas: sueltas });

  const disposicion: Disposicion = { grupos: {}, tablas: {} };
  let x = 0;
  let y = 0;
  let altoFila = 0;
  for (const bloque of bloques) {
    if (!bloque.tablas.length) continue;
    const { posiciones, ancho, alto } = await disponerBloque(bloque.tablas, esquema.relaciones, medidas);
    const relleno = bloque.grupo ? RELLENO_GRUPO : { arriba: 0, lados: 0, abajo: 0 };
    const caja = { ancho: ancho + 2 * relleno.lados, alto: alto + relleno.arriba + relleno.abajo };
    if (x > 0 && x + caja.ancho > ANCHO_MAX_FILA) {
      x = 0;
      y += altoFila + SEPARACION_GRUPOS;
      altoFila = 0;
    }
    for (const [nombre, p] of Object.entries(posiciones)) {
      disposicion.tablas[nombre] = bloque.grupo
        ? { x: p.x + relleno.lados, y: p.y + relleno.arriba }
        : { x: x + p.x, y: y + p.y };
    }
    if (bloque.grupo) disposicion.grupos[bloque.grupo] = { x, y, ...caja };
    x += caja.ancho + SEPARACION_GRUPOS;
    altoFila = Math.max(altoFila, caja.alto);
  }
  return disposicion;
}

/**
 * Ajusta la caja de un grupo a sus tablas: la agranda o la encoge, y si alguna tabla se ha salido
 * por arriba o por la izquierda, mueve el grupo para que todas sigan dentro sin moverse en el lienzo.
 */
export function encajarGrupo(origen: Punto, tablas: Record<string, Punto>, medidas: Record<string, Medidas>) {
  const nombres = Object.keys(tablas);
  if (!nombres.length) return { caja: { ...origen, ancho: 0, alto: 0 }, tablas };
  const minX = Math.min(...nombres.map((n) => tablas[n].x));
  const minY = Math.min(...nombres.map((n) => tablas[n].y));
  const maxX = Math.max(...nombres.map((n) => tablas[n].x + medidas[n].ancho));
  const maxY = Math.max(...nombres.map((n) => tablas[n].y + medidas[n].alto));
  const dx = minX - RELLENO_GRUPO.lados;
  const dy = minY - RELLENO_GRUPO.arriba;
  return {
    caja: {
      x: origen.x + dx,
      y: origen.y + dy,
      ancho: maxX - minX + 2 * RELLENO_GRUPO.lados,
      alto: maxY - minY + RELLENO_GRUPO.arriba + RELLENO_GRUPO.abajo,
    },
    tablas: Object.fromEntries(nombres.map((n) => [n, { x: tablas[n].x - dx, y: tablas[n].y - dy }])),
  };
}

/**
 * Parte de la disposición automática y respeta lo guardado: cada tabla que sigue en el mismo grupo
 * conserva su sitio, y cada grupo, su origen. Después ajusta cada grupo a sus tablas.
 */
export function combinar(esquema: Esquema, auto: Disposicion, guardadas: PosicionesGuardadas | null): Disposicion {
  if (!guardadas) return auto;
  const medidas = medidasDe(esquema);
  const resultado: Disposicion = { grupos: {}, tablas: {} };
  for (const t of esquema.tablas) {
    const guardada = guardadas.tablas[t.nombre];
    resultado.tablas[t.nombre] =
      guardada && guardada.grupo === t.grupo ? { x: guardada.x, y: guardada.y } : auto.tablas[t.nombre];
  }
  for (const g of esquema.grupos) {
    if (!auto.grupos[g.nombre]) continue;
    const origen = guardadas.grupos[g.nombre] ?? auto.grupos[g.nombre];
    const suyas = Object.fromEntries(g.tablas.filter((n) => resultado.tablas[n]).map((n) => [n, resultado.tablas[n]]));
    const encajado = encajarGrupo(origen, suyas, medidas);
    resultado.grupos[g.nombre] = encajado.caja;
    Object.assign(resultado.tablas, encajado.tablas);
  }
  return resultado;
}

/** Lo que se escribe en `esquema.posiciones.json`, en píxeles enteros para que el archivo quede limpio en git. */
export function aGuardar(esquema: Esquema, disposicion: Disposicion): PosicionesGuardadas {
  const punto = (p: Punto) => ({ x: Math.round(p.x), y: Math.round(p.y) });
  return {
    grupos: Object.fromEntries(Object.entries(disposicion.grupos).map(([n, c]) => [n, punto(c)])),
    tablas: Object.fromEntries(
      esquema.tablas
        .filter((t) => disposicion.tablas[t.nombre])
        .map((t) => [t.nombre, { ...punto(disposicion.tablas[t.nombre]), grupo: t.grupo }]),
    ),
  };
}
