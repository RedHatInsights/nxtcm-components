# Contributing

how to set up the repo, make changes, and get them merged.

for architecture details (monorepo structure, build system, data contracts, test pyramid), see [docs/architecture.md](docs/architecture.md).

---

## Setup

### Prerequisites

- Node.js (version in `package.json` → `engines.node`)
- npm (comes with Node)
- Git
- [GitHub CLI](https://cli.github.com/) (`gh`) — used for opening PRs from the command line

### Clone and install

```bash
git clone git@github.com:RedHatInsights/nxtcm-components.git
cd nxtcm-components
npm ci
```

`npm ci` installs root dependencies and workspace packages (`packages/nxtcm-dashboard`, `packages/nxtcm-rosa-hcp-wizard`).

### Verify everything works

run all five checks before starting any work:

```bash
npm run lint            # eslint — check only, no auto-fix
npm run type-check      # tsc --noEmit
npm run test:all        # jest + playwright CT
npm run build           # builds both workspace packages
npm run prettier:check  # formatting — CI enforces this
```

if all five pass, you're good to go.

---

## Where to put new code

| what you're building                         | where it goes                         |
| -------------------------------------------- | ------------------------------------- |
| dashboard widget (card, chart, panel)        | `packages/nxtcm-dashboard/src/`       |
| ROSA wizard step, field, or validation       | `packages/nxtcm-rosa-hcp-wizard/src/` |
| shared console UI (breadcrumbs, page header) | `src/components/`                     |
| shared utilities or types                    | `src/utilities/` or `src/types/`      |

new features go into the workspace packages. the root `src/` is being phased out — only add shared code there if it's genuinely consumed by both packages.

### File structure

every component gets its own directory with co-located files:

```text
ComponentName/
  ComponentName.tsx              # the component
  ComponentName.stories.tsx      # storybook story (CSF3)
  ComponentName.spec.tsx         # playwright CT test
  ComponentName.spec-helpers.tsx # test setup, mock data
  ComponentName.test.ts          # jest unit test (if logic warrants it)
  index.ts                       # barrel export
```

don't scatter test files or stories into separate directories. everything about a component lives together.

---

## Making changes

### Coding standards

- **TypeScript** for all new code — avoid `any`, use `unknown` if the type isn't known
- **functional components** only — no class-based React
- **explicit prop interfaces** with JSDoc — export them alongside the component
- **no HTTP calls from components** — consuming apps own all API communication
- **PatternFly 6** — use PF components, tokens, and layouts. don't invent custom UI when PF has it

import order: React → third-party → internal utilities → relative imports → CSS/assets.

### Commit messages

keep it short and human. one line, lowercase, no conventional-commit prefixes:

```bash
# good
git commit -m "handle stream cancellation in state manager"
git commit -m "add cluster name validation hook"

# avoid
git commit -m "feat: add validation hook"
git commit -m "This commit adds a new validation hook for cluster names"
```

skip formal bodies unless something really needs a sentence of context.

---

## Testing

### Test layers

| layer          | command            | what it tests                                      |
| -------------- | ------------------ | -------------------------------------------------- |
| jest (unit)    | `npm test`         | pure functions, hooks, utilities, validation logic |
| playwright CT  | `npm run test:ct`  | component rendering, interactions, visual states   |
| playwright E2E | `npm run test:e2e` | full app integration flows                         |
| unit + CT      | `npm run test:all` | runs jest + playwright CT (does not include E2E)   |

### Running specific tests

```bash
# single jest test file
npx jest path/to/file.test.ts

# single CT spec
npx playwright test -c playwright-ct.config.ts path/to/Component.spec.tsx

# CT with UI mode (interactive debugging)
npx playwright test -c playwright-ct.config.ts --ui
```

### Test guidelines

- use **role-based selectors** (`getByRole`, `getByLabel`, `getByText`) — never CSS class selectors
- put mock data and provider wrappers in `*.spec-helpers.tsx`, not inline
- test behavior, not implementation details
- cover: happy path, loading state, error state, empty state, user interactions

### Mutation testing (Stryker)

stryker runs on top of playwright CT specs to measure test effectiveness. not part of CI — run locally on demand:

```bash
npm run test:stryker -- path/to/Component.tsx
```

pass the **component** `.tsx` file, not the `.spec.tsx`.

---

## Storybook

### Running

```bash
npm run storybook     # dev server on port 6006
npm run build-storybook  # static build
```

### Writing stories

use CSF3 format (the only format used here):

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/Category/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: { title: 'Example' },
};
```

### Title conventions

| package                 | title pattern                                  |
| ----------------------- | ---------------------------------------------- |
| root `src/`             | `Components/<Category>/<Name>`                 |
| dashboard               | `Components/Dashboard/<Name>`                  |
| wizard fields           | `Form Elements/<Name>`                         |
| wizard connected fields | `Form Elements/Connected Form Elements/<Name>` |
| full wizard             | `Wizards/RosaHCPWizard`                        |

include at least a `Default` story. add `Loading`, `Error`, and `Empty` stories for components that handle those states.
note: current Storybook globs include package stories only; root `src/` stories are legacy and generally not added for new work.

### Verification

after writing a story, open it in the browser and verify it renders in both light and dark mode. check that controls work and the autodocs page generates correctly.

---

## Pull requests

### Before opening a PR

run all six checks and make sure they pass:

```bash
npm run lint
npm run type-check
npm run test:all        # jest + CT (not E2E)
npm run test:e2e        # E2E separately
npm run build
npm run prettier:check  # formatting
```

there's also the kitchen-sink script that runs prettier fix, lint fix, type-check, jest, and CT in one go:

```bash
npm run allthethings
```

### Opening the PR

use the [PR template](.github/pull_request_template.md) — it will auto-populate when you create the PR. fill in all sections; don't delete the template or replace it with your own format.

```bash
git push -u origin HEAD
gh pr create --base main
```

### What happens after you push

CI runs automatically (lint, type-check, unit tests, CT, E2E, build, storybook). results show up in the PR Checks tab.

the CT triage pipeline classifies any Playwright CT failures and posts a structured comment on the PR with categories and fix suggestions.

### Code review

PRs need approval before merging. reviewers are assigned via [CODEOWNERS](CODEOWNERS). the review process is documented in [.github/REVIEW_PROCESS.md](.github/REVIEW_PROCESS.md).

### Dependency updates (Renovate)

Renovate is enabled and automatically opens PRs for minor/patch dependency updates. Major version bumps are disabled. PatternFly and React packages are grouped into single PRs. If you see a Renovate PR, review the changelog and CI results before merging.

config is in `renovate.json`. for manual dependency changes, always use `npm ci` (not `npm install`) in CI.

---

## Building

```bash
# build both workspace packages
npm run build

