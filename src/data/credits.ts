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
  siKimi,
} from 'simple-icons';

export type SimpleIcon = {
  path: string;
  hex: string;
  viewBox?: string;
  /** Optional background rect fill — for icons like Fontsource that have
   *  a colored rounded-square background behind the foreground path. */
  bgFill?: string;
  /** Optional multi-path override for icons like Shiki that have multiple
   *  colored shapes. When present, `path`/`hex` are ignored. */
  paths?: { d: string; fill: string }[];
};

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

/** Custom brand icon for bits-ui (not in simple-icons).
 *  Icon mark extracted from the official bits-ui logo SVG. */
const BITS_UI_ICON: SimpleIcon = {
  path: 'M13.8889 13.8889H25V22.2222H13.8889V13.8889ZM36.1111 36.1111V27.7778H13.8889V36.1111H36.1111ZM38.8889 0H0V50H50V13.8889H38.8889V0ZM8.33333 41.6667V8.33333H30.5556V22.2222H41.6667V41.6667H8.33333Z',
  hex: '91AEBB',
  viewBox: '0 0 50 50',
};

/** Custom brand icon for the Svecosystem (formsnap · paneforge · runed).
 *  Uses the runed icon mark — a rounded square with an "R" — from the
 *  official runed repo logo SVG. */
const SVECOSYSTEM_ICON: SimpleIcon = {
  path: 'M22.7164 0C10.1705 0 0 10.1705 0 22.7164V98.79C0 111.335 10.1705 121.506 22.7164 121.506H98.79C111.336 121.506 121.506 111.335 121.506 98.79V22.7164C121.506 10.1705 111.336 0 98.79 0H22.7164ZM48.6384 19.836L77.9001 36.4316C79.4403 37.3047 80.4152 38.9127 80.4836 40.6741C80.5516 42.4418 79.7121 44.1115 78.2399 45.1044L53.5554 61.7486L79.384 94.0559L79.388 94.0609C81.1205 96.252 80.7921 99.452 78.5787 101.22C77.6326 101.977 76.4988 102.335 75.3938 102.335C73.8991 102.335 72.4162 101.684 71.4057 100.417L51.2228 75.1658V97.0981C51.2228 99.9185 48.943 102.198 46.1222 102.198C43.3013 102.198 41.0215 99.9185 41.0215 97.0981V24.2708C41.0215 22.4643 41.9759 20.7814 43.5563 19.867C45.1369 18.9433 47.0699 18.9494 48.6353 19.8343L48.6384 19.836ZM51.2228 51.0277V33.0234L65.7205 41.2511L51.2228 51.0277Z',
  hex: 'EC4F27',
  viewBox: '0 0 122 122',
};

/** Custom brand icon for Fontsource — a purple rounded square with a
 *  white "F" letter mark. Extracted from the official fontsource repo
 *  icon.svg. Uses bgFill for the colored background rect. */
const FONTSOURCE_ICON: SimpleIcon = {
  path: 'M11.7 7.2H20.1L22.5 7.2V12.6H20.1V9.6L11.7 9.6V13.8L17.1 13.8V16.2H11.7V20.4H13.5V22.8H11.7H9.3L7.5 22.8V20.4H9.3V16.2H7.5V13.8H9.3V9.6H7.5V7.2L9.3 7.2H11.7Z',
  hex: 'FFFFFF',
  viewBox: '0 0 30 30',
  bgFill: '625BF8',
};

/** Custom brand icon for tailwind-merge — a stylized wave pattern in
 *  indigo. Extracted from the official tailwind-merge repo logo.svg. */
