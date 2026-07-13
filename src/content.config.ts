import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const marketingCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/marketing' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    sort_order: z.number().optional(),
  }),
});

export const collections = {
  marketing: marketingCollection,
};
