import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useReactFlow,
  type OnNodeDrag,
} from '@xyflow/react';
import { TriangleAlert } from 'lucide-react';
import type { Documentacion, ErrorEsquema, Esquema } from './modelo.ts';
import { combinar, disponer, medidasDe } from './disposicion.ts';
import { guardarPosiciones, pedirEsquema, pedirPosiciones } from './api.ts';
import { GrupoNodo, RelacionArista, TablaNodo } from './diagrama.tsx';
import { BarraLateral, type Seleccion } from './BarraLateral.tsx';
import { PanelDetalle } from './PanelDetalle.tsx';
import { generarSvg } from './svg.ts';
import {
  ContextoVisor,
  buscar,
  conAlfa,
  construirAristas,
  construirNodos,
  idGrupo,
  posicionesActuales,
  reencajar,
  vecinasDe,
  type AristaVisor,
  type EstadoVisor,
  type NodoVisor,
} from './visor.ts';

const tiposNodo = { tabla: TablaNodo, grupo: GrupoNodo };
const tiposArista = { relacion: RelacionArista };

// React Flow separa cada panel 15 px del borde (`.react-flow__panel`).
const MARGEN_PANEL = 15;
const MINIMAPA = { ancho: 200, alto: 150 };
const SEPARACION_CONTROLES = 8;

export function App() {
  return (
    <ReactFlowProvider>
      <Visor />
    </ReactFlowProvider>
  );
}

let lienzoDeMedida: CanvasRenderingContext2D | null = null;

/** Mide un texto con las mismas fuentes que la pantalla, para colocar bien los textos del SVG. */
function medirTexto(texto: string, fuente: string): number {
  lienzoDeMedida ??= document.createElement('canvas').getContext('2d');
  if (!lienzoDeMedida) return texto.length * 7;
  lienzoDeMedida.font = fuente;
  return lienzoDeMedida.measureText(texto).width;
}

