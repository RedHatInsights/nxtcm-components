# Architecture

How the codebase is organized, why it's split the way it is, and how the pieces connect.

---

## Monorepo structure

```text
nxtcm-components/
├── packages/
│   ├── nxtcm-dashboard/          @redhat-cloud-services/nxtcm-dashboard
│   ├── nxtcm-rosa-hcp-wizard/    @redhat-cloud-services/nxtcm-rosa-hcp-wizard
├── src/                           legacy root source folder (currently empty)
├── .storybook/                    Storybook 9 config (covers all packages)
├── playwright/                    CT + E2E infrastructure
└── utils/                         CI helper scripts
```

The repo uses **npm workspaces** (declared in root `package.json` → `workspaces`). Current workspace members are `nxtcm-dashboard` and `nxtcm-rosa-hcp-wizard`.

### Why separate packages?

Dashboard widgets and the ROSA wizard serve different consumer apps with different release cadences. Splitting them means:

- consumers install only what they need (`@redhat-cloud-services/nxtcm-dashboard` or `@redhat-cloud-services/nxtcm-rosa-hcp-wizard`)
- each package can be versioned and published independently
- CI can scope lint/test/build to the changed package

The root `src/` still exists but is currently empty. New work goes into the workspace packages.

---

## Build system

The two workspace packages (dashboard, wizard) are built with **one shared `vite.config.ts`**. The differentiation happens via the `NXTCM_LIB_NAME` environment variable.

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
  - libName   = env NXTCM_LIB_NAME   (defaults to "NXTCM-COMPONENTS")
  - libOutDir = <libRoot>/dist/
```

Each package's build script sets the env var and points at the shared config:

```bash
# packages/nxtcm-dashboard/package.json → scripts.build
rm -rf dist && tsc && NXTCM_LIB_NAME=NXTCM-DASHBOARD vite build --config ../../vite.config.ts

# packages/nxtcm-rosa-hcp-wizard/package.json → scripts.build
rm -rf dist && tsc && NXTCM_LIB_NAME=NXTCM-ROSA-HCP-WIZARD vite build --config ../../vite.config.ts
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
| `dist/index.js` | ESM | tree-shakeable import for modern bundlers |
| `dist/index.umd.js` | UMD | legacy/CDN consumption |
| `dist/index.css` | CSS | component styles (Vite renames `style.css` → `index.css`) |
| `dist/index.d.ts` (+ co-located `*.d.ts`) | types | TypeScript declarations (via `tsc`) |

### What gets externalized

PatternFly, React, and utility libraries are externalized, not bundled. Consumers supply their own copies via `peerDependencies`. The peer contract differs by package:

- **root**: `@patternfly/react-core`, `react`, `react-dom`, `js-yaml`, `yaml`, `semver`
- **dashboard** (additional): `@patternfly/react-charts`, `@patternfly/react-table`, `@patternfly/widgetized-dashboard`, `@patternfly/react-icons`
- **wizard** (additional): `monaco-editor`, `monaco-yaml`, `@patternfly/react-code-editor`, `@patternfly/react-icons`

Monaco is only a peer dep of the wizard package, not the root or dashboard.

### TypeScript compilation

Each package has its own `tsconfig.json` that extends the root. During build:

1. `tsc` runs first to emit `.d.ts` type declarations into `dist/`
2. `vite build` runs second to bundle the JS + CSS

The root `tsconfig.json` includes all workspace packages for IDE type-checking and `npm run type-check`, but each package's tsconfig scopes its own build output.

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

The root `src/` folder is currently empty and treated as legacy. New work should go into workspace packages.

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
- source: co-located stories in workspace packages plus root-level MDX docs (the `../src/**/*.mdx` glob is configured, but there are currently no `src/**/*.mdx` files)
- guidance: Storybook has its own alias map in `.storybook/main.ts`; package aliases align with the main build, while `@` intentionally differs (`src/` in Storybook vs repo root in Vite/TS)

For cross-package imports, prefer:

- `@redhat-cloud-services/nxtcm-dashboard`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard`
