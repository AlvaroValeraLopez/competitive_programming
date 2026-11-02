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
├── components/          # Dibujos y componentes interactivos (.astro)
├── content/docs/
│   ├── index.mdx        # Portada
│   ├── problemas/       # Una página por problema: 001-..., 012-..., 015-...
│   └── conceptos/       # Teoría reutilizable entre problemas
└── styles/custom.css
```

## Añadir un problema

1. Crea `src/content/docs/problemas/NNN-nombre.mdx` siguiendo la estructura de los existentes:
   el problema, la idea en una frase, la fuerza bruta, el desarrollo matemático, el código,
   la complejidad y los conceptos utilizados.
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
