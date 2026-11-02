# Retos, paso a paso

Web que explica con detalle las soluciones de los retos de programación de este repositorio: la matemática que hay detrás, la algoritmia que organiza el cálculo y lo que hay que tener en cuenta al implementarlas. Por ahora tiene problemas de Project Euler, pero el modelo admite cualquier fuente (Exercism, Acepta el reto…). Está hecha con [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) y las fórmulas se escriben en LaTeX (KaTeX).

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
│   ├── Cabecera.astro       # Sustituye a la cabecera de Starlight: secciones, buscador y tema
│   ├── Heroe.astro          # Sustituye al Hero de Starlight (portada)
│   ├── TituloPagina.astro   # Título de página con las etiquetas de `temas`
│   ├── Solucion.astro       # Muestra una solución del repositorio (ver «Soluciones»)
│   ├── portada/             # Secciones de la portada: tarjetas, características…
│   ├── tracks/              # Catálogo de tracks y las pestañas de cada uno
│   └── …                    # Dibujos, vídeo y componentes interactivos
├── content/docs/
│   ├── index.mdx            # Portada
│   ├── mapa.mdx             # Mapa de relaciones
│   ├── tracks/              # index.mdx: el catálogo de tracks
│   ├── problemas/           # index.mdx (catálogo) y una página por ejercicio: 001-..., 012-...
│   └── conceptos/           # index.mdx (catálogo) y la teoría reutilizable entre ejercicios
├── lib/                     # Lógica pura con tests y lectura del contenido
│   ├── fuentes.ts           # De dónde vienen los ejercicios y cómo se nombran
│   ├── menu.ts              # Dominios y áreas de los conceptos; agrupación de los catálogos
│   ├── secciones.ts         # Las secciones de la cabecera y a cuál pertenece cada página
│   ├── tracks.ts            # Los tracks (rutas por dominio) y cómo se ordenan sus conceptos
│   ├── rutas.ts             # Los datos de cada track, a partir del contenido
│   ├── soluciones.ts        # Lenguajes y lectura de las soluciones del repositorio
│   ├── grafo.ts             # Relaciones entre páginas y disposición del mapa
│   └── filtro.ts            # Filtro por conceptos de la lista de problemas
├── navegacion.ts            # Quita el menú lateral de Starlight en todas las páginas
└── styles/
    ├── tema.css             # Colores, tipografía y formas (estética de Exercism)
    └── custom.css           # Ajustes de fórmulas y tablas
```

## Estética

La web toma la estética de [Exercism](https://exercism.org): tipografía Poppins (y Source Code Pro para el código), azul marino para el texto, morado `#604FCD` como color principal, fondos lavanda claros y tarjetas blancas con sombra azulada. Todos los colores están en `src/styles/tema.css`, tanto los del modo claro como los del oscuro.

Los vídeos (`../videos`) usan la paleta del modo oscuro, y sus tests comprueban que coincide con `tema.css`: si cambias un color aquí, actualiza también `../videos/euler_video/estilo.py`.

## Ejercicios y fuentes

Cada ejercicio declara de qué fuente viene y, si la fuente los numera, su número en ella:

```yaml
fuente: project-euler
numero: 3
```

Las fuentes están en `src/lib/fuentes.ts`. Una fuente numerada (Project Euler, Acepta el reto) agrupa sus ejercicios por decenas y los nombra con su prefijo («Problema 3: …»); una que no lo está (Exercism) los ordena alfabéticamente. Para añadir una fuente nueva basta con añadirla ahí.

## Conceptos, dominios y áreas

Cada concepto tiene un `area`, y cada área pertenece a un dominio, según `DOMINIOS` en `src/lib/menu.ts`:

- **Matemáticas**: sumas y series, teoría de números, combinatoria, aritmética modular.
- **Algoritmia**: programación dinámica.
- **Implementación**: números grandes.

El dominio no se escribe: se deduce del área. Para añadir un área nueva, añádela a su dominio en `DOMINIOS`. La sección «Conceptos utilizados» de cada ejercicio separa los conceptos por dominio, de modo que se ve qué matemáticas hacen falta y qué hay que saber para programarlo.

## Tracks

Un track es una ruta de aprendizaje: uno por dominio (Matemáticas, Algoritmia, Implementación), definidos en `src/lib/tracks.ts` con su icono, su resumen y su descripción. La ruta ordena los conceptos del dominio por niveles: en el primero, los que no necesitan ningún otro concepto del dominio; en cada nivel, los que se apoyan en los anteriores. Los conceptos previos de otros dominios no cuentan para el nivel, pero se indican. Los ejercicios de un track son los que usan alguno de sus conceptos.

