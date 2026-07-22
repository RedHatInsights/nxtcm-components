# Architecture

How the codebase is organized, why it's split the way it is, and how the pieces connect.

---

## Monorepo structure

```text
nxtcm-components/
├── packages/
│   ├── nxtcm-dashboard/          @redhat-cloud-services/nxtcm-dashboard
│   ├── nxtcm-rosa-hcp-wizard/    @redhat-cloud-services/nxtcm-rosa-hcp-wizard
├── src/                           root library (nxtcm-components)
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

The root `src/` still exists but is being phased out. New work goes into the workspace packages.

---

## Build system

The two workspace packages (dashboard, wizard) are built with **one shared `vite.config.ts`**. The differentiation happens via the `NXTCM_LIB_NAME` environment variable. The root library (`src/`) uses the same vite config but is being phased out and is not included in `npm run build`.

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

The root library can still be built separately by running `vite build` from the repo root (defaults `NXTCM_LIB_NAME` to `NXTCM-COMPONENTS`), but new work should go into the workspace packages.

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

## Component architecture

### Shared vs package-specific

| location | what goes here | examples |
|----------|---------------|----------|
| `packages/nxtcm-dashboard/src/` | dashboard home widgets (cards, charts, panels) | CVECard, TotalClusters, CostManagement |
| `packages/nxtcm-rosa-hcp-wizard/src/` | ROSA HCP cluster creation wizard (steps, fields, validation) | Steps/BasicSetup, Steps/Networking, yupSchemas |
| root `src/` (legacy) | shared console UI used by both consumer apps | ConsoleBreadcrumbs, PageHeader |

### Co-location pattern

Every component lives in its own directory with all related files:

```text
ComponentName/
├── ComponentName.tsx              the component
├── ComponentName.stories.tsx      Storybook story (CSF3)
├── ComponentName.spec.tsx         Playwright CT test
├── ComponentName.spec-helpers.tsx test setup, mock data, wrappers
├── ComponentName.test.ts          Jest unit test (for logic-heavy code)
├── ComponentName.module.scss      scoped styles (if needed)
└── index.ts                       barrel export
```

### No HTTP calls from components

Components never own API clients. Consuming apps (ACM console, OCM portal) handle all backend communication and pass data down via props. This is a hard boundary.

---

## Data contracts

### Dashboard widgets: `data` + `isLoading`

Dashboard widgets receive flat props. The host app fetches data and passes results directly:

```tsx
type ClustersWithIssuesProps = {
  data?: ClustersWithIssuesData;
  isLoading?: boolean;
  onClusterClick?: (cluster: ClusterIssue) => void;
};
```

When `isLoading` is true, the widget renders PatternFly `Skeleton` placeholders. When data arrives, skeletons swap to real content. No `fetch` callback, no error prop handling in most widgets (the host app handles retries).

### ROSA wizard: `Resource<T>`

The wizard uses a richer contract because fields have interdependencies (selecting a region triggers refetch of VPCs, subnets, etc.):

```tsx
type Resource<TData, TArgs extends unknown[] = []> = {
  data: TData;
  error: string | null;
  isFetching: boolean;
  fetch?: (...args: TArgs) => Promise<void>;
};
```

Key points:

- `fetch` is optional and typed with specific args (e.g., `fetch: (awsAccount: string) => Promise<void>`)
- the wizard calls `fetch` when a dependent field changes (cascade reset pattern)
- `isFetching` drives inline loading spinners on selects/dropdowns
- `error` drives inline error alerts below the field

Specialized resource types extend the base:

```tsx
type RolesResource = Resource<Role[], [awsAccount: string]> & {
  ocmRoleError: string | null;
  userRoleError: string | null;
  ocmRoleARN: string | null;
  fetch: (awsAccount: string) => Promise<void>;
};
```

### Why two different patterns?

Dashboard widgets are simple read-only displays, no user-triggered refetches needed. The wizard is a multi-step form where each selection can invalidate downstream data, so it needs the `fetch` callback to let the host app reload dependent resources.

---

## Test pyramid

```text
                    ┌─────────┐
                    │   E2E   │  few, integration flows
                    ├─────────┤
              ┌─────┤   CT    ├─────┐  component rendering + interaction
              │     ├─────────┤     │
              │     │  Jest   │     │  pure logic, utilities, hooks
              └─────┴─────────┴─────┘
