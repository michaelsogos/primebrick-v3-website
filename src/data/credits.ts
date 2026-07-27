/**
 * Credits data for the "Thank You" page — storytelling format.
 *
 * Each credit thanks a REAL author / org / collective for their open-source
 * work, names the project, and says what it is ACTUALLY used for inside
 * Primebrick (verified empirically against every repo's source code).
 *
 * Dead dependencies (hono, openid-client, passport, dompurify, cva, dotenv in
 * FE/docs, @iconify-json/*, inline-css, Cloudflare, Docker, Kubernetes, React,
 * MDX) are NOT listed — we only thank projects we genuinely use.
 *
 * Brand SVG paths come from `simple-icons` (already a dependency). Projects
 * without a simple-icon render a styled text badge instead.
 *
 * NOTE: Pure data module. No Node.js APIs — safe for prerendering.
 */
import {
  siTypescript,
  siNodedotjs,
  siBun,
  siAstro,
  siSvelte,
  siExpress,
  siVite,
  siPnpm,
  siEslint,
  siTailwindcss,
  siShadcnui,
  siLucide,
  siSimpleicons,
  siPostgresql,
  siRedis,
  siNatsdotio,
  siVercel,
  siAnthropic,
  siHuggingface,
  siZod,
  siHandlebarsdotjs,
  siMermaid,
  siVitest,
  siTestinglibrary,
  siDotenv,
  siSharp,
  siGithub,
} from 'simple-icons';

export type SimpleIcon = { path: string; hex: string };

export type Credit = {
  /** The person / team / org we thank by name. */
  author: string;
  /** GitHub handle (e.g. "@sveltejs"). */
  handle: string;
  /** Project name. */
  project: string;
  /** Major version used in Primebrick (e.g. "7", "5", "24"). */
  version: string;
  /** npm package name, if applicable. */
  package?: string;
  /** Canonical homepage — only well-known URLs, never guessed. */
  url: string;
  /** What it is ACTUALLY used for in Primebrick (empirically verified). */
  usage: string;
  /** Optional inline link within the usage text — the `usageLinkText`
   *  substring inside `usage` becomes a clickable link to this URL.
   *  The card itself still links to `url`. */
  usageLink?: string;
  /** The substring of `usage` to turn into a link to `usageLink`. */
  usageLinkText?: string;
  /** Optional brand icon from simple-icons. */
  icon?: SimpleIcon;
};

export type CreditSection = {
  id: string;
  /** Key into the localized `thankyou.section*` labels. */
  titleKey: string;
  items: Credit[];
};

/**
 * Wrap a simple-icon, overriding brand colors that are too dark to see on
 * the slate-950 background. Brands like Bun, Express, shadcn, Vercel,
 * Handlebars, GitHub, Anthropic, simple-icons use near-black hex values
 * that are invisible on dark backgrounds — we replace them with a light
 * slate tone so the logo shape is always readable.
 */
const VISIBLE_FALLBACK = 'f1f5f9'; // slate-100 — bright enough on slate-950

const ic = (i: { path: string; hex: string }): SimpleIcon => {
  const { hex } = i;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return {
    path: i.path,
    hex: luminance < 0.4 ? VISIBLE_FALLBACK : hex,
  };
};

