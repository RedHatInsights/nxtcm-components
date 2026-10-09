# Architecture

How the codebase is organized, why it's split the way it is, and how the pieces connect.

---

## Monorepo structure

```text
nxtcm-components/
├── packages/
│   ├── nxtcm-dashboard/          @redhat-cloud-services/nxtcm-dashboard
│   ├── nxtcm-rosa-hcp-wizard/    @redhat-cloud-services/nxtcm-rosa-hcp-wizard
├── .storybook/                    Storybook 9 config (covers all packages)
├── playwright/                    CT + E2E infrastructure
└── utils/                         CI helper scripts
```

The repo uses **npm workspaces** (declared in root `package.json` → `workspaces`). Current workspace members are `nxtcm-dashboard` and `nxtcm-rosa-hcp-wizard`.

### Why separate packages?

Dashboard widgets and the ROSA wizard serve different consumer apps with different release cadences. Splitting them means:

- consumers install only what they need (`@redhat-cloud-services/nxtcm-dashboard` or `@redhat-cloud-services/nxtcm-rosa-hcp-wizard`)
- each package can be versioned and published independently

---

## Build system

The two workspace packages (dashboard, wizard) are built with **one shared `vite.config.ts`**. npm runs each workspace's build script from its package directory, which determines the entry point and output directory.

### npm workspaces in this repo

Current workspaces from root `package.json`:

- `packages/nxtcm-dashboard`
- `packages/nxtcm-rosa-hcp-wizard`

Running `npm ci` at the repo root installs dependencies once and wires workspace package links so package imports resolve locally across the monorepo.

Run workspace-scoped scripts from the repo root with `-w`:

```bash
npm run build -w @redhat-cloud-services/nxtcm-dashboard
npm run build -w @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```

Why this setup exists:

- shared tooling/config at root (lint, type-check, Playwright, Storybook, Vite)
- independent package outputs and release boundaries for dashboard and wizard

### How it works

```text
vite.config.ts reads:
  - libRoot   = process.cwd()        (the package directory)
  - libEntry  = <libRoot>/src/index.ts
  - libOutDir = <libRoot>/dist/
```

Each package's build script points at the shared config:

```bash
# packages/nxtcm-dashboard/package.json → scripts.build
rm -rf dist && vite build --config ../../vite.config.ts

# packages/nxtcm-rosa-hcp-wizard/package.json → scripts.build
npm run type-check && rm -rf dist && vite build --config ../../vite.config.ts
```

The root `npm run build` runs the two workspace builds in sequence:

```bash
npm run build -w @redhat-cloud-services/nxtcm-dashboard && npm run build -w @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```

`npm run build` intentionally runs only the two workspace package builds.

### Output per package

Each build produces:

| file | format | purpose |
|------|--------|---------|
| `dist/index.mjs` | ESM | entry selected by `exports.import` and `module` |
| `dist/index.cjs` | CommonJS | entry selected by `exports.require` and `main` |
| `dist/index.css` | CSS | component styles |
| `dist/index.d.mts` | ESM types | bundled declarations selected by `exports.import.types` |
| `dist/index.d.cts` | CommonJS types | bundled declarations selected by `exports.require.types` |
| `dist/index.d.ts` | types fallback | bundled declarations selected by the top-level `types` field |

JavaScript source maps are emitted alongside both module formats. The CSS subpath exports in each package manifest continue to resolve to `dist/index.css`.

### What gets externalized

The shared config externalizes `react` and `react-dom` (including their subpaths), `@patternfly/*`, `js-yaml`, `yaml`, `monaco-editor`, and `monaco-yaml`. React's `jsx-runtime` and `jsx-dev-runtime` therefore resolve from the consuming application's React installation.

The `fullySpecifiedPatternFlyImports` build plugin rewrites external PatternFly component, layout, icon, and chart paths to explicit JavaScript filenames. ES output uses PatternFly's `dist/esm` files; CommonJS output uses its `dist/js` files. This allows strict ES-module resolution without a consumer webpack override for these imports.

