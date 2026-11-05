import type { Esquema, Texto } from './modelo.ts';

interface Props {
  texto: Texto;
  esquema: Esquema;
  /** La tabla que se está viendo: su nombre no se enlaza. */
  actual?: string;
  alElegirTabla: (tabla: string) => void;
  alElegirEnum: (nombre: string) => void;
}

/**
 * Pinta un texto de `modelo-datos.md` con su formato. Los fragmentos de código que nombran una tabla
 * (`intento`, `tabla.columna`) o un enum del esquema llevan a ella; los enlaces del documento se
 * muestran como texto, porque apuntan a otros archivos del repositorio.
 */
export function TextoDoc({ texto, ...resto }: Props) {
  const { esquema, actual, alElegirTabla, alElegirEnum } = resto;
  return (
    <>
      {texto.map((parte, i) => {
        if (parte.tipo === 'texto') return parte.texto;
        if (parte.tipo === 'negrita' || parte.tipo === 'cursiva') {
          const Etiqueta = parte.tipo === 'negrita' ? 'strong' : 'em';
          return (
            <Etiqueta key={i}>
              <TextoDoc texto={parte.hijos} {...resto} />
            </Etiqueta>
          );
        }
        if (parte.tipo === 'enlace')
          return (
            <span key={i} className="doc-enlace" title={parte.url}>
              <TextoDoc texto={parte.hijos} {...resto} />
            </span>
          );
        const tabla = parte.texto.split('.')[0];
        if (tabla === actual) return <code key={i} className="doc-actual">{parte.texto}</code>;
        if (esquema.tablas.some((t) => t.nombre === tabla))
          return (
            <button key={i} className="doc-codigo" onClick={() => alElegirTabla(tabla)} title={`Ver la tabla ${tabla}`}>
              {parte.texto}
            </button>
          );
        if (esquema.enums.some((e) => e.nombre === parte.texto))
          return (
            <button key={i} className="doc-codigo" onClick={() => alElegirEnum(parte.texto)} title={`Ver el enum ${parte.texto}`}>
              {parte.texto}
            </button>
          );
        return <code key={i}>{parte.texto}</code>;
      })}
    </>
  );
}
