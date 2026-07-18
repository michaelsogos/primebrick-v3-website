# AI AGENT INSTRUCTIONS - Primebrick Website (primebrick.dev)

## ⚠️ CRITICAL: NEVER COMMIT AUTOMATICALLY

**AI agents MUST NEVER commit changes without explicit user instruction.**

- WAIT for the user to explicitly tell you to commit before running any `git commit` command
- This applies to ALL situations - no exceptions

## Repository overview

`primebrick-v3-website` is the product website for Primebrick, deployed at `primebrick.dev`.
It is an Astro static site (hybrid rendering) deployed to Cloudflare Workers free plan.

The site serves two purposes:
1. **Institutional / marketing landing pages** — product overview, features, pricing
2. **Links to external docs** — architecture docs and API catalog are hosted on a separate Zudoku site at `docs.primebrick.dev`

**Tech stack**: Astro + @astrojs/svelte + Tailwind CSS 4
**Deployment**: Cloudflare Workers (free plan) via `wrangler deploy`
**Rendering**: Hybrid — all pages prerendered by default (0ms Worker CPU, free unlimited static asset requests)

**Documentation language:** All `*.md` files must use **English** for team-facing prose.

## Commands

| Action | Command |
|--------|---------|
| Install | `pnpm install` |
| Dev | `pnpm run dev` (port 4321) |
| Build | `pnpm run build` |
| Full build (install + build) | `pnpm run build:full` |
| Preview | `pnpm run preview` |
| Deploy | `pnpm run build && npx wrangler deploy` |
| Sync in-repo docs | `node scripts/sync-repo-docs.mjs` |
| Sync DeepWiki | `DEVIN_API_KEY=xxx node scripts/sync-deepwiki.mjs` |

## Cloudflare Workers build command

The Cloudflare build agent (on push to `main`) build command is the single
wrapped script:

```
pnpm run build:full
```

`build:full` is defined in `package.json` and runs `pnpm install && astro build`.
**Do NOT** paste the concatenated chain into the Cloudflare dashboard — keep the
build command as `pnpm run build:full` so the chain is maintained in
`package.json` (editable by dev/AI) rather than in the dashboard.

## CI / Deployment

**This repo uses Cloudflare Worker CI — push to `main` triggers auto-deployment.**

This repo follows **GitFlow**. The default working branch is `develop`. A new
build/deploy is triggered by creating a `release/*` branch, merging it to `main`
with a version tag, and pushing `main` — Cloudflare auto-builds and deploys.

**NEVER work directly on `main`.** `main` is production and auto-deploys on every
push. All day-to-day work happens on `develop` or `feature/*` branches. See
[docs/gitflow.md](./docs/gitflow.md) for complete GitFlow rules.

### Deployment flow

1. Work on `feature/*` branches from `develop`
2. Merge features into `develop` (`--no-ff`)
3. Create `release/<version>` from `develop`
4. Merge `release/<version>` into `main` (`--no-ff`) + tag
5. Push `main` with tags → **Cloudflare auto-deploys**
6. Merge `main` back to `develop`, push `develop`
7. Delete the `release/*` branch

### Primebrick CI/Deployment overview (all repos)

| Repo | CI/Deployment | Process to deploy |
|------|--------------|-------------------|
| **primebrick-v3-website** (this repo) | Cloudflare Worker CI | GitFlow: create release → merge to `main` + tag → Cloudflare auto-deploys |
| **primebrick-v3-docs** | Cloudflare Worker CI | GitFlow: create release → merge to `main` + tag → Cloudflare auto-deploys |
| **primebrick-v3-backend** (BE) | No auto-deploy CI | GitFlow: create release branch → close → merge to `main` + tag |
| **primebrick-v3-frontend** (FE) | No auto-deploy CI | GitFlow: create release branch → close → merge to `main` + tag |
| **primebrick-v3-microservices** (US) | No auto-deploy CI | GitFlow: create release branch → close → merge to `main` + tag |
| **primebrick-v3-sdk** (SDK) | GitHub Actions | GitFlow: create release → close → merge to `main` + tag → CI publishes to npm |
| **primebrick-v3-dal** (DAL) | GitHub Actions | GitFlow: create release → close → merge to `main` + tag → CI publishes to npm |

**Key points for AI agents:**
- **ALL repos follow GitFlow.** The default working branch is `develop` — NEVER
  work on `main` directly.
- **Docs/Website**: Cloudflare auto-deploys when a release is merged to `main`
  with a tag. The release process (release branch → merge to main → tag) is
  mandatory — do NOT push to `main` directly from `develop`.
- **BE/FE/US**: Same GitFlow process. No auto-deploy CI — deployment is the
  tagged release on `main`.
- **SDK/DAL**: Same GitFlow process, but GitHub Actions auto-publishes to npm
  when the tagged release lands on `main`.

## Dev server

Uses **Astro dev server** on port **4321**. Do NOT start a second instance. If the user
already runs the dev server, test against `http://localhost:4321` instead of spawning another.

## Conventions

- **kebab-case** for all filenames
- **Prerender by default** — `export const prerender = true` on all pages unless SSR is explicitly needed
- **No Node.js APIs in SSR code** — Workers runtime is V8 isolate, not Node.js
- **Svelte for interactivity, Astro for static content**
- **Tailwind CSS 4** via `@tailwindcss/vite` — no PostCSS config needed
- **Content Collections** — all docs in `src/content/docs/`, schema in `src/content/config.ts`
- **Synced content is read-only** — never hand-edit files under `deepwiki/` or `manual/` directories

## Sync scripts

Two sync scripts run in GitHub Actions CI (NOT on the Worker):
1. `scripts/sync-repo-docs.mjs` — clones repos, copies `docs/` folders
2. `scripts/sync-deepwiki.mjs` — calls Devin MCP, writes DeepWiki content as MD

Both commit synced content with `[skip ci]` to avoid deploy loops.

## Package Versioning — FIXED versions only (MANDATORY)

All package versions in `package.json` MUST be pinned to exact versions (e.g.
`"astro": "7.0.7"`). NO ranges (`^`, `~`, `>=`, `*`, `latest`) are allowed
for registry packages.

See [.devin/rules/package-versioning.md](./.devin/rules/package-versioning.md)
for the full rule and upgrade procedure.

## Further documentation

- [.devin/rules/](./.devin/rules/) — always-on rules for Devin agents
- [AGENTS.md](./AGENTS.md) — this file

## GitFlow rules

This repository follows GitFlow. AI agents MUST follow these rules.

**See [docs/gitflow.md](./docs/gitflow.md) for complete GitFlow rules, branch
management, closing procedure, version tagging, and commit rules.**

**See [.devin/rules/gitflow.md](./.devin/rules/gitflow.md) for the always-on
Devin enforcement rule (guardrails for git operations).**

Key points:
- **NEVER work on `main`** — `main` is production, auto-deploys on push
- **Default branch is `develop`** — all work starts here or from `feature/*` branches
- **New build = new release** — create `release/<version>`, merge to `main`, tag, push
- **NEVER push to `main` directly** — only via `release/*` or `hotfix/*` branches
- **ALWAYS merge `main` back to `develop`** after a release