const TAILWIND_MERGE_ICON: SimpleIcon = {
  path: 'M27 0C19.8 0 15.3 3.6 13.5 10.8C16.2 7.2 19.35 5.85 22.95 6.75C25.004 7.263 26.472 8.754 28.097 10.403C30.744 13.09 33.808 16.2 40.5 16.2C47.7 16.2 52.2 12.6 54 5.4C51.3 9 48.15 10.35 44.55 9.45C42.496 8.937 41.028 7.446 39.403 5.797C36.756 3.11 33.692 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27C2.7 23.4 5.85 22.05 9.45 22.95C11.504 23.464 12.972 24.954 14.597 26.603C17.244 29.29 20.308 32.4 27 32.4C34.2 32.4 38.7 28.8 40.5 21.6C37.8 25.2 34.65 26.55 31.05 25.65C28.996 25.137 27.528 23.646 25.903 21.997C23.256 19.31 20.192 16.2 13.5 16.2Z',
  hex: '6366F1',
  viewBox: '0 0 66 45',
};

/** Custom icon for flag-icons — the project has no brand logo (it's a
 *  collection of country flag SVGs), so we use a simple flag-on-pole
 *  icon in a blue tone to represent the concept. */
const FLAG_ICONS_ICON: SimpleIcon = {
  path: 'M5 2V22M5 2H17L14 7L17 12H5',
  hex: '3B82F6',
  viewBox: '0 0 24 24',
};

/** Custom brand icon for Shiki — a multi-color composition with a pink
 *  circle, green band, teal "S" letter, and yellow side bar. Extracted
 *  from the official shiki repo logo.svg. */
const SHIKI_ICON: SimpleIcon = {
  path: '',
  hex: '83D0DA',
  viewBox: '0 0 266 266',
  paths: [
    { d: 'M219.5 0a46.5 46.5 0 1 0 0 93 46.5 46.5 0 0 0 0-93Z', fill: 'CB7676' },
    { d: 'M0 48h266v65H0z', fill: '4B9978' },
    { d: 'M109.463 144.426C109.012 138.792 106.899 134.397 103.124 131.242C99.4052 128.086 93.7426 126.509 86.1361 126.509C81.2905 126.509 77.3182 127.1 74.2192 128.284C71.1766 129.411 68.9228 130.96 67.4579 132.932C65.9929 134.904 65.2323 137.158 65.1759 139.693C65.0632 141.778 65.4295 143.666 66.2747 145.356C67.1762 146.99 68.5848 148.483 70.5005 149.835C72.4162 151.131 74.8672 152.315 77.8535 153.385C80.8397 154.456 84.3894 155.414 88.5026 156.259L102.701 159.301C112.28 161.33 120.478 164.006 127.296 167.33C134.113 170.655 139.692 174.571 144.03 179.078C148.369 183.529 151.552 188.544 153.58 194.122C155.665 199.7 156.736 205.785 156.792 212.378C156.736 223.759 153.89 233.394 148.256 241.283C142.621 249.171 134.564 255.171 124.084 259.285C113.66 263.398 101.124 265.454 86.4742 265.454C71.4302 265.454 58.3019 263.229 47.0893 258.778C35.9331 254.326 27.2561 247.48 21.0582 238.24C14.9166 228.943 11.8177 217.054 11.7613 202.574H56.3862C56.6679 207.87 57.992 212.321 60.3585 215.928C62.725 219.534 66.0493 222.266 70.3315 224.126C74.67 225.985 79.8255 226.915 85.798 226.915C90.8127 226.915 95.0104 226.295 98.391 225.055C101.772 223.816 104.335 222.097 106.082 219.9C107.829 217.702 108.73 215.195 108.787 212.378C108.73 209.73 107.857 207.419 106.167 205.447C104.533 203.419 101.828 201.616 98.053 200.038C94.2779 198.404 89.1787 196.883 82.7554 195.474L65.514 191.756C50.1883 188.431 38.1024 182.881 29.2563 175.106C20.4666 167.274 16.0999 156.597 16.1562 143.074C16.0999 132.087 19.0298 122.48 24.946 114.254C30.9185 105.971 39.1729 99.5197 49.7094 94.8995C60.3021 90.2793 72.4444 87.9691 86.1361 87.9691C100.11 87.9691 112.195 90.3074 122.394 94.984C132.592 99.6606 140.452 106.253 145.974 114.761C151.552 123.213 154.369 133.101 154.426 144.426H109.463Z', fill: '83D0DA' },
    { d: 'M217 0h49v266h-49z', fill: 'E6CC78' },
  ],
};

