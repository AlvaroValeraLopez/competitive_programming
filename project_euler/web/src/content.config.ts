import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// Temas matemáticos de la página: se muestran bajo el título y en las
				// tarjetas de la portada.
				temas: z.array(z.string()).optional(),
			}),
		}),
	}),
};
