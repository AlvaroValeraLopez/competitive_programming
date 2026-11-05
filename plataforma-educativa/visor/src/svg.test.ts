import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { leerEsquema } from './esquema.ts';
import { disponer } from './disposicion.ts';
import { construirNodos } from './visor.ts';
import { escaparXml, generarSvg } from './svg.ts';

const cuenta = (texto: string, patron: RegExp) => (texto.match(patron) ?? []).length;

const EJEMPLO = `
TableGroup personas [color: #4F46E5] {
  Note: 'quién es quién & más'
  usuario
  alumno
}

TableGroup aparte [color: #10B981] {
  nota
}

Table usuario {
  id uuid [pk]
  email varchar [not null, note: 'para <iniciar> sesión']
}

Table alumno {
  usuario_id uuid [pk, ref: - usuario.id]
  tutor_id uuid [ref: > usuario.id]
}

Table nota {
  id uuid [pk]
  alumno_id uuid [not null, ref: > alumno.usuario_id]
}
`;

async function svgDe(dbml: string, ocultos = new Set<string>()) {
  const esquema = leerEsquema(dbml);
  const nodos = construirNodos(esquema, await disponer(esquema), ocultos);
  return generarSvg(esquema, nodos);
}

test('dibuja cada grupo, tabla y relación una vez', async () => {
  const svg = await svgDe(EJEMPLO);
  assert.ok(svg.startsWith('<?xml'));
  assert.match(svg, /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="[-\d. ]+" width="\d+" height="\d+">/);
  assert.equal(cuenta(svg, /class="grupo-nombre"/g), 2);
  assert.equal(cuenta(svg, /class="tabla-nombre"/g), 3);
  assert.equal(cuenta(svg, /class="linea( opcional)?"/g), 3);
  // tutor_id admite nulo: es la única relación opcional.
  assert.equal(cuenta(svg, /class="linea opcional"/g), 1);
  // Dos claves primarias simples y una que también es ajena (alumno.usuario_id), más dos ajenas.
  assert.equal(cuenta(svg, /href="#icono-llave"/g), 3);
  assert.equal(cuenta(svg, /href="#icono-eslabon"/g), 2);
});

test('escapa los textos y marca las columnas que admiten nulo', async () => {
  const svg = await svgDe(EJEMPLO);
  assert.ok(svg.includes('quién es quién &amp; más'));
  assert.ok(!svg.includes('<iniciar>'));
  assert.equal(escaparXml(`a<b & "c" 'd'`), 'a&lt;b &amp; &quot;c&quot; &apos;d&apos;');
  // alumno.tutor_id es la única columna que admite nulo.
  assert.equal(cuenta(svg, /<tspan class="nulo">\?<\/tspan>/g), 1);
  // email tiene nota: lleva su punto.
  assert.equal(cuenta(svg, /<circle [^>]*fill="#4f46e5"/g), 1);
});

test('no exporta los grupos ocultos ni las relaciones que los tocan', async () => {
  const svg = await svgDe(EJEMPLO, new Set(['aparte']));
  assert.equal(cuenta(svg, /class="grupo-nombre"/g), 1);
  assert.equal(cuenta(svg, /class="tabla-nombre"/g), 2);
  assert.equal(cuenta(svg, /class="linea( opcional)?"/g), 2);
  assert.ok(!svg.includes('>nota<'));
});

test('el esquema de la plataforma completo sale ligero', async () => {
  const svg = await svgDe(fs.readFileSync(new URL('../../esquema.dbml', import.meta.url), 'utf8'));
  assert.equal(cuenta(svg, /class="tabla-nombre"/g), 49);
  assert.equal(cuenta(svg, /class="linea( opcional)?"/g), 95);
  // Cada <g> abierto se cierra.
  assert.equal(cuenta(svg, /<g[ >]/g), cuenta(svg, /<\/g>/g));
  assert.ok(svg.length < 600_000, `pesa ${Math.round(svg.length / 1024)} KB`);
});
