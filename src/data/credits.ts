/**
 * Credits data for the "Thank You" page.
 *
 * Single source of truth for every open-source project, organization, and
 * group of authors Primebrick builds upon — across all 7 Primebrick repos
 * (website, docs, BE, FE, US, DAL, SDK) including docs tooling.
 *
 * Brand SVG paths come from `simple-icons` (already a dependency). Projects
 * without a simple-icon render a styled text badge instead.
 *
 * NOTE: This is a pure data module. No Node.js APIs — safe for the Workers
 * runtime and prerendering.
 */
import {
  siAstro,
  siSvelte,
  siReact,
  siTailwindcss,
  siCloudflare,
  siTypescript,
  siVite,
  siExpress,
  siRedis,
  siPostgresql,
  siHono,
  siVitest,
  siEslint,
  siZod,
  siGithub,
  siHuggingface,
  siMermaid,
  siPostcss,
  siJavascript,
  siNpm,
  siPnpm,
  siBun,
  siDocker,
  siKubernetes,
  siOpensourceinitiative,
  siJsonwebtokens,
  siPassport,
  siPrisma,
  siLucide,
  siIconify,
  siShadcnui,
  siTestinglibrary,
  siJest,
  siDotenv,
  siHtml5,
  siCss,
  siVercel,
  siStorybook,
  siMocha,
  siDeno,
  siJson,
} from 'simple-icons';

export type SimpleIcon = { path: string; hex: string };
export type Credit = {
  name: string;
  /** npm package name(s) this credit maps to, if any. */
  package?: string;
  /** Canonical homepage — only well-known URLs, never guessed. */
  url: string;
  /** Optional brand icon from simple-icons. */
  icon?: SimpleIcon;
  /** Optional one-line role/credit (already translated key, optional). */
  roleKey?: string;
};

export type CreditSection = {
  id: string;
  /** Key into the localized `thankyou.section*` labels. */
  titleKey: string;
  items: Credit[];
};

const icon = (i: { path: string; hex: string }): SimpleIcon => ({
  path: i.path,
  hex: i.hex,
});

