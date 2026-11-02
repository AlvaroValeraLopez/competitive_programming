// La web no tiene menú lateral: las secciones están en la cabecera
// (src/components/Cabecera.astro). Este route middleware de Starlight lo quita
// en todas las páginas, sin tocar el índice de la derecha ni la paginación
// (que Starlight calcula antes, a partir de la configuración del menú).
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

export const onRequest = defineRouteMiddleware((context) => {
	context.locals.starlightRoute.hasSidebar = false;
});