Each workspace's `peerDependencies` declares its own consumer requirements. Monaco is a peer dependency of the wizard package only. See the [dashboard manifest](../packages/nxtcm-dashboard/package.json) and [wizard manifest](../packages/nxtcm-rosa-hcp-wizard/package.json) for the complete contracts.

### TypeScript compilation

Each package has its own `tsconfig.json` that extends the root. During build, Vite owns `dist/`:

1. Vite emits `dist/index.mjs`, `dist/index.cjs`, and `dist/index.css`.
2. `unplugin-dts` (`bundleTypes: true`) bundles public declarations and emits `index.d.ts`, `index.d.mts`, and `index.d.cts` through its `outDirs` configuration.

The wizard's build runs `npm run type-check` (`tsc --noEmit`) before Vite. The dashboard's build invokes Vite directly; use its `npm run type-check` script for a separate compilation check.

The root `tsconfig.json` includes all workspace packages for IDE type-checking and `npm run type-check`, but each package's tsconfig scopes its own sources.

### Path aliases

Package aliases are consistent across all tools:

| alias | resolves to |
|-------|-------------|
| `@redhat-cloud-services/nxtcm-dashboard` | `packages/nxtcm-dashboard/src` |
| `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` | `packages/nxtcm-rosa-hcp-wizard/src` |

The `@/` alias is **not consistent** across tools:

| tool | `@` / `@/` resolves to |
|------|------------------------|
| `vite.config.ts` | `./` (repo root) |
| `tsconfig.json` | `./` (repo root) |
| `.storybook/main.ts` | `src/` |
| `playwright-ct.config.ts` | `src/` |
| `jest.config.js` | `src/` |

Because of this inconsistency, prefer the package aliases above for new code. Imports like `@/packages/...` can resolve in Vite/TypeScript but fail in Jest/Storybook/Playwright CT where `@/` resolves to `src/`.

---

## Scope of this document

This doc is intentionally narrow. It covers the mechanics shared across packages: build plumbing, alias behavior, and CI/test orchestration.

It does not try to re-explain package internals (component structure, field contracts, feature behavior). That detail belongs in package docs and overlays.

---

## Testing strategy

This repo is a component library, so the main signal should come from **unit tests** (logic) and **component tests** (rendering and interaction). We keep a small E2E slice here for smoke coverage, but full user journeys belong in consumer repos (ACM console and OCM portal), where routing, API wiring, and auth actually live.

Storybook is the shared visual dev/review surface. It is the quickest way to validate states and catch visual regressions before integration.

### What runs in CI

Main CI runs lint, type-check, unit tests, CT, E2E, build, and storybook in parallel. `coverage-contract` waits for unit/CT/E2E, then combines their outputs into `test-coverage-data.json`.

Additional workflows:

| workflow | trigger | purpose |
|----------|---------|---------|
| `ct-triage-comment.yml` | `workflow_run` after CI completes (failure + PR) | posts CT failure summaries as PR comments |
| `publish-package.yml` | release published | publishes workspace packages to npm |
| `deploy-storybook.yml` | push to main | deploys Storybook to GitHub Pages |
| `check-links.yml` | schedule + manual | validates external links and reports failures |

---

## Storybook

Storybook 9 (`@storybook/react-vite`) is the shared component docs and visual QA surface for this repo.

- audience: package contributors and reviewers validating behavior before integration
- source: co-located stories in workspace packages (`packages/*/src/**/*.stories.tsx`)
- visibility gating: Storybook tags separate public vs internal components:
  - **Public**: stories for components re-exported in `packages/*/src/index.ts` use `tags: ['autodocs']` and titles under `Components/Dashboard/` or `Wizards/`. Included in all environments (local dev, static build, GitHub Pages).
  - **Internal**: stories for internal subcomponents use `tags: ['autodocs', 'internal']` and titles under `Internal/`. Local `npm run storybook` shows them in the sidebar. `storybook build` (CI and GitHub Pages) hides them from the sidebar and docs via `excludeFromSidebar` and `excludeFromDocsStories`. They remain in `index.json`, and a direct URL still opens them.
  - Assert script `npm run storybook:assert-public` validates that all required public components are present in the static build index in CI.
- aliases: see [Path aliases](#path-aliases) above for the per-tool breakdown; prefer the package aliases for cross-package imports
