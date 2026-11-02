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
│   ├── problemas/           # Una página por problema: 001-..., 012-..., 015-...
│   └── conceptos/           # Teoría reutilizable entre problemas
└── styles/
    ├── tema.css             # Colores, tipografía y formas (estética de Exercism)
    └── custom.css           # Ajustes de fórmulas y tablas
```

## Estética

La web toma la estética de [Exercism](https://exercism.org): tipografía Poppins (y Source Code Pro para el código), azul marino para el texto, morado `#604FCD` como color principal, fondos lavanda claros y tarjetas blancas con sombra azulada. Todos los colores están en `src/styles/tema.css`, tanto los del modo claro como los del oscuro.

Los vídeos (`../videos`) usan la paleta del modo oscuro, y sus tests comprueban que coincide con `tema.css`: si cambias un color aquí, actualiza también `../videos/euler_video/estilo.py`.

## Añadir un problema

1. Crea `src/content/docs/problemas/NNN-nombre.mdx` siguiendo la estructura de los existentes:
   el problema, la idea en una frase, la fuerza bruta, el desarrollo matemático, el código,
   la complejidad y los conceptos utilizados. En el frontmatter, `sidebar.order` es el número
   del problema y `temas` la lista de etiquetas; la portada genera su tarjeta a partir de
   ambos y de `description`.
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
