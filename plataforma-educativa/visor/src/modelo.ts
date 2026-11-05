/**
 * El modelo que dibuja el visor. Lo construye `esquema.ts` en el servidor, a partir del DBML, y llega
 * al navegador como JSON: así el navegador no carga el parser.
 */

/** Lado de una relación: `1` si es el lado «uno», `*` si es el lado «muchos». */
export type Cardinalidad = '1' | '*';

export interface Columna {
  nombre: string;
  tipo: string;
  pk: boolean;
  unica: boolean;
  noNula: boolean;
  porDefecto: string | null;
  nota: string | null;
  /** Nombre del Enum si el tipo de la columna es uno. */
  enumNombre: string | null;
  /** La columna apunta a otra tabla. */
  esFk: boolean;
}

export interface Indice {
  columnas: string[];
  pk: boolean;
  unico: boolean;
  nota: string | null;
}

export interface Tabla {
  nombre: string;
  nota: string | null;
  grupo: string | null;
  columnas: Columna[];
  indices: Indice[];
}

export interface Extremo {
  tabla: string;
  columnas: string[];
  cardinalidad: Cardinalidad;
}

/** Una relación va siempre de la tabla que guarda la clave ajena (origen) a la referenciada (destino). */
export interface Relacion {
  id: string;
  origen: Extremo;
  destino: Extremo;
  /** La clave ajena admite nulos: la relación es opcional. */
  opcional: boolean;
}

export interface Grupo {
  nombre: string;
  color: string;
  nota: string | null;
  tablas: string[];
}

export interface EnumEsquema {
  nombre: string;
  nota: string | null;
  valores: { nombre: string; nota: string | null }[];
  /** Columnas que lo usan, como `tabla.columna`. */
  usadoEn: string[];
}

export interface Esquema {
  proyecto: { nombre: string; nota: string | null; motor: string } | null;
  tablas: Tabla[];
  relaciones: Relacion[];
  grupos: Grupo[];
  enums: EnumEsquema[];
}

export interface ErrorEsquema {
  mensaje: string;
  linea: number | null;
  columna: number | null;
  /** Cuántos errores ha encontrado el parser en total. */
  total: number;
}

/** Lo que responde `GET /api/esquema`: el modelo o, si el DBML no compila, el error. */
export type RespuestaEsquema = { archivo: string; modificado: number } & (
  | { esquema: Esquema; error?: undefined }
  | { error: ErrorEsquema; esquema?: undefined }
);

export const COLOR_SIN_GRUPO = '#475569';

/** Las relaciones que salen de una tabla y las que llegan a ella. */
export function relacionesDe(esquema: Esquema, tabla: string) {
  return {
    salientes: esquema.relaciones.filter((r) => r.origen.tabla === tabla),
    entrantes: esquema.relaciones.filter((r) => r.destino.tabla === tabla),
  };
}
