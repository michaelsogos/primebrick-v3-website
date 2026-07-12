#!/usr/bin/env node
/**
 * Sync DeepWiki content to Astro content collections.
 * Calls Devin MCP (https://mcp.devin.ai/mcp) with API key.
 * Uses ask_question tool (read_wiki_structure/contents have a known bug).
 *
 * Optimization: ONE ask_question call per repo (not N+1).
 * Asks for the complete wiki as a single markdown document, then splits by ## headings.
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
 * Clean AI response: remove preamble and footer.
 */
function cleanMarkdownResponse(text) {
  let cleaned = text;

  // Remove preamble before the first markdown heading
  const firstHeading = cleaned.search(/^#{1,6}\s/m);
  if (firstHeading > 0) cleaned = cleaned.slice(firstHeading);

  // Remove footer
  const footerIdx = cleaned.indexOf('Wiki pages you might want to explore:');
  if (footerIdx >= 0) cleaned = cleaned.slice(0, footerIdx).trimEnd();

  const searchIdx = cleaned.indexOf('View this search on DeepWiki:');
  if (searchIdx >= 0) cleaned = cleaned.slice(0, searchIdx).trimEnd();

  return cleaned.trim();
}

/**
 * Split a markdown document by ## (h2) headings into separate pages.
 * Content before the first ## becomes the overview.
 */
function splitByHeadings(markdown) {
  const pages = [];
  const lines = markdown.split('\n');
  let currentTitle = 'Overview';
  let currentContent = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      // Save previous section
      if (currentContent.length > 0) {
        pages.push({ title: currentTitle, content: currentContent.join('\n').trim() });
      }
      currentTitle = h2Match[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  // Save last section
  if (currentContent.length > 0) {
    pages.push({ title: currentTitle, content: currentContent.join('\n').trim() });
  }

  return pages;
}

async function syncRepo(repo) {
  const targetDir = join(projectRoot, repo.dir);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  const timestamp = new Date().toISOString();

  // Single ask_question call: get the entire wiki as one markdown document
  let fullContent;
  try {
    console.log(`  Fetching complete wiki for ${repo.name}...`);
    fullContent = await callMcpTool('ask_question', {
      repoName: repo.name,
      question: `Output the complete wiki documentation for this repository as a single markdown document. Use ## for each major documentation section (Overview, Architecture, Components, API, Database, Authentication, etc.) and ### for subsections. Include code examples where relevant. Do not include any preamble or explanation — start directly with the markdown content. Be comprehensive but factual — only include information that is actually present in the repository.`,
    });
  } catch (err) {
    console.error(`  Failed to fetch wiki for ${repo.name}: ${err.message}`);
    return;
  }

  const cleaned = cleanMarkdownResponse(fullContent);
  const pages = splitByHeadings(cleaned);

  let pagesWritten = 0;
  for (const page of pages) {
    const slug = slugify(page.title);
    const md = `---
title: "${page.title.replace(/"/g, '\\"')}"
source: deepwiki
repo: "${repo.name}"
deepwiki_topic: "${page.title.replace(/"/g, '\\"')}"
last_synced_at: "${timestamp}"
---

## ${page.title}

${page.content}
`;
    writeFileSync(join(targetDir, `${slug}.md`), md, 'utf-8');
    pagesWritten++;
  }

  // Also write the full document as a fallback
  writeFileSync(join(targetDir, '_full.md'), `---
title: "${repo.slug} — Full DeepWiki"
source: deepwiki
repo: "${repo.name}"
last_synced_at: "${timestamp}"
---

${cleaned}
`, 'utf-8');
  pagesWritten++;

  console.log(`  Wrote ${pagesWritten} files to ${repo.dir} (from 1 API call)`);
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