export const CREDITS: CreditSection[] = [
  {
    id: 'foundation',
    titleKey: 'sectionFoundation',
    items: [
      {
        author: 'Microsoft — Anders Hejlsberg & the TS team',
        handle: '@Microsoft',
        project: 'TypeScript',
        version: '7',
        package: 'typescript',
        url: 'https://www.typescriptlang.org',
        usage: 'The language every Primebrick repo is written in — backend, frontend, SDK, DAL, microservices, docs, and this website.',
        icon: ic(siTypescript),
      },
      {
        author: 'OpenJS Foundation & Node.js collaborators',
        handle: '@nodejs',
        project: 'Node.js',
        version: '24',
        url: 'https://nodejs.org',
        usage: 'Runs the Primebrick backend, SDK, DAL, and all build scripts.',
        icon: ic(siNodedotjs),
      },
      {
        author: 'Jarred Sumner',
        handle: '@oven-sh',
        project: 'Bun',
        version: '1',
        url: 'https://bun.sh',
        usage: 'Runtime for the Primebrick microservices — fast startup, hot reload, native TypeScript.',
        icon: ic(siBun),
      },
    ],
  },
  {
    id: 'frameworks',
    titleKey: 'sectionFrameworks',
    items: [
      {
        author: 'The Astro Team',
        handle: '@withastro',
        project: 'Astro',
        version: '7',
        package: 'astro',
        url: 'https://astro.build',
        usage: 'Powers primebrick.dev — this very website you are looking at.',
        icon: ic(siAstro),
      },
      {
        author: 'Rich Harris & the Svelte team',
        handle: '@sveltejs',
        project: 'Svelte & SvelteKit',
        version: '5',
        package: 'svelte',
        url: 'https://svelte.dev',
        usage: 'Powers the Primebrick admin frontend and the interactive islands on this website.',
        icon: ic(siSvelte),
      },
      {
        author: 'OpenJS Foundation',
        handle: '@expressjs',
        project: 'Express',
        version: '4',
        package: 'express',
        url: 'https://expressjs.com',
        usage: 'The Primebrick backend HTTP server — every API route, every middleware.',
        icon: ic(siExpress),
      },
      {
        author: 'Zuplo',
        handle: '@zuplo',
        project: 'Zudoku',
        version: '0',
        package: 'zudoku',
        url: 'https://zudoku.dev',
        usage: 'Powers docs.primebrick.dev — the API catalog, navigation, and MDX documentation.',
        usageLink: 'https://docs.primebrick.dev',
        usageLinkText: 'docs.primebrick.dev',
      },
    ],
  },
  {
    id: 'build',
    titleKey: 'sectionBuild',
    items: [
      {
        author: 'Evan You',
        handle: '@vitejs',
        project: 'Vite',
        version: '8',
        package: 'vite',
        url: 'https://vitejs.dev',
        usage: 'Build tool behind Astro, SvelteKit, and every TypeScript repo in the workspace.',
        icon: ic(siVite),
      },
      {
        author: 'Zoltan Kochan',
        handle: '@pnpm',
        project: 'pnpm',
        version: '9',
        url: 'https://pnpm.io',
        usage: 'Package manager for the entire Primebrick workspace — fast, disk-efficient, workspace-aware.',
        icon: ic(siPnpm),
      },
      {
        author: 'Nicholas C. Zakas & the ESLint team',
        handle: '@eslint',
        project: 'ESLint',
        version: '10',
        package: 'eslint',
        url: 'https://eslint.org',
        usage: 'Lints the frontend and docs codebases to keep quality high.',
        icon: ic(siEslint),
      },
    ],
  },
  {
    id: 'ui',
    titleKey: 'sectionUi',
    items: [
      {
        author: 'Adam Wathan & Tailwind Labs',
        handle: '@tailwindlabs',
        project: 'Tailwind CSS',
        version: '4',
        package: 'tailwindcss',
        url: 'https://tailwindcss.com',
        usage: 'Styling across the Primebrick frontend and this website — every color, every layout.',
        icon: ic(siTailwindcss),
      },
      {
        author: 'shadcn',
        handle: '@shadcn',
        project: 'shadcn/ui',
        version: '0',
        url: 'https://ui.shadcn.com',
        usage: 'The component system vendored into the Primebrick frontend — buttons, dialogs, command palettes, and more.',
        icon: ic(siShadcnui),
      },
      {
        author: 'Hunter Johnston',
        handle: '@huntabyte',
        project: 'bits-ui',
        version: '2',
        package: 'bits-ui',
        url: 'https://bits-ui.com',
        usage: 'The unstyled Svelte primitives beneath every shadcn-svelte component — accessible, headless, rock-solid.',
      },
      {
        author: 'Hunter Johnston & the Svecosystem team',
        handle: '@svecosystem',
        project: 'formsnap · paneforge · runed',
        version: '2',
        url: 'https://www.svecosystem.dev',
        usage: 'Accessible form components, resizable panels, and Svelte 5 runes utilities across the Primebrick frontend.',
      },
      {
        author: 'Eric Fennis',
        handle: '@lucide-icons',
        project: 'Lucide',
        version: '1',
        package: '@lucide/svelte',
        url: 'https://lucide.dev',
        usage: 'Over 100 icons used throughout the Primebrick frontend — every toolbar, every menu, every button.',
        icon: ic(siLucide),
      },
      {
        author: 'The Simple Icons collaborators',
        handle: '@simple-icons',
        project: 'simple-icons',
        version: '16',
        package: 'simple-icons',
        url: 'https://simpleicons.org',
        usage: 'Brand SVG logos on this website — and the very icons on this Thank You page.',
        icon: ic(siSimpleicons),
      },
      {
        author: 'The Fontsource team',
        handle: '@fontsource',
        project: 'Fontsource — Inter',
        version: '5',
        package: '@fontsource-variable/inter',
        url: 'https://fontsource.org',
        usage: 'The Inter variable font, self-hosted in the Primebrick frontend.',
      },
      {
        author: 'Panayiotis Lipiridis',
        handle: '@lipis',
        project: 'flag-icons',
        version: '7',
        package: 'flag-icons',
        url: 'https://flagicons.lipis.dev',
        usage: 'Country flags in the Primebrick frontend language selector.',
      },
      {
        author: 'Luke Edwards',
        handle: '@lukeed',
        project: 'clsx',
        version: '2',
        package: 'clsx',
        url: 'https://github.com/lukeed/clsx',
        usage: 'Conditional class names — the backbone of the frontend\'s cn() utility.',
      },
      {
        author: 'Dany Castillo',
        handle: '@dcastil',
        project: 'tailwind-merge',
        version: '3',
        package: 'tailwind-merge',
        url: 'https://github.com/dcastilho/tailwind-merge',
        usage: 'Intelligently merges Tailwind classes in the frontend\'s cn() utility — no conflicting styles.',
      },
    ],
  },
  {
    id: 'data',
    titleKey: 'sectionData',
    items: [
      {
        author: 'Brian Carlson & the node-postgres team',
        handle: '@brianc',
        project: 'PostgreSQL — node-postgres',
        version: '8',
        package: 'pg',
        url: 'https://node-postgres.com',
        usage: 'The database driver across the backend, DAL, SDK, and microservices — every query, every migration.',
        icon: ic(siPostgresql),
      },
      {
        author: 'The Redis team',
        handle: '@redis',
        project: 'Redis',
        version: '6',
        package: 'redis',
        url: 'https://redis.io',
        usage: 'Distributed caching and real-time presence tracking for collaboration features.',
        icon: ic(siRedis),
      },
      {
        author: 'Derek Collison & Synadia — CNCF',
        handle: '@nats-io',
        project: 'NATS',
        version: '2',
        package: 'nats',
        url: 'https://nats.io',
        usage: 'Inter-service messaging — microservices subscribe and publish, the backend coordinates.',
        icon: ic(siNatsdotio),
      },
    ],
  },
  {
    id: 'auth',
    titleKey: 'sectionAuth',
    items: [
      {
        author: 'Yang Luo & the Casdoor team',
        handle: '@casdoor',
        project: 'Casdoor',
        version: '1',
        package: 'casdoor-nodejs-sdk',
        url: 'https://casdoor.org',
        usage: 'Identity & access management — users, organizations, roles, the whole auth layer.',
      },
      {
        author: 'Filip Skokan',
        handle: '@panva',
        project: 'jose',
        version: '6',
        package: 'jose',
        url: 'https://github.com/panva/jose',
        usage: 'JWT signing & verification for MFA challenge tokens (backend) and OIDC access token verification (SDK).',
      },
      {
        author: 'The zxcvbn-ts team',
        handle: '@zxcvbn-ts',
        project: 'zxcvbn-ts',
        version: '4',
        package: '@zxcvbn-ts/core',
        url: 'https://github.com/zxcvbn-ts/zxcvbn-ts',
        usage: 'Password strength estimation in the Primebrick frontend — the meter you see when choosing a password.',
      },
    ],
  },
  {
    id: 'ai',
    titleKey: 'sectionAi',
    items: [
      {
        author: 'Vercel — the AI SDK team',
        handle: '@vercel',
        project: 'Vercel AI SDK',
        version: '7',
        package: 'ai',
        url: 'https://sdk.vercel.ai',
        usage: 'AI streaming responses, tool calling, and message handling in the Primebrick AI microservice.',
        icon: ic(siVercel),
      },
      {
        author: 'Anthropic',
        handle: '@modelcontextprotocol',
        project: 'Model Context Protocol',
        version: '2',
        package: '@modelcontextprotocol/server',
        url: 'https://modelcontextprotocol.io',
        usage: 'The open standard that lets the AI microservice discover and call backend tools.',
        icon: ic(siAnthropic),
      },
      {
        author: 'Hugging Face — Xenova',
        handle: '@huggingface',
        project: 'Transformers.js',
        version: '4',
        package: '@huggingface/transformers',
        url: 'https://huggingface.co/docs/transformers.js',
        usage: 'Runs embedding models in-browser/Node to generate RAG vectors for the AI knowledge base.',
        icon: ic(siHuggingface),
      },
    ],
  },
  {
    id: 'docs',
    titleKey: 'sectionDocs',
    items: [
      {
        author: 'The Mermaid team',
        handle: '@mermaid-js',
        project: 'Mermaid',
        version: '11',
        package: 'mermaid',
        url: 'https://mermaid.js.org',
        usage: 'Architecture diagrams in the Primebrick documentation — text-to-diagram, no image editing.',
        icon: ic(siMermaid),
      },
      {
        author: 'Pine Wu',
        handle: '@shikijs',
        project: 'Shiki',
        version: '4',
        package: 'shiki',
        url: 'https://shiki.style',
        usage: 'Syntax-highlighted code blocks in the docs and JSON error display in the frontend.',
      },
      {
        author: 'The TypeStrong community',
        handle: '@TypeStrong',
        project: 'TypeDoc',
        version: '0',
        package: 'typedoc',
        url: 'https://typedoc.org',
        usage: 'Generates API reference documentation for the Primebrick SDK and DAL libraries.',
      },
      {
        author: 'Bartek Pampuch',
        handle: '@bpampuch',
        project: 'pdfmake',
        version: '0',
        package: 'pdfmake',
        url: 'https://pdfmake.org',
        usage: 'Generates VPAT 2.5 accessibility compliance PDFs for the documentation site.',
      },
    ],
  },
  {
    id: 'export',
    titleKey: 'sectionExport',
    items: [
      {
        author: 'The Handlebars team',
        handle: '@handlebars-lang',
        project: 'Handlebars',
        version: '4',
        package: 'handlebars',
        url: 'https://handlebarsjs.com',
        usage: 'Renders email templates in the Primebrick microservices and HTML export templates in the backend.',
        icon: ic(siHandlebarsdotjs),
      },
      {
        author: 'The ExcelJS team',
        handle: '@exceljs',
        project: 'ExcelJS',
        version: '4',
        package: 'exceljs',
        url: 'https://github.com/exceljs/exceljs',
        usage: 'Streaming Excel/CSV export in the Primebrick backend — template-based, memory-efficient.',
      },
      {
        author: 'Erik Koopmans',
        handle: '@eKoopmans',
        project: 'html2pdf.js',
        version: '0',
        package: 'html2pdf.js',
        url: 'https://github.com/eKoopmans/html2pdf.js',
        usage: 'Client-side table-to-PDF export in the Primebrick frontend.',
      },
    ],
  },
  {
    id: 'testing',
    titleKey: 'sectionTesting',
    items: [
      {
        author: 'Anthony Fu & the Vitest team',
        handle: '@vitest-dev',
        project: 'Vitest',
        version: '4',
        package: 'vitest',
        url: 'https://vitest.dev',
        usage: 'Unit testing across the backend, frontend, SDK, DAL, and microservices.',
        icon: ic(siVitest),
      },
      {
        author: 'Microsoft — the Playwright team',
        handle: '@microsoft',
        project: 'Playwright',
        version: '1',
        package: '@playwright/test',
        url: 'https://playwright.dev',
        usage: 'End-to-end browser testing of the Primebrick frontend.',
      },
      {
        author: 'Deque Systems',
        handle: '@dequelabs',
        project: 'axe-core',
        version: '4',
        package: 'axe-core',
        url: 'https://www.deque.com/axe',
        usage: 'Automated WCAG 2.2 accessibility auditing — the axe audit script that keeps the frontend inclusive.',
      },
      {
        author: 'Kent C. Dodds & the Testing Library team',
        handle: '@testing-library',
        project: 'Testing Library',
        version: '5',
        package: '@testing-library/svelte',
        url: 'https://testing-library.com',
        usage: 'Component testing for the Primebrick frontend — test the way users use it.',
        icon: ic(siTestinglibrary),
      },
    ],
  },
  {
    id: 'utilities',
    titleKey: 'sectionUtilities',
    items: [
      {
        author: 'Colin McDonnell',
        handle: '@colinhacks',
        project: 'Zod',
        version: '4',
        package: 'zod',
        url: 'https://zod.dev',
        usage: 'Schema validation across the backend (request validation) and frontend (form validation with superforms).',
        icon: ic(siZod),
      },
      {
        author: 'Ron Buckton',
        handle: '@rbuckton',
        project: 'reflect-metadata',
        version: '0',
        package: 'reflect-metadata',
        url: 'https://www.npmjs.com/package/reflect-metadata',
        usage: 'Powers the @Entity, @Column, @Key decorators in the DAL and SDK — runtime metadata for the entity system.',
      },
      {
        author: 'Scott Motte',
        handle: '@motdotla',
        project: 'dotenv',
        version: '17',
        package: 'dotenv',
        url: 'https://github.com/motdotla/dotenv',
        usage: 'Loads environment variables in the Primebrick backend and its scripts.',
        icon: ic(siDotenv),
      },
      {
        author: 'Lovell Fuller',
        handle: '@lovell',
        project: 'sharp',
        version: '0',
        package: 'sharp',
        url: 'https://sharp.pixelplumbing.com',
        usage: 'High-performance image optimization at build time for this website.',
        icon: ic(siSharp),
      },
      {
        author: 'Andreas Söderlund',
        handle: '@ciscoheat',
        project: 'sveltekit-superforms',
        version: '2',
        package: 'sveltekit-superforms',
        url: 'https://superforms.rocks',
        usage: 'Type-safe form handling in the Primebrick frontend — login, profile, and settings forms.',
      },
      {
        author: 'Robert Soriano',
        handle: '@wobsoriano',
        project: 'svelte-sonner',
        version: '1',
        package: 'svelte-sonner',
        url: 'https://github.com/wobsoriano/svelte-sonner',
        usage: 'Toast notifications across the Primebrick frontend.',
      },
      {
        author: 'The humanspeak team',
        handle: '@humanspeak',
        project: 'svelte-motion',
        version: '0',
        package: 'svelte-motion',
        url: 'https://github.com/humanspeak/svelte-motion',
        usage: 'Spring-physics animations for the dock in the Primebrick frontend.',
      },
      {
        author: 'Microsoft Azure team',
        handle: '@Azure',
        project: '@microsoft/fetch-event-source',
        version: '2',
        package: '@microsoft/fetch-event-source',
        url: 'https://github.com/microsoft/fetch-event-source',
        usage: 'Server-Sent Events for AI chat streaming and real-time service status in the frontend.',
      },
    ],
  },
];

