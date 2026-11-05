import { memo, useContext } from 'react';
import { Handle, Position, getSmoothStepPath, type EdgeProps, type NodeProps } from '@xyflow/react';
import { KeyRound, Link2, StickyNote } from 'lucide-react';
import {
  ContextoVisor,
  FORMA_RELACION,
  conAlfa,
  descripcionColumna,
  descripcionRelacion,
  estadoArista,
  estadoTabla,
  marca,
  type AristaVisor,
  type NodoGrupo,
  type NodoTabla,
} from './visor.ts';

export const TablaNodo = memo(function TablaNodo({ data }: NodeProps<NodoTabla>) {
  const contexto = useContext(ContextoVisor);
  const { tabla, color } = data;
  const estado = estadoTabla(contexto, tabla.nombre);
  const coinciden = contexto.coincidencias?.get(tabla.nombre);
  const clases = ['tabla', `tabla-${estado}`, contexto.seleccionada === tabla.nombre ? 'tabla-seleccionada' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={clases}>
      <div className="tabla-cabecera" style={{ background: color }} title={tabla.nota ?? undefined}>
        <span className="tabla-nombre">{tabla.nombre}</span>
        {tabla.nota && <StickyNote size={13} className="tabla-icono-nota" />}
      </div>
      {tabla.columnas.map((c) => (
        <div key={c.nombre} className={coinciden?.has(c.nombre) ? 'fila fila-coincide' : 'fila'} title={descripcionColumna(c)}>
          <Handle type="source" position={Position.Left} id={`${c.nombre}:i`} isConnectable={false} />
          <span className="fila-icono">
            {c.pk ? <KeyRound size={12} className="icono-pk" /> : c.esFk ? <Link2 size={12} className="icono-fk" /> : null}
          </span>
          <span className={c.pk ? 'fila-nombre es-pk' : 'fila-nombre'}>{c.nombre}</span>
          {c.nota && <span className="punto-nota" />}
          <span className={c.enumNombre ? 'fila-tipo es-enum' : 'fila-tipo'}>
            {c.tipo}
            {!c.noNula && <span className="fila-nulo">?</span>}
          </span>
          <Handle type="source" position={Position.Right} id={`${c.nombre}:d`} isConnectable={false} />
        </div>
      ))}
    </div>
  );
});

export const GrupoNodo = memo(function GrupoNodo({ data }: NodeProps<NodoGrupo>) {
  const { grupo } = data;
  return (
    <div className="grupo" style={{ background: conAlfa(grupo.color, 0.06), borderColor: conAlfa(grupo.color, 0.4) }}>
      <div className="grupo-cabecera" title={grupo.nota ?? undefined}>
        <span className="grupo-nombre" style={{ color: grupo.color }}>
          {grupo.nombre}
        </span>
        {grupo.nota && <span className="grupo-nota">{grupo.nota}</span>}
      </div>
    </div>
  );
});

export const RelacionArista = memo(function RelacionArista(props: EdgeProps<AristaVisor>) {
  const contexto = useContext(ContextoVisor);
  const relacion = props.data!.relacion;
  const estado = estadoArista(contexto, relacion);
  const [ruta] = getSmoothStepPath({ ...props, ...FORMA_RELACION });
  const marcas = [
    marca(props.sourceX, props.sourceY, props.sourcePosition, relacion.origen.cardinalidad),
    marca(props.targetX, props.targetY, props.targetPosition, relacion.destino.cardinalidad),
  ].join(' ');
  return (
    <g className={`relacion relacion-${estado}`}>
      <path d={ruta} className="relacion-linea" strokeDasharray={relacion.opcional ? '5 4' : undefined} />
      <path d={marcas} className="relacion-marca" />
      <path d={ruta} className="relacion-zona">
        <title>{descripcionRelacion(relacion)}</title>
      </path>
    </g>
  );
});
