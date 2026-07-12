# Devin Rule: Fixed Package Versions (No Ranges)

## Trigger
- Applies to ALL `package.json` files in this repository.
- Applies whenever a package is added, updated, or its version is modified.

## Rule

### All package versions MUST be pinned to exact versions.

- **ALLOWED**: `"astro": "7.0.7"` — exact, no prefix.
- **FORBIDDEN**: `"astro": "^7.0.7"` — caret range.
- **FORBIDDEN**: `"astro": "~7.0.7"` — tilde range.
- **FORBIDDEN**: `"astro": ">=7.0.7"` — unbounded range.
- **FORBIDDEN**: `"astro": "latest"` — floating tag.
- **FORBIDDEN**: `"astro": "*"` — wildcard.

### Why

1. **Reproducibility**: Every dev machine, CI build, and production release
   gets the exact same dependency tree that was used during the test and UAT
   phase. No "lucky loot" — no surprise patch/minor that behaves differently.
2. **Stability**: A `pnpm install` on any machine at any time produces the
   same `node_modules`. A rebuild during a prod release cannot accidentally
   pull a newer patch that wasn't tested.
3. **Controlled upgrades**: Upgrading a dependency is a deliberate, tested
   action — not something that happens silently because of a range
   resolution.

### Exceptions

- **`workspace:*`** and **`file:../...`** protocols are allowed for internal
  monorepo packages. These are not registry packages and their version is
  determined by the local workspace, not by semver resolution.
- **`catalog:`** protocol is allowed if the workspace uses pnpm catalogs
  (the catalog itself must pin exact versions).

### Upgrade Procedure

When upgrading a package version:

1. Run `pnpm view <package> version` to get the latest absolute version.
2. Run `pnpm view <package>@<current-major> version` to get the latest
   version within the current major (safe patch/minor).
3. Decide which version to pin:
   - **Patch/minor within current major**: safe, no breaking changes.
   - **Major bump**: requires dedicated testing session — never do it
     silently as part of another task.
4. Set the exact version in `package.json` (no `^`, `~`, or other prefix).
5. Run `pnpm install` to update the lockfile.
6. Run the project's test suite to verify the upgrade didn't break anything.

### Enforcement

- AI agent MUST NOT add `^`, `~`, `>=`, `*`, or `latest` prefixes to any
  registry package version in `package.json`.
- AI agent MUST pin exact versions when adding new dependencies.
- AI agent MUST NOT change a pinned version to a range as a "quick fix"
  for a resolution conflict.
- When reviewing PRs, flag any range-prefixed versions as violations.
