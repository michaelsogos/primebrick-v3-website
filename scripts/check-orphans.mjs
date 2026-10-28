// Post-build SEO check — enforcement, not verification.
// Every URL the sitemap advertises must be reachable by crawling internal
// links from the locale root page. An orphan page (sitemap-only discovery)
// fails the build: fix the link graph or exclude the page via
// src/pages/sitemap.xml.ts EXCLUDE_PATHS.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/client';
const LANGUAGES = ['en', 'it', 'de', 'es', 'pt', 'fr'];

/** Internal path → emitted file (`/{lang}/x/` → `dist/client/{lang}/x/index.html`). */
function fileFor(path) {
  return join(DIST, path.replace(/\/$/, ''), 'index.html');
}

function normalizePath(raw) {
  const p = raw.split('#')[0].split('?')[0];
  if (!p.startsWith('/') || p.startsWith('//') || p.startsWith('/_') || p.startsWith('/favicon')) return null;
  return p.endsWith('/') ? p : `${p}/`;
}

/** Every internal link in an emitted HTML page. */
function internalLinks(file) {
  const html = readFileSync(file, 'utf8');
  const out = new Set();
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const p = normalizePath(m[1]);
    if (p) out.add(p);
  }
  return out;
}

/** BFS the internal-link graph from the locale root. */
function reachableFrom(root) {
  const seen = new Set([root]);
  const queue = [root];
  while (queue.length) {
    const path = queue.shift();
    const file = fileFor(path);
    if (!existsSync(file)) continue;
    for (const link of internalLinks(file)) {
      if (!seen.has(link)) {
        seen.add(link);
        queue.push(link);
      }
    }
  }
  return seen;
}

// Sitemap URLs (paths only).
const xml = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
const sitemapPaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);

let orphans = 0;
for (const lang of LANGUAGES) {
  const reachable = reachableFrom(`/${lang}/`);
  const missing = sitemapPaths.filter(
    (p) => p.startsWith(`/${lang}/`) && !reachable.has(p),
  );
  if (missing.length) {
    orphans += missing.length;
    console.error(`✗ ${lang}: ${missing.length} sitemap URL(s) unreachable via internal links:`);
    for (const p of missing) console.error(`    ${p}`);
  } else {
    console.log(`✓ ${lang}: all sitemap URLs reachable via internal links`);
  }
}

if (orphans) {
  console.error(
    `\ncheck-orphans: ${orphans} orphan URL(s). Add an internal link or exclude the page via EXCLUDE_PATHS in src/pages/sitemap.xml.ts.`,
  );
  process.exit(1);
}
console.log('check-orphans: OK — sitemap ⊆ internal link graph');
