import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { leerEsquema } from './esquema.ts';
import { codigos, leerDocumentacion } from './documentacion.ts';
import type { Texto } from './modelo.ts';

const plano = (t: Texto): string => t.map((p) => ('texto' in p ? p.texto : plano(p.hijos))).join('');

const DOC = `
# Modelo

## Convenciones

| Tabla | Qué representa |
| --- | --- |
| \`fuera_de_modulo\` | No cuenta: no está en un módulo numerado |

## 1. Personas

| Tabla | Qué representa |
| --- | --- |
| \`usuario\` | Cualquier persona que **inicia sesión** |
| \`error_tipico\` | Una equivocación frecuente |
| \`vieja\` | Ya no existe en el esquema |

**Por qué así**

- \`usuario\` es la base de todo.
- Los **errores típicos** van más allá de «bien o mal».
- La matrícula tiene fechas.
- Varias formas:
  - \`usuario\` para iniciar sesión;
  - y nada más.

## Cómo sale cada funcionalidad del modelo

| Lo que se ve | De dónde sale |
| --- | --- |
| La lista de personas | Los \`usuario\` y su \`error_tipico.nombre\` |
| Algo sin tablas | Nada que ver |

## Valores derivados

| Valor | Se calcula a partir de |
| --- | --- |
| \`error_tipico.total\` | Los \`usuario\` |

## Lo que cambiaría según las preguntas abiertas

| Pregunta | Cambio en el modelo |
| --- | --- |
| P1 · ¿Familias? | \`usuario\` ganaría un rol &amp; más |
`;

test('reparte cada parte del documento entre las tablas', () => {
  const d = leerDocumentacion(DOC, ['usuario', 'error_tipico', 'nueva'], 'modelo.md');
  assert.equal(d.archivo, 'modelo.md');
  assert.deepEqual(d.modulos.map((m) => [m.titulo, m.tablas]), [['1. Personas', ['usuario', 'error_tipico', 'vieja']]]);

  const usuario = d.tablas.usuario;
  assert.equal(usuario.modulo, '1. Personas');
  assert.deepEqual(usuario.representa, [
    { tipo: 'texto', texto: 'Cualquier persona que ' },
    { tipo: 'negrita', hijos: [{ tipo: 'texto', texto: 'inicia sesión' }] },
  ]);
  // Lo nombra en código el primer punto y un subpunto del cuarto.
  assert.deepEqual(usuario.porQue.map((p) => plano(p.texto)), ['usuario es la base de todo.', 'Varias formas:']);
  assert.deepEqual(usuario.porQue[1].subpuntos.map(codigos), [['usuario'], []]);
  assert.equal(usuario.funcionalidades.length, 1);
  assert.equal(plano(usuario.funcionalidades[0].queSeVe), 'La lista de personas');
  assert.equal(usuario.derivado, null);
  assert.equal(usuario.cambios.length, 1);
  assert.equal(plano(usuario.cambios[0].cambio), 'usuario ganaría un rol & más');
});

test('encuentra una tabla por su nombre en el texto normal, sin tildes y en plural', () => {
  const d = leerDocumentacion(DOC, ['usuario', 'error_tipico'], 'modelo.md');
  assert.deepEqual(d.tablas.error_tipico.porQue.map((p) => plano(p.texto)), ['Los errores típicos van más allá de «bien o mal».']);
  assert.ok(d.tablas.error_tipico.derivado);
  assert.equal(d.tablas.error_tipico.funcionalidades.length, 1);
});

test('avisa de las tablas sin explicar y de las que ya no existen', () => {
  const d = leerDocumentacion(DOC, ['usuario', 'error_tipico', 'nueva'], 'modelo.md');
  assert.deepEqual(d.sinExplicar, ['nueva']);
  assert.deepEqual(d.huerfanas, ['vieja']);
  assert.equal(d.tablas.fuera_de_modulo, undefined);
});

test('el documento de la plataforma explica todas las tablas del esquema', () => {
  const carpeta = new URL('../../', import.meta.url);
  const esquema = leerEsquema(fs.readFileSync(new URL('esquema.dbml', carpeta), 'utf8'));
  const d = leerDocumentacion(
    fs.readFileSync(new URL('modelo-datos.md', carpeta), 'utf8'),
    esquema.tablas.map((t) => t.nombre),
    'modelo-datos.md',
  );
  assert.equal(d.modulos.length, 8);
  assert.deepEqual(d.sinExplicar, []);
  assert.deepEqual(d.huerfanas, []);
  assert.ok(esquema.tablas.every((t) => d.tablas[t.nombre].representa));
  assert.equal(d.tablas.clase.modulo, '1. Organización');
  assert.ok(d.tablas.clase.porQue.length > 0);
  assert.ok(d.tablas.intento.funcionalidades.length > 0);
  assert.ok(d.tablas.dominio_concepto.derivado);
});
