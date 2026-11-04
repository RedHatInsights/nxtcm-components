# AGENTS.md

repo context for ai coding agents. this file is intentionally thin: routing + repo-wide constraints only.

## what is this repo?

npm workspaces monorepo of shared react component libraries for Red Hat ACM (Advanced Cluster Management) and OCM (OpenShift Cluster Manager) console UIs.

## hard constraints

1. never make http calls from components. consuming apps own backend communication.
2. before writing or reviewing code, load the matching doc from the [task routing](#task-routing) list. do not skip this step.
3. follow [development workflow](docs/agent-rules/development-workflow.md) before finishing changes, including the [verification commands](docs/agent-rules/development-workflow.md#mandatory-validation-checklist).

## layering model

- this root file = workspace routing + repo-wide rules.
- `docs/agent-rules/*.md` = task-type guidance, indexed by [task routing](#task-routing).
- `packages/nxtcm-dashboard/AGENTS.md` = dashboard-only domain behavior.
- `packages/nxtcm-rosa-hcp-wizard/AGENTS.md` = wizard-only domain behavior.
- folder-level `AGENTS.md` files (e.g. `packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/AGENTS.md`) = component/feature-specific overrides; load when working in that directory.

load the matching package overlay when the task is package-specific. load the folder overlay when one exists in the directory you are editing.

## where to add code

- `@redhat-cloud-services/nxtcm-dashboard` — `packages/nxtcm-dashboard/src/`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` — `packages/nxtcm-rosa-hcp-wizard/src/`

## path aliases

- `@redhat-cloud-services/nxtcm-dashboard` → `packages/nxtcm-dashboard/src`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` → `packages/nxtcm-rosa-hcp-wizard/src`
- `@/*` → repo root. TypeScript and the root Vite config resolve it there (`ct-fixture.ts`, `test-helpers.ts`). Storybook, Playwright CT, and Jest still alias `@/` to `src/`, and that directory is not in this repo.

## task routing

- ui component work: `docs/agent-rules/ui-component.md`
- playwright CT: `docs/agent-rules/playwright-ct.md`
- playwright E2E: `docs/agent-rules/playwright-e2e.md`
- monaco / yaml editor tests: `packages/nxtcm-rosa-hcp-wizard/src/Steps/YamlEditor/AGENTS.md`
- tests failing / coverage not working: `docs/agent-rules/test-verification.md`
- storybook: `docs/agent-rules/storybook.md`
- ci/workflow: `docs/agent-rules/ci-workflows.md`
- typescript: `docs/agent-rules/typescript.md`
