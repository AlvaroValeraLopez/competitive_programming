import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { leerEsquema } from './esquema.ts';
import {
  ALTO_CABECERA,
  ALTO_FILA,
  RELLENO_GRUPO,
  aGuardar,
  combinar,
  disponer,
  encajarGrupo,
  medidasDe,
  type Caja,
} from './disposicion.ts';

const esquema = leerEsquema(fs.readFileSync(new URL('../../esquema.dbml', import.meta.url), 'utf8'));
const medidas = medidasDe(esquema);

const solapan = (a: Caja, b: Caja) => a.x < b.x + b.ancho && b.x < a.x + a.ancho && a.y < b.y + b.alto && b.y < a.y + a.alto;

test('el alto de una tabla sale de su número de columnas', () => {
  const centro = esquema.tablas.find((t) => t.nombre === 'centro')!;
  assert.equal(medidas.centro.alto, ALTO_CABECERA + centro.columnas.length * ALTO_FILA + 2);
});

test('la disposición automática coloca todas las tablas dentro de su grupo y sin solaparse', async () => {
  const d = await disponer(esquema);
  assert.equal(Object.keys(d.tablas).length, esquema.tablas.length);
  assert.equal(Object.keys(d.grupos).length, esquema.grupos.length);

  const grupos = Object.values(d.grupos);
  for (let i = 0; i < grupos.length; i++)
    for (let j = i + 1; j < grupos.length; j++) assert.ok(!solapan(grupos[i], grupos[j]), 'dos grupos se solapan');

  for (const g of esquema.grupos) {
    const caja = d.grupos[g.nombre];
    const cajas = g.tablas.map((n) => ({ ...d.tablas[n], ...medidas[n] }));
    for (const c of cajas) {
      assert.ok(c.x >= RELLENO_GRUPO.lados && c.y >= RELLENO_GRUPO.arriba, `${g.nombre}: tabla fuera por arriba o la izquierda`);
      assert.ok(c.x + c.ancho <= caja.ancho && c.y + c.alto <= caja.alto, `${g.nombre}: tabla fuera por abajo o la derecha`);
    }
    for (let i = 0; i < cajas.length; i++)
      for (let j = i + 1; j < cajas.length; j++) assert.ok(!solapan(cajas[i], cajas[j]), `${g.nombre}: dos tablas se solapan`);
  }
});

test('encajar un grupo lo mueve si una tabla se sale por la izquierda, sin mover la tabla en el lienzo', () => {
  const m = { a: { ancho: 200, alto: 100 }, b: { ancho: 200, alto: 100 } };
  const { caja, tablas } = encajarGrupo({ x: 1000, y: 500 }, { a: { x: -50, y: 100 }, b: { x: 300, y: 300 } }, m);
  assert.deepEqual(tablas.a, { x: RELLENO_GRUPO.lados, y: RELLENO_GRUPO.arriba });
  // La tabla «a» sigue en el mismo sitio absoluto: 1000 - 50, 500 + 100.
  assert.equal(caja.x + tablas.a.x, 950);
  assert.equal(caja.y + tablas.a.y, 600);
  assert.equal(caja.ancho, 550 + 2 * RELLENO_GRUPO.lados);
  assert.equal(caja.alto, 300 + RELLENO_GRUPO.arriba + RELLENO_GRUPO.abajo);
});

test('combinar respeta lo guardado y descarta lo de una tabla que ha cambiado de grupo', async () => {
  const auto = await disponer(esquema);
  const guardadas = aGuardar(esquema, auto);
  guardadas.grupos.tareas = { x: 9000, y: 9000 };
  guardadas.tablas.tarea = { x: 400, y: 400, grupo: 'tareas' };
  guardadas.tablas.entrega = { x: 10, y: 10, grupo: 'otro_grupo' };

  const d = combinar(esquema, auto, guardadas);
  assert.deepEqual(d.grupos.organizacion, auto.grupos.organizacion);
  // El grupo se ha movido a lo guardado y se ha ajustado a sus tablas.
  const absoluta = (n: string) => ({ x: d.grupos.tareas.x + d.tablas[n].x, y: d.grupos.tareas.y + d.tablas[n].y });
  assert.deepEqual(absoluta('tarea'), { x: 9400, y: 9400 });
  const entregaAuto = auto.tablas.entrega;
  assert.deepEqual(absoluta('entrega'), { x: 9000 + entregaAuto.x, y: 9000 + entregaAuto.y });
});
