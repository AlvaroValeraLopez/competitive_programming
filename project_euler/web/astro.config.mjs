// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Las soluciones viven fuera de la web (en ../problems_1_to_hundred) y las
// páginas las importan con `?raw`, así el código nunca se duplica.
const solutionsDir = fileURLToPath(new URL('../problems_1_to_hundred', import.meta.url));

// https://astro.build/config
export default defineConfig({
	// Fórmulas en LaTeX ($...$ y $$...$$) renderizadas con KaTeX al compilar.
	// Sätteri, el procesador por defecto de Astro 7, no trae KaTeX, así que
	// usamos el procesador unified con remark-math y rehype-katex.
	markdown: {
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
	},
	vite: {
		resolve: {
			alias: { '@soluciones': solutionsDir },
		},
		server: {
			fs: { allow: ['..'] },
		},
	},
	integrations: [
		starlight({
			title: 'Euler, paso a paso',
			description:
				'Las matemáticas detrás de los problemas de Project Euler, explicadas con detalle.',
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
			components: {
				Hero: './src/components/Heroe.astro',
				PageTitle: './src/components/TituloPagina.astro',
			},
			expressiveCode: {
				styleOverrides: { borderRadius: '8px' },
			},
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