/** Custom icon for TypeDoc — a document with "TS" lettering in
 *  TypeScript blue. TypeDoc has no brand logo of its own. */
const TYPEDOC_ICON: SimpleIcon = {
  path: 'M6 2h8l4 4v16H6V2Zm8 0v4h4',
  hex: '3178C6',
  viewBox: '0 0 24 24',
};

/** Custom icon for pdfmake — a document with folded corner in PDF red.
 *  pdfmake has no brand logo of its own. */
const PDFMAKE_ICON: SimpleIcon = {
  path: 'M6 2h8l4 4v16H6V2Zm8 0v4h4M9 13h6M9 16h6M9 19h4',
  hex: 'E5322D',
  viewBox: '0 0 24 24',
};

/** Custom icon for Casdoor — a shield with keyhole representing IAM.
 *  Casdoor has no SVG logo (only PNG favicons). */
const CASDOOR_ICON: SimpleIcon = {
  path: 'M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Zm0 5a3 3 0 0 1 1.5 5.6V15h-3v-2.4A3 3 0 0 1 12 7Z',
  hex: '3B82F6',
  viewBox: '0 0 24 24',
};

/** Custom icon for jose — a seal/badge representing JWT signing.
 *  jose has no brand logo at all. */
const JOSE_ICON: SimpleIcon = {
  path: 'M12 2l3 6 6 .5-4.5 4 1.5 6L12 15l-6 3.5 1.5-6L3 8.5 9 8l3-6Z',
  hex: 'F59E0B',
  viewBox: '0 0 24 24',
};

/** Custom icon for zxcvbn-ts — a password strength meter with bars
 *  going from short to tall. zxcvbn-ts has no brand logo. */
const ZXCVBN_ICON: SimpleIcon = {
  path: 'M3 17h3v3H3v-3Zm5-4h3v7H8v-7Zm5-4h3v11h-3V9Zm5-5h3v16h-3V4Z',
  hex: '22C55E',
  viewBox: '0 0 24 24',
};

/** Custom icon for node-postgres — a database cylinder with a connection
 *  line, in teal to distinguish it from PostgreSQL's blue. */
const NODE_POSTGRES_ICON: SimpleIcon = {
  path: 'M12 3C7 3 4 4.8 4 7v10c0 2.2 3 4 8 4s8-1.8 8-4V7c0-2.2-3-4-8-4Zm0 2c3.3 0 6 1.1 6 2s-2.7 2-6 2-6-1.1-6-2 2.7-2 6-2Z',
  hex: '14B8A6',
  viewBox: '0 0 24 24',
};

/** Custom icon for exceljs — a spreadsheet grid. exceljs has no logo. */
const EXCELJS_ICON: SimpleIcon = {
  path: 'M4 3h16v18H4V3Zm0 4h16M4 14h16M10 3v18M4 11h16M4 18h16',
  hex: '217346',
  viewBox: '0 0 24 24',
};

/** Custom icon for html2pdf.js — a document converting to PDF.
 *  html2pdf.js has no logo. */
const HTML2PDF_ICON: SimpleIcon = {
  path: 'M6 2h8l4 4v16H6V2Zm8 0v4h4M9 14l3 3 3-3M12 10v7',
  hex: '6366F1',
  viewBox: '0 0 24 24',
};

/** Custom icon for axe-core — an accessibility person-in-circle.
 *  axe-core has no logo. */
const AXE_CORE_ICON: SimpleIcon = {
  path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm3 12H9v-1.5h2v-4H9V11h4v5.5h2V18Z',
  hex: '0054A6',
  viewBox: '0 0 24 24',
};

/** Custom icon for Playwright — simplified comedy/tragedy theater masks.
 *  The official logo is too complex (monitor + masks + transforms), so we
 *  use a simplified two-mask representation in the brand colors. */
