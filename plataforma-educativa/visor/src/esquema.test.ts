import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ErrorDbml, leerEsquema } from './esquema.ts';
import { relacionesDe } from './modelo.ts';

const EJEMPLO = `
Project prueba {
  database_type: 'PostgreSQL'
  Note: 'nota del proyecto'
}

TableGroup personas [color: #4F46E5] {
  Note: 'quién es quién'
  usuario
  alumno
}

Enum estado {
  activo [note: 'en uso']
  baja
}

Table usuario {
  id uuid [pk]
  email varchar [not null, unique, note: 'para iniciar sesión']
  estado estado [not null, default: 'activo']
  creado_en timestamptz [default: \`now()\`]
}

Table alumno {
  usuario_id uuid [pk, ref: - usuario.id]
  tutor_id uuid [ref: > usuario.id]
}

Table matricula {
  alumno_id uuid [not null]
  clase varchar [not null]
  indexes {
    (alumno_id, clase) [pk]
  }
  Note: 'sin grupo'
}

Ref: alumno.usuario_id < matricula.alumno_id
`;

test('lee tablas, columnas y grupos', () => {
  const e = leerEsquema(EJEMPLO);
  assert.deepEqual(e.tablas.map((t) => t.nombre), ['usuario', 'alumno', 'matricula']);
  assert.deepEqual(e.grupos, [
    { nombre: 'personas', color: '#4F46E5', nota: 'quién es quién', tablas: ['usuario', 'alumno'] },
  ]);
  assert.equal(e.tablas[2].grupo, null);
  assert.equal(e.tablas[2].nota, 'sin grupo');
  assert.deepEqual(e.proyecto, { nombre: 'prueba', nota: 'nota del proyecto', motor: 'PostgreSQL' });

  const [id, email, estado, creado] = e.tablas[0].columnas;
  assert.equal(id.pk, true);
  assert.equal(email.unica, true);
  assert.equal(email.noNula, true);
  assert.equal(email.nota, 'para iniciar sesión');
  assert.equal(estado.enumNombre, 'estado');
  assert.equal(estado.porDefecto, "'activo'");
  assert.equal(creado.porDefecto, 'now()');
  assert.equal(creado.noNula, false);
});

test('las columnas de una clave primaria compuesta son pk', () => {
  const matricula = leerEsquema(EJEMPLO).tablas[2];
  assert.deepEqual(matricula.columnas.map((c) => c.pk), [true, true]);
  assert.deepEqual(matricula.indices, [{ columnas: ['alumno_id', 'clase'], pk: true, unico: false, nota: null }]);
});

test('las relaciones van de la clave ajena a la tabla referenciada', () => {
  const e = leerEsquema(EJEMPLO);
  const resumen = e.relaciones.map((r) => [
    `${r.origen.tabla}.${r.origen.columnas[0]}`,
    r.origen.cardinalidad,
    `${r.destino.tabla}.${r.destino.columnas[0]}`,
    r.destino.cardinalidad,
    r.opcional,
  ]);
  assert.deepEqual(resumen, [
    ['alumno.usuario_id', '1', 'usuario.id', '1', false],
    ['alumno.tutor_id', '*', 'usuario.id', '1', true],
    // Declarada con «<» desde alumno: se le da la vuelta para que el origen sea el lado «muchos».
    ['matricula.alumno_id', '*', 'alumno.usuario_id', '1', false],
  ]);
  const alumno = e.tablas[1];
  assert.deepEqual(alumno.columnas.map((c) => c.esFk), [true, true]);
  assert.equal(e.tablas[0].columnas[0].esFk, false);

  const deAlumno = relacionesDe(e, 'alumno');
  assert.equal(deAlumno.salientes.length, 2);
  assert.equal(deAlumno.entrantes.length, 1);
});

test('lee los enums con sus valores y dónde se usan', () => {
  assert.deepEqual(leerEsquema(EJEMPLO).enums, [
    {
      nombre: 'estado',
      nota: null,
      valores: [
        { nombre: 'activo', nota: 'en uso' },
        { nombre: 'baja', nota: null },
      ],
      usadoEn: ['usuario.estado'],
    },
  ]);
});

test('un DBML con errores lanza ErrorDbml con la línea', () => {
  assert.throws(
    () => leerEsquema('Table a {\n  id uuid [pk\n}'),
    (e: unknown) => e instanceof ErrorDbml && e.linea === 3 && e.total >= 1,
  );
});

test('lee el esquema de la plataforma completo', () => {
  const texto = fs.readFileSync(new URL('../../esquema.dbml', import.meta.url), 'utf8');
  const e = leerEsquema(texto);
  assert.equal(e.tablas.length, 49);
  assert.equal(e.relaciones.length, 95);
  assert.equal(e.grupos.length, 8);
  assert.equal(e.enums.length, 32);
  assert.ok(e.tablas.every((t) => t.grupo !== null));
});
