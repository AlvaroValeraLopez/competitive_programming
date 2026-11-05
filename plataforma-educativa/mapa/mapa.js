/*
 * Mapa de la plataforma: tres vistas sobre los datos de datos.js.
 *
 *   #/                  la vista general: los dominios por capas y cómo se conectan
 *   #/dominio/<id>      un dominio: qué permite hacer, cómo está montado y por qué
 *   #/perfil/<id>       lo que puede hacer el profesor o el alumno
 *
 * Sin dependencias: se abre con doble clic en index.html.
 */
(() => {
  'use strict';

  const M = window.MAPA;
  const vista = document.getElementById('vista');
  const migas = document.getElementById('migas');
  const dominios = new Map(M.dominios.map((d) => [d.id, d]));
  const perfiles = new Map(M.perfiles.map((p) => [p.id, p]));
  const capaDe = new Map(M.capas.flatMap((c) => c.dominios.map((id) => [id, c])));

  // ─── Utilidades ────────────────────────────────────────────

  const esc = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /** Formato en línea de los textos: **negrita**, *cursiva* y `código`. */
  const md = (texto) =>
    esc(texto)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const lista = (valor) => (Array.isArray(valor) ? valor : [valor]);
  const de = (coleccion, id, campo = 'dominios') => coleccion.filter((x) => lista(x[campo]).includes(id));
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

  const funcionalidadesDe = (id) => M.funcionalidades.filter((f) => f.dominio === id || f.tambien.includes(id));
  const preguntasGlobales = M.preguntas.filter((p) => p.dominios.length === 0);

  const ICONOS = {
    profesor: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    alumno:
      '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    izquierda: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    derecha: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    flecha: '<path d="m9 18 6-6-6-6"/>',
  };
  const icono = (nombre, clase = 'icono') => `<svg class="${clase}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre]}</svg>`;

  const chipDominio = (d) =>
    `<a class="chip-dominio" style="--color:${d.color}" href="#/dominio/${d.id}"><i></i>${d.numero}. ${esc(d.nombre)}</a>`;

  const insigniaPerfil = (id) => `<span class="insignia-perfil insignia-${id}">${esc(perfiles.get(id).nombre)}</span>`;

  const seccion = (titulo, contenido, cuenta) =>
    contenido
      ? `<section class="bloque"><h2>${titulo}${cuenta !== undefined ? ` <span class="contador">${cuenta}</span>` : ''}</h2>${contenido}</section>`
      : '';

  function ponerMigas(pasos) {
    migas.innerHTML = [`<a href="#/">Mapa</a>`, ...pasos].join(`${icono('flecha', 'icono miga-separador')}`);
  }

  // ─── Vista general ─────────────────────────────────────────

  function tarjetaDominio(d) {
    const cifras = [
      plural(d.tablas.length, 'tabla', 'tablas'),
      plural(M.funcionalidades.filter((f) => f.dominio === d.id).length, 'funcionalidad', 'funcionalidades'),
      plural(de(M.preguntas, d.id).length, 'pregunta', 'preguntas'),
    ];
    return `
      <a class="tarjeta-dominio" data-dominio="${d.id}" href="#/dominio/${d.id}" style="--color:${d.color}">
        <span class="tarjeta-cabeza"><span class="tarjeta-numero">${d.numero}</span><span class="tarjeta-nombre">${esc(d.nombre)}</span></span>
        <span class="tarjeta-para">${esc(d.paraQue)}</span>
        <span class="tarjeta-cifras">${cifras.map((c) => `<span>${c}</span>`).join('')}</span>
      </a>`;
  }

  function vistaGeneral() {
    ponerMigas([]);
    const filaPerfiles = M.perfiles
      .map(
        (p) => `
        <a class="tarjeta-perfil" data-perfil="${p.id}" href="#/perfil/${p.id}">
          <span class="perfil-icono">${icono(p.id)}</span>
          <span><strong>${esc(p.nombre)}</strong><small>${plural(M.funcionalidades.filter((f) => f.perfil === p.id).length, 'funcionalidad', 'funcionalidades')}</small></span>
        </a>`,
      )
      .join('');
    const filas = M.capas
      .map(
        (c) => `
        <div class="fila">
          <div class="fila-etiqueta">${esc(c.nombre)}</div>
          <div class="fila-tarjetas">${c.dominios.map((id) => tarjetaDominio(dominios.get(id))).join('')}</div>
        </div>`,
      )
      .join('');

    vista.innerHTML = `
      <section class="intro">
        <h1>Cómo está montada la plataforma</h1>
        <p>${md(M.plataforma.resumen)} Está dividida en <strong>${M.dominios.length} dominios funcionales</strong>, que son los módulos del diseño.</p>
        <p class="ayuda">Pasa el ratón por un dominio o un perfil para ver con qué se conecta. Haz clic para entrar.</p>
      </section>

      <section class="mapa" id="mapa">
        <svg class="conexiones" id="conexiones" aria-hidden="true"></svg>
        <div class="fila fila-perfiles">
          <div class="fila-etiqueta">Quién la usa</div>
          <div class="fila-tarjetas">${filaPerfiles}</div>
        </div>
        ${filas}
      </section>

      <section class="leyenda-mapa">
        <div class="leyenda-item">
          <svg viewBox="0 0 46 12" aria-hidden="true"><path d="M2 6 H38" class="leyenda-linea"/><path d="M34 2 L40 6 L34 10" class="leyenda-linea"/></svg>
          <span><strong>usa a</strong>: sus tablas apuntan a las del otro dominio. Cuanto más gruesa, más relaciones.</span>
        </div>
        <div class="leyenda-item">
          <svg viewBox="0 0 46 12" aria-hidden="true"><path d="M2 6 H40" class="leyenda-linea leyenda-perfil"/></svg>
          <span>al pasar por un perfil, los dominios donde están sus funcionalidades</span>
        </div>
      </section>

      <div class="rejilla-general">
        ${seccion('La IA en la plataforma', `<p class="principio">${md(M.plataforma.principioIa)}</p>${tablaIa(M.ia, true)}`)}
        ${seccion('Preguntas de toda la plataforma', listaPreguntas(preguntasGlobales), preguntasGlobales.length)}
      </div>`;

    prepararMapa();
  }

  /** Dibuja las flechas entre dominios y prepara el resaltado al pasar el ratón. */
  function prepararMapa() {
    const mapa = document.getElementById('mapa');
    const svg = document.getElementById('conexiones');

    function dibujar() {
      const caja = mapa.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${caja.width} ${caja.height}`);
      svg.setAttribute('width', caja.width);
      svg.setAttribute('height', caja.height);
      const rect = (selector) => {
        const r = mapa.querySelector(selector).getBoundingClientRect();
        return { x: r.left - caja.left, y: r.top - caja.top, w: r.width, h: r.height };
      };

      // Cada flecha sale del borde de abajo o de arriba (o del lateral, si están en la misma fila).
      const flechas = M.dependencias.map((dep) => {
        const a = rect(`[data-dominio="${dep.de}"]`);
        const b = rect(`[data-dominio="${dep.a}"]`);
        const misma = Math.abs(a.y - b.y) < 4;
        const baja = b.y > a.y;
        const lados = misma ? (b.x > a.x ? ['der', 'izq'] : ['izq', 'der']) : baja ? ['abajo', 'arriba'] : ['arriba', 'abajo'];
        return { dep, a, b, lados };
      });

      // Reparte los puntos de salida y llegada por el borde para que las flechas no se pisen.
      const puntos = new Map();
      const apuntar = (id, lado, otro, f, cual) => {
        const clave = `${id}:${lado}`;
        if (!puntos.has(clave)) puntos.set(clave, []);
        puntos.get(clave).push({ f, cual, orden: lado === 'izq' || lado === 'der' ? otro.y : otro.x + otro.w / 2 });
      };
      for (const f of flechas) {
        apuntar(f.dep.de, f.lados[0], f.b, f, 'inicio');
        apuntar(f.dep.a, f.lados[1], f.a, f, 'fin');
      }
      for (const [clave, lista] of puntos) {
        const [id, lado] = clave.split(':');
        const r = rect(`[data-dominio="${id}"]`);
        lista.sort((p, q) => p.orden - q.orden);
        lista.forEach((p, i) => {
          const t = (i + 1) / (lista.length + 1);
          const punto =
            lado === 'abajo' ? { x: r.x + r.w * (0.15 + 0.7 * t), y: r.y + r.h } :
            lado === 'arriba' ? { x: r.x + r.w * (0.15 + 0.7 * t), y: r.y } :
            lado === 'der' ? { x: r.x + r.w, y: r.y + r.h * (0.25 + 0.5 * t) } :
            { x: r.x, y: r.y + r.h * (0.25 + 0.5 * t) };
          p.f[p.cual] = { ...punto, lado };
        });
      }

      /** Curva entre dos puntos de borde, y el último punto de control (marca la dirección de llegada). */
      const curva = (p, q) => {
        if (p.lado === 'izq' || p.lado === 'der') {
          const dx = Math.max(30, Math.abs(q.x - p.x) / 2) * (p.lado === 'der' ? 1 : -1);
          return { d: `M${p.x},${p.y} C${p.x + dx},${p.y} ${q.x - dx},${q.y} ${q.x},${q.y}`, control: { x: q.x - dx, y: q.y } };
        }
        const dy = Math.max(30, Math.abs(q.y - p.y) / 2) * (p.lado === 'abajo' ? 1 : -1);
        return { d: `M${p.x},${p.y} C${p.x},${p.y + dy} ${q.x},${q.y - dy} ${q.x},${q.y}`, control: { x: q.x, y: q.y - dy } };
      };

      /** La punta de la flecha, dibujada a mano para que tome el color de la línea con CSS. */
      const punta = (q, control) => {
        const largo = Math.hypot(q.x - control.x, q.y - control.y) || 1;
        const ux = (q.x - control.x) / largo;
        const uy = (q.y - control.y) / largo;
        const ala = (angulo) => {
          const c = Math.cos(angulo);
          const s = Math.sin(angulo);
          return `${q.x - 8 * (ux * c - uy * s)},${q.y - 8 * (ux * s + uy * c)}`;
        };
        return `M${ala(0.5)} L${q.x},${q.y} L${ala(-0.5)}`;
      };

      const conexiones = flechas
        .map((f) => {
          const origen = dominios.get(f.dep.de);
          const destino = dominios.get(f.dep.a);
          const titulo = `${origen.nombre} usa ${destino.nombre}: ${plural(f.dep.relaciones, 'relación', 'relaciones')}`;
          const { d, control } = curva(f.inicio, f.fin);
          return `
            <g class="conexion" data-de="${f.dep.de}" data-a="${f.dep.a}" style="--color:${origen.color}">
              <path class="conexion-linea" style="stroke-width:${1 + f.dep.relaciones * 0.45}" d="${d}"/>
              <path class="conexion-punta" d="${punta(f.fin, control)}"/>
              <title>${esc(titulo)}</title>
            </g>`;
        })
        .join('');

      // Líneas de cada perfil a los dominios de sus funcionalidades; solo se ven al pasar por el perfil.
      const lineasPerfil = M.perfiles
        .flatMap((p) => {
          const desde = rect(`[data-perfil="${p.id}"]`);
          const ids = [...new Set(M.funcionalidades.filter((f) => f.perfil === p.id).map((f) => f.dominio))];
          return ids.map((id, i) => {
            const hasta = rect(`[data-dominio="${id}"]`);
            const inicio = { x: desde.x + desde.w * ((i + 1) / (ids.length + 1)), y: desde.y + desde.h, lado: 'abajo' };
            const fin = { x: hasta.x + hasta.w / 2, y: hasta.y, lado: 'arriba' };
            return `<path class="linea-perfil" data-perfil="${p.id}" data-a="${id}" d="${curva(inicio, fin).d}"/>`;
          });
        })
        .join('');

      svg.innerHTML = lineasPerfil + conexiones;
    }

    function enfocar(elemento) {
      const id = elemento?.dataset.dominio ?? elemento?.dataset.perfil ?? null;
      mapa.classList.toggle('con-foco', Boolean(id));
      const relacionados = new Set(id ? [id] : []);
      svg.querySelectorAll('.conexion').forEach((p) => {
        const activa = p.dataset.de === id || p.dataset.a === id;
        p.classList.toggle('activa', activa);
        if (activa) relacionados.add(p.dataset.de === id ? p.dataset.a : p.dataset.de);
      });
      svg.querySelectorAll('.linea-perfil').forEach((p) => {
        const activa = p.dataset.perfil === id;
        p.classList.toggle('activa', activa);
        if (activa) relacionados.add(p.dataset.a);
      });
      mapa.querySelectorAll('[data-dominio], [data-perfil]').forEach((t) => {
        const propio = t.dataset.dominio ?? t.dataset.perfil;
        t.classList.toggle('relacionada', relacionados.has(propio));
        t.classList.toggle('foco', propio === id);
      });
    }

    mapa.addEventListener('mouseover', (e) => enfocar(e.target.closest('[data-dominio], [data-perfil]')));
    mapa.addEventListener('mouseleave', () => enfocar(null));
    mapa.addEventListener('focusin', (e) => enfocar(e.target.closest('[data-dominio], [data-perfil]')));
    mapa.addEventListener('focusout', () => enfocar(null));

    dibujar();
    new ResizeObserver(() => dibujar()).observe(mapa);
    document.fonts?.ready.then(dibujar);
  }

  // ─── Piezas compartidas ────────────────────────────────────

  function listaPreguntas(preguntas) {
    if (!preguntas.length) return '';
    return `<ul class="lista-items">${preguntas
      .map(
        (p) => `
        <li>
          <span class="item-id${p.clave ? ' clave' : ''}" title="${p.clave ? 'De las que más cambian el modelo' : ''}">${p.id}${p.clave ? ' ★' : ''}</span>
          <div><div>${md(p.texto)}</div><div class="item-detalle">Afecta a: ${md(p.afecta)}</div></div>
        </li>`,
      )
      .join('')}</ul>`;
  }

  function tablaIa(usos, conDominio = false) {
    if (!usos.length) return '';
    return `<div class="ia">${usos
      .map(
        (u) => `
        <div class="ia-item">
          <div class="ia-uso">${esc(u.uso)}${conDominio ? chipDominio(dominios.get(u.dominio)) : ''}</div>
          <div class="ia-hace"><span>Hace</span>${md(u.hace)}</div>
          <div class="ia-no"><span>No hace</span>${md(u.noHace)}</div>
        </div>`,
      )
      .join('')}</div>`;
  }

  function tarjetaFuncionalidad(f, idDominio) {
    const otros = [f.dominio, ...f.tambien].filter((id) => id !== idDominio).map((id) => chipDominio(dominios.get(id)));
    return `
      <details class="funcionalidad">
        <summary>
          ${icono('flecha', 'icono flecha-desplegar')}
          <span class="func-id">${f.id}</span>
          <strong>${esc(f.nombre)}</strong>
          ${idDominio && f.dominio !== idDominio ? `<span class="func-de" title="Su dominio principal es ${esc(dominios.get(f.dominio).nombre)}">de ${dominios.get(f.dominio).numero}. ${esc(dominios.get(f.dominio).nombre)}</span>` : ''}
          ${idDominio ? insigniaPerfil(f.perfil) : ''}
        </summary>
        <div class="func-cuerpo">
          <p>${md(f.detalle)}</p>
          ${otros.length ? `<div class="func-tambien">También en ${otros.join('')}</div>` : ''}
        </div>
      </details>`;
  }

  // ─── Vista de un dominio ───────────────────────────────────

  function vistaDominio(d) {
    ponerMigas([`<span>${d.numero}. ${esc(d.nombre)}</span>`]);
    const orden = M.dominios;
    const i = orden.indexOf(d);
    const anterior = orden[(i - 1 + orden.length) % orden.length];
    const siguiente = orden[(i + 1) % orden.length];

    const funcs = funcionalidadesDe(d.id).sort((a, b) => (a.dominio === d.id ? 0 : 1) - (b.dominio === d.id ? 0 : 1));
    const usa = M.dependencias.filter((x) => x.de === d.id).sort((a, b) => b.relaciones - a.relaciones);
    const loUsan = M.dependencias.filter((x) => x.a === d.id).sort((a, b) => b.relaciones - a.relaciones);
    const conexion = (x, otro) =>
      `<li>${chipDominio(dominios.get(otro))}<span class="contador">${plural(x.relaciones, 'relación', 'relaciones')}</span></li>`;
    const glosario = M.glosario.filter((g) => g.dominio === d.id);
    const reglas = de(M.reglas, d.id);
    const decisiones = de(M.decisiones, d.id);
    const preguntas = de(M.preguntas, d.id);

    vista.innerHTML = `
      <article class="dominio" style="--color:${d.color}">
        <header class="dominio-cabecera">
          <div class="dominio-numero">${d.numero}</div>
          <div class="dominio-titulo">
            <div class="dominio-capa">${esc(capaDe.get(d.id).nombre)}</div>
            <h1>${esc(d.nombre)}</h1>
            <p>${esc(d.paraQue)}</p>
          </div>
          <nav class="dominio-pasos">
            <a href="#/dominio/${anterior.id}" title="${esc(anterior.nombre)}">${icono('izquierda')}${anterior.numero}</a>
            <a href="#/dominio/${siguiente.id}" title="${esc(siguiente.nombre)}">${siguiente.numero}${icono('derecha')}</a>
          </nav>
        </header>

        <div class="dominio-cuerpo">
          <div class="columna-principal">
            ${seccion(
              'Qué permite hacer',
              funcs.length
                ? `<div class="funcionalidades">${funcs.map((f) => tarjetaFuncionalidad(f, d.id)).join('')}</div>`
                : '<p class="vacio">Ninguna funcionalidad vive aquí directamente: este dominio da soporte a los demás.</p>',
              funcs.length,
            )}
            ${seccion(
              'Cómo está montado',
              `<ul class="tablas">${d.tablas.map((t) => `<li><code>${esc(t.nombre)}</code><span>${md(t.representa)}</span></li>`).join('')}</ul>
               <p class="nota-fuente">Para ver las columnas y las relaciones de cada tabla, ábrela en el visor del esquema.</p>`,
              plural(d.tablas.length, 'tabla', 'tablas'),
            )}
            ${seccion(
              'Por qué está así',
              `<ul class="lista-puntos">${d.porQue
                .map((p) =>
                  typeof p === 'string'
                    ? `<li>${md(p)}</li>`
                    : `<li>${md(p.texto)}<ul>${p.subpuntos.map((s) => `<li>${md(s)}</li>`).join('')}</ul></li>`,
                )
                .join('')}</ul>`,
            )}
          </div>

          <aside class="columna-lateral">
            ${seccion(
              'Se conecta con',
              `${usa.length ? `<h3>Usa</h3><ul class="conexiones-lista">${usa.map((x) => conexion(x, x.a)).join('')}</ul>` : '<h3>Usa</h3><p class="vacio">Nada: es la base de la que tiran los demás.</p>'}
               ${loUsan.length ? `<h3>Lo usan</h3><ul class="conexiones-lista">${loUsan.map((x) => conexion(x, x.de)).join('')}</ul>` : ''}`,
            )}
            ${seccion(
              'Conceptos clave',
              glosario.length ? `<dl class="glosario">${glosario.map((g) => `<dt>${esc(g.termino)}</dt><dd>${md(g.definicion)}</dd>`).join('')}</dl>` : '',
            )}
            ${seccion('Dónde entra la IA', tablaIa(M.ia.filter((u) => u.dominio === d.id)))}
            ${seccion(
              'Reglas',
              reglas.length ? `<ul class="lista-items">${reglas.map((r) => `<li><span class="item-id">${r.id}</span><div>${md(r.texto)}</div></li>`).join('')}</ul>` : '',
              reglas.length || undefined,
            )}
            ${seccion(
              'Decisiones',
              decisiones.length
                ? `<ul class="lista-items">${decisiones.map((x) => `<li><span class="item-id">${x.id}</span><div><div>${md(x.decision)}</div><div class="item-detalle">${md(x.porque)}</div></div></li>`).join('')}</ul>`
                : '',
              decisiones.length || undefined,
            )}
            ${seccion('Preguntas abiertas', listaPreguntas(preguntas), preguntas.length || undefined)}
          </aside>
        </div>
      </article>`;
  }

  // ─── Vista de un perfil ────────────────────────────────────

  function vistaPerfil(p) {
    ponerMigas([`<span>${esc(p.nombre)}</span>`]);
    const suyas = M.funcionalidades.filter((f) => f.perfil === p.id);
    const otro = M.perfiles.find((x) => x.id !== p.id);
    const porDominio = M.dominios
      .map((d) => ({ d, funcs: suyas.filter((f) => f.dominio === d.id) }))
      .filter((x) => x.funcs.length);

    vista.innerHTML = `
      <article class="perfil">
        <header class="dominio-cabecera perfil-cabecera">
          <div class="dominio-numero perfil-numero">${icono(p.id)}</div>
          <div class="dominio-titulo">
            <div class="dominio-capa">Perfil</div>
            <h1>${esc(p.nombre)}</h1>
            <p>${md(p.resumen)}</p>
          </div>
          <nav class="dominio-pasos"><a href="#/perfil/${otro.id}">${esc(otro.nombre)}${icono('derecha')}</a></nav>
        </header>
        <p class="perfil-resumen">${plural(suyas.length, 'funcionalidad', 'funcionalidades')} repartidas en ${plural(porDominio.length, 'dominio', 'dominios')}.</p>
        <div class="perfil-cuerpo">
          ${porDominio
            .map(
              ({ d, funcs }) => `
              <section class="bloque bloque-dominio" style="--color:${d.color}">
                <h2>${chipDominio(d)}</h2>
                <div class="funcionalidades">${funcs.map((f) => tarjetaFuncionalidad(f, null)).join('')}</div>
              </section>`,
            )
            .join('')}
        </div>
      </article>`;
  }

  // ─── Navegación ────────────────────────────────────────────

  function mostrar() {
    const [tipo, id] = location.hash.replace(/^#\/?/, '').split('/');
    if (tipo === 'dominio' && dominios.has(id)) vistaDominio(dominios.get(id));
    else if (tipo === 'perfil' && perfiles.has(id)) vistaPerfil(perfiles.get(id));
    else vistaGeneral();
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', mostrar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && location.hash.length > 2) location.hash = '#/';
  });
  mostrar();
})();
