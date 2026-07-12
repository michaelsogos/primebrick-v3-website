#!/usr/bin/env node
/**
 * Sync README.md from each repo to Astro content collections.
 * Shallow-clones each repo (depth 1), copies README.md only.
 * NOTE: docs/ folders are NOT copied — they contain AI agent instructions,
 * not human-facing documentation. Human docs come from DeepWiki sync.
 *
 * Usage: node scripts/sync-repo-docs.mjs
 *
 * Output: src/content/docs/<repo>/manual/*.md
 */
import { execSync } from 'node:child_process';
import {
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const REPOS = [
  { git: 'https://github.com/michaelsogos/primebrick-v3-backend.git', slug: 'backend', dir: 'src/content/docs/backend/manual' },
  { git: 'https://github.com/michaelsogos/primebrick-v3-frontend.git', slug: 'frontend', dir: 'src/content/docs/frontend/manual' },
  { git: 'https://github.com/michaelsogos/primebrick-v3-microservices.git', slug: 'microservices', dir: 'src/content/docs/microservices/manual' },
  { git: 'https://github.com/michaelsogos/primebrick-v3-dal.git', slug: 'dal', dir: 'src/content/docs/dal/manual' },
  { git: 'https://github.com/michaelsogos/primebrick-v3-sdk.git', slug: 'sdk', dir: 'src/content/docs/sdk/manual' },
];

const TMP_DIR = join(projectRoot, '.tmp-repo-sync');

/**
 * Assign a sidebar order based on a title or filename.
 * This controls the display order in Starlight's autogenerate sidebar,
 * which otherwise sorts alphabetically.
 *
 * Logical reading sequence:
 *   1. Overview / Introduction / Home / Getting Started / Quickstart / README
 *   2. Architecture / AGENTS
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
 * Determine the sidebar order for a manual doc file.
 * README.md -> overview.md (order 1, always first)
 * AGENTS.md -> agents.md (order 2)
 * getting-started / quickstart files -> order 1 or 2
 * Other docs/ files -> order based on title via getSidebarOrder
 */
function getManualSidebarOrder(filename, title) {
  const lower = (filename || '').toLowerCase();
  // README is always copied as overview.md — it should be first
  if (lower === 'readme' || lower === 'overview') return 1;
  // AGENTS.md should come right after README
  if (lower === 'agents') return 2;
  // getting-started / quickstart files get priority
  if (lower.includes('getting-started') || lower.includes('quickstart') || lower.includes('quick-start')) {
    return 1;
  }
  return getSidebarOrder(title);
}

function addFrontmatter(content, title, repoSlug, sidebarOrder) {
  if (content.startsWith('---')) {
    return content;
  }
  const order = sidebarOrder !== undefined ? sidebarOrder : getSidebarOrder(title);
  return `---
title: "${title}"
source: manual
repo: "${repoSlug}"
sidebar:
  order: ${order}
---

${content}`;
}

function processMarkdownFile(srcPath, destPath, repoSlug) {
  let content = readFileSync(srcPath, 'utf-8');
  const filename = basename(srcPath, '.md');
  const title = filename
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const order = getManualSidebarOrder(filename, title);
  content = addFrontmatter(content, title, repoSlug, order);
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, content, 'utf-8');
}

function syncRepo(repo) {
  console.log(`Syncing docs for ${repo.slug}...`);
  const cloneDir = join(TMP_DIR, repo.slug);

  rmSync(cloneDir, { recursive: true, force: true });
  mkdirSync(cloneDir, { recursive: true });

  try {
    execSync(`git clone --depth 1 ${repo.git} ${cloneDir}`, {
      stdio: 'pipe',
      timeout: 60000,
    });
  } catch (err) {
    console.error(`  Failed to clone ${repo.git}: ${err.message}`);
    return;
  }

  const targetDir = join(projectRoot, repo.dir);
  rmSync(targetDir, { recursive: true, force: true });
  mkdirSync(targetDir, { recursive: true });

  // Copy README.md as overview (human-facing project overview)
  // NOTE: We do NOT copy docs/ folders — those contain AI agent instructions,
  // not human-facing documentation. Human docs come from DeepWiki sync.
  const readme = join(cloneDir, 'README.md');
  if (existsSync(readme)) {
    processMarkdownFile(readme, join(targetDir, 'overview.md'), repo.slug);
    console.log(`  Copied README.md as overview.md`);
  }

}

// Main
console.log('=== In-repo docs sync started ===');
rmSync(TMP_DIR, { recursive: true, force: true });
mkdirSync(TMP_DIR, { recursive: true });

for (const repo of REPOS) {
  try {
    syncRepo(repo);
  } catch (err) {
    console.error(`Failed to sync ${repo.slug}: ${err.message}`);
  }
}

// Cleanup
rmSync(TMP_DIR, { recursive: true, force: true });
console.log('=== In-repo docs sync complete ===');
