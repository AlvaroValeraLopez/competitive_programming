// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { envolverTablas } from './src/lib/tablas.ts';

// Las soluciones viven fuera de la web, en cualquier carpeta del repositorio:
// cada página las lista en su frontmatter y el componente <Solucion /> las lee
// al compilar (src/lib/soluciones.ts), así el código nunca se duplica.

// https://astro.build/config
export default defineConfig({
	// Fórmulas en LaTeX ($...$ y $$...$$) renderizadas con KaTeX al compilar.
	// Sätteri, el procesador por defecto de Astro 7, no trae KaTeX, así que
	// usamos el procesador unified con remark-math y rehype-katex. Las tablas
	// se envuelven en un contenedor para darles marco (src/lib/tablas.ts).
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex, envolverTablas],
		}),
	},
	integrations: [
		starlight({
			title: 'Retos, paso a paso',
			description:
				'Retos de programación explicados con detalle: la matemática y la programación que hay detrás de cada solución.',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Español', lang: 'es' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/AlvaroValeraLopez/competitive_programming',
				},
			],
			logo: { src: './src/assets/logo.svg' },
			customCss: [
				'@fontsource/poppins/400.css',
				'@fontsource/poppins/500.css',
				'@fontsource/poppins/600.css',
				'@fontsource/poppins/700.css',
				'@fontsource/source-code-pro/400.css',
				'@fontsource/source-code-pro/600.css',
				'katex/dist/katex.min.css',
				'./src/styles/tema.css',
				'./src/styles/custom.css',
			],
			routeMiddleware: './src/navegacion.ts',
			components: {
				Header: './src/components/Cabecera.astro',
				Hero: './src/components/Heroe.astro',
				ThemeSelect: './src/components/SelectorTema.astro',
				PageTitle: './src/components/TituloPagina.astro',
			},
			expressiveCode: {
				styleOverrides: { borderRadius: '8px' },
			},
			// No hay menú lateral (lo quita src/navegacion.ts): esta lista solo fija el
			// orden de la paginación «Anterior / Siguiente» al pie de cada página.
			sidebar: [
				{ label: 'Inicio', link: '/' },
				{ label: 'Mapa', link: '/mapa/' },
				{
					label: 'Problemas',
					items: [{ autogenerate: { directory: 'problemas' } }],
				},
				{
					label: 'Conceptos',
					items: [{ autogenerate: { directory: 'conceptos' } }],
				},
			],
		}),
	],
});