/**
 * Flat list of author / org names used by the gratitude marquee at the
 * bottom of the page. Kept short and iconic.
 */
export const MARQUEE_NAMES: string[] = [
  'Microsoft',
  'OpenJS Foundation',
  'Jarred Sumner',
  'The Astro Team',
  'Rich Harris',
  'Zuplo',
  'Evan You',
  'Zoltan Kochan',
  'Adam Wathan',
  'shadcn',
  'Hunter Johnston',
  'Eric Fennis',
  'Luke Edwards',
  'Dany Castillo',
  'Brian Carlson',
  'The Redis team',
  'Derek Collison',
  'Yang Luo',
  'Filip Skokan',
  'Vercel',
  'Anthropic',
  'Hugging Face',
  'Colin McDonnell',
  'Pine Wu',
  'Anthony Fu',
  'Deque Systems',
  'Kent C. Dodds',
  'Lovell Fuller',
  'Andreas Söderlund',
  'Erik Koopmans',
  'Bartek Pampuch',
  'Ron Buckton',
  'Panayiotis Lipiridis',
  'The Simple Icons collaborators',
  'The Fontsource team',
  'The zxcvbn-ts team',
  'The Handlebars team',
  'The ExcelJS team',
  'The TypeStrong community',
  'The Mermaid team',
  'Open Source Initiative',
];
