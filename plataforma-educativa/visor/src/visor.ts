import { createContext } from 'react';
import type { Edge, Node } from '@xyflow/react';
import { COLOR_SIN_GRUPO, type Columna, type Esquema, type Grupo, type Relacion, type Tabla } from './modelo.ts';
import { aGuardar, encajarGrupo, medidasDe, type Disposicion, type Medidas, type PosicionesGuardadas } from './disposicion.ts';

export type NodoTabla = Node<{ tabla: Tabla; color: string }, 'tabla'>;
export type NodoGrupo = Node<{ grupo: Grupo }, 'grupo'>;
export type NodoVisor = NodoTabla | NodoGrupo;
export type AristaVisor = Edge<{ relacion: Relacion }, 'relacion'>;

export const idGrupo = (nombre: string) => `grupo:${nombre}`;

// ─── Resaltado ──────────────────────────────────────────────

export interface EstadoVisor {
  /** Tabla con el ratón encima o, si no hay, la seleccionada: se resaltan ella y sus relaciones. */
  foco: string | null;
  seleccionada: string | null;
  /** Tablas relacionadas con la del foco. */
  vecinas: Set<string>;
  /** Con una búsqueda activa, las columnas que coinciden en cada tabla que coincide. */
  coincidencias: Map<string, Set<string>> | null;
}

export const ContextoVisor = createContext<EstadoVisor>({
  foco: null,
  seleccionada: null,
  vecinas: new Set(),
  coincidencias: null,
});

export function estadoTabla(e: EstadoVisor, tabla: string): 'normal' | 'foco' | 'atenuada' {
  if (e.foco) return tabla === e.foco ? 'foco' : e.vecinas.has(tabla) ? 'normal' : 'atenuada';
  if (e.coincidencias) return e.coincidencias.has(tabla) ? 'normal' : 'atenuada';
  return 'normal';
}

export function estadoArista(e: EstadoVisor, r: Relacion): 'normal' | 'resaltada' | 'atenuada' {
  if (e.foco) return r.origen.tabla === e.foco || r.destino.tabla === e.foco ? 'resaltada' : 'atenuada';
  if (e.coincidencias) return e.coincidencias.has(r.origen.tabla) && e.coincidencias.has(r.destino.tabla) ? 'normal' : 'atenuada';
  return 'normal';
}

export function vecinasDe(esquema: Esquema, tabla: string | null): Set<string> {
  const vecinas = new Set<string>();
  if (!tabla) return vecinas;
  for (const r of esquema.relaciones) {
    if (r.origen.tabla === tabla) vecinas.add(r.destino.tabla);
    if (r.destino.tabla === tabla) vecinas.add(r.origen.tabla);
  }
  return vecinas;
}

/** Busca en nombres y notas de tablas y columnas. */
export function buscar(esquema: Esquema, consulta: string) {
  const q = consulta.trim().toLowerCase();
  if (!q) return null;
  const contiene = (texto: string | null) => Boolean(texto && texto.toLowerCase().includes(q));
  const coincidencias = new Map<string, Set<string>>();
  const tablas: string[] = [];
  const columnas: { tabla: string; columna: string }[] = [];
  for (const t of esquema.tablas) {
    const cols = new Set(t.columnas.filter((c) => contiene(c.nombre) || contiene(c.nota)).map((c) => c.nombre));
    const porTabla = contiene(t.nombre) || contiene(t.nota);
    if (porTabla) tablas.push(t.nombre);
    cols.forEach((c) => columnas.push({ tabla: t.nombre, columna: c }));
    if (porTabla || cols.size) coincidencias.set(t.nombre, cols);
  }
  return { coincidencias, tablas, columnas };
}

// ─── Textos ─────────────────────────────────────────────────

export function descripcionColumna(c: Columna): string {
  const rasgos = [
    c.tipo,
    c.pk ? 'clave primaria' : null,
    c.esFk ? 'clave ajena' : null,
    c.unica ? 'única' : null,
    c.noNula ? 'obligatoria' : 'admite nulo',
    c.porDefecto !== null ? `por defecto ${c.porDefecto}` : null,
  ].filter(Boolean);
  return [rasgos.join(' · '), c.nota].filter(Boolean).join('\n');
}

const CARDINALIDAD = { '1-1': 'uno a uno', '*-1': 'muchos a uno', '1-*': 'uno a muchos', '*-*': 'muchos a muchos' };

export function descripcionRelacion(r: Relacion): string {
  const lado = (e: Relacion['origen']) => `${e.tabla}.${e.columnas.join(', ')}`;
  const tipo = CARDINALIDAD[`${r.origen.cardinalidad}-${r.destino.cardinalidad}`];
  return `${lado(r.origen)} → ${lado(r.destino)} · ${tipo}${r.opcional ? ' · opcional' : ''}`;
}

