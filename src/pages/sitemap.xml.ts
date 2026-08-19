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

/** Page paths (without locale prefix) that exist for every locale. */
const PAGE_PATHS = [
  '',
  'contact',
  'thank-you',
  'use-cases/',
  'use-cases/developer',
  'use-cases/tech-leader',
  'use-cases/solution-architect',
  'use-cases/cto',
  'use-cases/visionary-entrepreneur',
  'use-cases/soc-team',
  'demo/versions',
] as const;

/** Last-modified date for the sitemap entries. Update when content changes
 *  significantly. Using a fixed date avoids non-reproducible builds. */
const LASTMOD = '2026-07-27';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlForPath(langCode: string, pagePath: string): string {
  return pagePath === ''
    ? `${SITE_URL}/${langCode}/`
    : `${SITE_URL}/${langCode}/${pagePath}`;
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
