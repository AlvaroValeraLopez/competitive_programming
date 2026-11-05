import { Parser } from '@dbml/core';
import {
  COLOR_SIN_GRUPO,
  type EnumEsquema,
  type ErrorEsquema,
  type Esquema,
  type Extremo,
  type Grupo,
  type Indice,
  type Relacion,
  type Tabla,
} from './modelo.ts';

/** Se usa en el servidor (vite.config.ts) y en los tests; el navegador solo recibe el resultado. */

export class ErrorDbml extends Error {
  linea: number | null;
  columna: number | null;
  total: number;

  constructor(mensaje: string, linea: number | null, columna: number | null, total: number) {
    super(mensaje);
    this.linea = linea;
    this.columna = columna;
    this.total = total;
  }

  aJson(): ErrorEsquema {
    return { mensaje: this.message, linea: this.linea, columna: this.columna, total: this.total };
  }
}

type Normalizado = ReturnType<ReturnType<InstanceType<typeof Parser>['parse']>['normalize']>;

interface Diagnostico {
  message?: string;
  location?: { start?: { line?: number; column?: number } };
}

function compilar(texto: string): Normalizado {
  try {
    return new Parser().parse(texto, 'dbmlv2').normalize();
  } catch (error) {
    const diags: Diagnostico[] = (error as { diags?: Diagnostico[] }).diags ?? [];
    const primero = diags[0];
    throw new ErrorDbml(
      primero?.message ?? String(error),
      primero?.location?.start?.line ?? null,
      primero?.location?.start?.column ?? null,
      Math.max(diags.length, 1),
    );
  }
}

function formatearDefecto(valor: { type: string; value: unknown } | null | undefined): string | null {
  if (!valor) return null;
  if (valor.type === 'string') return `'${String(valor.value)}'`;
  return String(valor.value);
}

const porId = <T extends { id: number }>(coleccion: Record<number, T>) =>
  Object.values(coleccion).sort((a, b) => a.id - b.id);

/** Convierte un texto DBML en el modelo que dibuja el visor. Lanza `ErrorDbml` si no compila. */
export function leerEsquema(texto: string): Esquema {
  const n = compilar(texto);

  const grupos: Grupo[] = porId(n.tableGroups).map((g) => ({
    nombre: g.name,
    color: g.color ?? COLOR_SIN_GRUPO,
    nota: g.note ?? null,
    tablas: g.tableIds.map((id) => n.tables[id].name),
  }));

  const columnasFk = new Set<number>();
  const relaciones: Relacion[] = porId(n.refs).map((ref) => {
    let [a, b] = ref.endpointIds.map((id) => n.endpoints[id]);
    // El origen es el lado «muchos». En las 1-1 el parser no dice quién guarda la clave ajena
    // (las referencias en línea dan primero la tabla referenciada; las sueltas, el orden escrito),
    // así que el destino es el lado que es un `id` a secas.
    const esId = (e: typeof a) => e.fieldNames.length === 1 && e.fieldNames[0] === 'id';
    if (a.relation === '1' && b.relation === '*') [a, b] = [b, a];
    else if (a.relation === '1' && b.relation === '1' && esId(a) && !esId(b)) [a, b] = [b, a];
    a.fieldIds.forEach((id) => columnasFk.add(id));
    const opcional = a.fieldIds.some((id) => !n.fields[id].not_null && !n.fields[id].pk);
    const extremo = (e: typeof a): Extremo => ({
      tabla: e.tableName,
      columnas: e.fieldNames,
      cardinalidad: e.relation === '*' ? '*' : '1',
    });
    return {
      id: `${a.tableName}.${a.fieldNames.join(',')}->${b.tableName}.${b.fieldNames.join(',')}`,
      origen: extremo(a),
      destino: extremo(b),
      opcional,
    };
  });

  const tablas: Tabla[] = porId(n.tables).map((t) => {
    const indices: Indice[] = t.indexIds.map((id) => {
      const indice = n.indexes[id];
      return {
        columnas: indice.columnIds.map((c) => n.indexColumns[c].value),
        pk: Boolean(indice.pk),
        unico: Boolean(indice.unique),
        nota: indice.note ?? null,
      };
    });
    const enPk = new Set(indices.filter((i) => i.pk).flatMap((i) => i.columnas));
    return {
      nombre: t.name,
      nota: t.note ?? null,
      grupo: t.groupId != null ? n.tableGroups[t.groupId].name : null,
      indices,
      columnas: t.fieldIds.map((id) => {
        const f = n.fields[id];
        return {
          nombre: f.name,
          tipo: f.type.type_name,
          pk: Boolean(f.pk) || enPk.has(f.name),
          unica: Boolean(f.unique),
          noNula: Boolean(f.not_null) || Boolean(f.pk) || enPk.has(f.name),
          porDefecto: formatearDefecto(f.dbdefault),
          nota: f.note ?? null,
          enumNombre: f.enumId != null ? n.enums[f.enumId].name : null,
          esFk: columnasFk.has(id),
        };
      }),
    };
  });

  const enums: EnumEsquema[] = porId(n.enums).map((e) => ({
    nombre: e.name,
    nota: e.note ?? null,
    valores: e.valueIds.map((id) => ({ nombre: n.enumValues[id].name, nota: n.enumValues[id].note ?? null })),
    usadoEn: e.fieldIds.map((id) => `${n.tables[n.fields[id].tableId].name}.${n.fields[id].name}`),
  }));

  const db = Object.values(n.database)[0];
  return {
    proyecto: db?.name ? { nombre: db.name, nota: db.note ?? null, motor: db.databaseType } : null,
    tablas,
    relaciones,
    grupos,
    enums,
  };
}
