import { X } from 'lucide-react';
import { relacionesDe, type Esquema, type Relacion } from './modelo.ts';
import { conAlfa } from './visor.ts';
import type { Seleccion } from './BarraLateral.tsx';

interface Props {
  esquema: Esquema;
  seleccion: Seleccion;
  alCerrar: () => void;
  alElegirTabla: (tabla: string) => void;
  alElegirEnum: (nombre: string) => void;
}

const TIPO_RELACION: Record<string, string> = { '1-1': '1 : 1', '*-1': 'N : 1', '1-*': '1 : N', '*-*': 'N : N' };

export function PanelDetalle({ esquema, seleccion, alCerrar, alElegirTabla, alElegirEnum }: Props) {
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
                  {enlaceTabla(tabla)}
                  <span className="mono muted">.{columna}</span>
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
  const { salientes, entrantes } = relacionesDe(esquema, t.nombre);
  const tipo = (r: Relacion) => TIPO_RELACION[`${r.origen.cardinalidad}-${r.destino.cardinalidad}`];

  return (
    <aside className="panel">
      {cabecera('Tabla', t.nombre)}
      {grupo && (
        <span className="chip" style={{ color: grupo.color, background: conAlfa(grupo.color, 0.1) }} title={grupo.nota ?? undefined}>
          {grupo.nombre}
        </span>
      )}
      {t.nota && <p className="panel-nota">{t.nota}</p>}

      <section className="panel-seccion">
        <h3>
          Columnas <span className="muted">{t.columnas.length}</span>
        </h3>
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
      </section>

      {salientes.length > 0 && (
        <section className="panel-seccion">
          <h3>
            Apunta a <span className="muted">{salientes.length}</span>
          </h3>
          <ul className="lista-detalle">
            {salientes.map((r) => (
              <li key={r.id} className="relacion-linea-detalle">
                <span className="mono">{r.origen.columnas.join(', ')}</span>
                <span className="muted">→</span>
                {enlaceTabla(r.destino.tabla)}
                <span className="mono muted">.{r.destino.columnas.join(', ')}</span>
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
            La referencian <span className="muted">{entrantes.length}</span>
          </h3>
          <ul className="lista-detalle">
            {entrantes.map((r) => (
              <li key={r.id} className="relacion-linea-detalle">
                {enlaceTabla(r.origen.tabla)}
                <span className="mono muted">.{r.origen.columnas.join(', ')}</span>
                <span className="muted">→</span>
                <span className="mono">{r.destino.columnas.join(', ')}</span>
                <span className="spacer" />
                <span className="insignia insignia-suave">{tipo(r)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
    </aside>
  );
}