function Visor() {
  const flujo = useReactFlow<NodoVisor, AristaVisor>();
  const [esquema, setEsquema] = useState<Esquema | null>(null);
  const [archivo, setArchivo] = useState<{ nombre: string; cargado: Date } | null>(null);
  const [documentacion, setDocumentacion] = useState<Documentacion | null>(null);
  const [error, setError] = useState<ErrorEsquema | null>(null);
  const [nodos, setNodos, alCambiarNodos] = useNodesState<NodoVisor>([]);
  const [ocultos, setOcultos] = useState<Set<string>>(new Set());
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [encima, setEncima] = useState<string | null>(null);
  const [consulta, setConsulta] = useState('');

  // Lo último de cada estado, para los manejadores que no se recrean.
  const actual = useRef({ esquema, nodos, ocultos });
  actual.current = { esquema, nodos, ocultos };

  const cargar = useCallback(
    async (inicial: boolean) => {
      const respuesta = await pedirEsquema();
      setArchivo({ nombre: respuesta.archivo, cargado: new Date() });
      if (respuesta.error) return setError(respuesta.error);
      const nuevo = respuesta.esquema;
      const { esquema: anterior, nodos: nodosAnteriores, ocultos: ocultosAhora } = actual.current;
      // Al recargar se conserva lo que hay en pantalla; al abrir, lo guardado en el repositorio.
      const guardadas = inicial ? await pedirPosiciones() : anterior ? posicionesActuales(anterior, nodosAnteriores) : null;
      const auto = await disponer(nuevo);
      setEsquema(nuevo);
      setDocumentacion(respuesta.documentacion);
      setNodos(construirNodos(nuevo, combinar(nuevo, auto, guardadas), ocultosAhora));
      setError(null);
      if (inicial) setTimeout(() => flujo.fitView({ padding: 0.04 }), 60);
    },
    [flujo, setNodos],
  );

  useEffect(() => {
    cargar(true);
    const alCambiar = () => cargar(false);
    import.meta.hot?.on('esquema:cambio', alCambiar);
    return () => import.meta.hot?.off('esquema:cambio', alCambiar);
  }, [cargar]);

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSeleccion(null);
      setConsulta('');
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, []);

  const medidas = useMemo(() => (esquema ? medidasDe(esquema) : {}), [esquema]);
  const aristas = useMemo(() => (esquema ? construirAristas(esquema, nodos) : []), [esquema, nodos]);
  const resultados = useMemo(() => (esquema ? buscar(esquema, consulta) : null), [esquema, consulta]);

  const seleccionada = seleccion?.tipo === 'tabla' ? seleccion.nombre : null;
  const foco = encima ?? seleccionada;
  const contexto = useMemo<EstadoVisor>(
    () => ({
      foco,
      seleccionada,
      vecinas: esquema ? vecinasDe(esquema, foco) : new Set(),
      coincidencias: resultados?.coincidencias ?? null,
    }),
    [esquema, foco, seleccionada, resultados],
  );

  const guardar = (ns: NodoVisor[]) => {
    const e = actual.current.esquema;
    if (e) guardarPosiciones(posicionesActuales(e, ns));
  };

  const alSoltar: OnNodeDrag<NodoVisor> = (_evento, _nodo, arrastrados) => {
    // Con zoom, las posiciones salen con decimales: se redondean para que el JSON quede limpio.
    const movidos = new Map(arrastrados.map((n) => [n.id, { x: Math.round(n.position.x), y: Math.round(n.position.y) }]));
    let ns = actual.current.nodos.map((n) => (movidos.has(n.id) ? { ...n, position: movidos.get(n.id)! } : n));
    const grupos = new Set(arrastrados.flatMap((n) => (n.type === 'tabla' && n.data.tabla.grupo ? [n.data.tabla.grupo] : [])));
    for (const g of grupos) ns = reencajar(ns, g, medidas);
    setNodos(ns);
    guardar(ns);
  };

  const aplicarOcultos = (siguiente: Set<string>) => {
    setOcultos(siguiente);
    setNodos((ns) =>
      ns.map((n) => {
        const grupo = n.type === 'grupo' ? n.data.grupo.nombre : n.data.tabla.grupo;
        return grupo ? { ...n, hidden: siguiente.has(grupo) } : n;
      }),
    );
  };

  const alternarGrupo = (grupo: string) => {
    const siguiente = new Set(ocultos);
    if (siguiente.has(grupo)) siguiente.delete(grupo);
    else siguiente.add(grupo);
    aplicarOcultos(siguiente);
  };

  const enfocar = (id: string) => flujo.fitView({ nodes: [{ id }], duration: 450, padding: 0.3, maxZoom: 1.2 });

  const elegirTabla = (nombre: string) => {
    const grupo = esquema?.tablas.find((t) => t.nombre === nombre)?.grupo;
    if (grupo && ocultos.has(grupo)) alternarGrupo(grupo);
    setSeleccion({ tipo: 'tabla', nombre });
    setTimeout(() => enfocar(nombre), 30);
  };

  const enfocarGrupo = (grupo: string) => {
    if (ocultos.has(grupo)) alternarGrupo(grupo);
    setTimeout(() => enfocar(idGrupo(grupo)), 30);
  };

  const reordenar = async () => {
    if (!esquema) return;
    const ns = construirNodos(esquema, await disponer(esquema), ocultos);
    setNodos(ns);
    guardar(ns);
    setTimeout(() => flujo.fitView({ padding: 0.04, duration: 400 }), 60);
  };

  /** Descarga los grupos visibles como SVG vectorial (ver svg.ts), sin resaltados. */
  const exportar = () => {
    if (!esquema) return;
    const svg = generarSvg(esquema, actual.current.nodos, { medirTexto });
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const enlace = document.createElement('a');
    enlace.download = `${(archivo?.nombre ?? 'esquema').replace(/\.dbml$/, '')}.svg`;
    enlace.href = url;
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <ContextoVisor.Provider value={contexto}>
      <div className="app">
        <BarraLateral
          esquema={esquema}
          documentacion={documentacion}
          archivo={archivo}
          error={error}
          consulta={consulta}
          resultados={resultados}
          ocultos={ocultos}
          seleccion={seleccion}
          alCambiarConsulta={setConsulta}
          alAlternarGrupo={alternarGrupo}
          alMostrarTodos={() => aplicarOcultos(new Set())}
          alEnfocarGrupo={enfocarGrupo}
          alElegirTabla={elegirTabla}
          alElegirEnum={(nombre) => setSeleccion({ tipo: 'enum', nombre })}
          alEncajar={() => flujo.fitView({ padding: 0.04, duration: 400 })}
          alReordenar={reordenar}
          alExportar={exportar}
        />

        <main className="lienzo">
          {error && (
            <div className="aviso-error" role="alert">
              <TriangleAlert size={16} />
              <div>
                <strong>El DBML tiene un error{error.linea ? ` en la línea ${error.linea}` : ''}</strong>
                <div>
                  {error.mensaje}
                  {error.total > 1 ? ` (y ${error.total - 1} más)` : ''}
                </div>
                {esquema && <div className="small">Se muestra la última versión que compilaba.</div>}
              </div>
            </div>
          )}
          {!esquema && !error && <div className="cargando">Leyendo el esquema…</div>}
          <ReactFlow
            nodes={nodos}
            edges={aristas}
            nodeTypes={tiposNodo}
            edgeTypes={tiposArista}
            onNodesChange={alCambiarNodos}
            onNodeDragStop={alSoltar}
            onNodeClick={(_e, n) => n.type === 'tabla' && setSeleccion({ tipo: 'tabla', nombre: n.id })}
            onNodeMouseEnter={(_e, n) => n.type === 'tabla' && setEncima(n.id)}
            onNodeMouseLeave={() => setEncima(null)}
            onPaneClick={() => setSeleccion(null)}
            connectionMode={ConnectionMode.Loose}
            nodesConnectable={false}
            edgesFocusable={false}
            minZoom={0.05}
            maxZoom={2}
            attributionPosition="bottom-left"
          >
            <Background gap={24} color="#dfe3ea" />
            {/* Los controles van pegados a la izquierda del minimapa, los dos abajo a la derecha. */}
            <Controls
              showInteractive={false}
              position="bottom-right"
              style={{ marginRight: MARGEN_PANEL + MINIMAPA.ancho + SEPARACION_CONTROLES }}
            />
            <MiniMap
              pannable
              zoomable
              position="bottom-right"
              style={{ width: MINIMAPA.ancho, height: MINIMAPA.alto }}
              nodeStrokeWidth={0}
              maskColor="rgba(246, 247, 249, 0.75)"
              nodeColor={(n) =>
                n.type === 'grupo' ? conAlfa((n as NodoVisor & { type: 'grupo' }).data.grupo.color, 0.18) : (n as NodoVisor & { type: 'tabla' }).data.color
              }
            />
          </ReactFlow>
        </main>

        {esquema && seleccion && (
          <PanelDetalle
            esquema={esquema}
            documentacion={documentacion}
            seleccion={seleccion}
            alCerrar={() => setSeleccion(null)}
            alElegirTabla={elegirTabla}
            alElegirEnum={(nombre) => setSeleccion({ tipo: 'enum', nombre })}
          />
        )}
      </div>
    </ContextoVisor.Provider>
  );
}
