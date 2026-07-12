---
trigger: always_on
---
# Devin Rule: Documentation Sync

## Trigger
- Applies whenever the docs sync scripts (`scripts/sync-deepwiki.mjs`, `scripts/sync-repo-docs.mjs`) are modified, run, or debugged.
- Applies when content collection files under `src/content/docs/*/deepwiki/` or `src/content/docs/*/manual/` are involved.

## Sync Architecture
Two independent sync pipelines feed MD files into Astro Content Collections:

1. **In-repo docs sync** (`scripts/sync-repo-docs.mjs`):
   - Shallow-clones each Primebrick repo (depth 1)
   - Copies `docs/` folder, `README.md`, `AGENTS.md` into `src/content/docs/<repo>/manual/`
   - Adds frontmatter (`title`, `source: manual`, `repo`) to files that lack it
   - Runs in GitHub Actions CI (full Node.js), NOT on the Worker

2. **DeepWiki sync** (`scripts/sync-deepwiki.mjs`):
   - Calls Devin MCP (`https://mcp.devin.ai/mcp`) with `DEVIN_API_KEY`
   - Uses `read_wiki_structure` + `read_wiki_contents` MCP tools
   - Writes MD files into `src/content/docs/<repo>/deepwiki/`
   - Runs in GitHub Actions CI, NOT on the Worker

## Rules
1. **Sync scripts run in CI only**: Never run sync scripts from the Worker. They require Node.js APIs (`fs`, `child_process`) that are not available in the Workers runtime.
2. **DEVIN_API_KEY is a secret**: Store as GitHub Actions secret. NEVER commit it. NEVER log it. NEVER expose it in client-side code.
3. **Partial sync is OK**: If one repo's wiki is unavailable or the MCP call fails, the sync script MUST skip that repo and continue with the others. Do NOT abort the entire sync on a single repo failure.
4. **Frontmatter must match schema**: Synced files MUST have frontmatter that matches the Zod schema in `src/content/config.ts`. If the schema changes, update the sync scripts to match.
5. **Commit synced content**: Sync workflows MUST commit the synced files to git with `[skip ci]` in the commit message to avoid triggering a deploy on every sync. The deploy workflow runs on push to `main` only.
6. **No manual edits to synced files**: Files under `src/content/docs/*/deepwiki/` and `src/content/docs/*/manual/` are auto-generated. Manual edits will be overwritten. For hand-written docs, use `src/content/docs/*/handwritten/` or `src/content/marketing/`.
7. **DeepWiki output format is not guaranteed**: The exact format of `read_wiki_contents` output may change. The sync script includes a fallback (`_full.md`) that stores the entire content as one file if per-page splitting fails. If the parser breaks, inspect the actual MCP output and fix the parser — do NOT blame the content.
8. **Wiki must be generated first**: DeepWiki sync will fail for repos whose wiki hasn't been generated on `app.devin.ai`. The script logs a warning and skips that repo. This is expected behavior, not a bug.

## Enforcement
- AI agent MUST NOT run sync scripts from the Worker runtime.
- AI agent MUST NOT commit `DEVIN_API_KEY` or any credentials.
- AI agent MUST NOT abort sync on a single repo failure — use try/catch per repo.
- AI agent MUST NOT manually edit files under `deepwiki/` or `manual/` directories.
- AI agent MUST include `[skip ci]` in sync commit messages.
