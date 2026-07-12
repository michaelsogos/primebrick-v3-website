---
trigger: always_on
---
# Devin Rule: OpenAPI REPL / API Explorer

## Trigger
- Applies whenever the OpenAPI explorer page (`src/pages/api-explorer/`) or the Scalar integration is modified.
- Applies when the BE aggregated OpenAPI endpoint is involved.

## Architecture
1. **Scalar API Reference**: The explorer uses `@scalar/astro` (`ScalarComponent`). It renders an interactive API reference with try-it, code generation, server selector, and auth configuration.
2. **Prerendered page**: The `/api-explorer` page MUST be prerendered (`export const prerender = true`). Scalar runs entirely client-side. No Worker CPU cost.
3. **Client-side spec fetch**: The OpenAPI spec is fetched client-side via `fetch()` from the BE URL the user configures in Scalar's server selector. No build-time fetch, no SSR fetch.
4. **User-configurable BE host**: The user can point the explorer at any BE: `http://localhost:3001`, `https://api.primebrick.dev`, staging, on-prem. Scalar's built-in server selector handles this.
5. **User-configurable auth**: Scalar supports bearer token, API key, and OAuth2 client_credentials. No custom auth code on the website side.

## BE Dependency
1. **Aggregated OpenAPI endpoint**: The BE (`primebrick-be-v3`) exposes `GET /api/v1/openapi/aggregated.json` which merges the BE spec + all online microservice specs from the `service_registry`.
2. **Microservice paths are prefixed**: Paths from microservice specs are prefixed with `/ws/:serviceCode` to match the existing BE proxy.
3. **Partial spec is valid**: If some microservices are offline, the aggregated spec includes only the online ones. The explorer still works — unavailable endpoints just won't be in the spec.
4. **The BE endpoint is public**: Mounted before the auth guard (same as the existing `/api/v1/openapi.json`). No authentication required to fetch the spec.

## Rules
1. **Do NOT fetch the spec at build time**: The spec URL is user-configurable. Build-time fetch would bake in a specific BE URL. The spec must be fetched client-side.
2. **Do NOT add auth logic to the website**: Auth is handled by Scalar's built-in auth UI. The website does not store tokens, manage sessions, or proxy requests.
3. **Do NOT proxy API requests through the Worker**: The "try it" feature sends requests directly from the browser to the BE. CORS must be configured on the BE, not on the website.
4. **CORS is a BE concern**: The BE must allow CORS from `primebrick.dev` (and `localhost:4321` for dev). This is configured in the BE, not in the website repo.
5. **Scalar version pinning**: `@scalar/astro` must be pinned to an exact version (per package-versioning rule). Scalar updates can change the UI/UX — test after upgrading.

## Enforcement
- AI agent MUST set `export const prerender = true` on the api-explorer page.
- AI agent MUST NOT add server-side fetch logic for the OpenAPI spec.
- AI agent MUST NOT add auth/token management code to the website.
- AI agent MUST NOT proxy API requests through the Cloudflare Worker.
- AI agent MUST pin `@scalar/astro` to an exact version.
