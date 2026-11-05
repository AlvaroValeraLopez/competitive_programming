import { Columns3, Database, Eye, EyeOff, ImageDown, LayoutGrid, ListTree, Maximize, Search, Table2 } from 'lucide-react';
import type { ErrorEsquema, Esquema } from './modelo.ts';
import type { buscar } from './visor.ts';

export type Seleccion = { tipo: 'tabla' | 'enum'; nombre: string };

interface Props {
  esquema: Esquema | null;
  archivo: { nombre: string; cargado: Date } | null;
  error: ErrorEsquema | null;
  consulta: string;
  resultados: ReturnType<typeof buscar>;
  ocultos: Set<string>;
  seleccion: Seleccion | null;
  alCambiarConsulta: (consulta: string) => void;
  alAlternarGrupo: (grupo: string) => void;
  alMostrarTodos: () => void;
  alEnfocarGrupo: (grupo: string) => void;
  alElegirTabla: (tabla: string) => void;
  alElegirEnum: (nombre: string) => void;
  alEncajar: () => void;
  alReordenar: () => void;
  alExportar: () => void;
}

const MAX_RESULTADOS = 40;

export function BarraLateral(p: Props) {
  const { esquema, resultados } = p;
  const hora = p.archivo?.cargado.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const total = resultados ? resultados.tablas.length + resultados.columnas.length : 0;

  return (
    <aside className="barra">
      <div className="marca">
        <Database size={18} />
        Visor de esquema
      </div>

      <div className="archivo">
        <div className="archivo-nombre">{p.archivo?.nombre ?? '…'}</div>
        {esquema && (
          <div className="muted small">
            {esquema.tablas.length} tablas · {esquema.relaciones.length} relaciones · {esquema.enums.length} enums
          </div>
        )}
        {hora && <div className={p.error ? 'small texto-error' : 'muted small'}>{p.error ? 'Con errores' : 'Leído'} a las {hora}</div>}
      </div>

      <label className="buscador">
        <Search size={15} />
        <input
          value={p.consulta}
          onChange={(e) => p.alCambiarConsulta(e.target.value)}
          placeholder="Buscar tablas, columnas o notas"
        />
      </label>

      {resultados ? (
        <section className="seccion">
          <div className="seccion-titulo">
            {total} {total === 1 ? 'resultado' : 'resultados'}
          </div>
          <div className="lista">
            {resultados.tablas.slice(0, MAX_RESULTADOS).map((t) => (
              <button key={t} className="fila-lista" onClick={() => p.alElegirTabla(t)}>
                <Table2 size={14} className="muted" />
                <span className="mono">{t}</span>
              </button>
            ))}
            {resultados.columnas.slice(0, Math.max(0, MAX_RESULTADOS - resultados.tablas.length)).map((c) => (
              <button key={`${c.tabla}.${c.columna}`} className="fila-lista" onClick={() => p.alElegirTabla(c.tabla)}>
                <Columns3 size={14} className="muted" />
                <span className="mono">
                  <span className="muted">{c.tabla}.</span>
                  {c.columna}
                </span>
              </button>
            ))}
            {total > MAX_RESULTADOS && <div className="muted small fila-lista">y {total - MAX_RESULTADOS} más…</div>}
          </div>
        </section>
      ) : (
        esquema && (
          <>
            <section className="seccion">
              <div className="seccion-titulo">
                Grupos
                {p.ocultos.size > 0 && (
                  <button className="enlace" onClick={p.alMostrarTodos}>
                    Mostrar todos
                  </button>
                )}
              </div>
              <div className="lista">
                {esquema.grupos.map((g) => {
                  const oculto = p.ocultos.has(g.nombre);
                  return (
                    <div key={g.nombre} className={oculto ? 'fila-lista fila-oculta' : 'fila-lista'} title={g.nota ?? undefined}>
                      <span className="muestra" style={{ background: g.color }} />
                      <button className="fila-texto mono" onClick={() => p.alEnfocarGrupo(g.nombre)}>
                        {g.nombre}
                      </button>
                      <span className="muted small">{g.tablas.length}</span>
                      <button
                        className="icono-btn"
                        onClick={() => p.alAlternarGrupo(g.nombre)}
                        title={oculto ? 'Mostrar el grupo' : 'Ocultar el grupo'}
                      >
                        {oculto ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <details className="seccion">
              <summary className="seccion-titulo">
                <ListTree size={13} />
                Enums <span className="muted">{esquema.enums.length}</span>
              </summary>
              <div className="lista">
                {esquema.enums.map((e) => (
                  <button
                    key={e.nombre}
                    className={p.seleccion?.tipo === 'enum' && p.seleccion.nombre === e.nombre ? 'fila-lista activa' : 'fila-lista'}
                    onClick={() => p.alElegirEnum(e.nombre)}
                  >
                    <span className="mono">{e.nombre}</span>
                    <span className="spacer" />
                    <span className="muted small">{e.valores.length}</span>
                  </button>
                ))}
              </div>
            </details>

            <section className="seccion leyenda">
              <div className="seccion-titulo">Leyenda</div>
              <svg width="240" height="66" viewBox="0 0 240 66" aria-hidden="true">
                <line x1="8" y1="12" x2="64" y2="12" className="leyenda-linea" />
                <path d="M51,12 L64,6 M51,12 L64,18" className="leyenda-linea" />
                <text x="76" y="16">muchos</text>
                <line x1="8" y1="34" x2="64" y2="34" className="leyenda-linea" />
                <path d="M57,28 L57,40" className="leyenda-linea" />
                <text x="76" y="38">uno</text>
                <line x1="8" y1="56" x2="64" y2="56" className="leyenda-linea" strokeDasharray="5 4" />
                <text x="76" y="60">opcional (admite nulo)</text>
              </svg>
              <div className="muted small">
                <span className="fila-nulo">?</span> la columna admite nulo · <span className="punto-nota en-linea" /> tiene nota
              </div>
            </section>
          </>
        )
      )}

      <div className="spacer" />

      <div className="acciones">
        <button className="btn" onClick={p.alEncajar} title="Encajar todo el diagrama en la pantalla">
          <Maximize size={14} /> Encajar
        </button>
        <button className="btn" onClick={p.alReordenar} title="Volver a colocar todas las tablas automáticamente">
          <LayoutGrid size={14} /> Reordenar
        </button>
        <button className="btn btn-ancho" onClick={p.alExportar} title="Descargar el diagrama completo como imagen PNG">
          <ImageDown size={14} /> Exportar PNG
        </button>
      </div>
    </aside>
  );
}
