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
│   ├── TituloPagina.astro   # Título con las etiquetas de `temas` y la ficha de cada ejercicio
│   ├── Dificultad.astro     # Píldora con la dificultad de un ejercicio
│   ├── Solucion.astro       # Muestra una solución del repositorio (ver «Soluciones»)
│   ├── portada/             # Secciones de la portada: tarjetas, características…
│   ├── tracks/              # Catálogo de tracks y las pestañas de cada uno
│   └── …                    # Dibujos, vídeo y componentes interactivos
├── content/docs/
│   ├── index.mdx            # Portada
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
│   ├── grafo.ts             # Relaciones entre páginas
│   ├── arbol.ts             # Disposición del árbol de conceptos
│   ├── dificultad.ts        # Los niveles de dificultad de los ejercicios
│   └── filtro.ts            # Filtros y orden de la lista de ejercicios
├── navegacion.ts            # Quita el menú lateral de Starlight en todas las páginas
└── styles/
    ├── tema.css             # Colores, tipografía y formas (estética de Exercism)
    └── custom.css           # Ajustes de fórmulas y tablas
```

## Estética

La web toma la estética de [Exercism](https://exercism.org): tipografía Poppins (y Source Code Pro para el código), azul marino para el texto, morado `#604FCD` como color principal, fondos lavanda claros y tarjetas blancas con sombra azulada. Todos los colores están en `src/styles/tema.css`, tanto los del modo claro como los del oscuro.

Los vídeos (`../videos`) usan la paleta del modo oscuro, y sus tests comprueban que coincide con `tema.css`: si cambias un color aquí, actualiza también `../videos/euler_video/estilo.py`.

## Ejercicios y fuentes

Cada ejercicio declara de qué fuente viene, si la fuente los numera su número en ella, y su dificultad:

```yaml
fuente: project-euler
numero: 3
dificultad: media # facil | media | dificil
```

Las fuentes están en `src/lib/fuentes.ts`. Una fuente numerada (Project Euler, Acepta el reto) agrupa sus ejercicios por decenas y los nombra con su prefijo («Problema 3: …»); una que no lo está (Exercism) los ordena alfabéticamente. Para añadir una fuente nueva basta con añadirla ahí.

La dificultad (`src/lib/dificultad.ts`) es obligatoria en todos los ejercicios: si falta, la compilación falla. Es **fácil** si basta una idea directa o la fuerza bruta ya es suficiente, **media** si hace falta un concepto que no es inmediato (la criba, la factorización, la programación dinámica…) y **difícil** si hay que combinar varios conceptos y pensar en la eficiencia. Se ve como una píldora verde, ámbar o roja en la lista de ejercicios y en la ficha que hay bajo el título de cada ejercicio, junto a su fuente y los conceptos que aplica, separados por dominio.

## Conceptos, dominios y áreas

Cada concepto tiene un `area`, y cada área pertenece a un dominio, según `DOMINIOS` en `src/lib/menu.ts`:

- **Matemáticas**: sumas y series, teoría de números, combinatoria, aritmética modular.
- **Algoritmia**: programación dinámica.
- **Implementación**: números grandes.

El dominio no se escribe: se deduce del área. Para añadir un área nueva, añádela a su dominio en `DOMINIOS`. La sección «Conceptos utilizados» de cada ejercicio separa los conceptos por dominio, de modo que se ve qué matemáticas hacen falta y qué hay que saber para programarlo.

## Tracks

Un track es una ruta de aprendizaje: uno por dominio (Matemáticas, Algoritmia, Implementación), definidos en `src/lib/tracks.ts` con su icono, su resumen y su descripción. La ruta ordena los conceptos del dominio por niveles: en el primero, los que no necesitan ningún otro concepto del dominio; en cada nivel, los que se apoyan en los anteriores. Los conceptos previos de otros dominios no cuentan para el nivel, pero se indican. Los ejercicios de un track son los que usan alguno de sus conceptos.

- `/tracks/` (`content/docs/tracks/index.mdx`): el catálogo, una tarjeta por track.
- `/tracks/<slug>/`, `/tracks/<slug>/aprender/` y `/tracks/<slug>/practicar/`: las pestañas «Acerca de», «Aprender» (el árbol de conceptos de la ruta) y «Practicar» (sus ejercicios). Las genera `src/pages/tracks/[track]/[...pestana].astro` con `<StarlightPage>`, así que no hay que escribirlas.

