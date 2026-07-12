#!/usr/bin/env node
/**
 * Sync in-repo docs/ folders to Astro content collections.
 * Shallow-clones each repo (depth 1), copies docs/ + README.md + AGENTS.md.
 *
 * Usage: node scripts/sync-repo-docs.mjs
 *
 * Output: src/content/docs/<repo>/manual/*.md
 */
import { execSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  rmSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
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

function addFrontmatter(content, title, repoSlug) {
  if (content.startsWith('---')) {
    return content;
  }
  return `---
title: "${title}"
source: manual
repo: "${repoSlug}"
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
  content = addFrontmatter(content, title, repoSlug);
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

  // Copy docs/ folder if it exists
  const docsDir = join(cloneDir, 'docs');
  if (existsSync(docsDir)) {
    const mdFiles = findMarkdownFiles(docsDir);
    for (const mdFile of mdFiles) {
      const relativePath = mdFile.slice(docsDir.length);
      const destPath = join(targetDir, relativePath);
      processMarkdownFile(mdFile, destPath, repo.slug);
    }
    console.log(`  Copied ${mdFiles.length} files from docs/`);
  }

  // Copy README.md as overview
  const readme = join(cloneDir, 'README.md');
  if (existsSync(readme)) {
    processMarkdownFile(readme, join(targetDir, 'overview.md'), repo.slug);
    console.log(`  Copied README.md as overview.md`);
  }

  // Copy AGENTS.md as architecture reference
  const agents = join(cloneDir, 'AGENTS.md');
  if (existsSync(agents)) {
    processMarkdownFile(agents, join(targetDir, 'agents-guide.md'), repo.slug);
    console.log(`  Copied AGENTS.md as agents-guide.md`);
  }
}

function findMarkdownFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden directories and .obsidian
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      results.push(...findMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }
  return results;
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