// ─── Nodos y aristas ────────────────────────────────────────

export function construirNodos(esquema: Esquema, disposicion: Disposicion, ocultos: Set<string>): NodoVisor[] {
  const medidas = medidasDe(esquema);
  const colores = new Map(esquema.grupos.map((g) => [g.nombre, g.color]));
  const grupos: NodoGrupo[] = esquema.grupos
    .filter((g) => disposicion.grupos[g.nombre])
    .map((g) => {
      const caja = disposicion.grupos[g.nombre];
      return {
        id: idGrupo(g.nombre),
        type: 'grupo',
        position: { x: caja.x, y: caja.y },
        width: caja.ancho,
        height: caja.alto,
        data: { grupo: g },
        dragHandle: '.grupo-cabecera',
        selectable: false,
        zIndex: -1,
        hidden: ocultos.has(g.nombre),
      };
    });
  const tablas: NodoTabla[] = esquema.tablas.map((t) => ({
    id: t.nombre,
    type: 'tabla',
    position: disposicion.tablas[t.nombre],
    width: medidas[t.nombre].ancho,
    height: medidas[t.nombre].alto,
    parentId: t.grupo ? idGrupo(t.grupo) : undefined,
    data: { tabla: t, color: t.grupo ? (colores.get(t.grupo) ?? COLOR_SIN_GRUPO) : COLOR_SIN_GRUPO },
    hidden: t.grupo ? ocultos.has(t.grupo) : false,
  }));
  // Los grupos van antes que sus tablas: React Flow necesita los padres primero.
  return [...grupos, ...tablas];
}

/** La disposición que se ve ahora en el lienzo, lista para guardarla. */
export function posicionesActuales(esquema: Esquema, nodos: NodoVisor[]): PosicionesGuardadas {
  const disposicion: Disposicion = { grupos: {}, tablas: {} };
  for (const n of nodos) {
    if (n.type === 'grupo')
      disposicion.grupos[n.data.grupo.nombre] = { ...n.position, ancho: n.width ?? 0, alto: n.height ?? 0 };
    else disposicion.tablas[n.id] = n.position;
  }
  return aGuardar(esquema, disposicion);
}

/** Ajusta el grupo a sus tablas después de mover alguna. */
export function reencajar(nodos: NodoVisor[], grupo: string, medidas: Record<string, Medidas>): NodoVisor[] {
  const id = idGrupo(grupo);
  const nodoGrupo = nodos.find((n) => n.id === id);
  if (!nodoGrupo) return nodos;
  const hijos = Object.fromEntries(nodos.filter((n) => n.parentId === id).map((n) => [n.id, n.position]));
  const { caja, tablas } = encajarGrupo(nodoGrupo.position, hijos, medidas);
  return nodos.map((n) => {
    if (n.id === id) return { ...n, position: { x: caja.x, y: caja.y }, width: caja.ancho, height: caja.alto };
    if (n.parentId === id) return { ...n, position: tablas[n.id] };
    return n;
  });
}

/**
 * Una arista por relación, de la columna de la clave ajena a la columna referenciada. Sale por el
 * lado de la tabla que mira a la otra; si están una encima de otra, las dos por el mismo lado.
 */
export function construirAristas(esquema: Esquema, nodos: NodoVisor[]): AristaVisor[] {
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const absoluta = (n: NodoVisor) => {
    const padre = n.parentId ? porId.get(n.parentId) : undefined;
    return { x: n.position.x + (padre?.position.x ?? 0), ancho: n.width ?? 0 };
  };
  const aristas: AristaVisor[] = [];
  for (const r of esquema.relaciones) {
    const a = porId.get(r.origen.tabla);
    const b = porId.get(r.destino.tabla);
    if (!a || !b) continue;
    const pa = absoluta(a);
    const pb = absoluta(b);
    let lados: [string, string];
    if (pb.x > pa.x + pa.ancho) lados = ['d', 'i'];
    else if (pb.x + pb.ancho < pa.x) lados = ['i', 'd'];
    else lados = pb.x + pb.ancho / 2 >= pa.x + pa.ancho / 2 ? ['d', 'd'] : ['i', 'i'];
    aristas.push({
      id: r.id,
      type: 'relacion',
      source: a.id,
      target: b.id,
      sourceHandle: `${r.origen.columnas[0]}:${lados[0]}`,
      targetHandle: `${r.destino.columnas[0]}:${lados[1]}`,
      data: { relacion: r },
      hidden: Boolean(a.hidden || b.hidden),
    });
  }
  return aristas;
}

export function conAlfa(color: string, alfa: number): string {
  const hex = color.replace('#', '');
  const completo = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex.slice(0, 6);
  const n = Number.parseInt(completo, 16);
  if (Number.isNaN(n)) return color;
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alfa})`;
}