# build a specific package
npm run build -w @redhat-cloud-services/nxtcm-dashboard
npm run build -w @redhat-cloud-services/nxtcm-rosa-hcp-wizard
```

both packages use the shared `vite.config.ts` with `NXTCM_LIB_NAME` to differentiate output. see [docs/architecture.md](docs/architecture.md) for details on the build system.

---

## AI-assisted development

this repo includes a root [AGENTS.md](AGENTS.md) for AI coding agents (Cursor, Claude Code, OpenCode, and similar tools). it covers:

- routing to task-specific rulebooks in `docs/agent-rules/`
- pointers to package overlays (`packages/*/AGENTS.md`) for domain-specific behavior
- repo-wide constraints that always apply

if you're using an AI tool, it will pick up `AGENTS.md` automatically. keep routing accurate when conventions change so agents load the right context.

---

## Quick reference

| task               | command                                                         |
| ------------------ | --------------------------------------------------------------- |
| install deps       | `npm ci`                                                        |
| lint               | `npm run lint`                                                  |
| type-check         | `npm run type-check`                                            |
| jest tests         | `npm test`                                                      |
| playwright CT      | `npm run test:ct`                                               |
| playwright E2E     | `npm run test:e2e`                                              |
| unit + CT tests    | `npm run test:all`                                              |
| storybook          | `npm run storybook`                                             |
| build all packages | `npm run build`                                                 |
| build dashboard    | `npm run build -w @redhat-cloud-services/nxtcm-dashboard`       |
| build wizard       | `npm run build -w @redhat-cloud-services/nxtcm-rosa-hcp-wizard` |
| prettier check     | `npm run prettier:check`                                        |
| prettier fix       | `npm run prettier:fix`                                          |
| mutation testing   | `npm run test:stryker -- path/to/Component.tsx`                 |
| fix everything     | `npm run allthethings`                                          |
