import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

const docsCollection = defineCollection({
  loader: docsLoader(),
  schema: docsSchema({
    extend: z.object({
      source: z.enum(['deepwiki', 'manual', 'handwritten']).optional(),
      repo: z.string().optional(),
      deepwiki_page_id: z.string().optional(),
      deepwiki_topic: z.string().optional(),
      last_synced_at: z.string().optional(),
    }),
  }),
});

const i18nCollection = defineCollection({
  loader: i18nLoader(),
  schema: i18nSchema(),
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
  i18n: i18nCollection,
  marketing: marketingCollection,
};
