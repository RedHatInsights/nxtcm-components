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
  components/               # UI components consumed by other apps
                             # subdirectories organized by feature area
                             # each component is independent of the others
  context/                   # shared React context providers (e.g. i18n)
  types/                     # shared TypeScript types and interfaces
  utilities/                 # shared helper functions and utilities
  examples/                  # usage examples
  test-helpers.ts            # shared playwright CT helpers
  index.ts                   # main entry — all public exports

packages/
  react-form-wizard/         # separate package, own tsconfig, NOT in main build

playwright/
  e2e/                       # E2E tests (vite dev server)

.storybook/                  # storybook 9 config (react-vite)
.github/workflows/           # CI pipeline definitions
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

## CI pipeline

defined in `.github/workflows/ci.yml`. runs on push to `main` and on PRs.

**important:** jest does NOT run in CI — only Playwright CT, E2E, lint, prettier, type-check, and storybook build do. a green CI doesn't mean jest tests passed — always run `npm run test:all` locally.

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

- prefer `onValueChange` over useEffect for reacting to form value changes (react-form-wizard pattern)
- custom hooks for business logic separation

other react best practices (dependency arrays, key props, memoization) are enforced by eslint via `react-hooks/recommended`.

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

## verifying changes

after making code changes, run these commands:

1. `npm run lint` — check for lint errors (see `.eslintrc.json` for rules)
2. `npm run type-check` — verify TypeScript compiles
3. `npm run test:all` — run jest + playwright CT tests
4. `npm run build` — verify the build succeeds

## lint and formatting

linting rules are defined in `.eslintrc.json` — run `npm run lint` after code changes.

non-obvious rules worth knowing upfront:

- `@typescript-eslint/no-explicit-any: off` — `any` is accepted (tech debt) but prefer proper types
- `no-console: error` — but relaxed in story files only
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
