# AGENTS.md

repo context for AI coding agents. this file is tool-agnostic — read by Cursor, Claude Code, GitHub Copilot, OpenCode, ACP runners, and any other tool that follows the AGENTS.md convention.

## what is this repo?

shared React component library for Red Hat ACM (Advanced Cluster Management) and OCM (OpenShift Cluster Manager) console UIs. built with PatternFly 6, TypeScript, React 18. published as UMD + ESM + types from `dist/`.

this repo provides UI components, types, and integration shapes. consuming apps supply data and wire navigation.

### what this repo does NOT do

- no REST/API clients — consuming apps handle all backend calls
- no routing — consumers provide `LinkComponent` and navigation callbacks
- no auth — consumers handle authentication
- no state management beyond form wizard state
- components must never make HTTP calls directly — use injected callbacks

## project layout

```text
src/
  components/
    dashboard/              # dashboard card components
    Wizards/RosaWizard/     # ROSA cluster creation wizard (multi-step)
    ConsoleBreadcrumbs/     # breadcrumb nav component
    PageHeader/             # page-level header
  context/                  # TranslationContext (i18n provider)
  test-helpers.ts           # shared playwright CT helpers
  index.ts                  # main entry — all public exports

packages/
  react-form-wizard/        # separate package, own tsconfig, NOT in main build

playwright/
  e2e/                      # E2E tests (vite dev server)

.storybook/                 # storybook 9 config (react-vite)
.cursor/rules/              # Cursor IDE rule files
.github/workflows/ci.yml    # CI pipeline
```

## file conventions

components follow a co-location pattern:

```text
ComponentName/
  ComponentName.tsx           # the component
  ComponentName.stories.tsx   # storybook stories (CSF3)
  ComponentName.spec.tsx      # playwright component tests
  ComponentName.test.ts       # jest unit tests (if logic warrants it)
  index.ts                    # barrel export
```

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
| node | 20 | (via .nvmrc) |

## test setup

| type | command | config | runs in CI? |
|------|---------|--------|-------------|
| unit | `npm test` | jest.config.js | no |
| component | `npm run test:ct` | playwright-ct.config.ts | yes |
| E2E | `npm run test:e2e` | playwright.config.ts | yes |
| all local | `npm run test:all` | — | — |

**important:** jest does NOT run in CI. only playwright CT, E2E, lint, prettier, type-check, and storybook build run in CI. a green CI doesn't mean jest tests passed — always run `npm run test:all` locally.

## CI pipeline

runs on push to `main` and on PRs. jobs (parallel):

1. **lint** — eslint + prettier check
2. **type-check** — `tsc --noEmit`
3. **component tests** — playwright CT
4. **build** — `tsc && vite build`
5. **E2E** — playwright E2E
6. **storybook** — storybook build

all jobs also run `npm ci` in `packages/react-form-wizard`.

## path aliases

- `@/` → `src/`
- `@patternfly-labs/react-form-wizard` → `packages/react-form-wizard/src`

configured in: tsconfig.json, vite config, playwright-ct.config.ts, storybook main.ts, jest.config.js

## coding standards

### naming

- PascalCase for file names and React components
- camelCase for functions and variables
- UPPER_SNAKE_CASE for constants

### components

- functional components only (no class-based)
- export prop types alongside the component
- use explicit prop interfaces, not inline types
- document required vs optional props with JSDoc on the interface
- prefer PatternFly components over custom ones
- do NOT override PatternFly styles with custom CSS — use variants, modifiers, and tokens
- import icons from `@patternfly/react-icons`
- prefer PF utility classes and spacing tokens over custom CSS

### react patterns

- proper dependency arrays in useEffect/useCallback/useMemo
- custom hooks for business logic separation
- prefer `onValueChange` over useEffect for reacting to form value changes (react-form-wizard pattern)
- useMemo for expensive computations
- useCallback when passing callbacks to memoized children
- proper key props for list items

### TypeScript

- TypeScript for all new components and utilities
- avoid `any` — prefer `unknown` when the type isn't known
- explicit return types on functions
- type custom hooks with proper return types
- type callback functions explicitly

### imports (order)

1. React imports (useState, useEffect, etc.)
2. Third-party libraries (PatternFly, lodash, etc.)
3. Internal utilities and shared components
4. Relative imports from local directories
5. CSS/SCSS imports and assets last

## lint rules (notable)

- `no-console: error` (off in stories and tests)
- `@typescript-eslint/no-explicit-any: off` (tech debt — prefer proper types but it's not enforced)
- `@typescript-eslint/no-unused-vars: error` (with `_` prefix ignore pattern)
- eslint is check-only in git hooks (no `--fix`)
- prettier auto-formats staged files via lint-staged

## storybook

- CSF3 format (Meta + StoryObj from `@storybook/react`)
- `*.stories.tsx` naming convention
- co-locate stories next to their component
- include `tags: ['autodocs']` for auto-generated docs
- title convention: `Components/<Category>/<ComponentName>`

## testing conventions

- use Playwright CT (`*.spec.tsx`) for component tests, not Jest
- co-locate test files next to the component
- use `*.spec-helpers.tsx` for test setup/context wrappers
- mock data and provider wrappers go in spec-helpers, not inline
- follow Arrange-Act-Assert pattern
- test behavior, not implementation details
- descriptive test names that say what's being tested

## known quirks

- `prettier:check` script references a `cypress/` glob — legacy, no cypress dir at root
- `packages/react-form-wizard` may still have cypress references
- jest isn't in CI — run `npm run test:all` locally to catch unit test failures
- `@typescript-eslint/no-explicit-any` is OFF — `any` isn't banned but should be avoided
