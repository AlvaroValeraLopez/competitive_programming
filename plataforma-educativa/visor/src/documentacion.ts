import { marked, type Token, type Tokens } from 'marked';
import type { DocTabla, Documentacion, Punto, Texto } from './modelo.ts';

/**
 * Lee `modelo-datos.md` y reparte entre las tablas lo que dice de cada una. Se ejecuta en el servidor
 * (vite.config.ts) y en los tests; el navegador solo recibe el resultado.
 *
 * Se apoya en la estructura del documento:
 * - cada módulo es un `## N. Título` con una tabla «Tabla | Qué representa» y una lista tras
 *   «**Por qué así**»;
 * - y hay tres tablas globales: «Lo que se ve | De dónde sale», «Valor | Se calcula a partir de» y
 *   «Pregunta | Cambio en el modelo».
 */

const ENTIDADES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
const desescapar = (texto: string) => texto.replace(/&(amp|lt|gt|quot|#39);/g, (_, e: string) => ENTIDADES[e]);

function aTexto(tokens: Token[] | undefined): Texto {
  const salida: Texto = [];
  for (const t of tokens ?? []) {
    if (t.type === 'codespan') salida.push({ tipo: 'codigo', texto: desescapar(t.text) });
    else if (t.type === 'strong') salida.push({ tipo: 'negrita', hijos: aTexto(t.tokens) });
    else if (t.type === 'em') salida.push({ tipo: 'cursiva', hijos: aTexto(t.tokens) });
    else if (t.type === 'link') salida.push({ tipo: 'enlace', url: t.href, hijos: aTexto(t.tokens) });
    else if ((t.type === 'text' || t.type === 'paragraph') && t.tokens?.length) salida.push(...aTexto(t.tokens));
    else if (t.type === 'br') salida.push({ tipo: 'texto', texto: ' ' });
    else if ('text' in t && typeof t.text === 'string') salida.push({ tipo: 'texto', texto: desescapar(t.text) });
  }
  // Junta los trozos de texto seguidos.
  return salida.reduce<Texto>((juntos, parte) => {
    const ultimo = juntos[juntos.length - 1];
    if (parte.tipo === 'texto' && ultimo?.tipo === 'texto') ultimo.texto += parte.texto;
    else juntos.push(parte);
    return juntos;
  }, []);
}

function aPunto(item: Tokens.ListItem): Punto {
  const sublistas = item.tokens.filter((t): t is Tokens.List => t.type === 'list');
  return {
    texto: aTexto(item.tokens.filter((t) => t.type !== 'list')),
    subpuntos: sublistas.flatMap((l) => l.items.map((i) => aTexto(i.tokens))),
  };
}

/** Los fragmentos de código de un texto, como `intento` o `tabla.columna`. */
export function codigos(texto: Texto): string[] {
  return texto.flatMap((p) => (p.tipo === 'codigo' ? [p.texto] : p.tipo === 'texto' ? [] : codigos(p.hijos)));
}

/** El texto sin formato, sin los fragmentos de código. */
function plano(texto: Texto): string {
  return texto.map((p) => (p.tipo === 'texto' ? p.texto : p.tipo === 'codigo' ? ' ' : plano(p.hijos))).join('');
}

/** `tabla.columna` → `tabla`. */
export const tablaDe = (codigo: string) => codigo.split('.')[0];

const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Si un punto habla de una tabla: la nombra en código (`intento`) o, en el texto normal, con sus
 * palabras sin tildes y en singular o plural («la matrícula», «los errores típicos»).
 */
function menciona(punto: Punto, tabla: string): boolean {
  const textos = [punto.texto, ...punto.subpuntos];
  if (textos.some((t) => codigos(t).some((c) => tablaDe(c) === tabla))) return true;
  const palabras = tabla.split('_').map((p) => `${p}(?:e?s)?`).join('[\\s_]+');
  const patron = new RegExp(`(?:^|[^\\p{L}\\d_])${palabras}(?:$|[^\\p{L}\\d_])`, 'u');
  return textos.some((t) => patron.test(normalizar(plano(t))));
}

const vacia = (): DocTabla => ({ modulo: null, representa: null, porQue: [], funcionalidades: [], derivado: null, cambios: [] });

export function leerDocumentacion(markdown: string, tablasDelEsquema: string[], archivo: string): Documentacion {
  const existentes = new Set(tablasDelEsquema);
  const tablas: Record<string, DocTabla> = {};
  const de = (nombre: string) => (tablas[nombre] ??= vacia());
  const modulos: Documentacion['modulos'] = [];
  let modulo: Documentacion['modulos'][number] | null = null;
  let tocaPorQue = false;

  /** Las tablas del esquema que nombra un texto en código. */
  const nombradas = (texto: Texto) => [...new Set(codigos(texto).map(tablaDe))].filter((n) => existentes.has(n));

  for (const t of marked.lexer(markdown)) {
    if (t.type === 'heading' && t.depth === 2) {
      modulo = /^\d+\.\s/.test(t.text) ? { titulo: t.text, tablas: [], porQue: [] } : null;
      if (modulo) modulos.push(modulo);
      tocaPorQue = false;
    } else if (t.type === 'table') {
      const tabla = t as Tokens.Table;
      const columna = tabla.header[0]?.text.trim();
      for (const fila of tabla.rows) {
        const [a, b] = fila.map((celda) => aTexto(celda.tokens));
        if (columna === 'Tabla' && modulo) {
          const nombre = codigos(a)[0];
          if (!nombre) continue;
          modulo.tablas.push(nombre);
          Object.assign(de(nombre), { modulo: modulo.titulo, representa: b });
        } else if (columna === 'Lo que se ve') {
          for (const n of nombradas(b)) de(n).funcionalidades.push({ queSeVe: a, deDondeSale: b });
        } else if (columna === 'Valor') {
          const n = nombradas(a)[0];
          if (n) de(n).derivado = { valor: a, fuente: b };
        } else if (columna === 'Pregunta') {
          for (const n of nombradas(b)) de(n).cambios.push({ pregunta: a, cambio: b });
        }
      }
    } else if (t.type === 'paragraph' && modulo) {
      tocaPorQue = t.text.trim() === '**Por qué así**';
    } else if (t.type === 'list' && modulo && tocaPorQue) {
      modulo.porQue.push(...(t as Tokens.List).items.map(aPunto));
      tocaPorQue = false;
    }
  }

  for (const m of modulos)
    for (const nombre of m.tablas) de(nombre).porQue = m.porQue.filter((p) => menciona(p, nombre));

  const explicadas = new Set(modulos.flatMap((m) => m.tablas));
  return {
    archivo,
    tablas,
    modulos,
    sinExplicar: tablasDelEsquema.filter((n) => !explicadas.has(n)),
    huerfanas: [...explicadas].filter((n) => !existentes.has(n)),
  };
}
