// Menú lateral generado a partir del frontmatter: los problemas se agrupan por
// fuente (y, si la fuente los numera, por decenas) y los conceptos por dominio y
// área, cada grupo plegado salvo el que contiene la página actual. Sustituye el
// contenido de los grupos «Problemas» y «Conceptos» definidos en astro.config.mjs.
import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { agruparConceptos, agruparEjercicios } from './lib/menu';
import { obtenerPaginas, urlDe } from './lib/paginas';

type Entrada = StarlightRouteData['sidebar'][number];
type Enlace = Extract<Entrada, { type: 'link' }>;
type Grupo = Extract<Entrada, { type: 'group' }>;

const contieneActual = (entrada: Entrada): boolean =>
	entrada.type === 'link' ? entrada.isCurrent : entrada.entries.some(contieneActual);

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
	const grupo = (label: string, entries: Entrada[], badge?: Grupo['badge']): Grupo => ({
		type: 'group',
		label,
		entries,
		collapsed: !entries.some(contieneActual),
		badge,
	});

	for (const entrada of ruta.sidebar) {
		if (entrada.type !== 'group') continue;
		if (entrada.label === 'Problemas') {
			entrada.entries = [
				enlace('problemas', 'Todos los problemas'),
				...agruparEjercicios(problemas).map((f) =>
					grupo(
						f.nombre,
						f.decenas
							? f.decenas.map((d) =>
									grupo(
										d.etiqueta,
										d.problemas.map((p) => enlace(p.id, p.etiqueta, { 'data-numero': String(p.numero) })),
										{ text: `${d.problemas.length}/10`, variant: 'default' },
									),
								)
							: f.ejercicios.map((p) => enlace(p.id, p.etiqueta)),
						{ text: String(f.ejercicios.length), variant: 'default' },
					),
				),
			];
		} else if (entrada.label === 'Conceptos') {
			entrada.entries = [
				enlace('conceptos', 'Todos los conceptos'),
				...agruparConceptos(conceptos).map((d) =>
					grupo(
						d.dominio,
						d.areas.map((a) => grupo(a.area, a.conceptos.map((c) => enlace(c.id, c.etiqueta)))),
					),
				),
			];
		}
	}
});
