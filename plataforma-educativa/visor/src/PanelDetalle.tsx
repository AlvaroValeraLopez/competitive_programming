import { useState } from 'react';
import { BookOpen, ChevronRight, X } from 'lucide-react';
import { relacionesDe, type Documentacion, type Esquema, type Relacion, type Texto } from './modelo.ts';
import { conAlfa } from './visor.ts';
import { TextoDoc } from './TextoDoc.tsx';
import type { Seleccion } from './BarraLateral.tsx';

type Pestana = 'explicacion' | 'columnas' | 'relaciones';

interface Props {
  esquema: Esquema;
  documentacion: Documentacion | null;
  seleccion: Seleccion;
  alCerrar: () => void;
  alElegirTabla: (tabla: string) => void;
  alElegirEnum: (nombre: string) => void;
}

const TIPO_RELACION: Record<string, string> = { '1-1': '1 : 1', '*-1': 'N : 1', '1-*': '1 : N', '*-*': 'N : N' };

export function PanelDetalle({ esquema, documentacion, seleccion, alCerrar, alElegirTabla, alElegirEnum }: Props) {
  // La pestaña se mantiene al pasar de una tabla a otra.
  const [pestana, setPestana] = useState<Pestana>('explicacion');

  const cabecera = (tipo: string, nombre: string) => (
    <header className="panel-cabecera">
      <div>
        <div className="panel-tipo">{tipo}</div>
        <h2 className="mono">{nombre}</h2>
      </div>
      <button className="icono-btn" onClick={alCerrar} title="Cerrar (Esc)">
        <X size={16} />
      </button>
    </header>
  );

  const enlaceTabla = (tabla: string) => (
    <button className="enlace mono" onClick={() => alElegirTabla(tabla)}>
      {tabla}
    </button>
  );

  if (seleccion.tipo === 'enum') {
    const e = esquema.enums.find((x) => x.nombre === seleccion.nombre);
    if (!e) return null;
    return (
      <aside className="panel">
        {cabecera('Enum', e.nombre)}
        {e.nota && <p className="panel-nota">{e.nota}</p>}
        <section className="panel-seccion">
          <h3>
            Valores <span className="muted">{e.valores.length}</span>
          </h3>
          <ul className="lista-detalle">
            {e.valores.map((v) => (
              <li key={v.nombre}>
                <span className="mono strong">{v.nombre}</span>
                {v.nota && <div className="muted small">{v.nota}</div>}
              </li>
            ))}
          </ul>
        </section>
        <section className="panel-seccion">
          <h3>Se usa en</h3>
          <ul className="lista-detalle">
            {e.usadoEn.map((uso) => {
              const [tabla, columna] = uso.split('.');
              return (
                <li key={uso} className="relacion-linea-detalle">
                  <span className="campo">
                    {enlaceTabla(tabla)}
                    <span className="mono muted">.{columna}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
    );
  }

  const t = esquema.tablas.find((x) => x.nombre === seleccion.nombre);
  if (!t) return null;
  const grupo = esquema.grupos.find((g) => g.nombre === t.grupo);
  const doc = documentacion?.tablas[t.nombre];
  const { salientes, entrantes } = relacionesDe(esquema, t.nombre);
  const tipo = (r: Relacion) => TIPO_RELACION[`${r.origen.cardinalidad}-${r.destino.cardinalidad}`];
  const texto = (x: Texto) => (
    <TextoDoc texto={x} esquema={esquema} actual={t.nombre} alElegirTabla={alElegirTabla} alElegirEnum={alElegirEnum} />
  );

  return (
    <aside className="panel">
      {cabecera('Tabla', t.nombre)}
      {grupo && (
        <span className="chip" style={{ color: grupo.color, background: conAlfa(grupo.color, 0.1) }} title={grupo.nota ?? undefined}>
          {doc?.modulo ?? grupo.nombre}
        </span>
      )}

      <div className="pestanas" role="tablist">
        {(
          [
            ['explicacion', 'Explicación', null],
            ['columnas', 'Columnas', t.columnas.length],
            ['relaciones', 'Relaciones', salientes.length + entrantes.length],
          ] as const
        ).map(([id, etiqueta, cuenta]) => (
          <button key={id} role="tab" aria-selected={pestana === id} className={pestana === id ? 'pestana activa' : 'pestana'} onClick={() => setPestana(id)}>
            {etiqueta}
            {cuenta !== null && <span className="contador">{cuenta}</span>}
          </button>
        ))}
      </div>

      {pestana === 'explicacion' && (
        <>
          {doc?.representa && <p className="doc-representa">{texto(doc.representa)}</p>}
          {t.nota && (
            <section className="panel-seccion">
              <h3>Nota en el esquema</h3>
              <p className="panel-nota">{t.nota}</p>
            </section>
          )}
          {doc && doc.porQue.length > 0 && (
            <section className="panel-seccion">
              <h3>Por qué así</h3>
              <ul className="doc-lista">
                {doc.porQue.map((punto, i) => (
                  <li key={i}>
                    {texto(punto.texto)}
                    {punto.subpuntos.length > 0 && (
                      <ul>
                        {punto.subpuntos.map((sub, j) => (
                          <li key={j}>{texto(sub)}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {doc?.derivado && (
            <section className="panel-seccion">
              <h3>Valor derivado</h3>
              <div className="doc-aviso">
                {doc.derivado.valor.some((p) => p.tipo === 'codigo' && p.texto !== t.nombre) && <div>{texto(doc.derivado.valor)}</div>}
                Se puede recalcular en cualquier momento a partir de {texto(doc.derivado.fuente)}.
              </div>
            </section>
          )}
          {doc && doc.funcionalidades.length > 0 && (
            <section className="panel-seccion">
              <h3>
                Funcionalidades que la usan <span className="contador">{doc.funcionalidades.length}</span>
              </h3>
              <div className="doc-desplegables" key={t.nombre}>
                {doc.funcionalidades.map((f, i) => (
                  <details key={i}>
                    <summary>
                      <ChevronRight size={13} className="flecha" />
                      <span>{texto(f.queSeVe)}</span>
                    </summary>
                    <p>{texto(f.deDondeSale)}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
          {doc && doc.cambios.length > 0 && (
            <section className="panel-seccion">
              <h3>Podría cambiar</h3>
              <ul className="doc-lista">
                {doc.cambios.map((c, i) => (
                  <li key={i}>
                    <strong>{texto(c.pregunta)}</strong>
                    <div>{texto(c.cambio)}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!doc?.representa && (
            <div className="doc-vacio">
              {documentacion
                ? `${documentacion.archivo} todavía no explica esta tabla. Añádela a la tabla «Tabla | Qué representa» de su módulo.`
                : 'No hay modelo-datos.md junto al esquema, así que no hay explicaciones.'}
            </div>
          )}
          {documentacion && doc?.representa && (
            <div className="doc-fuente">
              <BookOpen size={12} /> {documentacion.archivo}
              {doc.modulo && ` · ${doc.modulo}`}
            </div>
          )}
        </>
      )}

      {pestana === 'columnas' && (
        <>
          <ul className="lista-detalle">
            {t.columnas.map((c) => (
              <li key={c.nombre}>
                <div className="columna-linea">
                  <span className="mono strong">{c.nombre}</span>
                  {c.pk && <span className="insignia insignia-pk">PK</span>}
                  {c.esFk && <span className="insignia insignia-fk">FK</span>}
                  {c.unica && <span className="insignia">único</span>}
                  {!c.noNula && <span className="insignia insignia-suave">admite nulo</span>}
                  <span className="spacer" />
                  {c.enumNombre ? (
                    <button className="enlace mono small" onClick={() => alElegirEnum(c.enumNombre!)}>
                      {c.tipo}
                    </button>
                  ) : (
                    <span className="mono muted small">{c.tipo}</span>
                  )}
                </div>
                {c.porDefecto !== null && (
                  <div className="muted small">
                    por defecto <code>{c.porDefecto}</code>
                  </div>
                )}
                {c.nota && <div className="columna-nota">{c.nota}</div>}
              </li>
            ))}
          </ul>
          {t.indices.length > 0 && (
            <section className="panel-seccion">
              <h3>Índices</h3>
              <ul className="lista-detalle">
                {t.indices.map((i) => (
                  <li key={i.columnas.join(',')} className="relacion-linea-detalle">
                    <span className="mono">({i.columnas.join(', ')})</span>
                    <span className="spacer" />
                    {i.pk && <span className="insignia insignia-pk">clave primaria</span>}
                    {i.unico && <span className="insignia">único</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {pestana === 'relaciones' && (
        <>
          {salientes.length > 0 && (
            <section className="panel-seccion">
              <h3>
                Apunta a <span className="contador">{salientes.length}</span>
              </h3>
              <ul className="lista-detalle">
                {salientes.map((r) => (
                  <li key={r.id} className="relacion-linea-detalle">
                    <span className="mono">{r.origen.columnas.join(', ')}</span>
                    <span className="muted">→</span>
                    <span className="campo">
                      {enlaceTabla(r.destino.tabla)}
                      <span className="mono muted">.{r.destino.columnas.join(', ')}</span>
                    </span>
                    <span className="spacer" />
                    <span className="insignia insignia-suave">{tipo(r)}</span>
                    {r.opcional && <span className="insignia insignia-suave">opcional</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {entrantes.length > 0 && (
            <section className="panel-seccion">
              <h3>
                La referencian <span className="contador">{entrantes.length}</span>
              </h3>
              <ul className="lista-detalle">
                {entrantes.map((r) => (
                  <li key={r.id} className="relacion-linea-detalle">
                    <span className="campo">
                      {enlaceTabla(r.origen.tabla)}
                      <span className="mono muted">.{r.origen.columnas.join(', ')}</span>
                    </span>
                    <span className="muted">→</span>
                    <span className="mono">{r.destino.columnas.join(', ')}</span>
                    <span className="spacer" />
                    <span className="insignia insignia-suave">{tipo(r)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!salientes.length && !entrantes.length && <div className="doc-vacio">Esta tabla no tiene relaciones.</div>}
        </>
      )}
    </aside>
  );
}
