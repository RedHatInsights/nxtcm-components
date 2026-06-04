# AGENTS.md

repo context for AI coding agents. this file is tool-agnostic — read by Cursor, Claude Code, GitHub Copilot, OpenCode, ACP runners, and any other tool that follows the AGENTS.md convention.

## what is this repo?

npm workspaces monorepo of shared React component libraries for Red Hat ACM (Advanced Cluster Management) and OCM (OpenShift Cluster Manager) console UIs. built with PatternFly 6, TypeScript, React 18. each publishable package outputs UMD + ESM + types from its own `dist/`.

| package | npm name | purpose |
|---------|----------|---------|
| root `src/` | `nxtcm-components` | shared console UI (breadcrumbs, page header, non-HCP wizards, etc.) |
| `packages/nxtcm-dashboard` | `@redhat-cloud-services/nxtcm-dashboard` | ACM/OCM home dashboard widgets |
| `packages/nxtcm-rosa-hcp-wizard` | `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` | ROSA HCP cluster creation wizard |

this repo provides UI components, types, and integration shapes. consuming apps supply data and wire navigation.

### what this repo does NOT do

- no REST/API clients — consuming apps handle all backend calls
- no routing — consumers provide `LinkComponent` and navigation callbacks
- no auth — consumers handle authentication
- no state management beyond form wizard state

---

## critical rules

these are hard constraints. violating them will break builds, fail reviews, or produce incorrect output.

