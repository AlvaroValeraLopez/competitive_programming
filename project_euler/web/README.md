# Euler, paso a paso

Web que explica las matemáticas detrás de las soluciones de Project Euler de este repositorio. Está hecha con [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) y las fórmulas se escriben en LaTeX (KaTeX).

## Arrancar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera la web estática en dist/
```

## Estructura

```
src/
├── components/
│   ├── Heroe.astro          # Sustituye al Hero de Starlight (portada)
│   ├── TituloPagina.astro   # Título de página con las etiquetas de `temas`
│   ├── portada/             # Secciones de la portada: tarjetas, características…
│   └── …                    # Dibujos, vídeo y componentes interactivos
├── content/docs/
│   ├── index.mdx            # Portada
│   ├── mapa.mdx             # Mapa de relaciones
│   ├── problemas/           # index.mdx (catálogo) y una página por problema: 001-..., 012-...
│   └── conceptos/           # index.mdx (catálogo) y la teoría reutilizable entre problemas
├── lib/                     # Lógica pura con tests (grafo, menú) y lectura del contenido
├── menu-lateral.ts          # Genera el menú lateral a partir del frontmatter
└── styles/
    ├── tema.css             # Colores, tipografía y formas (estética de Exercism)
    └── custom.css           # Ajustes de fórmulas y tablas
```

## Estética

La web toma la estética de [Exercism](https://exercism.org): tipografía Poppins (y Source Code Pro para el código), azul marino para el texto, morado `#604FCD` como color principal, fondos lavanda claros y tarjetas blancas con sombra azulada. Todos los colores están en `src/styles/tema.css`, tanto los del modo claro como los del oscuro.

Los vídeos (`../videos`) usan la paleta del modo oscuro, y sus tests comprueban que coincide con `tema.css`: si cambias un color aquí, actualiza también `../videos/euler_video/estilo.py`.

## Relaciones

Las relaciones entre páginas se declaran solo en el frontmatter, con el nombre del archivo del concepto sin extensión:

```yaml
# En un problema: los conceptos que usa
conceptos: [suma-de-gauss, inclusion-exclusion]

# En un concepto: los conceptos que necesita
requiere: [coeficientes-binomiales]
```

A partir de ahí se genera todo lo demás: el [mapa](src/content/docs/mapa.mdx), las secciones «Conceptos utilizados» y «Problemas relacionados» de cada problema, y «Conceptos previos» y «Dónde aparece» de cada concepto (con `<Relaciones mostrar="…" />`). Si una página usa un concepto que no existe, o los conceptos previos forman un ciclo, la compilación falla diciendo dónde está el error.

## Menú lateral y catálogos

El menú no se escribe a mano: `src/menu-lateral.ts` (un *route middleware* de Starlight) lo genera en cada página a partir del frontmatter, para que siga siendo manejable cuando haya cien problemas.

- **Problemas**, agrupados por decenas (1–10, 11–20…) según `sidebar.order`, con un contador de los explicados en cada una («2/10»). Solo aparecen las decenas que tienen algún problema.
- **Conceptos**, agrupados por área según el campo `area`, que es obligatorio en los conceptos y debe ser una de las áreas de `AREAS` en `src/lib/menu.ts` (para añadir una área nueva, añádela ahí).
- Todos los grupos van plegados, salvo el que contiene la página actual.

Cada sección tiene su catálogo completo, con buscador (por número, título o tema, sin que importen las tildes): **Todos los problemas** (`/problemas/`), que además filtra por el área de los conceptos que usa cada problema, y **Todos los conceptos** (`/conceptos/`). La portada solo muestra las primeras tarjetas y enlaza a ellos.

Si a un concepto le falta el área, o dos problemas tienen el mismo número, la compilación falla diciendo dónde.

## Tests

La lógica del grafo (`src/lib/grafo.ts`) y del menú (`src/lib/menu.ts`) no depende de Astro y tiene tests:

```bash
npm test
```

## Añadir un problema

1. Crea `src/content/docs/problemas/NNN-nombre.mdx` siguiendo la estructura de los existentes:
   el problema, la idea en una frase, la fuerza bruta, el desarrollo matemático, el código,
   la complejidad y los conceptos utilizados. En el frontmatter, `sidebar.order` es el número
   del problema, `temas` la lista de etiquetas y `conceptos` los conceptos que usa (ver
   «Relaciones»). La tarjeta del catálogo y su entrada en el menú salen de estos campos y de
   `description`. Un concepto nuevo necesita además `area`.
2. El código del repositorio se importa sin copiarlo, con el alias `@soluciones`, que apunta a
   `../problems_1_to_hundred`:

   ```mdx
   import { Code } from '@astrojs/starlight/components';
   import solucion from '@soluciones/1_10/1_multiplesOfThreeAndFive.js?raw';

   <Code code={solucion} lang="js" title="1_multiplesOfThreeAndFive.js" />
   ```

3. Fórmulas: `$...$` dentro del texto y `$$...$$` en bloque.
4. Enlaces internos relativos (`../../conceptos/suma-de-gauss/`), para que sigan funcionando si
   la web se publica en una subruta, como en GitHub Pages.
