#!/usr/bin/env node
/**
 * Sync DeepWiki content to Astro content collections.
 * Calls Devin MCP (https://mcp.devin.ai/mcp) with API key.
 * Fetches wiki structure + contents for each repo, writes MD files.
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
 * Uses raw fetch — no SDK dependency needed for simple tool calls.
 */
async function callMcpTool(toolName, args) {
  // Initialize: send tools/list to get session, then call the tool
  const initResponse = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
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

  // Extract session ID from the Mcp-Session-Id header if present
  const sessionId = initResponse.headers.get('Mcp-Session-Id');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
  if (sessionId) {
    headers['Mcp-Session-Id'] = sessionId;
  }

  // Send initialized notification
  await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
    }),
  });

  // Call the tool
  const toolResponse = await fetch(MCP_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args,
      },
    }),
  });

  if (!toolResponse.ok) {
    const errorText = await toolResponse.text();
    throw new Error(`MCP tool call failed: ${toolResponse.status} ${errorText}`);
  }

  const result = await toolResponse.json();

  if (result.error) {
    throw new Error(`MCP error: ${JSON.stringify(result.error)}`);
  }

  // Extract text content from the result
  const content = result.result?.content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === 'text') {
        return item.text;
      }
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

async function syncRepo(repo) {
  const targetDir = join(projectRoot, repo.dir);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  let structure;
  try {
    console.log(`  Fetching wiki structure for ${repo.name}...`);
    const structureText = await callMcpTool('read_wiki_structure', { repoName: repo.name });
    structure = JSON.parse(structureText);
  } catch (err) {
    console.error(`  Failed to fetch wiki structure for ${repo.name}: ${err.message}`);
    console.error(`  Skipping — wiki may not be generated yet. Visit https://app.devin.ai/wiki/${repo.name}`);
    return;
  }

  let contentsText;
  try {
    console.log(`  Fetching wiki contents for ${repo.name}...`);
    contentsText = await callMcpTool('read_wiki_contents', { repoName: repo.name });
  } catch (err) {
    console.error(`  Failed to fetch wiki contents for ${repo.name}: ${err.message}`);
    return;
  }

  const timestamp = new Date().toISOString();

  // Try to parse structure and write individual page files
  let pagesWritten = 0;
  const pages = structure.pages || structure.topics || structure.docs || [];

  if (Array.isArray(pages) && pages.length > 0) {
    for (const page of pages) {
      const slug = page.slug || page.id || slugify(page.title || 'untitled');
      const title = page.title || slug;
      const content = page.content || '';

      const md = `---
title: "${title.replace(/"/g, '\\"')}"
source: deepwiki
repo: "${repo.name}"
deepwiki_page_id: "${slug}"
last_synced_at: "${timestamp}"
---

${content || contentsText}
`;
      const filePath = join(targetDir, `${slug}.md`);
      writeFileSync(filePath, md, 'utf-8');
      pagesWritten++;
    }
  }

  // Always write a full contents fallback file
  const fullMd = `---
title: "${repo.slug} — Full DeepWiki"
source: deepwiki
repo: "${repo.name}"
last_synced_at: "${timestamp}"
---

${contentsText}
`;
  writeFileSync(join(targetDir, '_full.md'), fullMd, 'utf-8');
  pagesWritten++;

  console.log(`  Wrote ${pagesWritten} files to ${repo.dir}`);
}

// Main
console.log('=== DeepWiki sync started ===');

for (const repo of REPOS) {
  console.log(`Syncing ${repo.name}...`);
  try {
    syncRepo(repo);
  } catch (err) {
    console.error(`Failed to sync ${repo.name}: ${err.message}`);
    // Continue with other repos — partial sync is OK
  }
}

console.log('=== DeepWiki sync complete ===');
