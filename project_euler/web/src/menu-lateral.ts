// Menú lateral generado a partir del frontmatter: los problemas se agrupan por
// decenas y los conceptos por área, cada grupo plegado salvo el de la página
// actual. Sustituye el contenido de los grupos «Problemas» y «Conceptos»
// definidos en astro.config.mjs.
import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { agruparConceptos, agruparProblemas } from './lib/menu';
import { obtenerPaginas, urlDe } from './lib/paginas';

type Entrada = StarlightRouteData['sidebar'][number];
type Enlace = Extract<Entrada, { type: 'link' }>;
type Grupo = Extract<Entrada, { type: 'group' }>;

export const onRequest = defineRouteMiddleware(async (context) => {
	const ruta = context.locals.starlightRoute;
	const actual = ruta.entry.id;
	const { problemas, conceptos } = await obtenerPaginas();

	const enlace = (id: string, label: string, attrs: Enlace['attrs'] = {}): Enlace => ({
		type: 'link',
		label,
		href: urlDe(id),
		isCurrent: id === actual,
		badge: undefined,
		attrs,
	});
	const grupo = (label: string, entries: Enlace[], badge?: Grupo['badge']): Grupo => ({
		type: 'group',
		label,
		entries,
		collapsed: !entries.some((e) => e.isCurrent),
		badge,
	});

	for (const entrada of ruta.sidebar) {
		if (entrada.type !== 'group') continue;
		if (entrada.label === 'Problemas') {
			entrada.entries = [
				enlace('problemas', 'Todos los problemas'),
				...agruparProblemas(problemas).map((d) =>
					grupo(
						d.etiqueta,
						d.problemas.map((p) => enlace(p.id, p.etiqueta, { 'data-numero': String(p.numero) })),
						{ text: `${d.problemas.length}/10`, variant: 'default' },
					),
				),
			];
		} else if (entrada.label === 'Conceptos') {
			entrada.entries = [
				enlace('conceptos', 'Todos los conceptos'),
				...agruparConceptos(conceptos).map((g) => grupo(g.area, g.conceptos.map((c) => enlace(c.id, c.etiqueta)))),
			];
		}
	}
});