const PLAYWRIGHT_ICON: SimpleIcon = {
  path: '',
  hex: '2EAD33',
  viewBox: '0 0 24 24',
  paths: [
    { d: 'M9 4C6 4 4 6 4 9c0 3 2 5 5 5s5-2 5-5c0-3-2-5-5-5Zm-1.5 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM9 11c-1 0-2 .5-2 1h4c0-.5-1-1-2-1Z', fill: '2EAD33' },
    { d: 'M15 10c-3 0-5 2-5 5s2 5 5 5 5-2 5-5c0-3-2-5-5-5Zm-1.5 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM15 17c-1 0-2-.5-2-1h4c0 .5-1 1-2 1Z', fill: 'D65348' },
  ],
};

/** Custom icon for reflect-metadata — a metadata/annotation tag shape.
 *  reflect-metadata has no logo. */
const REFLECT_METADATA_ICON: SimpleIcon = {
  path: 'M12 2L2 7v10l10 5 10-5V7L12 2Zm0 2.5L19.5 8 12 11.5 4.5 8 12 4.5Z',
  hex: 'DB2777',
  viewBox: '0 0 24 24',
};

/** Custom brand icon for sveltekit-superforms — a shield/diamond shape
 *  in gold. Extracted from the official superforms logo.svg (simplified
 *  to the outer diamond outline). */
const SUPERFORMS_ICON: SimpleIcon = {
  path: 'M12 2L3 8.5 12 22 21 8.5 12 2Zm0 3L17.5 9 12 18 6.5 9 12 5Z',
  hex: 'ECD11C',
  viewBox: '0 0 24 24',
};

/** Custom icon for svelte-sonner — a toast notification bell.
 *  svelte-sonner has no logo (only toast UI icons). */
const SVELTE_SONNER_ICON: SimpleIcon = {
  path: 'M12 2a6 6 0 0 0-6 6v4l-2 3h16l-2-3V8a6 6 0 0 0-6-6Zm0 18a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z',
  hex: 'F97316',
  viewBox: '0 0 24 24',
};

/** Custom brand icon for svelte-motion — a teal rounded square with a
 *  white bezier curve and dots. Extracted from the official svelte-motion
 *  logo.svg. The stroke-based curve is converted to a filled approximation. */
const SVELTE_MOTION_ICON: SimpleIcon = {
  path: 'M4 14C6 8 9 8 11 11s5 4 7-2',
  hex: 'FFFFFF',
  viewBox: '0 0 24 24',
  bgFill: '3DBBA0',
};

/** Custom icon for @microsoft/fetch-event-source — a broadcast/signal
 *  waves icon. fetch-event-source has no logo. */
const FETCH_EVENT_SOURCE_ICON: SimpleIcon = {
  path: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-4a7 7 0 0 1 5 2l-1.5 1.5A5 5 0 0 0 12 7a5 5 0 0 0-3.5 1.5L7 7a7 7 0 0 1 5-2Zm0 14a7 7 0 0 1-5-2l1.5-1.5A5 5 0 0 0 12 17a5 5 0 0 0 3.5-1.5L17 17a7 7 0 0 1-5 2Z',
  hex: '0078D4',
  viewBox: '0 0 24 24',
};

/** Custom icon for Devin (Cognition) — a spark/asterisk shape in the
 *  Cognition brand blue. Devin has no simple-icons entry. */
const DEVIN_ICON: SimpleIcon = {
  path: 'M12 2L13.5 8.5L20 7L15 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9 12L4 7L10.5 8.5Z',
  hex: '3B82F6',
  viewBox: '0 0 24 24',
};

/** Custom icon for SWE models — a code bracket with a checkmark,
 *  representing software engineering. No brand logo exists. */
const SWE_ICON: SimpleIcon = {
  path: 'M8 6L2 12L8 18M16 6L22 12L16 18M13 4L11 20',
  hex: '8B5CF6',
  viewBox: '0 0 24 24',
};

/** Custom icon for GLM (Zhipu AI) — a hexagonal neural node shape
 *  in Zhipu blue. GLM has no simple-icons entry. */
