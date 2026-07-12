# AI AGENT INSTRUCTIONS - Primebrick Website (primebrick.dev)

## ⚠️ CRITICAL: NEVER COMMIT AUTOMATICALLY

**AI agents MUST NEVER commit changes without explicit user instruction.**

- WAIT for the user to explicitly tell you to commit before running any `git commit` command
- This applies to ALL situations - no exceptions

## Repository overview

`primebrick-v3-website` is the product website for Primebrick, deployed at `primebrick.dev`.
It is an Astro static site (hybrid rendering) deployed to Cloudflare Workers free plan.

The site serves three purposes:
1. **Institutional / marketing landing pages** — product overview, features, pricing
2. **Project documentation** — architecture docs, guides sourced from DeepWiki + in-repo `docs/` folders
3. **OpenAPI REPL / API explorer** — interactive API docs with live try-it, powered by Scalar

**Tech stack**: Astro + @astrojs/svelte + @astrojs/starlight + @scalar/astro + Tailwind CSS 4
**Deployment**: Cloudflare Workers (free plan) via `wrangler deploy`
**Rendering**: Hybrid — all pages prerendered by default (0ms Worker CPU, free unlimited static asset requests)

**Documentation language:** All `*.md` files must use **English** for team-facing prose.

## Commands

| Action | Command |
|--------|---------|
| Install | `pnpm install` |
| Dev | `pnpm run dev` (port 4321) |
| Build | `pnpm run build` |
| Preview | `pnpm run preview` |
| Deploy | `pnpm run build && npx wrangler deploy` |
| Sync in-repo docs | `node scripts/sync-repo-docs.mjs` |
| Sync DeepWiki | `DEVIN_API_KEY=xxx node scripts/sync-deepwiki.mjs` |

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
Ensure you follow branch management, version tagging, and commit protocols.