export const CREDITS: CreditSection[] = [
  {
    id: 'core',
    titleKey: 'sectionCore',
    items: [
      { name: 'Astro', package: 'astro', url: 'https://astro.build', icon: icon(siAstro) },
      { name: 'Svelte & SvelteKit', package: 'svelte', url: 'https://svelte.dev', icon: icon(siSvelte) },
      { name: 'React', package: 'react', url: 'https://react.dev', icon: icon(siReact) },
      { name: 'Zudoku', package: 'zudoku', url: 'https://zudoku.dev' },
      { name: 'Express', package: 'express', url: 'https://expressjs.com', icon: icon(siExpress) },
      { name: 'Hono', package: 'hono', url: 'https://hono.dev', icon: icon(siHono) },
      { name: 'Vite', package: 'vite', url: 'https://vitejs.dev', icon: icon(siVite) },
      { name: 'Bun', url: 'https://bun.sh', icon: icon(siBun) },
    ],
  },
  {
    id: 'ui',
    titleKey: 'sectionUi',
    items: [
      { name: 'Tailwind CSS', package: 'tailwindcss', url: 'https://tailwindcss.com', icon: icon(siTailwindcss) },
      { name: 'shadcn/ui', url: 'https://ui.shadcn.com', icon: icon(siShadcnui) },
      { name: 'bits-ui', package: 'bits-ui', url: 'https://bits-ui.com' },
      { name: 'Lucide', package: '@lucide/svelte', url: 'https://lucide.dev', icon: icon(siLucide) },
      { name: 'Iconify', package: '@iconify-json', url: 'https://iconify.design', icon: icon(siIconify) },
      { name: 'simple-icons', package: 'simple-icons', url: 'https://simpleicons.org' },
      { name: 'Fontsource', package: '@fontsource-variable/inter', url: 'https://fontsource.org' },
      { name: 'flag-icons', package: 'flag-icons', url: 'https://flagicons.lipis.dev' },
      { name: 'clsx', package: 'clsx', url: 'https://github.com/lukeed/clsx' },
      { name: 'tailwind-merge', package: 'tailwind-merge', url: 'https://github.com/dcastilho/tailwind-merge' },
      { name: 'class-variance-authority', package: 'class-variance-authority', url: 'https://cva.style' },
    ],
  },
  {
    id: 'data',
    titleKey: 'sectionData',
    items: [
      { name: 'PostgreSQL', package: 'pg', url: 'https://www.postgresql.org', icon: icon(siPostgresql) },
      { name: 'node-postgres', package: 'pg', url: 'https://node-postgres.com', icon: icon(siPostgresql) },
      { name: 'Redis', package: 'redis', url: 'https://redis.io', icon: icon(siRedis) },
      { name: 'NATS', package: 'nats', url: 'https://nats.io' },
      { name: 'Cloudflare', package: 'wrangler', url: 'https://www.cloudflare.com', icon: icon(siCloudflare) },
      { name: 'sharp', package: 'sharp', url: 'https://sharp.pixelplumbing.com' },
      { name: 'reflect-metadata', package: 'reflect-metadata', url: 'https://www.npmjs.com/package/reflect-metadata' },
      { name: 'Docker', url: 'https://www.docker.com', icon: icon(siDocker) },
      { name: 'Kubernetes', url: 'https://kubernetes.io', icon: icon(siKubernetes) },
    ],
  },
  {
    id: 'auth',
    titleKey: 'sectionAuth',
    items: [
      { name: 'JOSE', package: 'jose', url: 'https://github.com/panva/jose' },
      { name: 'openid-client', package: 'openid-client', url: 'https://github.com/panva/node-openid-client' },
      { name: 'Casdoor', package: 'casdoor-nodejs-sdk', url: 'https://casdoor.org' },
      { name: 'DOMPurify', package: 'dompurify', url: 'https://github.com/cure53/DOMPurify' },
      { name: 'zxcvbn-ts', package: '@zxcvbn-ts/core', url: 'https://github.com/zxcvbn-ts/zxcvbn-ts' },
      { name: 'JSON Web Tokens', package: 'jose', url: 'https://jwt.io', icon: icon(siJsonwebtokens) },
      { name: 'Passport', package: 'passport', url: 'https://www.passportjs.org', icon: icon(siPassport) },
    ],
  },
  {
    id: 'ai',
    titleKey: 'sectionAi',
    items: [
      { name: 'Vercel AI SDK', package: 'ai', url: 'https://sdk.vercel.ai', icon: icon(siVercel) },
      { name: 'Model Context Protocol', package: '@modelcontextprotocol/server', url: 'https://modelcontextprotocol.io' },
      { name: 'Anthropic', url: 'https://www.anthropic.com' },
      { name: 'Hugging Face', package: '@huggingface/transformers', url: 'https://huggingface.co', icon: icon(siHuggingface) },
      { name: 'Transformers.js', package: '@huggingface/transformers', url: 'https://huggingface.co/docs/transformers.js' },
    ],
  },
  {
    id: 'docs',
    titleKey: 'sectionDocs',
    items: [
      { name: 'Zudoku', package: 'zudoku', url: 'https://zudoku.dev' },
      { name: 'Mermaid', package: 'mermaid', url: 'https://mermaid.js.org', icon: icon(siMermaid) },
      { name: 'Shiki', package: 'shiki', url: 'https://shiki.style' },
      { name: 'TypeDoc', package: 'typedoc', url: 'https://typedoc.org' },
      { name: 'pdfmake', package: 'pdfmake', url: 'https://pdfmake.org' },
      { name: 'MDX', url: 'https://mdxjs.com' },
    ],
  },
  {
    id: 'build',
    titleKey: 'sectionBuild',
    items: [
      { name: 'TypeScript', package: 'typescript', url: 'https://www.typescriptlang.org', icon: icon(siTypescript) },
      { name: 'ESLint', package: 'eslint', url: 'https://eslint.org', icon: icon(siEslint) },
      { name: 'typescript-eslint', package: '@typescript-eslint', url: 'https://typescript-eslint.io' },
      { name: 'Vitest', package: 'vitest', url: 'https://vitest.dev', icon: icon(siVitest) },
      { name: 'Playwright', package: '@playwright/test', url: 'https://playwright.dev' },
      { name: 'axe-core', package: 'axe-core', url: 'https://www.deque.com/axe' },
      { name: 'Deque Systems', url: 'https://www.deque.com' },
      { name: 'Testing Library', package: '@testing-library/svelte', url: 'https://testing-library.com', icon: icon(siTestinglibrary) },
      { name: 'jsdom', package: 'jsdom', url: 'https://github.com/jsdom/jsdom' },
      { name: 'PostCSS', package: 'postcss', url: 'https://postcss.org', icon: icon(siPostcss) },
      { name: 'dotenv', package: 'dotenv', url: 'https://github.com/motdotla/dotenv', icon: icon(siDotenv) },
      { name: 'pnpm', url: 'https://pnpm.io', icon: icon(siPnpm) },
    ],
  },
  {
    id: 'utils',
    titleKey: 'sectionUtils',
    items: [
      { name: 'Zod', package: 'zod', url: 'https://zod.dev', icon: icon(siZod) },
      { name: 'Handlebars', package: 'handlebars', url: 'https://handlebarsjs.com' },
      { name: 'html2pdf.js', package: 'html2pdf.js', url: 'https://github.com/eKoopmans/html2pdf.js' },
      { name: 'ExcelJS', package: 'exceljs', url: 'https://github.com/exceljs/exceljs' },
      { name: 'json-bigint', package: 'json-bigint', url: 'https://github.com/sidorares/json-bigint', icon: icon(siJson) },
      { name: 'sveltekit-superforms', package: 'sveltekit-superforms', url: 'https://superforms.rocks' },
      { name: 'svelte-motion', package: 'svelte-motion', url: 'https://github.com/kenOfAllTrades/svelte-motion' },
      { name: 'svelte-sonner', package: 'svelte-sonner', url: 'https://github.com/wobsoriano/svelte-sonner' },
      { name: 'Adobe React Spectrum', package: '@internationalized/date', url: 'https://react-spectrum.adobe.com' },
      { name: 'Microsoft fetch-event-source', package: '@microsoft/fetch-event-source', url: 'https://github.com/microsoft/fetch-event-source' },
    ],
  },
];

/**
 * Flat list of org / project names used by the gratitude marquee at the
 * bottom of the page. Kept short and iconic.
 */
export const MARQUEE_NAMES: string[] = [
  'Astro',
  'Svelte',
  'React',
  'Tailwind Labs',
  'Microsoft',
  'Cloudflare',
  'Vercel',
  'Anthropic',
  'Hugging Face',
  'PostgreSQL',
  'Redis',
  'NATS',
  'OpenJS Foundation',
  'Meta',
  'Adobe',
  'Deque Systems',
  'Cure53',
  'Casdoor',
  'Zudoku',
  'Vite',
  'Bun',
  'Express',
  'Hono',
  'Vitest',
  'Playwright',
  'ESLint',
  'TypeScript',
  'Zod',
  'Mermaid',
  'Shiki',
  'Fontsource',
  'Lucide',
  'Iconify',
  'simple-icons',
  'shadcn/ui',
  'Testing Library',
  'Prisma',
  'Handlebars',
  'pnpm',
  'Open Source Initiative',
];
