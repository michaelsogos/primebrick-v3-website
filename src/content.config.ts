import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    source: z.enum(['deepwiki', 'manual', 'handwritten']),
    repo: z.string().optional(),
    deepwiki_page_id: z.string().optional(),
    last_synced_at: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const marketingCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/marketing' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    sort_order: z.number().optional(),
  }),
});

export const collections = {
  docs: docsCollection,
  marketing: marketingCollection,
};