El árbol de conceptos (`ArbolConceptos.astro`, con la disposición de `src/lib/arbol.ts`) dibuja una ruta al estilo del de Exercism: solo conceptos, cada uno debajo de los que necesita y con el color de su dominio; los conceptos previos de otras rutas aparecen atenuados y con borde discontinuo. Sale en la pestaña «Aprender» de cada track y en la sección «Conceptos», y es el único mapa de la web: `/mapa/` redirige a `/conceptos/`.

Al añadir un dominio en `DOMINIOS`, hay que añadir su track; los tests lo comprueban.

## Relaciones

Las relaciones entre páginas se declaran solo en el frontmatter, con el nombre del archivo del concepto sin extensión:

```yaml
# En un ejercicio: los conceptos que usa
conceptos: [suma-de-gauss, inclusion-exclusion]

# En un concepto: los conceptos que necesita
requiere: [coeficientes-binomiales]
```

A partir de ahí se genera todo lo demás: el árbol de conceptos de cada ruta, las secciones «Conceptos utilizados» y «Problemas relacionados» de cada ejercicio, y «Conceptos previos» y «Dónde aparece» de cada concepto (con `<Relaciones mostrar="…" />`). Si una página usa un concepto que no existe, o los conceptos previos forman un ciclo, la compilación falla diciendo dónde está el error.

## Soluciones

Las soluciones no se copian en la web: cada ejercicio lista sus archivos en el frontmatter, con la ruta desde la raíz del repositorio, en cualquier carpeta y en cualquier lenguaje:

```yaml
soluciones:
  - archivo: 'project_euler/problems_1_to_hundred/1_10/3_largestPrimeFactor.js'
```

Y la página los muestra con `<Solucion />` (la primera) o `<Solucion indice={1} />` (la segunda…). El lenguaje se deduce de la extensión (JavaScript, TypeScript, Python, C, C++, Java) y el título del bloque es el nombre del archivo. Si un archivo no existe, la compilación falla diciendo cuál.

## Navegación y catálogos

La web no tiene menú lateral, para dejar todo el ancho al contenido. La navegación son unas pocas secciones en la cabecera (`src/components/Cabecera.astro`), definidas en `src/lib/secciones.ts`; la sección de la página actual se resalta. En pantallas estrechas, las secciones pasan a un menú desplegable. `src/navegacion.ts`, un *route middleware* de Starlight, quita el menú lateral en todas las páginas; la lista `sidebar` de `astro.config.mjs` solo fija el orden de la paginación «Anterior / Siguiente».

Las páginas de lectura (las que tienen índice a la derecha) usan una columna de unos 48rem, centrada; la portada, los catálogos y los árboles de conceptos usan todo el ancho.

Cada sección tiene su catálogo completo, con buscador sin que importen las tildes. La portada solo muestra las primeras tarjetas y enlaza a ellos.

- **Todos los ejercicios** (`/problemas/`, `ListaProblemas.astro`), al estilo de la lista de ejercicios de Exercism. Cada tarjeta muestra la fuente, el número, el título, la dificultad, la descripción y los conceptos que usa, con un punto del color de su dominio. Se filtra desde varias vistas a la vez: pestañas de dificultad y un panel con track, fuente, conceptos (por dominio y área) y temas; dentro de un grupo basta con cumplir una opción, y entre grupos hay que cumplirlos todos. Con conceptos elegidos, salen antes los ejercicios que usan más de ellos. Se ordena por fuente y número o por dificultad. El filtro queda en la dirección (`/problemas/?dificultad=media&conceptos=suma-de-gauss,funcion-divisor&q=…&orden=dificultad`), así que cualquier selección se puede enlazar. Cada concepto tiene bajo su título un botón «Practicar: N ejercicios» que lleva a esa lista filtrada, y la pestaña «Practicar» de cada track la muestra restringida a sus ejercicios.
- **Todos los conceptos** (`/conceptos/`): primero el mapa de conceptos (`MapaConceptos.astro`), con el árbol de cada ruta en una pestaña, y debajo el catálogo (`Catalogo.astro`), agrupado por dominio y área.

Si a un ejercicio le falta la fuente o el número, si dos ejercicios de la misma fuente tienen el mismo número, o si a un concepto le falta el área, la compilación falla diciendo dónde.

## Tests

La lógica de `src/lib/` no depende de Astro y tiene tests:

```bash
npm test
```

## Añadir un ejercicio

1. Crea `src/content/docs/problemas/NNN-nombre.mdx` siguiendo la estructura de los existentes:
   el problema, la idea en una frase, la fuerza bruta, el desarrollo, el código, la complejidad
   y los conceptos utilizados. En el frontmatter van `fuente`, `numero` y `dificultad` (ver «Ejercicios y
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
