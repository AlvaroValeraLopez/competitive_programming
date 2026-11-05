import { useEffect, useMemo, useRef } from 'react';
import {
  BookOpen,
  ChevronRight,
  Columns3,
  Database,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  KeyRound,
  LayoutGrid,
  Link2,
  Maximize,
  Search,
  Table2,
  X,
} from 'lucide-react';
import { COLOR_SIN_GRUPO, type Documentacion, type ErrorEsquema, type Esquema } from './modelo.ts';
import type { buscar } from './visor.ts';

export type Seleccion = { tipo: 'tabla' | 'enum'; nombre: string };

interface Props {
  esquema: Esquema | null;
  documentacion: Documentacion | null;
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
  const { esquema, documentacion, resultados, error } = p;
  const buscador = useRef<HTMLInputElement>(null);
  const hora = p.archivo?.cargado.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const total = resultados ? resultados.tablas.length + resultados.columnas.length : 0;

  const colorDe = useMemo(() => {
    const colores = new Map(esquema?.grupos.map((g) => [g.nombre, g.color]));
    const porTabla = new Map(esquema?.tablas.map((t) => [t.nombre, t.grupo ? colores.get(t.grupo) : undefined]));
    return (tabla: string) => porTabla.get(tabla) ?? COLOR_SIN_GRUPO;
  }, [esquema]);