const GLM_ICON: SimpleIcon = {
  path: 'M12 2L21 7V17L12 22L3 17V7L12 2ZM12 7L16 9.5V14.5L12 17L8 14.5V9.5L12 7Z',
  hex: '4F46E5',
  viewBox: '0 0 24 24',
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
        icon: BITS_UI_ICON,
      },
      {
        author: 'Hunter Johnston & the Svecosystem team',
        handle: '@svecosystem',
        project: 'formsnap · paneforge · runed',
        version: '2',
        url: 'https://www.svecosystem.dev',
        usage: 'Accessible form components, resizable panels, and Svelte 5 runes utilities across the Primebrick frontend.',
        icon: SVECOSYSTEM_ICON,
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
        icon: FONTSOURCE_ICON,
      },
      {
        author: 'Panayiotis Lipiridis',
        handle: '@lipis',
        project: 'flag-icons',
        version: '7',
        package: 'flag-icons',
        url: 'https://flagicons.lipis.dev',
        usage: 'Country flags in the Primebrick frontend language selector.',
        icon: FLAG_ICONS_ICON,
      },
      {
        author: 'Luke Edwards',
        handle: '@lukeed',
        project: 'clsx',
        version: '2',
        package: 'clsx',
        url: 'https://github.com/lukeed/clsx',
        usage: 'Powers the clean, consistent styling you see across the Primebrick frontend.',
      },
      {
        author: 'Dany Castillo',
        handle: '@dcastil',
        project: 'tailwind-merge',
        version: '3',
        package: 'tailwind-merge',
        url: 'https://github.com/dcastil/tailwind-merge',
        usage: 'Keeps the Primebrick frontend styles sharp and conflict-free, every time.',
        icon: TAILWIND_MERGE_ICON,
      },
    ],
  },
  {
    id: 'data',
    titleKey: 'sectionData',
    items: [
      {
        author: 'The PostgreSQL Global Development Group',
        handle: '@postgresql',
        project: 'PostgreSQL',
        version: '17',
        url: 'https://www.postgresql.org',
        usage: 'The world\'s most advanced open-source database — powering every Primebrick query, transaction, and migration.',
        icon: ic(siPostgresql),
      },
      {
        author: 'Brian Carlson & the node-postgres team',
        handle: '@brianc',
        project: 'node-postgres',
        version: '8',
        package: 'pg',
        url: 'https://node-postgres.com',
        usage: 'The driver that connects Primebrick to PostgreSQL — every query, every result, across backend, SDK, and microservices.',
        icon: NODE_POSTGRES_ICON,
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
        icon: CASDOOR_ICON,
      },
      {
        author: 'Filip Skokan',
        handle: '@panva',
        project: 'jose',
        version: '6',
        package: 'jose',
        url: 'https://github.com/panva/jose',
        usage: 'Keeps your login secure — multi-factor authentication and single sign-on, verified every time.',
        icon: JOSE_ICON,
      },
      {
        author: 'The zxcvbn-ts team',
        handle: '@zxcvbn-ts',
        project: 'zxcvbn-ts',
        version: '4',
        package: '@zxcvbn-ts/core',
        url: 'https://github.com/zxcvbn-ts/zxcvbn',
        usage: 'Password strength estimation in the Primebrick frontend — the meter you see when choosing a password.',
        icon: ZXCVBN_ICON,
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
        usage: 'The engine behind Primebrick\'s AI assistant — streaming answers, smart tools, smooth conversations.',
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
        usage: 'Powers Primebrick\'s AI knowledge base — understanding your documents right in the browser.',
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
        usage: 'Beautiful, readable code samples in the Primebrick documentation.',
        icon: SHIKI_ICON,
      },
      {
        author: 'The TypeStrong community',
        handle: '@TypeStrong',
        project: 'TypeDoc',
        version: '0',
        package: 'typedoc',
        url: 'https://typedoc.org',
        usage: 'Generates API reference documentation for the Primebrick SDK and DAL libraries.',
        icon: TYPEDOC_ICON,
      },
      {
        author: 'Bartek Pampuch',
        handle: '@bpampuch',
        project: 'pdfmake',
        version: '0',
        package: 'pdfmake',
        url: 'https://pdfmake.org',
        usage: 'Generates VPAT 2.5 accessibility compliance PDFs for the documentation site.',
        icon: PDFMAKE_ICON,
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
        usage: 'Excel and CSV exports in Primebrick — your data, ready to share in a click.',
        icon: EXCELJS_ICON,
      },
      {
        author: 'Erik Koopmans',
        handle: '@eKoopmans',
        project: 'html2pdf.js',
        version: '0',
        package: 'html2pdf.js',
        url: 'https://github.com/eKoopmans/html2pdf.js',
        usage: 'Client-side table-to-PDF export in the Primebrick frontend.',
        icon: HTML2PDF_ICON,
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
        icon: PLAYWRIGHT_ICON,
      },
      {
        author: 'Deque Systems',
        handle: '@dequelabs',
        project: 'axe-core',
        version: '4',
        package: 'axe-core',
        url: 'https://www.deque.com/axe',
        usage: 'Automated accessibility auditing that keeps Primebrick inclusive for everyone — every release, every screen.',
        icon: AXE_CORE_ICON,
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
        usage: 'Validates every form and request in Primebrick — wrong inputs never reach the server.',
        icon: ic(siZod),
      },
      {
        author: 'Ron Buckton',
        handle: '@rbuckton',
        project: 'reflect-metadata',
        version: '0',
        package: 'reflect-metadata',
        url: 'https://www.npmjs.com/package/reflect-metadata',
        usage: 'The foundation that lets Primebrick map data to databases seamlessly — behind every query and migration.',
        icon: REFLECT_METADATA_ICON,
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
        icon: SUPERFORMS_ICON,
      },
      {
        author: 'Robert Soriano',
        handle: '@wobsoriano',
        project: 'svelte-sonner',
        version: '1',
        package: 'svelte-sonner',
        url: 'https://github.com/wobsoriano/svelte-sonner',
        usage: 'Toast notifications across the Primebrick frontend.',
        icon: SVELTE_SONNER_ICON,
      },
      {
        author: 'The humanspeak team',
        handle: '@humanspeak',
        project: 'svelte-motion',
        version: '0',
        package: 'svelte-motion',
        url: 'https://github.com/humanspeak/svelte-motion',
        usage: 'Spring-physics animations for the dock in the Primebrick frontend.',
        icon: SVELTE_MOTION_ICON,
      },
      {
        author: 'Microsoft Azure team',
        handle: '@Azure',
        project: '@microsoft/fetch-event-source',
        version: '2',
        package: '@microsoft/fetch-event-source',
        url: 'https://github.com/microsoft/fetch-event-source',
        usage: 'The real-time connection behind Primebrick\'s live AI chat and service status updates.',
        icon: FETCH_EVENT_SOURCE_ICON,
      },
    ],
  },
  {
    id: 'ai-agents',
    titleKey: 'sectionAiAgents',
    items: [
      {
        author: 'Cognition',
        handle: '@cognition',
        project: 'Devin',
        version: '',
        url: 'https://devin.ai',
        usage: 'The AI software engineer that paired on architecture, code, and releases across the entire Primebrick v3 codebase.',
        icon: DEVIN_ICON,
      },
      {
        author: 'Cognition & the open SWE community',
        handle: '@cognition',
        project: 'SWE Models',
        version: '',
        url: 'https://www.swe-bench.org',
        usage: 'Software-engineering-tuned models that reviewed diffs, wrote tests, and caught regressions throughout Primebrick development.',
        icon: SWE_ICON,
      },
      {
        author: 'Zhipu AI',
        handle: '@ZhipuAI',
        project: 'GLM 5.2',
        version: '',
        url: 'https://www.zhipuai.cn',
        usage: 'The model that powered countless coding sessions — refactoring, documentation, and the Primebrick website you are reading right now.',
        icon: GLM_ICON,
      },
      {
        author: 'Moonshot AI',
        handle: '@moonshot',
        project: 'Kimi 2.6+',
        version: '',
        url: 'https://kimi.com',
        usage: 'Long-context reasoning that helped design Primebrick\'s multi-repo architecture and cross-service contracts.',
        icon: ic(siKimi),
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
  'Cognition',
  'Zhipu AI',
  'Moonshot AI',
];
