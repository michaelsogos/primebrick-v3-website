// Prerendered sitemap.xml endpoint.
// Generates a sitemap with hreflang alternates for all locale × page
// combinations. The root "/" redirect page is excluded (it has noindex
// and 302s to /en/).
//
// The @astrojs/sitemap integration was tried first but is incompatible
// with the @astrojs/cloudflare adapter in Astro 7 (the adapter rearranges
// static assets before the integration runs, so it finds no pages). This
// custom endpoint is the reliable alternative.

import { LANGUAGES } from '../i18n/translations';

export const prerender = true;

const SITE_URL = 'https://primebrick.dev';

/** Page paths (without locale prefix) to exclude from the sitemap even though
 *  a matching `src/pages/[lang]/` file exists — e.g. future pages carrying
 *  their own noindex. Deliberate, visible opt-out; default is include-all. */
const EXCLUDE_PATHS: readonly string[] = ['thank-you'];

/** Page paths (without locale prefix) that exist for every locale — derived
 *  from the `.astro` files under `src/pages/[lang]` at build time so the
 *  sitemap can never drift from the real route set. `index.astro` maps to
 *  its directory (trailing slash), matching the canonical URL shape. */
const PAGE_PATHS: readonly string[] = Object.keys(import.meta.glob('./**/*.astro'))
  .filter((key) => key.startsWith('./[lang]/'))
  .map((key) => {
    const rel = key.slice('./[lang]/'.length).replace(/\.astro$/, '');
    if (rel === 'index') return '';
    if (rel.endsWith('/index')) return rel.slice(0, rel.length - 'index'.length);
    return rel;
  })
  .filter((p) => !EXCLUDE_PATHS.includes(p))
  .sort();

/** Last-modified date for the sitemap entries. Update when content changes
 *  significantly. Using a fixed date avoids non-reproducible builds. */
// Evaluated at prerender = CI build date; a deploy IS a content change.
const LASTMOD = new Date().toISOString().slice(0, 10);

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlForPath(langCode: string, pagePath: string): string {
  // Canonical URL form is trailing-slash: the site 307s bare paths to it,
  // so sitemap/hreflang targets must already carry the slash.
  const path = pagePath === '' || pagePath.endsWith('/') ? pagePath : `${pagePath}/`;
  return `${SITE_URL}/${langCode}/${path}`;
}

export async function GET(): Promise<Response> {
  const urls: string[] = [];

  for (const lang of LANGUAGES) {
    for (const pagePath of PAGE_PATHS) {
      const loc = urlForPath(lang.code, pagePath);
      const alternates = LANGUAGES.map(
        (l) =>
          `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${escapeXml(urlForPath(l.code, pagePath))}"/>`,
      ).join('\n');
      // x-default points to the English version (canonical default locale).
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(urlForPath('en', pagePath))}"/>`;

      urls.push(
        [
          '  <url>',
          `    <loc>${escapeXml(loc)}</loc>`,
          `    <lastmod>${LASTMOD}</lastmod>`,
          `    <changefreq>${pagePath === '' ? 'weekly' : 'monthly'}</changefreq>`,
          `    <priority>${pagePath === '' ? '1.0' : '0.8'}</priority>`,
          alternates,
          xDefault,
          '  </url>',
        ].join('\n'),
      );
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