- `/tracks/` (`content/docs/tracks/index.mdx`): el catálogo, una tarjeta por track.
- `/tracks/<slug>/`, `/tracks/<slug>/aprender/` y `/tracks/<slug>/practicar/`: las pestañas «Acerca de», «Aprender» (la ruta) y «Practicar» (sus ejercicios). Las genera `src/pages/tracks/[track]/[...pestana].astro` con `<StarlightPage>`, así que no hay que escribirlas.

Al añadir un dominio en `DOMINIOS`, hay que añadir su track; los tests lo comprueban.

## Relaciones

Las relaciones entre páginas se declaran solo en el frontmatter, con el nombre del archivo del concepto sin extensión:

```yaml
# En un ejercicio: los conceptos que usa
conceptos: [suma-de-gauss, inclusion-exclusion]

# En un concepto: los conceptos que necesita
requiere: [coeficientes-binomiales]
```

A partir de ahí se genera todo lo demás: el [mapa](src/content/docs/mapa.mdx), las secciones «Conceptos utilizados» y «Problemas relacionados» de cada ejercicio, y «Conceptos previos» y «Dónde aparece» de cada concepto (con `<Relaciones mostrar="…" />`). Si una página usa un concepto que no existe, o los conceptos previos forman un ciclo, la compilación falla diciendo dónde está el error.

## Soluciones

Las soluciones no se copian en la web: cada ejercicio lista sus archivos en el frontmatter, con la ruta desde la raíz del repositorio, en cualquier carpeta y en cualquier lenguaje:

```yaml
soluciones:
  - archivo: 'project_euler/problems_1_to_hundred/1_10/3_largestPrimeFactor.js'
```

Y la página los muestra con `<Solucion />` (la primera) o `<Solucion indice={1} />` (la segunda…). El lenguaje se deduce de la extensión (JavaScript, TypeScript, Python, C, C++, Java) y el título del bloque es el nombre del archivo. Si un archivo no existe, la compilación falla diciendo cuál.

## Navegación y catálogos

La web no tiene menú lateral, para dejar todo el ancho al contenido. La navegación son unas pocas secciones en la cabecera (`src/components/Cabecera.astro`), definidas en `src/lib/secciones.ts`; la sección de la página actual se resalta. En pantallas estrechas, las secciones pasan a un menú desplegable. `src/navegacion.ts`, un *route middleware* de Starlight, quita el menú lateral en todas las páginas; la lista `sidebar` de `astro.config.mjs` solo fija el orden de la paginación «Anterior / Siguiente».

Las páginas de lectura (las que tienen índice a la derecha) usan una columna de unos 48rem, centrada; la portada, los catálogos y el mapa usan todo el ancho.

Cada sección tiene su catálogo completo, con buscador sin que importen las tildes. La portada solo muestra las primeras tarjetas y enlaza a ellos.

- **Todos los problemas** (`/problemas/`, `ListaProblemas.astro`), al estilo de la lista de ejercicios de Exercism. Cada tarjeta muestra el número, el título, la descripción y los conceptos que usa. Se puede **practicar por conceptos**: al elegir uno o varios, aparecen los ejercicios que los usan, primero los que usan más. El filtro queda en la dirección (`/problemas/?conceptos=suma-de-gauss,funcion-divisor&q=…`), así que cualquier selección se puede enlazar. Cada concepto tiene bajo su título un botón «Practicar: N problemas» que lleva a esa lista filtrada.
- **Todos los conceptos** (`/conceptos/`, `Catalogo.astro`), agrupados por dominio y área.

Si a un ejercicio le falta la fuente o el número, si dos ejercicios de la misma fuente tienen el mismo número, o si a un concepto le falta el área, la compilación falla diciendo dónde.

## Tests

La lógica de `src/lib/` no depende de Astro y tiene tests:

```bash
npm test
```

## Añadir un ejercicio

1. Crea `src/content/docs/problemas/NNN-nombre.mdx` siguiendo la estructura de los existentes:
   el problema, la idea en una frase, la fuerza bruta, el desarrollo, el código, la complejidad
   y los conceptos utilizados. En el frontmatter van `fuente` y `numero` (ver «Ejercicios y
   fuentes»), `soluciones` (ver «Soluciones»), `temas` (las etiquetas) y `conceptos` (ver
   «Relaciones»); `sidebar.order` solo fija el orden. La tarjeta del catálogo y su entrada en el
   menú salen de estos campos y de `description`. Un concepto nuevo necesita además `area`.
2. Muestra el código del repositorio con `<Solucion />`:

   ```mdx
   import Solucion from '../../../components/Solucion.astro';

   <Solucion />
   ```

3. Fórmulas: `$...$` dentro del texto y `$$...$$` en bloque.
4. Enlaces internos relativos (`../../conceptos/suma-de-gauss/`), para que sigan funcionando si
   la web se publica en una subruta, como en GitHub Pages.
