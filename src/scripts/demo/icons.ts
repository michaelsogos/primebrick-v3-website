/* ============================================================
   Primebrick Demo Prototype — Inline Lucide SVG Path Map
   Lucide icons are MIT-licensed (ISC). Paths inlined to avoid
   adding @lucide/svelte dep (not in website repo).
   ============================================================ */

export type IconNode = { type?: string; attrs: Record<string, string> };
export type IconDef = string | string[] | IconNode[];

export const ICONS: Record<string, IconDef> = {
  // Topbar / shell
  panelLeft: 'M7 3v18M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2',
  search: 'm21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  triangleAlert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  messageSquare: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  sun: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41',
  moon: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z',
  chevronDown: 'm6 9 6 6 6-6',
  chevronsUpDown: 'm7 15 5 5 5-5M7 9l5-5 5 5',
  chevronRight: 'm9 18 6-6-6-6',
  chevronLeft: 'm15 18-6-6 6-6',
  x: 'M18 6 6 18M6 6l12 12',
  send: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.1 1.1z M21.854 2.147l-10.94 10.939',
  // Entity table
  filter: 'M3 6h18M7 12h10M11 18h2',
  columns3: 'M18 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2M6 18v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M6 6h12v12H6z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  layoutGrid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  arrowUpDown: 'm21 16-4 4-4-4M17 20V4M3 8l4-4 4 4M7 4v16',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  fileText: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v5h5M16 13H8M16 17H8M10 9H8',
  fileTypeXlsx: 'M14 2v5h5M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM8 13l2 2-2 2M12 15l2-2M12 15l2 2',
  fileTypeCsv: 'M14 2v5h5M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM8 13h8M8 17h8M10 13v4',
  fileTypeHtml: 'M14 2v5h5M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM8 18l2-4 2 4M16 14h-4M12 14v4',
  fileTypePdf: 'M14 2v5h5M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM8 14h2a2 2 0 0 0 0-4H8v6M14 14v-4h2a2 2 0 0 1 0 4h-2',
  envelope: 'M2 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H2zm2 2 8 6 8-6',
  // CRUD actions
  pencil: 'M12 20h9M16.5 3.5a2.12 2.12 0 0 0 3 3L7 19l-4 1 1-4z',
  eye: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  trash2: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
  rotateCcw: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5',
  copy: 'M9 9h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V11a2 2 0 0 1 2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  keyRound: [
    { type: 'path', attrs: { d: 'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z' } },
    { type: 'circle', attrs: { cx: '16.5', cy: '7.5', r: '.5', fill: 'currentColor' } },
  ],
  // Security
  shieldCheck: [
    { type: 'path', attrs: { d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' } },
    { type: 'path', attrs: { d: 'm9 12 2 2 4-4' } },
  ],
  fingerprint: 'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4M14 13.12c0 2.88 2.34 8.12 5.1 8.12M16 13c0-1.5-1-3-3-3M8 12a4 4 0 0 1 8 0c0 4 1 8 2 9M6 13c0-5 3-8 6-8s6 3 6 8c0 1.5-.5 3-1 4',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4',
  scanFace: 'M6 4H4a2 2 0 0 0-2 2v2M18 4h2a2 2 0 0 1 2 2v2M6 20H4a2 2 0 0 1-2-2v-2M18 20h2a2 2 0 0 0 2-2v-2M9 9h.01M15 9h.01M8 14c1 1 2 1.5 4 1.5s3-.5 4-1.5',
  // Version / errors
  circleCheckBig: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM8 12l3 3 5-5',
  alertCircle: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01',
  alertTriangle: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  circleX: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  thumbsUp: 'M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L14 2a3.13 3.13 0 0 1 3 3.88z',
  thumbsDown: 'M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L10 22a3.13 3.13 0 0 1-3-3.88z',
  // Modules / health
  cloud: 'M17.5 19a4.5 4.5 0 1 0 0-9h-1.8A7 7 0 1 0 4 15.3',
  cloudOff: 'm2 2 20 20M5.78 5.78A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 3.5-1.5M21 5.5A4.5 4.5 0 0 0 16.5 1h-7a7 7 0 0 0-3.78 1.22',
  database: 'M12 8a8 8 0 1 0 0-8 8 8 0 0 0 0 8zM4.5 4v16c0 1.38 3.36 2.5 7.5 2.5s7.5-1.12 7.5-2.5V4M4.5 12c0 1.38 3.36 2.5 7.5 2.5s7.5-1.12 7.5-2.5',
  databaseZap: 'M12 8a8 8 0 1 0 0-8 8 8 0 0 0 0 8zM4.5 4v16c0 1.38 3.36 2.5 7.5 2.5M17 13l4 4-4 4M21 17h-7',
  radio: 'M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4M19.1 4.9C23 8.8 23 15.2 19.1 19.1M12 12h.01',
  shieldAlert: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zM12 8v4M12 16h.01',
  // Misc
  settings: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  plus: 'M12 5v14M5 12h14',
  users: [
    { type: 'path', attrs: { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' } },
    { type: 'path', attrs: { d: 'M16 3.128a4 4 0 0 1 0 7.744' } },
    { type: 'path', attrs: { d: 'M22 21v-2a4 4 0 0 0-3-3.87' } },
    { type: 'circle', attrs: { cx: '9', cy: '7', r: '4' } },
  ],
  building2: [
    { type: 'path', attrs: { d: 'M10 12h4' } },
    { type: 'path', attrs: { d: 'M10 8h4' } },
    { type: 'path', attrs: { d: 'M14 21v-3a2 2 0 0 0-4 0v3' } },
    { type: 'path', attrs: { d: 'M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2' } },
    { type: 'path', attrs: { d: 'M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16' } },
  ],
  package: 'm7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
  mail: 'M2 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H2zm2 2 8 6 8-6',
  squareUser: [
    { type: 'rect', attrs: { width: '18', height: '18', x: '3', y: '3', rx: '2' } },
    { type: 'circle', attrs: { cx: '12', cy: '10', r: '3' } },
    { type: 'path', attrs: { d: 'M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2' } },
  ],
  userKey: [
    { type: 'path', attrs: { d: 'M20 11v6' } },
    { type: 'path', attrs: { d: 'M20 13h2' } },
    { type: 'path', attrs: { d: 'M3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 2.072.578' } },
    { type: 'circle', attrs: { cx: '10', cy: '7', r: '4' } },
    { type: 'circle', attrs: { cx: '20', cy: '19', r: '2' } },
  ],
  zap: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z',
  sparkles: [
    'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
    'M20 2v4',
    'M22 4h-4',
    'M6 20a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  ],
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
  arrowUpRight: 'M7 7h10v10M7 17 17 7',
  check: 'M20 6 9 17l-5-5',
  gitBranch: 'M6 3v12M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 3a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3M18 9v3a3 3 0 0 1-3 3H9',
  layers: 'M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83zM2.6 13.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83M2.6 18.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83',
  command: 'M15 6a3 3 0 1 1 3 3h-9a3 3 0 1 1 3-3v9a3 3 0 1 1-3 3h9a3 3 0 1 1-3-3z',
  tag: 'M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42zM7 7h.01',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  history: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M12 7v5l4 2',
  power: 'M12 2v10M18.4 6.6a9 9 0 1 1-12.77.04',
  refreshCw: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M3 21v-5h5',
  trendingUp: 'M16 7h6v6M22 7l-8.5 8.5-5-5L2 17',
  // Requested icons (paths verified from lucide source)
  panelsTopLeft: [
    'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
    'M3 9h18',
    'M9 21V9',
  ],
  table2: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18',
  botMessageSquare: [
    'M12 6V2H8',
    'm8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z',
    'M2 12h2',
    'M9 11v2',
    'M15 11v2',
    'M20 12h2',
  ],
  brainCircuit: [
    'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z',
    'M9 13a4.5 4.5 0 0 0 3-4',
    'M6.003 5.125A3 3 0 0 0 6.401 6.5',
    'M3.477 10.896a4 4 0 0 1 .585-.396',
    'M6 18a4 4 0 0 1-1.967-.516',
    'M12 13h4',
    'M12 18h6a2 2 0 0 1 2 2v1',
    'M12 8h8',
    'M16 8V5a2 2 0 0 1 2-2',
    'M16.5 13a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0',
    'M18.5 3a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0',
    'M20.5 21a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0',
    'M20.5 8a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0',
  ],
  monitorPlay: [
    'M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z',
    'M12 17v4',
    'M8 21h8',
    'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
  ],
};

/**
 * Create an SVG element from a Lucide path string or array of path strings.
 */
export function makeIcon(paths: IconDef): SVGSVGElement {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const arr = Array.isArray(paths) ? paths : [paths];
  arr.forEach((node) => {
    if (typeof node === 'string') {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', node);
      svg.appendChild(p);
    } else if (node && typeof node === 'object') {
      const iconNode = node as IconNode;
      const el = document.createElementNS(ns, iconNode.type || 'path');
      Object.entries(iconNode.attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
      svg.appendChild(el);
    }
  });
  return svg;
}

/**
 * Render an icon into a target element.
 */
export function renderIcon(name: string, target: HTMLElement | string): void {
  const path = ICONS[name];
  if (!path) {
    console.warn('Icon not found:', name);
    return;
  }
  const svg = makeIcon(path);
  let el: HTMLElement | null = target as HTMLElement;
  if (typeof target === 'string') el = document.querySelector(target);
  if (el) el.appendChild(svg);
}

/**
 * Replace all <i data-icon="name"></i> placeholders in the document.
 */
export function renderAllIcons(): void {
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.getAttribute('data-icon');
    const path = name ? ICONS[name] : undefined;
    if (path) {
      const svg = makeIcon(path);
      el.replaceWith(svg);
    }
  });
}