1. **never make HTTP calls from components** — use injected callbacks. consuming apps supply data via the `Resource<T>` pattern (data + loading + error + optional fetch).
2. **always co-locate component files** — component, stories, spec, and tests live together in one directory (see [file conventions](#file-conventions)).
3. **always run verification before committing** — see [verifying changes](#verifying-changes).
4. **jest does NOT run in CI** — a green CI doesn't mean jest tests passed. always run `npm run test:all` locally.

---

## PatternFly

this repo uses PatternFly for UI. for design system rules, styling, accessibility, and implementation workflow, read [.agents/skills/patternfly/SKILL.md](.agents/skills/patternfly/SKILL.md).

---

## project layout

```text
src/                                    # main library (nxtcm-components)
  components/                           # shared UI consumed by other apps
                                        # ConsoleBreadcrumbs, PageHeader, Wizards/RosaWizard, etc.
                                        # dashboard + ROSA HCP wizard moved to packages/ (see below)
  context/                              # shared React context providers (e.g. i18n)
  types/                                # shared TypeScript types and interfaces
  utilities/                            # shared helper functions and utilities
  examples/                             # usage examples
  test-helpers.ts                       # shared playwright CT helpers
  index.ts                              # main entry — all public exports

packages/
  nxtcm-dashboard/                      # @redhat-cloud-services/nxtcm-dashboard (npm workspace)
    src/                                # Dashboard, CVECard, TotalClusters, Telemetry, etc.
    package.json                        # build: NXTCM_LIB_NAME=NXTCM-DASHBOARD + root vite.config.ts
    tsconfig.json                       # extends root; rootDir src, outDir dist
  nxtcm-rosa-hcp-wizard/                # @redhat-cloud-services/nxtcm-rosa-hcp-wizard (npm workspace)
    src/                                # ROSAHCPWizard, steps, WizFields, yup schemas
    package.json                        # build: NXTCM_LIB_NAME=NXTCM-ROSA-HCP-WIZARD + root vite.config.ts
    tsconfig.json
  react-form-wizard/         # separate package, own tsconfig, NOT in main build

playwright/
  e2e/                                  # E2E tests (vite dev server)

.storybook/                             # storybook 9 config (react-vite)
                                        # includes stories from src/ and packages/nxtcm-*/
.github/workflows/                      # CI pipeline definitions
vite.config.ts                          # shared Vite lib build; NXTCM_LIB_NAME selects output package
```

### where to put new code

- **dashboard home widgets** → `packages/nxtcm-dashboard/src/`
- **ROSA HCP wizard** (steps, fields, validation) → `packages/nxtcm-rosa-hcp-wizard/src/`
- **shared console UI** used across features → `src/components/` or `src/utilities/`

workspace packages share root lint, prettier, jest, playwright CT, and vite config. run package builds from the package directory (e.g. `npm run build -w @redhat-cloud-services/nxtcm-dashboard`) or via each package's `package.json` scripts.

## file conventions

components follow a co-location pattern under `src/` or `packages/*/src/`:

```text
ComponentName/
  ComponentName.tsx           # the component
  ComponentName.stories.tsx   # storybook stories (CSF3)
  ComponentName.spec.tsx      # playwright component tests
  ComponentName.test.ts       # jest unit tests (if logic warrants it)
  index.ts                    # barrel export
```

## path aliases

- `@/` → `src/`
- `@patternfly-labs/react-form-wizard` → `packages/react-form-wizard/src`
- `@redhat-cloud-services/nxtcm-dashboard` → `packages/nxtcm-dashboard/src`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` → `packages/nxtcm-rosa-hcp-wizard/src`

configured in: `tsconfig.json`, `vite.config.ts`, `playwright-ct.config.ts`, `.storybook/main.ts`, `jest.config.js` (`@/` only)

---

## tech stack

| layer | tool | version |
|-------|------|---------|
| UI framework | React | 18 |
| design system | PatternFly | 6 |
| language | TypeScript | 5 |
| build | Vite + tsc | 5 |
| component tests | Playwright CT | 1.56+ |
| E2E tests | Playwright | 1.56+ |
| unit tests | Jest 29 + jsdom | — |
| stories | Storybook 9 | react-vite |
| lint | ESLint 8 | typescript-eslint |
| format | Prettier | 3 |
| git hooks | Husky + lint-staged | — |
| node | 24.15+ | (via `package.json` `engines.node` |

---

## verifying changes

after making code changes, run these commands from the repo root:

1. `npm run lint` — lint `src/` and all `packages/**/*.{ts,tsx}`
2. `npm run type-check` — verify root + workspace package TypeScript (`tsconfig.json` includes `packages/nxtcm-dashboard` and `packages/nxtcm-rosa-hcp-wizard`)
3. `npm run test:all` — jest + playwright CT (CT matches `src/**/*.spec.tsx` and `packages/nxtcm-*/src/**/*.spec.tsx`)
4. `npm run build` — build main `nxtcm-components` library; also run `npm run build -w <package>` when changing a workspace package

### test commands

| type | command | config | runs in CI? |
|------|---------|--------|-------------|
| unit | `npm test` | jest.config.js | no |
| component | `npm run test:ct` | playwright-ct.config.ts | yes |
| E2E | `npm run test:e2e` | playwright.config.ts | yes |
| all local | `npm run test:all` | — | — |

### CI pipeline

defined in `.github/workflows/ci.yml`. runs on push to `main` and on PRs.

---

## coding standards

### naming

- PascalCase for file names and React components
- camelCase for functions and variables
- UPPER_SNAKE_CASE for constants
- use descriptive names that indicate component purpose
- prefer ternary operators over if-else when the expression is simple; never nest ternaries

### components

- functional components only (no class-based)
- export prop types alongside the component
- use explicit prop interfaces, not inline types
- document required vs optional props with JSDoc on the interface

### react patterns

- prefer `onValueChange` over useEffect for reacting to form value changes (react-form-wizard pattern)
- custom hooks for business logic separation

other react best practices (dependency arrays, key props, memoization) are enforced by eslint via `react-hooks/recommended`.

### TypeScript

- TypeScript for all new components and utilities
- avoid `any` — prefer `unknown` when the type isn't known
- explicit return types on functions
- use proper TypeScript error types instead of generic `Error` objects
- type custom hooks with proper return types
- type callback functions explicitly

### imports (order)

1. React imports (useState, useEffect, etc.)
2. Third-party libraries (PatternFly, lodash, etc.)
3. Internal utilities and shared components
4. Relative imports from local directories
5. CSS/SCSS imports and assets last

### storybook

- CSF3 format (Meta + StoryObj from `@storybook/react`)
- `*.stories.tsx` naming convention
- co-locate stories next to their component
- include `tags: ['autodocs']` for auto-generated docs
- title convention: `Components/<Category>/<ComponentName>` (root `src/`); package stories use the same pattern under their package tree
- dashboard and ROSA HCP stories live in `packages/nxtcm-dashboard/src/` and `packages/nxtcm-rosa-hcp-wizard/src/` (legacy paths under `src/components/dashboard` and `src/components/Wizards/ROSAHCPWizard` are excluded from Storybook)

### testing

- use Playwright CT (`*.spec.tsx`) for component tests, not Jest
- co-locate test files next to the component
- use `*.spec-helpers.tsx` for test setup/context wrappers
- mock data and provider wrappers go in spec-helpers, not inline
- add unit tests for code changes
- follow Arrange-Act-Assert pattern
- test behavior, not implementation details
- descriptive test names that say what's being tested

---

## common mistakes to avoid

### TypeScript

```tsx
// don't — untyped props and any
const MyComponent = (props: any) => { ... }

// do — explicit prop interface
interface MyComponentProps {
  title: string;
  onSave: (data: FormData) => void;
}
const MyComponent = ({ title, onSave }: MyComponentProps) => { ... }
```

### testing

```tsx
// don't — mock data inline, CSS class selectors
test('renders', async ({ mount }) => {
  const c = await mount(<Widget data={{ count: 5 }} />);
  await expect(c.locator('.pf-v6-c-card__title')).toBeVisible();
});

// do — spec-helpers for mock data, role/testid selectors
test('renders widget with count', async ({ mount }) => {
  const c = await mount(<Widget {...defaultProps} />);
  await expect(c.getByRole('heading', { name: /widget/i })).toBeVisible();
});
```

### console usage

```tsx
// don't — console in component code (no-console: error)
console.log('debug:', data);

// do — remove console statements, or use proper logging
// no-console is relaxed in *.stories.tsx files only
```

---

## lint and formatting

linting rules are defined in `.eslintrc.json` — run `npm run lint` after code changes.

non-obvious rules worth knowing upfront:

- `@typescript-eslint/no-explicit-any: off` — `any` is accepted (tech debt) but prefer proper types
- `no-console: error` — but relaxed in story files only
- eslint is check-only in git hooks (no `--fix`)
- prettier auto-formats staged files via lint-staged

---

## reference documentation

| what | where |
|------|-------|
| PatternFly | [.agents/skills/patternfly/SKILL.md](.agents/skills/patternfly/SKILL.md) |
| lint rules | `.eslintrc.json` |
| TypeScript config (root + packages) | `tsconfig.json`, `packages/nxtcm-dashboard/tsconfig.json`, `packages/nxtcm-rosa-hcp-wizard/tsconfig.json` |
| npm workspaces | `package.json` → `workspaces` |
| shared Vite lib build | `vite.config.ts` (`NXTCM_LIB_NAME` env var) |
| CI pipeline | `.github/workflows/ci.yml` |
| PR template | `.github/pull_request_template.md` |
| Storybook config | `.storybook/main.ts` |
| Playwright CT config | `playwright-ct.config.ts` |
| Playwright E2E config | `playwright.config.ts` |
| Jest config | `jest.config.js` |
| Node version | via `package.json` `engines.node` |

---

## known quirks

- `prettier:check` script references a `cypress/` glob — legacy, no cypress dir at root
- `packages/react-form-wizard` may still have cypress references