  // «/» lleva al buscador desde cualquier sitio, salvo que ya se esté escribiendo.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      const escribiendo = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (e.key === '/' && !escribiendo) {
        e.preventDefault();
        buscador.current?.focus();
      }
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, []);

  return (
    <aside className="barra">
      <header className="barra-cabecera">
        <span className="marca-logo">
          <Database size={17} />
        </span>
        <div className="marca-textos">
          <div className="marca-titulo">Visor de esquema</div>
          {esquema?.proyecto && <div className="marca-proyecto">{esquema.proyecto.nombre}</div>}
        </div>
      </header>

      <div className="barra-contenido">
        <section className="tarjeta-archivo">
          <div className="archivo-fila">
            <FileCode2 size={15} className="muted" />
            <span className="archivo-nombre">{p.archivo?.nombre ?? '…'}</span>
            {hora && (
              <span className={error ? 'estado estado-error' : 'estado'} title={error ? error.mensaje : 'Se actualiza al guardar el archivo'}>
                <i />
                {error ? 'Con errores' : hora}
              </span>
            )}
          </div>
          {esquema && (
            <div className="cifras">
              <div>
                <b>{esquema.tablas.length}</b>tablas
              </div>
              <div>
                <b>{esquema.relaciones.length}</b>relaciones
              </div>
              <div>
                <b>{esquema.enums.length}</b>enums
              </div>
            </div>
          )}
          {esquema && documentacion && (
            <div
              className="archivo-doc"
              title={`${esquema.tablas.length - documentacion.sinExplicar.length} de ${esquema.tablas.length} tablas explicadas. Las explicaciones del panel de cada tabla salen de este documento`}
            >
              <BookOpen size={13} />
              <span className="archivo-doc-nombre">{documentacion.archivo}</span>
              <span className={documentacion.sinExplicar.length ? 'contador contador-aviso' : 'contador contador-ok'}>
                {esquema.tablas.length - documentacion.sinExplicar.length}/{esquema.tablas.length}
              </span>
            </div>
          )}
          {documentacion && (documentacion.sinExplicar.length > 0 || documentacion.huerfanas.length > 0) && (
            <div className="archivo-aviso">
              {documentacion.sinExplicar.length > 0 && (
                <div>
                  Sin explicar: <span className="mono">{documentacion.sinExplicar.join(', ')}</span>
                </div>
              )}
              {documentacion.huerfanas.length > 0 && (
                <div>
                  En el documento pero no en el esquema: <span className="mono">{documentacion.huerfanas.join(', ')}</span>
                </div>
              )}
            </div>
          )}
          {error && (
            <div className="archivo-error">
              {error.linea ? `Línea ${error.linea}: ` : ''}
              {error.mensaje}
            </div>
          )}
        </section>

        <label className="buscador">
          <Search size={15} />
          <input
            ref={buscador}
            value={p.consulta}
            onChange={(e) => p.alCambiarConsulta(e.target.value)}
            placeholder="Buscar tablas, columnas o notas"
          />
          {p.consulta ? (
            <button className="buscador-borrar" onClick={() => p.alCambiarConsulta('')} title="Borrar (Esc)">
              <X size={14} />
            </button>
          ) : (
            <kbd title="Pulsa / para buscar">/</kbd>
          )}
        </label>

        {resultados ? (
          <section className="seccion">
            <div className="seccion-titulo">
              Resultados <span className="contador">{total}</span>
            </div>
            {total === 0 && <div className="vacio">Nada coincide con «{p.consulta.trim()}».</div>}
            <div className="lista">
              {resultados.tablas.slice(0, MAX_RESULTADOS).map((t) => (
                <button key={t} className="fila-lista" onClick={() => p.alElegirTabla(t)}>
                  <Table2 size={14} style={{ color: colorDe(t) }} />
                  <span className="fila-texto mono">{t}</span>
                </button>
              ))}
              {resultados.columnas.slice(0, Math.max(0, MAX_RESULTADOS - resultados.tablas.length)).map((c) => (
                <button key={`${c.tabla}.${c.columna}`} className="fila-lista" onClick={() => p.alElegirTabla(c.tabla)}>
                  <Columns3 size={14} style={{ color: colorDe(c.tabla) }} />
                  <span className="fila-texto mono">
                    <span className="muted">{c.tabla}.</span>
                    {c.columna}
                  </span>
                </button>
              ))}
              {total > MAX_RESULTADOS && <div className="vacio">y {total - MAX_RESULTADOS} más…</div>}
            </div>
          </section>
        ) : (
          esquema && (
            <>
              <section className="seccion">
                <div className="seccion-titulo">
                  Grupos <span className="contador">{esquema.grupos.length}</span>
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
                      <div key={g.nombre} className={oculto ? 'grupo-fila oculto' : 'grupo-fila'}>
                        <button className="grupo-boton" onClick={() => p.alEnfocarGrupo(g.nombre)} title={g.nota ?? undefined}>
                          <span className="muestra" style={{ background: g.color }} />
                          <span className="fila-texto mono">{g.nombre}</span>
                          <span className="contador">{g.tablas.length}</span>
                        </button>
                        <button
                          className="icono-btn ojo"
                          onClick={() => p.alAlternarGrupo(g.nombre)}
                          title={oculto ? 'Mostrar el grupo' : 'Ocultar el grupo'}
                          aria-pressed={oculto}
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
                  <ChevronRight size={13} className="flecha" />
                  Enums <span className="contador">{esquema.enums.length}</span>
                </summary>
                <div className="lista">
                  {esquema.enums.map((e) => (
                    <button
                      key={e.nombre}
                      className={p.seleccion?.tipo === 'enum' && p.seleccion.nombre === e.nombre ? 'fila-lista activa' : 'fila-lista'}
                      onClick={() => p.alElegirEnum(e.nombre)}
                    >
                      <span className="fila-texto mono">{e.nombre}</span>
                      <span className="contador">{e.valores.length}</span>
                    </button>
                  ))}
                </div>
              </details>

              <details className="seccion" open>
                <summary className="seccion-titulo">
                  <ChevronRight size={13} className="flecha" />
                  Leyenda
                </summary>
                <div className="leyenda">
                  <ul>
                    <li className="leyenda-titulo">Relaciones</li>
                    <li>
                      <svg className="leyenda-linea" viewBox="0 0 30 14" aria-hidden="true">
                        <path d="M2,7 H28 M15,7 L28,1 M15,7 L28,13" />
                      </svg>
                      muchos
                    </li>
                    <li>
                      <svg className="leyenda-linea" viewBox="0 0 30 14" aria-hidden="true">
                        <path d="M2,7 H28 M21,1 V13" />
                      </svg>
                      uno
                    </li>
                    <li>
                      <svg className="leyenda-linea" viewBox="0 0 30 14" aria-hidden="true">
                        <path d="M2,7 H28" strokeDasharray="4 3" />
                      </svg>
                      opcional
                    </li>
                  </ul>
                  <ul>
                    <li className="leyenda-titulo">Columnas</li>
                    <li>
                      <span className="leyenda-icono">
                        <KeyRound size={13} className="icono-pk" />
                      </span>
                      clave primaria
                    </li>
                    <li>
                      <span className="leyenda-icono">
                        <Link2 size={13} className="icono-fk" />
                      </span>
                      clave ajena
                    </li>
                    <li>
                      <span className="leyenda-icono fila-nulo">?</span>
                      admite nulo
                    </li>
                    <li>
                      <span className="leyenda-icono">
                        <span className="punto-nota" />
                      </span>
                      tiene nota
                    </li>
                  </ul>
                </div>
              </details>
            </>
          )
        )}
      </div>

      <footer className="barra-pie">
        <button className="btn btn-primario" onClick={p.alExportar} disabled={!esquema} title="Descargar el diagrama como SVG vectorial">
          <Download size={15} /> Exportar SVG
        </button>
        <div className="pie-secundario">
          <button className="btn" onClick={p.alEncajar} title="Encajar todo el diagrama en la pantalla">
            <Maximize size={14} /> Encajar
          </button>
          <button className="btn" onClick={p.alReordenar} title="Volver a colocar todas las tablas automáticamente">
            <LayoutGrid size={14} /> Reordenar
          </button>
        </div>
      </footer>
    </aside>
  );
}
