# AGENTS.md

repo context for ai coding agents. this file is intentionally thin: routing + repo-wide constraints only.

## what is this repo?

npm workspaces monorepo of shared react component libraries for Red Hat ACM (Advanced Cluster Management) and OCM (OpenShift Cluster Manager) console UIs.

workspace packages:

- `@redhat-cloud-services/nxtcm-dashboard` (`packages/nxtcm-dashboard`) — workspace package
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` (`packages/nxtcm-rosa-hcp-wizard`) — workspace package

## hard constraints

1. never make http calls from components, consuming apps own backend communication.
2. before writing or modifying any component file, you MUST read the task-type doc from `docs/agent-rules/` that matches the work (e.g., `ui-component.md` for
   component code). Do not skip this step. Refer to the #[task routing section](#task-routing) for a list of docs. 
3. run [verification commands](docs/agent-rules/development-workflow.md#mandatory-validation-checklist) before finishing changes.
4. use package-specific overlays (`packages/*/AGENTS.md`) for domain rules, do not put package detail in this root file.

## layering model

- this root file = workspace routing + repo-wide rules.
- `docs/agent-rules/*.md` = task-type guidance (new component, storybook, ct, workflows, typescript).
- `packages/nxtcm-dashboard/AGENTS.md` = dashboard-only domain behavior.
- `packages/nxtcm-rosa-hcp-wizard/AGENTS.md` = wizard-only domain behavior.

## project map

```text
packages/
  nxtcm-dashboard/
  nxtcm-rosa-hcp-wizard/
docs/agent-rules/         # task-type rulebooks
.github/workflows/        # ci workflows
```

## where to add code

- dashboard widget work: `packages/nxtcm-dashboard/src/`
- rosa hcp wizard work: `packages/nxtcm-rosa-hcp-wizard/src/`

## path aliases

- `@redhat-cloud-services/nxtcm-dashboard` → `packages/nxtcm-dashboard/src`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` → `packages/nxtcm-rosa-hcp-wizard/src`
- `@/` → resolves differently per tool (vite/ts: repo root, storybook/playwright/jest: `src/`)


## task routing

load the relevant doc before writing or reviewing code:

- ui component work: `docs/agent-rules/ui-component.md`
- playwright CT: `docs/agent-rules/playwright-ct.md`
- storybook: `docs/agent-rules/storybook.md`
- ci/workflow: `docs/agent-rules/ci-workflows.md`
- typescript: `docs/agent-rules/typescript.md`

after picking a task doc, load the relevant package overlay when the task is package-specific.

## development workflow

when making changes to the codebase, make sure you follow the instructions in the [development workflow doc](docs/agent-rules/development-workflow.md).

## known quirks

- `prettier:check` still includes legacy cypress references.
