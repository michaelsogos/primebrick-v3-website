#!/usr/bin/env node
/**
 * Sync DeepWiki content to Astro content collections.
 * Calls Devin MCP (https://mcp.devin.ai/mcp) with API key.
 * Uses ask_question tool (read_wiki_structure/contents have a known bug).
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
  // MCP Streamable HTTP requires Accept header for content negotiation
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Authorization': `Bearer ${API_KEY}`,
  };

  // Initialize: send initialize request to get session
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

  // Extract session ID from the Mcp-Session-Id header if present
  const sessionId = initResponse.headers.get('Mcp-Session-Id');

  const headers = { ...baseHeaders };
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

  // Response may be SSE (text/event-stream) or plain JSON
  const contentType = toolResponse.headers.get('content-type') || '';
  let result;
  if (contentType.includes('text/event-stream')) {
    // Parse SSE: extract the last data: line containing the JSON-RPC response
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

/**
 * Clean AI response: remove preamble and footer that ask_question adds.
 */
function cleanMarkdownResponse(text) {
  let cleaned = text;

  // Remove preamble before the first markdown heading or code block
  // Common patterns: "The user is asking for...", "Here is...", etc.
  const firstHeading = cleaned.search(/^#{1,6}\s/m);
  const firstCodeBlock = cleaned.search(/^```/m);
  let cutIndex = -1;
  if (firstHeading >= 0) cutIndex = firstHeading;
  if (firstCodeBlock >= 0 && (cutIndex < 0 || firstCodeBlock < cutIndex)) cutIndex = firstCodeBlock;
  if (cutIndex > 0) {
    cleaned = cleaned.slice(cutIndex);
  }

  // Remove footer: everything after "Wiki pages you might want to explore:"
  const footerIdx = cleaned.indexOf('Wiki pages you might want to explore:');
  if (footerIdx >= 0) {
    cleaned = cleaned.slice(0, footerIdx).trimEnd();
  }

  // Remove footer: "View this search on DeepWiki:"
  const searchIdx = cleaned.indexOf('View this search on DeepWiki:');
  if (searchIdx >= 0) {
    cleaned = cleaned.slice(0, searchIdx).trimEnd();
  }

  return cleaned.trim();
}

/**
 * Parse a topic list from ask_question response.
 * The response may be a JSON array or a newline-separated list.
 */
function parseTopicList(text) {
  // Try JSON first
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
    if (parsed.topics && Array.isArray(parsed.topics)) {
      return parsed.topics.map(String);
    }
  } catch {
    // Not JSON — try line-by-line
  }

  // Try extracting lines that look like topic titles
  const lines = text.split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
    .filter(l => l.length > 2 && l.length < 200 && !l.startsWith('#') && !l.startsWith('```'));
  
  return lines.length > 0 ? lines : [];
}

async function syncRepo(repo) {
  const targetDir = join(projectRoot, repo.dir);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  const timestamp = new Date().toISOString();

  // Step 1: Ask for the list of documentation topics
  let topics = [];
  try {
    console.log(`  Fetching wiki topics for ${repo.name}...`);
    const topicsText = await callMcpTool('ask_question', {
      repoName: repo.name,
      question: 'List all the main documentation topics/pages available for this repository. Return ONLY a JSON array of strings, each being a topic title. No explanation, no markdown, just the JSON array.',
    });
    topics = parseTopicList(topicsText);
    console.log(`  Found ${topics.length} topics: ${topics.slice(0, 5).join(', ')}${topics.length > 5 ? '...' : ''}`);
  } catch (err) {
    console.error(`  Failed to fetch topics for ${repo.name}: ${err.message}`);
    console.error(`  Falling back to single-page documentation.`);
  }

  let pagesWritten = 0;

  // Step 2: For each topic, ask for the full content
  if (topics.length > 0) {
    for (const topic of topics) {
      try {
        const slug = slugify(topic);
        console.log(`    Fetching: ${topic}...`);
        const content = await callMcpTool('ask_question', {
          repoName: repo.name,
          question: `Write the complete documentation page about "${topic}" for this repository. Use markdown format with proper headings (##, ###), code examples where relevant, and clear explanations. Do not include any preamble — start directly with the markdown content.`,
        });

        const md = `---
title: "${topic.replace(/"/g, '\\"')}"
source: deepwiki
repo: "${repo.name}"
deepwiki_topic: "${topic.replace(/"/g, '\\"')}"
last_synced_at: "${timestamp}"
---

${cleanMarkdownResponse(content)}
`;
        writeFileSync(join(targetDir, `${slug}.md`), md, 'utf-8');
        pagesWritten++;
      } catch (err) {
        console.error(`    Failed to fetch topic "${topic}": ${err.message}`);
      }
    }
  }

  // Step 3: Always write an overview page
  try {
    console.log(`  Fetching overview for ${repo.name}...`);
    const overview = await callMcpTool('ask_question', {
      repoName: repo.name,
      question: 'Provide a comprehensive overview of this repository: what it is, its architecture, main components, key design decisions, and how it fits into the larger Primebrick v3 ecosystem. Use markdown format with proper headings. Do not include any preamble — start directly with the markdown content.',
    });

    const md = `---
title: "Overview"
source: deepwiki
repo: "${repo.name}"
deepwiki_topic: "Overview"
last_synced_at: "${timestamp}"
---

${cleanMarkdownResponse(overview)}
`;
    writeFileSync(join(targetDir, 'overview.md'), md, 'utf-8');
    pagesWritten++;
  } catch (err) {
    console.error(`  Failed to fetch overview for ${repo.name}: ${err.message}`);
  }

  console.log(`  Wrote ${pagesWritten} files to ${repo.dir}`);
}

// Main
console.log('=== DeepWiki sync started ===');

for (const repo of REPOS) {
  console.log(`Syncing ${repo.name}...`);
  try {
    await syncRepo(repo);
  } catch (err) {
    console.error(`Failed to sync ${repo.name}: ${err.message}`);
    // Continue with other repos — partial sync is OK
  }
}

console.log('=== DeepWiki sync complete ===');