```

### Jest (unit tests)

- config: `jest.config.js`
- matches: `**/*.test.[jt]s?(x)` (explicitly excludes `*.spec.*`)
- environment: jsdom
- use for: pure functions, hooks, utilities, validation logic, data transformations
- does NOT mount React components to a real DOM

### Playwright CT (component tests)

- config: `playwright-ct.config.ts`
- matches: `src/**/*.spec.tsx`, `packages/nxtcm-*/src/**/*.spec.tsx`
- browser: Chromium (real browser, real DOM)
- use for: component rendering, user interactions, visual states, accessibility assertions
- mock data goes in `*.spec-helpers.tsx` files
- selectors: role-based (`getByRole`) or `data-testid`, never CSS classes

### Playwright E2E (end-to-end)

- config: `playwright.config.ts`
- directory: `playwright/e2e/`
- use for: full app integration flows (Storybook or dev server as test target)
- currently minimal coverage

### What runs in CI

| layer | CI job | command |
|-------|--------|---------|
| Jest | `unit-test` | `npm test -- --coverage` |
| Playwright CT | `test` | `npx playwright test -c playwright-ct.config.ts` |
| Playwright E2E | `e2e` | `npx playwright test` |

All three run in CI. A `coverage-contract` job assembles results from all three into a single `test-coverage-data.json` artifact.

### When to use which

| scenario | test layer |
|----------|-----------|
| validating a yup schema produces correct errors | Jest |
| a utility function transforms data correctly | Jest |
| a component renders loading skeletons when `isLoading=true` | Playwright CT |
| clicking a dropdown opens options and selecting one updates form state | Playwright CT |
| navigating through all wizard steps end-to-end | E2E |
| verifying Storybook stories render without console errors | E2E |

### Mutation testing (Stryker)

Stryker runs on top of Playwright CT specs. It mutates a component's source and re-runs the co-located `.spec.tsx` to measure test effectiveness. Not part of CI, run locally on demand:

```bash
npm run test:stryker -- path/to/Component.tsx
```

---

## CI pipeline

Defined in `.github/workflows/ci.yml`. Lint, type-check, unit-test, CT, E2E, build, and storybook jobs run independently in parallel. The `coverage-contract` job waits for the three test jobs (`unit-test`, `test`, `e2e`) to finish, then assembles their results:

```text
┌──────┐ ┌────────────┐ ┌───────────┐ ┌──────┐ ┌─────┐ ┌───────┐ ┌───────────┐
│ Lint │ │ Type Check │ │ Unit Test │ │  CT  │ │ E2E │ │ Build │ │ Storybook │
└──────┘ └────────────┘ └───────────┘ └──────┘ └─────┘ └───────┘ └───────────┘
                              │             │       │
                              └─────────────┴───────┘
                                        │
                             ┌──────────────────────┐
                             │ Coverage Contract    │
                             │ needs: unit-test,    │
                             │        test, e2e     │
                             └──────────────────────┘
```

After those test jobs complete, `coverage-contract` downloads their artifacts and builds `test-coverage-data.json`, a normalized summary of test results across all layers.

Additional workflows beyond the main CI:

| workflow | trigger | purpose |
|----------|---------|---------|
| `ct-triage-comment.yml` | `workflow_run` after CI completes (failure + PR) | posts CT failure summaries as PR comments |
| `publish-package.yml` | release published | publishes workspace packages to npm |
| `deploy-storybook.yml` | push to main | deploys Storybook to GitHub Pages |
| `check-links.yml` | schedule + manual | validates external links and reports failures |

---

## Storybook

Storybook 9 with `@storybook/react-vite`. Stories live co-located with components in both workspace packages. The `.storybook/main.ts` globs cover:

```ts
stories: [
  '../src/**/*.mdx',
  '../packages/nxtcm-dashboard/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  '../packages/nxtcm-rosa-hcp-wizard/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
]
```

Storybook uses the same Vite resolve aliases as the main build, so package imports resolve correctly during development.

---

## Key decisions and rationale

| decision | why |
|----------|-----|
| single vite config with env var | avoids config duplication across packages; one place to maintain externals, globals, and output format |
| `Resource<T>` with typed fetch args | lets the wizard trigger refetches with correct parameters while keeping the host app in control of actual API calls |
| flat `data + isLoading` for dashboard | widgets are simpler, no cascading dependencies, host app handles all fetch logic |
| Playwright CT over RTL for component tests | real browser rendering catches CSS/layout issues that jsdom misses; aligns with PatternFly's visual component model |
| co-location (component + story + spec + helpers) | everything about a component lives together, no hunting across directories |
| workspaces over separate repos | shared tooling (lint, prettier, jest, playwright, vite) without duplication, single PR for cross-package changes |
