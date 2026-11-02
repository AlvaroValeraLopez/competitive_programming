import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { ID_FUENTES } from './lib/fuentes';
import { AREAS } from './lib/menu';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Temas de la página: se muestran bajo el título y en las tarjetas.
				temas: z.array(z.string()).optional(),
				// Ejercicios: de qué fuente vienen (ver src/lib/fuentes.ts) y, si la
				// fuente los numera, su número en ella.
				fuente: z.enum(ID_FUENTES).optional(),
				numero: z.number().int().positive().optional(),
				// Relaciones (ver src/lib/grafo.ts). Ejercicios: conceptos que usan.
				// Conceptos: conceptos previos que necesitan. Sin el prefijo «conceptos/».
				conceptos: z.array(z.string()).optional(),
				requiere: z.array(z.string()).optional(),
				// Conceptos: área con la que se agrupan en el menú y en el catálogo. Cada
				// área pertenece a un dominio: matemáticas, algoritmia o implementación
				// (ver src/lib/menu.ts).
				area: z.enum(AREAS).optional(),
			}),
		}),
	}),
};
