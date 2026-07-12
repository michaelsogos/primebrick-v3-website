#!/usr/bin/env node
/**
 * Sync DeepWiki content to Astro content collections.
 * Uses read_wiki_contents (instant, returns full pre-generated wiki).
 *
 * Usage: node scripts/sync-deepwiki.mjs
 * Requires: DEVIN_API_KEY environment variable
 *
 * Output: src/content/docs/<repo>/deepwiki/*.md
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const REPOS = [
  { name: 'michaelsogos/primebrick-v3-backend', slug: 'backend', dir: 'src/content/docs/backend/deepwiki' },
  { name: 'michaelsogos/primebrick-v3-frontend', slug: 'frontend', dir: 'src/content/docs/frontend/deepwiki' },
  { name: 'michaelsogos/primebrick-v3-microservices', slug: 'microservices', dir: 'src/content/docs/microservices/deepwiki' },
  { name: 'michaelsogos/primebrick-v3-dal', slug: 'dal', dir: 'src/content/docs/dal/deepwiki' },
  { name: 'michaelsogos/primebrick-v3-sdk', slug: 'sdk', dir: 'src/content/docs/sdk/deepwiki' },
];

const API_KEY = process.env.DEVIN_API_KEY;
if (!API_KEY) {
  console.warn('WARNING: DEVIN_API_KEY not set — skipping DeepWiki sync.');
  console.warn('         Set it as a build secret in Cloudflare dashboard to enable DeepWiki sync.');
  console.warn('         Only in-repo docs will be synced. DeepWiki content will be missing.');
  process.exit(0);
}

const MCP_URL = 'https://mcp.devin.ai/mcp';

/**
 * Call a Devin MCP tool via Streamable HTTP.
 */
async function callMcpTool(toolName, args) {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Authorization': `Bearer ${API_KEY}`,
  };

  // Initialize
  const initResponse = await fetch(MCP_URL, {
    method: 'POST',
    headers: baseHeaders,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'primebrick-web-sync', version: '1.0.0' },
      },
    }),
  });

  if (!initResponse.ok) {
    throw new Error(`MCP initialize failed: ${initResponse.status} ${initResponse.statusText}`);
  }

  const sessionId = initResponse.headers.get('Mcp-Session-Id');
  const headers = { ...baseHeaders };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;

  // Send initialized notification
  await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });

  // Call the tool
  const toolResponse = await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  if (!toolResponse.ok) {
    const errorText = await toolResponse.text();
    throw new Error(`MCP tool call failed: ${toolResponse.status} ${errorText}`);
  }

  // Response may be SSE or plain JSON
  const contentType = toolResponse.headers.get('content-type') || '';
  let result;
  if (contentType.includes('text/event-stream')) {
    const text = await toolResponse.text();
    const dataLines = text.split('\n').filter(l => l.startsWith('data:'));
    const lastData = dataLines[dataLines.length - 1]?.slice(5).trim();
    result = JSON.parse(lastData);
  } else {
    result = await toolResponse.json();
  }

  if (result.error) {
    throw new Error(`MCP error: ${JSON.stringify(result.error)}`);
  }

  const content = result.result?.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === 'text') return item.text;
    }
  }
  return JSON.stringify(result.result);
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Assign a sidebar order based on the wiki page title/structure.
 * This controls the display order in Starlight's autogenerate sidebar,
 * which otherwise sorts alphabetically.
 *
 * Logical reading sequence:
 *   1. Overview / Introduction / Home
 *   2. Architecture
 *   3. Components / Modules / Services
 *   4. Database / Data Model
 *   5. API / Endpoints
 *   6. Authentication / Security
 *   7. Configuration
 *   8. Deployment / Infrastructure
 *   9. Testing
 *  10. Development / Contributing
 * 100+. Everything else (alphabetical among themselves)
 */
function getSidebarOrder(title) {
  const lower = (title || '').toLowerCase();
  if (lower.includes('overview') || lower.includes('introduction') || lower.includes('home')) return 1;
  if (lower.includes('architecture')) return 2;
  if (lower.includes('component') || lower.includes('module') || lower.includes('service')) return 3;
  if (lower.includes('database') || lower.includes('data model') || lower.includes('data-model')) return 4;
  if (lower.includes('api') || lower.includes('endpoint')) return 5;
  if (lower.includes('auth') || lower.includes('security')) return 6;
  if (lower.includes('config')) return 7;
  if (lower.includes('deploy') || lower.includes('infra')) return 8;
  if (lower.includes('test')) return 9;
  if (lower.includes('develop') || lower.includes('contribut')) return 10;
  return 100; // everything else goes last
}

/**
 * Parse read_wiki_contents response into separate pages.
 * The response uses "# Page: <Title>" as page separators.
 * Returns array of { title, content }.
 */
function parseWikiPages(text) {
  const pages = [];
  // Split by "# Page:" marker
  const sections = text.split(/^# Page:\s+/m);

  for (const section of sections) {
    if (!section.trim()) continue;

    // First line after "# Page: " is the title
    const newlineIdx = section.indexOf('\n');
    if (newlineIdx < 0) continue;

    const title = section.slice(0, newlineIdx).trim();
    const content = section.slice(newlineIdx + 1).trim();

    if (title && content) {
      pages.push({ title, content });
    }
  }

  return pages;
}

async function syncRepo(repo) {
  const targetDir = join(projectRoot, repo.dir);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  const timestamp = new Date().toISOString();

  // Single read_wiki_contents call — instant, returns full pre-generated wiki
  let wikiText;
  try {
    console.log(`  Fetching wiki contents for ${repo.name}...`);
    wikiText = await callMcpTool('read_wiki_contents', { repoName: repo.name });
  } catch (err) {
    console.error(`  Failed to fetch wiki for ${repo.name}: ${err.message}`);
    console.error(`  Skipping — visit https://app.devin.ai/wiki/${repo.name} to check wiki status.`);
    return;
  }

  const pages = parseWikiPages(wikiText);

  if (pages.length === 0) {
    // Fallback: write the entire response as a single file
    console.warn(`  No page markers found — writing single file.`);
    writeFileSync(join(targetDir, '_full.md'), `---
title: "${repo.slug} — Full DeepWiki"
source: deepwiki
repo: "${repo.name}"
last_synced_at: "${timestamp}"
sidebar:
  order: 1
---

${wikiText}
`, 'utf-8');
    console.log(`  Wrote 1 file to ${repo.dir}`);
    return;
  }

  let pagesWritten = 0;
  for (const page of pages) {
    const slug = slugify(page.title);
    const order = getSidebarOrder(page.title);
    const md = `---
title: "${page.title.replace(/"/g, '\\"')}"
source: deepwiki
repo: "${repo.name}"
deepwiki_page: "${page.title.replace(/"/g, '\\"')}"
last_synced_at: "${timestamp}"
sidebar:
  order: ${order}
---

${page.content}
`;
    writeFileSync(join(targetDir, `${slug}.md`), md, 'utf-8');
    pagesWritten++;
  }

  console.log(`  Wrote ${pagesWritten} pages to ${repo.dir}`);
}

// Main
console.log('=== DeepWiki sync started ===');

for (const repo of REPOS) {
  console.log(`Syncing ${repo.name}...`);
  try {
    await syncRepo(repo);
  } catch (err) {
    console.error(`Failed to sync ${repo.name}: ${err.message}`);
  }
}

console.log('=== DeepWiki sync complete ===');
