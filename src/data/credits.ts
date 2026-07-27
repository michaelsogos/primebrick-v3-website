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
  siHuggingface,
  siZod,
  siHandlebarsdotjs,
  siMermaid,
  siVitest,
  siTestinglibrary,
  siDotenv,
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
  paths?: { d: string; fill: string; stroke?: string; strokeWidth?: string; fillNone?: boolean }[];
  /** Optional raster image path (WebP/PNG) for logos that cannot be
   *  represented as SVG paths. When present, all other fields are ignored
   *  and the image is rendered inside the icon container. Path is relative
   *  to the site root (e.g. "/icons/casdoor.webp"). */
  imgPath?: string;
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
 *  Full logo extracted from the official bits-ui logo SVG — a circle
 *  (the "bits" dot), the word "bits" as letter paths (b, i, t, s), and
 *  a rounded square containing "ui". The brand color (#91AEBB) is too
 *  muted for dark backgrounds, so we brighten it to #B8CDD8. */
const BITS_UI_ICON: SimpleIcon = {
  path: '',
  hex: 'B8CDD8',
  viewBox: '0 0 87.7 21.4',
  paths: [
    // "s" letter (from "bits")
    { d: 'M58,20c-2.3,0-4.1-0.8-5.6-2.4l2.4-2.2c1,1.1,2,1.7,3.2,1.7c1.2,0,1.9-0.6,1.9-1.4c0-0.7-0.3-1.1-2.5-1.6c-3.6-0.9-4.2-2.5-4.2-4.2c0-2.4,1.9-4.1,5-4.1c2.2,0,3.6,0.5,5,2.3l-2.5,1.9c-0.7-1-1.5-1.5-2.4-1.5c-1,0-1.7,0.4-1.7,1.2c0,0.5,0.2,0.9,1.8,1.3c3.9,1,4.8,2.5,4.8,4.5C63.3,18.1,61,20,58,20z', fill: 'B8CDD8' },
    // "t" letter (from "bits")
    { d: 'M49.3,19.7c-2.7,0-4.1-1.2-4.1-4.2V9.2h-1.9v-3h1.9V3.4l3.5-0.4v3.1h2.9v3h-2.9v6.2c0,0.9,0.4,1.2,1.1,1.2h1.5v3.1H49.3z', fill: 'B8CDD8' },
    // "i" letter (from "bits")
    { d: 'M37.8,19.7V6.2h3.5v13.5H37.8z M37.5,3c0-1.1,0.9-2.1,2.1-2.1c1.2,0,2.1,0.9,2.1,2.1c0,1.2-0.9,2.1-2.1,2.1C38.4,5,37.5,4.1,37.5,3z', fill: 'B8CDD8' },
    // "b" letter (from "bits")
    { d: 'M28.8,20c-2.4,0-3.6-1-4.4-2.5v2.2H21v-19h3.5v7.5c0.7-1.4,2-2.4,4.3-2.4c3.7,0,6.7,3.2,6.7,7.1C35.5,16.9,32.5,20,28.8,20z M24.4,13c0,2.1,1.5,3.9,3.8,3.9c2.2,0,3.7-1.8,3.7-3.9c0-2.1-1.5-3.9-3.7-3.9C25.9,9,24.4,10.9,24.4,13z', fill: 'B8CDD8' },
    // Circle (the "bits" dot)
    { d: 'M5.9 11.7 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0', fill: 'B8CDD8' },
    // Rounded square outline (the "ui" container)
    { d: 'M81,20.4h-7c-2.9,0-5.2-2.4-5.2-5.2v-7c0-2.9,2.4-5.2,5.2-5.2h7c2.9,0,5.2,2.4,5.2,5.2v7C86.2,18,83.9,20.4,81,20.4z M74,4c-2.3,0-4.2,1.9-4.2,4.2v7c0,2.3,1.9,4.2,4.2,4.2h7c2.3,0,4.2-1.9,4.2-4.2v-7C85.1,5.8,83.3,4,81,4H74z', fill: 'B8CDD8' },
    // "u" + "i" letters inside the box
    { d: 'M77.8,8.1h1.1v4.8c0,0.5-0.1,1-0.4,1.4c-0.2,0.4-0.6,0.7-1,0.9c-0.4,0.2-0.9,0.3-1.5,0.3c-0.6,0-1.1-0.1-1.5-0.3c-0.4-0.2-0.8-0.5-1-0.9c-0.2-0.4-0.4-0.8-0.4-1.4V8.1h1.1v4.7c0,0.3,0.1,0.6,0.2,0.9c0.1,0.3,0.4,0.5,0.6,0.6c0.3,0.1,0.6,0.2,1,0.2c0.4,0,0.7-0.1,1-0.2c0.3-0.1,0.5-0.4,0.6-0.6c0.1-0.3,0.2-0.6,0.2-0.9V8.1z M81.7,8.1v7.3h-1.1V8.1H81.7z', fill: 'B8CDD8' },
  ],
};

/** Official Zudoku logomark — extracted from cdn.zudoku.dev/logos/favicon.svg.
 *  Dark rounded square with a white "Z" puzzle-piece mark. 130×130 viewBox. */
const ZUDOKU_ICON: SimpleIcon = {
  path: '',
  hex: 'FFFFFF',
  viewBox: '0 0 130 130',
  bgFill: '0C0C0C',
  paths: [
    { d: 'M76.221 27.968A4.666 4.666 0 0 1 80.581 25h23.667c6.325 0 10.835 6.134 8.948 12.171l-7.549 24.159a4.688 4.688 0 0 1-4.474 3.289H72.429c-4.103 0-6.19 3.714-7.429 7.429-.992 2.974-8.336 21.83-11.221 29.222a4.666 4.666 0 0 1-4.36 2.968H25.753c-6.325 0-10.835-6.134-8.948-12.171l7.549-24.159a4.688 4.688 0 0 1 4.474-3.289h28.744c4.103 0 6.19-3.714 7.429-7.428.992-2.975 8.335-21.83 11.221-29.223Z', fill: 'FFFFFF' },
    { d: 'M79.195 70.81a6.19 6.19 0 0 0-5.797 4.016l-9.446 25.19c-.766 2.043.745 4.222 2.926 4.222h26.448a12.5 12.5 0 0 0 11.704-8.11l5.535-14.763c1.916-5.107-1.86-10.555-7.315-10.555H79.195ZM37.913 25a12.5 12.5 0 0 0-11.705 8.111l-5.535 14.762c-1.916 5.107 1.86 10.556 7.315 10.556h24.055c2.58 0 4.89-1.601 5.797-4.017l9.446-25.19C68.052 27.18 66.542 25 64.36 25H37.913Z', fill: 'FFFFFF' },
  ],
};

/** Custom brand icon for the Svecosystem (formsnap · paneforge · runed).
 *  Uses the official formsnap icon mark — a rounded square with a
 *  lightning/arrow shape — in the formsnap brand green (#00D492). */
const SVECOSYSTEM_ICON: SimpleIcon = {
  path: 'M101.243 3.2627C74.5494 -0.329442 47.4958 -0.338885 20.7999 3.23462C16.237 3.82902 11.9953 5.90446 8.72581 9.14235C5.45634 12.3802 3.33983 16.6016 2.70117 21.1585C-0.891322 47.8521 -0.900408 74.906 2.67415 101.602C3.26836 106.165 5.34367 110.407 8.58148 113.676C11.8193 116.946 16.0407 119.062 20.5975 119.701C33.9631 121.499 47.4341 122.402 60.9201 122.402C74.3381 122.402 87.7411 121.509 101.04 119.728C105.603 119.134 109.845 117.058 113.115 113.821C116.384 110.583 118.501 106.361 119.139 101.804C120.938 88.4387 121.841 74.9678 121.841 61.4817C121.841 48.0637 120.947 34.6607 119.167 21.3614C118.572 16.7985 116.497 12.5568 113.259 9.28733C110.021 6.01787 105.8 3.90136 101.243 3.2627ZM88.1368 66.8475L62.3218 98.9813C61.764 99.6819 61.0549 100.247 60.2476 100.635C59.4403 101.023 58.5557 101.224 57.6601 101.222C56.9443 101.22 56.234 101.097 55.5597 100.857C54.4257 100.482 53.4385 99.7596 52.7375 98.7926C52.0366 97.8257 51.6575 96.6628 51.6538 95.4685V70.3109H41.0653C39.3141 70.3411 37.5905 69.8713 36.0968 68.9566C34.6031 68.042 33.4011 66.7205 32.6318 65.147C31.9327 63.6959 31.662 62.0755 31.8517 60.476C32.0413 58.8765 32.6833 57.3643 33.7024 56.1169L59.5174 23.9831C60.3066 23.0027 61.3836 22.2919 62.5965 21.9559C63.8095 21.62 65.0973 21.6731 66.2785 22.1078C67.4124 22.4828 68.3997 23.2048 69.1006 24.1718C69.8016 25.1387 70.1807 26.3016 70.1843 27.4959V52.6535H80.7739C82.5249 52.6234 84.2481 53.0932 85.7416 54.0076C87.2351 54.922 88.437 56.2432 89.2064 57.8164C89.9058 59.2673 90.1767 60.8877 89.9872 62.4872C89.7977 64.0867 89.1558 65.6 88.1368 66.8475Z',
  hex: '00D492',
  viewBox: '0 0 122 122',
};

/** Fontsource logo — official icon from fontsource.org, served as a
 *  WebP raster image (the logo is a purple rounded square with a white
 *  "F" letter mark). */
const FONTSOURCE_ICON: SimpleIcon = {
  path: '',
  hex: '625BF8',
  imgPath: '/icons/fontsource.webp',
};

/** Custom brand icon for tailwind-merge — a stylized wave pattern in
 *  indigo. Extracted from the official tailwind-merge repo logo.svg. */
const TAILWIND_MERGE_ICON: SimpleIcon = {
  path: 'M27 0C19.8 0 15.3 3.6 13.5 10.8C16.2 7.2 19.35 5.85 22.95 6.75C25.004 7.263 26.472 8.754 28.097 10.403C30.744 13.09 33.808 16.2 40.5 16.2C47.7 16.2 52.2 12.6 54 5.4C51.3 9 48.15 10.35 44.55 9.45C42.496 8.937 41.028 7.446 39.403 5.797C36.756 3.11 33.692 0 27 0ZM13.5 16.2C6.3 16.2 1.8 19.8 0 27C2.7 23.4 5.85 22.05 9.45 22.95C11.504 23.464 12.972 24.954 14.597 26.603C17.244 29.29 20.308 32.4 27 32.4C34.2 32.4 38.7 28.8 40.5 21.6C37.8 25.2 34.65 26.55 31.05 25.65C28.996 25.137 27.528 23.646 25.903 21.997C23.256 19.31 20.192 16.2 13.5 16.2Z',
  hex: '6366F1',
  viewBox: '0 0 66 45',
};

/** flag-icons logo — official favicon from flagicons.lipis.dev, served
 *  as a WebP raster image. */
const FLAG_ICONS_ICON: SimpleIcon = {
  path: '',
  hex: '3B82F6',
  imgPath: '/icons/flag-icons.webp',
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

// TypeDoc has no brand logo — uses ic(siGithub) below (GitHub-hosted project)
// pdfmake has no brand logo — uses ic(siGithub) below (GitHub-hosted project)

/** Casdoor logo — official icon from casdoor.org, served as a WebP
 *  raster image (the logo is a purple curved shape with a stem). */
const CASDOOR_ICON: SimpleIcon = {
  path: '',
  hex: '522DD5',
  imgPath: '/icons/casdoor.webp',
};

// jose has no brand logo — uses ic(siGithub) below (GitHub-hosted project)
// zxcvbn-ts has no brand logo — uses ic(siGithub) below (GitHub-hosted project)

/** node-postgres logo — official icon from node-postgres.com, served as
 *  a WebP raster image. */
const NODE_POSTGRES_ICON: SimpleIcon = {
  path: '',
  hex: '3D8CB5',
  imgPath: '/icons/node-postgres.webp',
};

// exceljs has no brand logo — uses ic(siGithub) below (GitHub-hosted project)
// html2pdf.js has no brand logo — uses ic(siGithub) below (GitHub-hosted project)

/** Official axe-core logomark — extracted from the Deque axe-core SVG
 *  (docs.deque.com/devtools-for-web). A cream rounded square with two
 *  interlocking puzzle-piece shapes in blue (#2e5f7a) and pink (#b25295). */
const AXE_CORE_ICON: SimpleIcon = {
  path: '',
  hex: '2E5F7A',
  viewBox: '0 0 339.56 340',
  paths: [
    // Background rounded square (cream)
    { d: 'M60.07 60.84h219.41v219.41H60.07Z', fill: 'F6F3ED' },
    // Blue puzzle pieces
    { d: 'M168.22 212.45c5.22 0 10.22 2.07 13.91 5.76 3.69 3.69 5.76 8.69 5.76 13.91s-2.07 10.22-5.76 13.91c-3.69 3.69-8.69 5.76-13.91 5.76h-15.6v-39.34h15.6Z', fill: '2E5F7A' },
    { d: 'M211.68 172.1c0-5.22 2.07-10.22 5.76-13.91 3.69-3.69 8.69-5.76 13.91-5.76s10.22 2.07 13.91 5.76c3.69 3.69 5.76 8.69 5.76 13.91v15.6h-39.34v-15.6Z', fill: '2E5F7A' },
    { d: 'M171.34 128.64c-5.22 0-10.22-2.07-13.91-5.76-3.69-3.69-5.76-8.69-5.76-13.91 0-5.22 2.07-10.22 5.76-13.91 3.69-3.69 8.69-5.76 13.91-5.76h15.6v39.34h-15.6Z', fill: '2E5F7A' },
    { d: 'M127.87 168.98c0 5.22-2.07 10.22-5.76 13.91-3.69 3.69-8.69 5.76-13.91 5.76-5.22 0-10.22-2.07-13.91-5.76-3.69-3.69-5.76-8.69-5.76-13.91v-15.6h39.34v15.6Z', fill: '2E5F7A' },
    // Pink puzzle pieces
    { d: 'M198.31 201.28c3.69-3.69 8.69-5.76 13.91-5.76 5.22 0 10.22 2.07 13.91 5.76 3.69 3.69 5.76 8.69 5.76 13.91 0 5.22-2.07 10.22-5.76 13.91l-11.03 11.03-27.82-27.82 11.03-11.03Z', fill: 'B25295' },
    { d: 'M200.51 142.01c-3.69-3.69-5.76-8.69-5.76-13.91 0-5.22 2.07-10.22 5.76-13.91 3.69-3.69 8.69-5.76 13.91-5.76 5.22 0 10.22 2.07 13.91 5.76l11.03 11.03-27.82 27.82-11.03-11.03Z', fill: 'B25295' },
    { d: 'M141.25 139.81c-3.69 3.69-8.69 5.76-13.91 5.76-5.22 0-10.22-2.07-13.91-5.76-3.69-3.69-5.76-8.69-5.76-13.91 0-5.22 2.07-10.22 5.76-13.91l11.03-11.03 27.82 27.82-11.03 11.03Z', fill: 'B25295' },
    { d: 'M139.04 199.07c3.69 3.69 5.76 8.69 5.76 13.91 0 5.22-2.07 10.22-5.76 13.91s-8.69 5.76-13.91 5.76c-5.22 0-10.22-2.07-13.91-5.76l-11.03-11.03 27.82-27.82 11.03 11.03Z', fill: 'B25295' },
  ],
};

/** Custom icon for Playwright — simplified comedy/tragedy theater masks.
 *  The official logo is too complex (monitor + masks + transforms), so we
 *  use a simplified two-mask representation in the brand colors. */
const PLAYWRIGHT_ICON: SimpleIcon = {
  path: '',
  hex: '2D4552',
  viewBox: '0 0 400 400',
  paths: [
    { d: 'M136.444 221.556C123.558 225.213 115.104 231.625 109.535 238.032C114.869 233.364 122.014 229.08 131.652 226.348C141.51 223.554 149.92 223.574 156.869 224.915V219.481C150.941 218.939 144.145 219.371 136.444 221.556ZM108.946 175.876L61.0895 188.484C61.0895 188.484 61.9617 189.716 63.5767 191.36L104.153 180.668C104.153 180.668 103.578 188.077 98.5847 194.705C108.03 187.559 108.946 175.876 108.946 175.876ZM149.005 288.347C81.6582 306.486 46.0272 228.438 35.2396 187.928C30.2556 169.229 28.0799 155.067 27.5 145.928C27.4377 144.979 27.4665 144.179 27.5336 143.446C24.04 143.657 22.3674 145.473 22.7077 150.721C23.2876 159.855 25.4633 174.016 30.4473 192.721C41.2301 233.225 76.8659 311.273 144.213 293.134C158.872 289.185 169.885 281.992 178.152 272.81C170.532 279.692 160.995 285.112 149.005 288.347ZM161.661 128.11V132.903H188.077C187.535 131.206 186.989 129.677 186.447 128.11H161.661Z', fill: '2D4552' },
    { d: 'M193.981 167.584C205.861 170.958 212.144 179.287 215.465 186.658L228.711 190.42C228.711 190.42 226.904 164.623 203.57 157.995C181.741 151.793 168.308 170.124 166.674 172.496C173.024 167.972 182.297 164.268 193.981 167.584ZM299.422 186.777C277.573 180.547 264.145 198.916 262.535 201.255C268.89 196.736 278.158 193.031 289.837 196.362C301.698 199.741 307.976 208.06 311.307 215.436L324.572 219.212C324.572 219.212 322.736 193.41 299.422 186.777ZM286.262 254.795L176.072 223.99C176.072 223.99 177.265 230.038 181.842 237.869L274.617 263.805C282.255 259.386 286.262 254.795 286.262 254.795ZM209.867 321.102C122.618 297.71 133.166 186.543 147.284 133.865C153.097 112.156 159.073 96.0203 164.029 85.204C161.072 84.5953 158.623 86.1529 156.203 91.0746C150.941 101.747 144.212 119.124 137.7 143.45C123.586 196.127 113.038 307.29 200.283 330.682C241.406 341.699 273.442 324.955 297.323 298.659C274.655 319.19 245.714 330.701 209.867 321.102Z', fill: '2D4552' },
    { d: 'M161.661 262.296V239.863L99.3324 257.537C99.3324 257.537 103.938 230.777 136.444 221.556C146.302 218.762 154.713 218.781 161.661 220.123V128.11H192.869C189.471 117.61 186.184 109.526 183.423 103.909C178.856 94.612 174.174 100.775 163.545 109.665C156.059 115.919 137.139 129.261 108.668 136.933C80.1966 144.61 57.179 142.574 47.5752 140.911C33.9601 138.562 26.8387 135.572 27.5049 145.928C28.0847 155.062 30.2605 169.224 35.2445 187.928C46.0272 228.433 81.663 306.481 149.01 288.342C166.602 283.602 179.019 274.233 187.626 262.291H161.661V262.296ZM61.0848 188.484L108.946 175.876C108.946 175.876 107.551 194.288 89.6087 199.018C71.6614 203.743 61.0848 188.484 61.0848 188.484Z', fill: 'E2574C' },
    { d: 'M341.786 129.174C329.345 131.355 299.498 134.072 262.612 124.185C225.716 114.304 201.236 97.0224 191.537 88.8994C177.788 77.3834 171.74 69.3802 165.788 81.4857C160.526 92.163 153.797 109.54 147.284 133.866C133.171 186.543 122.623 297.706 209.867 321.098C297.093 344.47 343.53 242.92 357.644 190.238C364.157 165.917 367.013 147.5 367.799 135.625C368.695 122.173 359.455 126.078 341.786 129.174ZM166.497 172.756C166.497 172.756 180.246 151.372 203.565 158C226.899 164.628 228.706 190.425 228.706 190.425L166.497 172.756ZM223.42 268.713C182.403 256.698 176.077 223.99 176.077 223.99L286.262 254.796C286.262 254.791 264.021 280.578 223.42 268.713ZM262.377 201.495C262.377 201.495 276.107 180.126 299.422 186.773C322.736 193.411 324.572 219.208 324.572 219.208L262.377 201.495Z', fill: '2EAD33' },
    { d: 'M139.88 246.04L99.3324 257.532C99.3324 257.532 103.737 232.44 133.607 222.496L110.647 136.33L108.663 136.933C80.1918 144.611 57.1742 142.574 47.5704 140.911C33.9554 138.563 26.834 135.572 27.5001 145.929C28.08 155.063 30.2557 169.224 35.2397 187.929C46.0225 228.433 81.6583 306.481 149.005 288.342L150.989 287.719L139.88 246.04ZM61.0848 188.485L108.946 175.876C108.946 175.876 107.551 194.288 89.6087 199.018C71.6615 203.743 61.0848 188.485 61.0848 188.485Z', fill: 'D65348' },
    { d: 'M225.27 269.163L223.415 268.712C182.398 256.698 176.072 223.99 176.072 223.99L232.89 239.872L262.971 124.281L262.607 124.185C225.711 114.304 201.232 97.0224 191.532 88.8994C177.783 77.3834 171.735 69.3802 165.783 81.4857C160.526 92.163 153.797 109.54 147.284 133.866C133.171 186.543 122.623 297.706 209.867 321.097L211.655 321.5L225.27 269.163ZM166.497 172.756C166.497 172.756 180.246 151.372 203.565 158C226.899 164.628 228.706 190.425 228.706 190.425L166.497 172.756Z', fill: '1D8D22' },
    { d: 'M141.946 245.451L131.072 248.537C133.641 263.019 138.169 276.917 145.276 289.195C146.513 288.922 147.74 288.687 149 288.342C152.302 287.451 155.364 286.348 158.312 285.145C150.371 273.361 145.118 259.789 141.946 245.451ZM137.7 143.451C132.112 164.307 127.113 194.326 128.489 224.436C130.952 223.367 133.554 222.371 136.444 221.551L138.457 221.101C136.003 188.939 141.308 156.165 147.284 133.866C148.799 128.225 150.318 122.978 151.832 118.085C149.393 119.637 146.767 121.228 143.776 122.867C141.759 129.093 139.722 135.898 137.7 143.451Z', fill: 'C04B41' },
  ],
};

// reflect-metadata has no brand logo — uses ic(siGithub) below (GitHub-hosted project)
// @microsoft/fetch-event-source has no brand logo — uses ic(siGithub) below

/** Official sveltekit-superforms logomark — extracted from
 *  superforms.rocks/favicon.svg. Three layers: dark blue inner diamond,
 *  olive band lines, and gold outline. 1080×1080 viewBox. */
const SUPERFORMS_ICON: SimpleIcon = {
  path: '',
  hex: 'ECD11C',
  viewBox: '0 0 1080 1080',
  paths: [
    // Layer 1: dark blue inner diamond
    { d: 'M530 922 83 391 275 204.588 834 204.588 1011 396 530 922', fill: '182439' },
    // Layer 2: olive band lines (#b7a73f)
    { d: 'M741.251 662.107H334.31v64.28h406.941v-64.28Z', fill: 'b7a73f' },
    { d: 'M697.019 779.656H381.781v-64.28h315.239v64.28Zm-224.32-116.141h-168.684v-18.093h168.684v18.093Zm270.981 31.964L141.126 347.594l60.584-104.935 602.554 347.885-60.584 104.935Zm194.602-243.383l-386.157-222.949 12.445-21.555 386.157 222.949-12.445 21.555Z', fill: 'b7a73f' },
    { d: 'M963.286 415.916l-386.157-222.949-12.445 21.555 386.157 222.949 12.445-21.555Z', fill: 'b7a73f' },
    { d: 'M963.292 426.04l-386.157-222.949 12.445-21.555 386.157 222.949-12.445 21.555Zm-34.816 34.298l-408.373-235.774 9.801-16.976 408.373 235.774-9.801 16.976Z', fill: 'b7a73f' },
    { d: 'M928.475 456.992L504.426 212.167l-9.801 16.976 424.049 244.825 9.801-16.976Z', fill: 'b7a73f' },
    { d: 'M908.873 490.95L455.42 229.148l12.445-21.555 453.453 261.801-12.445 21.555Zm-590.686-107.299l-136.251-78.664 40.279-69.765 136.251 78.664-40.279 69.764Z', fill: 'b7a73f' },
    // Layer 3: gold outline
    { d: 'M842.637 179.14H258.378L44.915 391.505l484.635 583.598 38.662-43.38 479.723-538.224-205.298-214.358h0Zm-21.344 50l158.572 165.579-448.973 503.732L112.578 394.719l166.433-165.579H821.292Z', fill: 'ECD11C' },
  ],
};

/** svelte-sonner logo — official favicon from the svelte-sonner site,
 *  served as a PNG raster image (white Svelte-style toast icon). */
const SVELTE_SONNER_ICON: SimpleIcon = {
  path: '',
  hex: 'FFFFFF',
  imgPath: '/icons/svelte-sonner.png',
};

/** svelte-motion logo — official favicon from svelte-motion.gradientdescent.de,
 *  served as a PNG raster image. */
const SVELTE_MOTION_ICON: SimpleIcon = {
  path: '',
  hex: '00AC7F',
  imgPath: '/icons/svelte-motion.png',
};

/** Official Model Context Protocol logomark — extracted from
 *  modelcontextprotocol.io/favicon.svg. Black rounded square with three
 *  white stroke paths forming the MCP connector diagram. */
const MCP_ICON: SimpleIcon = {
  path: '',
  hex: 'FFFFFF',
  viewBox: '0 0 180 180',
  bgFill: '000000',
  paths: [
    { d: 'M23.5996 85.2532L86.2021 22.6507C94.8457 14.0071 108.86 14.0071 117.503 22.6507C126.147 31.2942 126.147 45.3083 117.503 53.9519L70.2254 101.23', fill: '', stroke: 'FFFFFF', strokeWidth: '11', fillNone: true },
    { d: 'M70.8789 100.578L117.504 53.952C126.148 45.3083 140.163 45.3083 148.806 53.952L149.132 54.278C157.776 62.9216 157.776 76.9357 149.132 85.5792L92.5139 142.198C89.6327 145.079 89.6327 149.75 92.5139 152.631L104.14 164.257', fill: '', stroke: 'FFFFFF', strokeWidth: '11', fillNone: true },
    { d: 'M101.853 38.3013L55.553 84.6011C46.9094 93.2447 46.9094 107.258 55.553 115.902C64.1966 124.546 78.2106 124.546 86.8543 115.902L133.154 69.6025', fill: '', stroke: 'FFFFFF', strokeWidth: '11', fillNone: true },
  ],
};

/** Official sharp logo — extracted from sharp.pixelplumbing.com/favicon.svg.
 *  Two-color stroke-based icon: lime green (#9c0) and dark green (#090).
 *  Uses the paths array with stroke/strokeWidth instead of fill. */
const SHARP_ICON: SimpleIcon = {
  path: '',
  hex: '99CC00',
  viewBox: '86 86 550 550',
  paths: [
    { d: 'M258.411 285.777l200.176-26.8M244.113 466.413L451.44 438.66M451.441 438.66V238.484M451.441 88.363v171.572l178.725-23.917M270.323 255.602V477.22M272.71 634.17V462.591L93.984 486.515', fill: '', stroke: '99CC00', strokeWidth: '80', fillNone: true },
    { d: 'M451.441 610.246V438.66l178.725-23.91M269.688 112.59v171.58L90.964 308.093', fill: '', stroke: '009900', strokeWidth: '80', fillNone: true },
  ],
};

/** Official Devin logo — extracted from devin.ai/favicon.svg.
 *  The mark is a faceted hexagonal "D" shape, used as Cognition's
 *  brand icon for Devin. Single-path, 425×425 viewBox. */
const DEVIN_ICON: SimpleIcon = {
  path: 'M70 159.333V91.3471C70 88.3592 71.594 85.5983 74.1816 84.1044L133.043 50.1205C135.631 48.6265 138.819 48.6265 141.407 50.1205L200.269 84.1044C202.856 85.5983 204.45 88.3592 204.45 91.3471V126.068C204.708 137.606 210.806 148.734 221.531 154.926C232.256 161.117 244.942 160.834 255.063 155.289L285.132 137.929C287.719 136.435 290.907 136.435 293.495 137.929L352.357 171.913C354.944 173.406 356.538 176.167 356.538 179.155V247.123C356.538 250.111 354.944 252.872 352.357 254.366L293.495 288.35C290.907 289.844 287.719 289.844 285.132 288.35L255.306 271.13C245.146 265.456 232.344 265.117 221.534 271.358C210.809 277.55 204.711 288.678 204.453 300.215V334.926C204.453 337.914 202.859 340.675 200.271 342.169L141.41 376.153C138.822 377.647 135.634 377.647 133.046 376.153L74.1845 342.169C71.5969 340.675 70.0028 337.914 70.0028 334.926V266.959C70.0029 263.971 71.5969 261.21 74.1845 259.716L133.046 225.732C135.634 224.238 138.822 224.238 141.41 225.732L171.547 243.132C181.656 248.638 194.306 248.906 205.005 242.729C215.815 236.488 221.922 225.231 222.088 213.595C221.83 202.057 215.732 189.737 205.008 183.545C194.283 177.353 181.597 177.636 171.476 183.181L141.269 200.72C138.67 202.229 135.461 202.228 132.864 200.716L74.1576 166.562C71.5835 165.065 70 162.311 70 159.333Z',
  hex: 'f1f5f9',
  viewBox: '0 0 425 425',
};

/** Official Cognition logomark — extracted from cognition.com/icon.svg.
 *  Three interlocking hexagonal nodes forming the Cognition brand mark,
 *  used here for the SWE Models credit. Multi-path, 20×20 viewBox. */
const SWE_ICON: SimpleIcon = {
  path: '',
  hex: 'f1f5f9',
  viewBox: '-0.747952 -0.722232 21.495942 21.477469',
  paths: [
    { d: 'M13.2603 8.85657C13.6689 8.62171 14.174 8.62171 14.5826 8.85657L15.6386 9.46628C15.6723 9.48514 15.7089 9.5 15.746 9.51028C15.7534 9.51314 15.7609 9.51485 15.7694 9.516C15.806 9.52457 15.8431 9.52914 15.8797 9.53085H15.8854C15.89 9.53085 15.8929 9.53085 15.8974 9.52914C15.9311 9.52914 15.9649 9.52343 15.9986 9.516C16.0043 9.516 16.0106 9.51428 16.0163 9.51143C16.0517 9.50114 16.0866 9.48628 16.1191 9.46914C16.122 9.46743 16.1266 9.46628 16.1294 9.46457L18.2403 8.24514C18.3917 8.15828 18.4843 7.99714 18.4843 7.82228V5.384C18.4843 5.20914 18.3917 5.04742 18.2403 4.96114L16.1294 3.74171C15.978 3.65485 15.7917 3.65485 15.6403 3.74171L13.5294 4.96114C13.5294 4.96114 13.5237 4.96571 13.5209 4.96685C13.4889 4.98571 13.4574 5.00971 13.4311 5.036C13.4266 5.04057 13.4237 5.04457 13.4191 5.04914C13.3957 5.07428 13.3751 5.10228 13.3563 5.13142C13.3534 5.136 13.3506 5.14 13.3477 5.14628C13.33 5.17885 13.3151 5.21257 13.3049 5.24914C13.302 5.25657 13.3003 5.264 13.2991 5.27257C13.2906 5.30914 13.2843 5.34742 13.2843 5.38742V6.60685C13.2843 7.07714 13.0317 7.516 12.6231 7.75085C12.2146 7.98571 11.7094 7.98571 11.3009 7.75085L10.2449 7.14114C10.2111 7.12228 10.1746 7.10742 10.1374 7.09714C10.13 7.09428 10.1226 7.09257 10.114 7.09142C10.0774 7.08285 10.0403 7.07828 10.0037 7.07657H9.98771C9.95228 7.07657 9.91857 7.08228 9.88485 7.08971C9.87914 7.08971 9.87285 7.09142 9.86885 7.09257C9.83228 7.10285 9.79857 7.11771 9.76428 7.13542C9.76142 7.13714 9.75685 7.13828 9.75399 7.14L7.64314 8.35942C7.49171 8.44628 7.39914 8.60742 7.39914 8.78228V11.2206C7.39914 11.3954 7.49171 11.5571 7.64314 11.6434L9.75399 12.8629C9.75399 12.8629 9.76142 12.8657 9.76428 12.8674C9.79799 12.8851 9.83171 12.9 9.86885 12.9103C9.87457 12.912 9.88085 12.9131 9.88657 12.9149C9.92028 12.9223 9.95399 12.9269 9.98771 12.928C9.99228 12.928 9.99514 12.9297 9.99971 12.9297H10.0054C10.042 12.9297 10.0791 12.924 10.1157 12.9149C10.1231 12.9131 10.1306 12.9103 10.1391 12.9091C10.1757 12.8989 10.2111 12.884 10.2466 12.8651L11.3026 12.2554C11.7111 12.0206 12.2163 12.0206 12.6243 12.2554C13.0311 12.4903 13.2854 12.9297 13.2854 13.4V14.6194C13.2854 14.6589 13.2911 14.6971 13.3003 14.7337C13.302 14.7411 13.3031 14.7497 13.306 14.7571C13.3163 14.7926 13.3311 14.8274 13.3483 14.86C13.3511 14.8646 13.354 14.8686 13.3574 14.8749C13.3751 14.904 13.3957 14.932 13.4209 14.9571C13.4254 14.9617 13.4283 14.9657 13.4329 14.9703C13.4591 14.9966 13.49 15.0189 13.5226 15.0394C13.5254 15.0411 13.5283 15.044 13.5311 15.0451L15.642 16.2646C15.7169 16.3086 15.802 16.3309 15.886 16.3309C15.97 16.3309 16.0551 16.3086 16.13 16.2646L18.2409 15.0451C18.3923 14.9583 18.4849 14.7971 18.4849 14.6223V12.184C18.4849 12.0091 18.3923 11.8474 18.2409 11.7611L16.13 10.5417C16.13 10.5417 16.1226 10.5389 16.1197 10.5371C16.086 10.5194 16.0523 10.5046 16.0157 10.4943C16.01 10.4931 16.0054 10.4931 15.9997 10.4914C15.966 10.4829 15.9306 10.4783 15.8969 10.4783H15.8809C15.8443 10.4783 15.8077 10.484 15.7706 10.4931C15.7631 10.4949 15.7557 10.4977 15.7489 10.4989C15.7123 10.5091 15.6769 10.524 15.6414 10.5429L14.5854 11.1526C14.1786 11.3874 13.6717 11.3874 13.2637 11.1526C12.8569 10.9177 12.6026 10.4783 12.6026 10.008C12.6026 9.53771 12.8551 9.09885 13.2637 8.86343L13.262 8.85771L13.2603 8.85657Z', fill: 'f1f5f9' },
    { d: 'M1.75971 8.24743L3.87057 9.46685C3.94542 9.51085 4.03057 9.53314 4.11457 9.53314C4.19857 9.53314 4.28371 9.51085 4.35857 9.46685L6.46942 8.24743C6.46942 8.24743 6.47514 8.24285 6.47799 8.24171C6.51057 8.22285 6.54085 8.19885 6.56771 8.17257C6.57228 8.168 6.57514 8.164 6.57971 8.15942C6.60314 8.13428 6.62371 8.10628 6.64314 8.07714C6.64599 8.07257 6.64885 8.06857 6.65171 8.06228C6.66942 8.02971 6.68428 7.996 6.69457 7.95942C6.69742 7.952 6.69914 7.94457 6.70028 7.936C6.70885 7.89943 6.71514 7.86114 6.71514 7.82171V6.60228C6.71514 6.132 6.96771 5.69314 7.37628 5.45828C7.78485 5.22342 8.28999 5.22342 8.69857 5.45828L9.75457 6.068C9.78828 6.08685 9.82485 6.10171 9.86199 6.112C9.86942 6.11485 9.87685 6.11657 9.88542 6.11771C9.92199 6.12628 9.95742 6.13085 9.99571 6.13257H10.0014C10.006 6.13257 10.0089 6.13085 10.0134 6.13085C10.0471 6.13085 10.0809 6.12514 10.1146 6.11771C10.1203 6.11771 10.1266 6.116 10.1323 6.11314C10.1689 6.10285 10.2026 6.088 10.2369 6.07028C10.2397 6.06914 10.2443 6.06742 10.2471 6.06571L12.358 4.84628C12.5094 4.75942 12.602 4.59828 12.602 4.42342V1.98514C12.602 1.81028 12.5094 1.64857 12.358 1.56228L10.2471 0.342853C10.0957 0.255996 9.90942 0.255996 9.75799 0.342853L7.64714 1.56228C7.64714 1.56228 7.64142 1.56685 7.63857 1.568C7.60657 1.58685 7.57571 1.61085 7.54885 1.63714C7.54428 1.64171 7.54142 1.64571 7.53685 1.65028C7.51342 1.67542 7.49285 1.70342 7.47342 1.73257C7.47057 1.73714 7.46771 1.74114 7.46485 1.74742C7.44714 1.78 7.43228 1.81371 7.42199 1.85028C7.41914 1.85771 7.41742 1.86514 7.41628 1.87371C7.40714 1.91028 7.40142 1.94857 7.40142 1.98857V3.208C7.40142 3.67828 7.14885 4.11714 6.74028 4.35257C6.33342 4.58742 5.82657 4.58742 5.41799 4.35257L4.36199 3.74285C4.32828 3.724 4.29171 3.70914 4.25457 3.69885C4.24714 3.696 4.23971 3.69428 4.23114 3.69314C4.19457 3.68457 4.15742 3.68 4.12085 3.67828H4.10485C4.06942 3.67828 4.03571 3.684 4.00199 3.69142C3.99628 3.69142 3.98999 3.69314 3.98599 3.69428C3.94942 3.70457 3.91571 3.71942 3.88142 3.73714C3.87857 3.73885 3.87399 3.74 3.87114 3.74171L1.76028 4.96114C1.60885 5.048 1.51628 5.20914 1.51628 5.384V7.82228C1.51628 7.99714 1.60885 8.15885 1.76028 8.24514V8.248L1.75971 8.24743Z', fill: 'f1f5f9' },
    { d: 'M12.3551 15.1514L10.2443 13.932C10.2443 13.932 10.2369 13.9291 10.234 13.9274C10.2003 13.9097 10.1666 13.8954 10.1294 13.8851C10.1237 13.8834 10.1174 13.8823 10.1117 13.8806C10.078 13.8731 10.0443 13.8674 10.0089 13.8674H9.99285C9.95628 13.8674 9.91914 13.8731 9.88257 13.8823C9.87514 13.884 9.86771 13.8869 9.86028 13.888C9.82371 13.8983 9.78828 13.9131 9.75285 13.932L8.69685 14.5417C8.28999 14.7766 7.78314 14.7766 7.37628 14.5417C6.96771 14.3069 6.71514 13.8674 6.71514 13.3971V12.1777C6.71514 12.1383 6.70942 12.1 6.70028 12.0629C6.69914 12.0554 6.69742 12.0469 6.69457 12.0394C6.68428 12.004 6.66942 11.9691 6.65171 11.9366C6.64885 11.932 6.64599 11.928 6.64314 11.9217C6.62542 11.8926 6.60485 11.8646 6.57971 11.8394C6.57514 11.8349 6.57228 11.8309 6.56828 11.8263C6.54199 11.8 6.51114 11.7777 6.47857 11.7571C6.47571 11.7554 6.47285 11.7526 6.46999 11.7514L4.35914 10.532C4.20771 10.4451 4.02142 10.4451 3.86999 10.532L1.75914 11.7514C1.60771 11.8383 1.51514 11.9994 1.51514 12.1743V14.6126C1.51514 14.7874 1.60771 14.9491 1.75914 15.0354L3.86999 16.2549C3.86999 16.2549 3.87742 16.2577 3.88028 16.2594C3.91399 16.2771 3.94771 16.2914 3.98314 16.3017C3.98885 16.3034 3.99514 16.3046 4.00085 16.3063C4.03457 16.3137 4.06714 16.3183 4.10199 16.3194C4.10657 16.3194 4.11057 16.3206 4.11399 16.3206H4.11971C4.15628 16.3206 4.19342 16.3149 4.22828 16.3057C4.23571 16.304 4.24428 16.3011 4.25171 16.3C4.28828 16.2897 4.32371 16.2749 4.35914 16.256L5.41514 15.6463C5.82371 15.4114 6.32885 15.4114 6.73742 15.6463C7.14428 15.8811 7.39857 16.3206 7.39857 16.7909V18.0103C7.39857 18.0497 7.40428 18.088 7.41342 18.1251C7.41514 18.1326 7.41628 18.1411 7.41914 18.1486C7.42942 18.184 7.44428 18.2189 7.46199 18.2514C7.46485 18.256 7.46771 18.26 7.47057 18.2663C7.48828 18.2954 7.50885 18.3234 7.53399 18.3486C7.53857 18.3531 7.54142 18.3571 7.54542 18.3617C7.57171 18.388 7.60257 18.4103 7.63514 18.4309C7.63799 18.4326 7.64085 18.4354 7.64428 18.4366L9.75514 19.656C9.82999 19.7 9.91514 19.7223 9.99914 19.7223C10.0831 19.7223 10.1683 19.7 10.2431 19.656L12.354 18.4366C12.5054 18.3497 12.598 18.1886 12.598 18.0137V15.5754C12.598 15.4006 12.5054 15.2389 12.354 15.1526L12.3551 15.1514Z', fill: 'f1f5f9' },
  ],
};

/** Official Z.ai (Zhipu AI) logomark — extracted from z-cdn.chatglm.cn
 *  logo.svg. A dark rounded-square with a white "Z" letter mark.
 *  Uses bgFill for the dark background and paths for the white Z. */
const GLM_ICON: SimpleIcon = {
  path: '',
  hex: 'FFFFFF',
  viewBox: '0 0 30 30',
  bgFill: '2D2D2D',
  paths: [
    { d: 'M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z', fill: 'FFFFFF' },
    { d: 'M24.3,7.1 L13.14,22.91 L5.7,22.91 L16.86,7.1 Z', fill: 'FFFFFF' },
    { d: 'M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z', fill: 'FFFFFF' },
  ],
};

export const CREDITS: CreditSection[] = [
  {
    id: 'foundation',
    titleKey: 'sectionFoundation',
    items: [
      {
        author: 'Microsoft — Anders Hejlsberg & the TS team',
        handle: '@Microsoft',
        project: 'TypeScript®',
        version: '7',
        package: 'typescript',
        url: 'https://www.typescriptlang.org',
        usage: 'The language every Primebrick repo is written in — backend, frontend, SDK, DAL, microservices, docs, and this website.',
        icon: ic(siTypescript),
      },
      {
        author: 'OpenJS Foundation & Node.js collaborators',
        handle: '@nodejs',
        project: 'Node.js®',
        version: '24',
        url: 'https://nodejs.org',
        usage: 'Runs the Primebrick backend, SDK, DAL, and all build scripts.',
        icon: ic(siNodedotjs),
      },
      {
        author: 'Jarred Sumner',
        handle: '@oven-sh',
        project: 'Bun™',
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
        project: 'Astro™',
        version: '7',
        package: 'astro',
        url: 'https://astro.build',
        usage: 'Powers primebrick.dev — this very website you are looking at.',
        icon: ic(siAstro),
      },
      {
        author: 'Rich Harris & the Svelte team',
        handle: '@sveltejs',
        project: 'Svelte™ & SvelteKit™',
        version: '5',
        package: 'svelte',
        url: 'https://svelte.dev',
        usage: 'Powers the Primebrick admin frontend and the interactive islands on this website.',
        icon: ic(siSvelte),
      },
      {
        author: 'OpenJS Foundation',
        handle: '@expressjs',
        project: 'Express®',
        version: '4',
        package: 'express',
        url: 'https://expressjs.com',
        usage: 'The Primebrick backend HTTP server — every API route, every middleware.',
        icon: ic(siExpress),
      },
      {
        author: 'Zuplo',
        handle: '@zuplo',
        project: 'Zudoku™',
        version: '0',
        package: 'zudoku',
        url: 'https://zudoku.dev',
        usage: 'Powers docs.primebrick.dev — the API catalog, navigation, and MDX documentation.',
        usageLink: 'https://docs.primebrick.dev',
        usageLinkText: 'docs.primebrick.dev',
        icon: ZUDOKU_ICON,
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
        project: 'Vite™',
        version: '8',
        package: 'vite',
        url: 'https://vitejs.dev',
        usage: 'Build tool behind Astro, SvelteKit, and every TypeScript repo in the workspace.',
        icon: ic(siVite),
      },
      {
        author: 'Zoltan Kochan',
        handle: '@pnpm',
        project: 'pnpm™',
        version: '9',
        url: 'https://pnpm.io',
        usage: 'Package manager for the entire Primebrick workspace — fast, disk-efficient, workspace-aware.',
        icon: ic(siPnpm),
      },
      {
        author: 'Nicholas C. Zakas & the ESLint team',
        handle: '@eslint',
        project: 'ESLint™',
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
        project: 'Tailwind CSS™',
        version: '4',
        package: 'tailwindcss',
        url: 'https://tailwindcss.com',
        usage: 'Styling across the Primebrick frontend and this website — every color, every layout.',
        icon: { ...ic(siTailwindcss), hex: '38BDF8' },
      },
      {
        author: 'shadcn',
        handle: '@shadcn',
        project: 'shadcn/ui™',
        version: '0',
        url: 'https://ui.shadcn.com',
        usage: 'The component system vendored into the Primebrick frontend — buttons, dialogs, command palettes, and more.',
        icon: { ...ic(siShadcnui), hex: 'eb4f27' },
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
        project: 'Lucide™',
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
        icon: ic(siGithub),
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
        project: 'PostgreSQL®',
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
        project: 'Redis®',
        version: '6',
        package: 'redis',
        url: 'https://redis.io',
        usage: 'Distributed caching and real-time presence tracking for collaboration features.',
        icon: ic(siRedis),
      },
      {
        author: 'Derek Collison & Synadia — CNCF',
        handle: '@nats-io',
        project: 'NATS™',
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
        project: 'Casdoor™',
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
        icon: ic(siGithub),
      },
      {
        author: 'The zxcvbn-ts team',
        handle: '@zxcvbn-ts',
        project: 'zxcvbn-ts',
        version: '4',
        package: '@zxcvbn-ts/core',
        url: 'https://github.com/zxcvbn-ts/zxcvbn',
        usage: 'Password strength estimation in the Primebrick frontend — the meter you see when choosing a password.',
        icon: ic(siGithub),
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
        project: 'Vercel AI SDK™',
        version: '7',
        package: 'ai',
        url: 'https://sdk.vercel.ai',
        usage: 'The engine behind Primebrick\'s AI assistant — streaming answers, smart tools, smooth conversations.',
        icon: ic(siVercel),
      },
      {
        author: 'Anthropic',
        handle: '@modelcontextprotocol',
        project: 'Model Context Protocol™',
        version: '2',
        package: '@modelcontextprotocol/server',
        url: 'https://modelcontextprotocol.io',
        usage: 'The open standard that lets the AI microservice discover and call backend tools.',
        icon: MCP_ICON,
      },
      {
        author: 'Hugging Face — Xenova',
        handle: '@huggingface',
        project: 'Transformers.js™',
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
        project: 'Mermaid™',
        version: '11',
        package: 'mermaid',
        url: 'https://mermaid.js.org',
        usage: 'Architecture diagrams in the Primebrick documentation — text-to-diagram, no image editing.',
        icon: ic(siMermaid),
      },
      {
        author: 'Pine Wu',
        handle: '@shikijs',
        project: 'Shiki™',
        version: '4',
        package: 'shiki',
        url: 'https://shiki.style',
        usage: 'Beautiful, readable code samples in the Primebrick documentation.',
        icon: SHIKI_ICON,
      },
      {
        author: 'The TypeStrong community',
        handle: '@TypeStrong',
        project: 'TypeDoc™',
        version: '0',
        package: 'typedoc',
        url: 'https://typedoc.org',
        usage: 'Generates API reference documentation for the Primebrick SDK and DAL libraries.',
        icon: ic(siGithub),
      },
      {
        author: 'Bartek Pampuch',
        handle: '@bpampuch',
        project: 'pdfmake',
        version: '0',
        package: 'pdfmake',
        url: 'https://pdfmake.org',
        usage: 'Generates VPAT 2.5 accessibility compliance PDFs for the documentation site.',
        icon: ic(siGithub),
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
        project: 'Handlebars™',
        version: '4',
        package: 'handlebars',
        url: 'https://handlebarsjs.com',
        usage: 'Renders email templates in the Primebrick microservices and HTML export templates in the backend.',
        icon: ic(siHandlebarsdotjs),
      },
      {
        author: 'The ExcelJS team',
        handle: '@exceljs',
        project: 'ExcelJS™',
        version: '4',
        package: 'exceljs',
        url: 'https://github.com/exceljs/exceljs',
        usage: 'Excel and CSV exports in Primebrick — your data, ready to share in a click.',
        icon: ic(siGithub),
      },
      {
        author: 'Erik Koopmans',
        handle: '@eKoopmans',
        project: 'html2pdf.js',
        version: '0',
        package: 'html2pdf.js',
        url: 'https://github.com/eKoopmans/html2pdf.js',
        usage: 'Client-side table-to-PDF export in the Primebrick frontend.',
        icon: ic(siGithub),
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
        project: 'Vitest™',
        version: '4',
        package: 'vitest',
        url: 'https://vitest.dev',
        usage: 'Unit testing across the backend, frontend, SDK, DAL, and microservices.',
        icon: ic(siVitest),
      },
      {
        author: 'Microsoft — the Playwright team',
        handle: '@microsoft',
        project: 'Playwright®',
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
        project: 'Testing Library™',
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
        project: 'Zod™',
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
        icon: ic(siGithub),
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
        icon: SHARP_ICON,
      },
      {
        author: 'Andreas Söderlund',
        handle: '@ciscoheat',
        project: 'sveltekit-superforms™',
        version: '2',
        package: 'sveltekit-superforms',
        url: 'https://superforms.rocks',
        usage: 'Type-safe form handling in the Primebrick frontend — login, profile, and settings forms.',
        icon: SUPERFORMS_ICON,
      },
      {
        author: 'Robert Soriano',
        handle: '@wobsoriano',
        project: 'svelte-sonner™',
        version: '1',
        package: 'svelte-sonner',
        url: 'https://github.com/wobsoriano/svelte-sonner',
        usage: 'Toast notifications across the Primebrick frontend.',
        icon: SVELTE_SONNER_ICON,
      },
      {
        author: 'The humanspeak team',
        handle: '@humanspeak',
        project: 'svelte-motion™',
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
        icon: ic(siGithub),
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
        project: 'Devin™',
        version: '',
        url: 'https://devin.ai',
        usage: 'The AI software engineer that paired on architecture, code, and releases across the entire Primebrick v3 codebase.',
        icon: DEVIN_ICON,
      },
      {
        author: 'Cognition & the open SWE community',
        handle: '@cognition',
        project: 'SWE Models™',
        version: '1.6+',
        url: 'https://www.swe-bench.org',
        usage: 'Software-engineering-tuned models that reviewed diffs, wrote tests, and caught regressions throughout Primebrick development.',
        icon: SWE_ICON,
      },
      {
        author: 'Zhipu AI',
        handle: '@ZhipuAI',
        project: 'GLM™',
        version: '5.2',
        url: 'https://www.zhipuai.cn',
        usage: 'The model that powered countless coding sessions — refactoring, documentation, and the Primebrick website you are reading right now.',
        icon: GLM_ICON,
      },
      {
        author: 'Moonshot AI',
        handle: '@moonshot',
        project: 'Kimi™',
        version: '2.6+',
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
  'Microsoft®',
  'OpenJS Foundation',
  'Jarred Sumner',
  'The Astro™ Team',
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
  'The Redis® team',
  'Derek Collison',
  'Yang Luo',
  'Filip Skokan',
  'Vercel™',
  'Anthropic™',
  'Hugging Face™',
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
