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
  /** npm package name, if applicable. */
  package?: string;
  /** Canonical homepage — only well-known URLs, never guessed. */
  url: string;
  /** What it is ACTUALLY used for in Primebrick (empirically verified). */
  usage: string;
  /** Optional brand icon from simple-icons. */
  icon?: SimpleIcon;
};

export type CreditSection = {
  id: string;
  /** Key into the localized `thankyou.section*` labels. */
  titleKey: string;
  items: Credit[];
};

const ic = (i: { path: string; hex: string }): SimpleIcon => ({
  path: i.path,
  hex: i.hex,
});

export const CREDITS: CreditSection[] = [
  {
    id: 'foundation',
    titleKey: 'sectionFoundation',
    items: [
      {
        author: 'Microsoft — Anders Hejlsberg & the TS team',
        handle: '@Microsoft',
        project: 'TypeScript',
        package: 'typescript',
        url: 'https://www.typescriptlang.org',
        usage: 'The language every Primebrick repo is written in — backend, frontend, SDK, DAL, microservices, docs, and this website.',
        icon: ic(siTypescript),
      },
      {
        author: 'OpenJS Foundation & Node.js collaborators',
        handle: '@nodejs',
        project: 'Node.js',
        url: 'https://nodejs.org',
        usage: 'Runs the Primebrick backend, SDK, DAL, and all build scripts.',
        icon: ic(siNodedotjs),
      },
      {
        author: 'Jarred Sumner',
        handle: '@oven-sh',
        project: 'Bun',
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
        package: 'astro',
        url: 'https://astro.build',
        usage: 'Powers primebrick.dev — this very website you are looking at.',
        icon: ic(siAstro),
      },
      {
        author: 'Rich Harris & the Svelte team',
        handle: '@sveltejs',
        project: 'Svelte & SvelteKit',
        package: 'svelte',
        url: 'https://svelte.dev',
        usage: 'Powers the Primebrick admin frontend and the interactive islands on this website.',
        icon: ic(siSvelte),
      },
      {
        author: 'OpenJS Foundation — Express TC',
        handle: '@expressjs',
        project: 'Express',
        package: 'express',
        url: 'https://expressjs.com',
        usage: 'The Primebrick backend HTTP server — every API route, every middleware.',
        icon: ic(siExpress),
      },
      {
        author: 'Zuplo',
        handle: '@zuplo',
        project: 'Zudoku',
        package: 'zudoku',
        url: 'https://zudoku.dev',
        usage: 'Powers docs.primebrick.dev — the API catalog, navigation, and MDX documentation.',
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
        package: 'vite',
        url: 'https://vitejs.dev',
        usage: 'Build tool behind Astro, SvelteKit, and every TypeScript repo in the workspace.',
        icon: ic(siVite),
      },
      {
        author: 'Zoltan Kochan',
        handle: '@pnpm',
        project: 'pnpm',
        url: 'https://pnpm.io',
        usage: 'Package manager for the entire Primebrick workspace — fast, disk-efficient, workspace-aware.',
        icon: ic(siPnpm),
      },
      {
        author: 'Nicholas C. Zakas & the ESLint team',
        handle: '@eslint',
        project: 'ESLint',
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
        package: 'tailwindcss',
        url: 'https://tailwindcss.com',
        usage: 'Styling across the Primebrick frontend and this website — every color, every layout.',
        icon: ic(siTailwindcss),
      },
      {
        author: 'shadcn',
        handle: '@shadcn',
        project: 'shadcn/ui',
        url: 'https://ui.shadcn.com',
        usage: 'The component system vendored into the Primebrick frontend — buttons, dialogs, command palettes, and more.',
        icon: ic(siShadcnui),
      },
      {
        author: 'Hunter Johnston',
        handle: '@huntabyte',
        project: 'bits-ui',
        package: 'bits-ui',
        url: 'https://bits-ui.com',
        usage: 'The unstyled Svelte primitives beneath every shadcn-svelte component — accessible, headless, rock-solid.',
      },
      {
        author: 'Hunter Johnston & the Svecosystem team',
        handle: '@svecosystem',
        project: 'formsnap · paneforge · runed',
        url: 'https://www.svecosystem.dev',
        usage: 'Accessible form components, resizable panels, and Svelte 5 runes utilities across the Primebrick frontend.',
      },
      {
        author: 'Eric Fennis',
        handle: '@lucide-icons',
        project: 'Lucide',
        package: '@lucide/svelte',
        url: 'https://lucide.dev',
        usage: 'Over 100 icons used throughout the Primebrick frontend — every toolbar, every menu, every button.',
        icon: ic(siLucide),
      },
      {
        author: 'The Simple Icons collaborators',
        handle: '@simple-icons',
        project: 'simple-icons',
        package: 'simple-icons',
        url: 'https://simpleicons.org',
        usage: 'Brand SVG logos on this website — and the very icons on this Thank You page.',
        icon: ic(siSimpleicons),
      },
      {
        author: 'The Fontsource team',
        handle: '@fontsource',
        project: 'Fontsource — Inter',
        package: '@fontsource-variable/inter',
        url: 'https://fontsource.org',
        usage: 'The Inter variable font, self-hosted in the Primebrick frontend.',
      },
      {
        author: 'Panayiotis Lipiridis',
        handle: '@lipis',
        project: 'flag-icons',
        package: 'flag-icons',
        url: 'https://flagicons.lipis.dev',
        usage: 'Country flags in the Primebrick frontend language selector.',
      },
      {
        author: 'Luke Edwards',
        handle: '@lukeed',
        project: 'clsx',
        package: 'clsx',
        url: 'https://github.com/lukeed/clsx',
        usage: 'Conditional class names — the backbone of the frontend\'s cn() utility.',
      },
      {
        author: 'Dany Castillo',
        handle: '@dcastil',
        project: 'tailwind-merge',
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
        package: 'pg',
        url: 'https://node-postgres.com',
        usage: 'The database driver across the backend, DAL, SDK, and microservices — every query, every migration.',
        icon: ic(siPostgresql),
      },
      {
        author: 'The Redis team',
        handle: '@redis',
        project: 'Redis',
        package: 'redis',
        url: 'https://redis.io',
        usage: 'Distributed caching and real-time presence tracking for collaboration features.',
        icon: ic(siRedis),
      },
      {
        author: 'Derek Collison & Synadia — CNCF',
        handle: '@nats-io',
        project: 'NATS',
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
        package: 'casdoor-nodejs-sdk',
        url: 'https://casdoor.org',
        usage: 'Identity & access management — users, organizations, roles, the whole auth layer.',
      },
      {
        author: 'Filip Skokan',
        handle: '@panva',
        project: 'jose',
        package: 'jose',
        url: 'https://github.com/panva/jose',
        usage: 'JWT signing & verification for MFA challenge tokens (backend) and OIDC access token verification (SDK).',
      },
      {
        author: 'The zxcvbn-ts team',
        handle: '@zxcvbn-ts',
        project: 'zxcvbn-ts',
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
        package: 'ai',
        url: 'https://sdk.vercel.ai',
        usage: 'AI streaming responses, tool calling, and message handling in the Primebrick AI microservice.',
        icon: ic(siVercel),
      },
      {
        author: 'Anthropic',
        handle: '@modelcontextprotocol',
        project: 'Model Context Protocol',
        package: '@modelcontextprotocol/server',
        url: 'https://modelcontextprotocol.io',
        usage: 'The open standard that lets the AI microservice discover and call backend tools.',
        icon: ic(siAnthropic),
      },
      {
        author: 'Hugging Face — Xenova',
        handle: '@huggingface',
        project: 'Transformers.js',
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
        package: 'mermaid',
        url: 'https://mermaid.js.org',
        usage: 'Architecture diagrams in the Primebrick documentation — text-to-diagram, no image editing.',
        icon: ic(siMermaid),
      },
      {
        author: 'Pine Wu',
        handle: '@shikijs',
        project: 'Shiki',
        package: 'shiki',
        url: 'https://shiki.style',
        usage: 'Syntax-highlighted code blocks in the docs and JSON error display in the frontend.',
      },
      {
        author: 'The TypeStrong community',
        handle: '@TypeStrong',
        project: 'TypeDoc',
        package: 'typedoc',
        url: 'https://typedoc.org',
        usage: 'Generates API reference documentation for the Primebrick SDK and DAL libraries.',
      },
      {
        author: 'Bartek Pampuch',
        handle: '@bpampuch',
        project: 'pdfmake',
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
        package: 'handlebars',
        url: 'https://handlebarsjs.com',
        usage: 'Renders email templates in the Primebrick microservices and HTML export templates in the backend.',
        icon: ic(siHandlebarsdotjs),
      },
      {
        author: 'The ExcelJS team',
        handle: '@exceljs',
        project: 'ExcelJS',
        package: 'exceljs',
        url: 'https://github.com/exceljs/exceljs',
        usage: 'Streaming Excel/CSV export in the Primebrick backend — template-based, memory-efficient.',
      },
      {
        author: 'Erik Koopmans',
        handle: '@eKoopmans',
        project: 'html2pdf.js',
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
        package: 'vitest',
        url: 'https://vitest.dev',
        usage: 'Unit testing across the backend, frontend, SDK, DAL, and microservices.',
        icon: ic(siVitest),
      },
      {
        author: 'Microsoft — the Playwright team',
        handle: '@microsoft',
        project: 'Playwright',
        package: '@playwright/test',
        url: 'https://playwright.dev',
        usage: 'End-to-end browser testing of the Primebrick frontend.',
      },
      {
        author: 'Deque Systems',
        handle: '@dequelabs',
        project: 'axe-core',
        package: 'axe-core',
        url: 'https://www.deque.com/axe',
        usage: 'Automated WCAG 2.2 accessibility auditing — the axe audit script that keeps the frontend inclusive.',
      },
      {
        author: 'Kent C. Dodds & the Testing Library team',
        handle: '@testing-library',
        project: 'Testing Library',
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
        package: 'zod',
        url: 'https://zod.dev',
        usage: 'Schema validation across the backend (request validation) and frontend (form validation with superforms).',
        icon: ic(siZod),
      },
      {
        author: 'Ron Buckton',
        handle: '@rbuckton',
        project: 'reflect-metadata',
        package: 'reflect-metadata',
        url: 'https://www.npmjs.com/package/reflect-metadata',
        usage: 'Powers the @Entity, @Column, @Key decorators in the DAL and SDK — runtime metadata for the entity system.',
      },
      {
        author: 'Scott Motte',
        handle: '@motdotla',
        project: 'dotenv',
        package: 'dotenv',
        url: 'https://github.com/motdotla/dotenv',
        usage: 'Loads environment variables in the Primebrick backend and its scripts.',
        icon: ic(siDotenv),
      },
      {
        author: 'Lovell Fuller',
        handle: '@lovell',
        project: 'sharp',
        package: 'sharp',
        url: 'https://sharp.pixelplumbing.com',
        usage: 'High-performance image optimization at build time for this website.',
        icon: ic(siSharp),
      },
      {
        author: 'Andreas Söderlund',
        handle: '@ciscoheat',
        project: 'sveltekit-superforms',
        package: 'sveltekit-superforms',
        url: 'https://superforms.rocks',
        usage: 'Type-safe form handling in the Primebrick frontend — login, profile, and settings forms.',
      },
      {
        author: 'Robert Soriano',
        handle: '@wobsoriano',
        project: 'svelte-sonner',
        package: 'svelte-sonner',
        url: 'https://github.com/wobsoriano/svelte-sonner',
        usage: 'Toast notifications across the Primebrick frontend.',
      },
      {
        author: 'The humanspeak team',
        handle: '@humanspeak',
        project: 'svelte-motion',
        package: 'svelte-motion',
        url: 'https://github.com/humanspeak/svelte-motion',
        usage: 'Spring-physics animations for the dock in the Primebrick frontend.',
      },
      {
        author: 'Microsoft Azure team',
        handle: '@Azure',
        project: '@microsoft/fetch-event-source',
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
