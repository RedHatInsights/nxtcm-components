# AGENTS.md

repo context for ai coding agents. this file is intentionally thin: routing + repo-wide constraints only.

## what is this repo?

npm workspaces monorepo of shared react component libraries for Red Hat ACM (Advanced Cluster Management) and OCM (OpenShift Cluster Manager) console UIs.

publishable packages:
- `@redhat-cloud-services/nxtcm-dashboard` (`packages/nxtcm-dashboard`)
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` (`packages/nxtcm-rosa-hcp-wizard`)

## hard constraints

1. never make http calls from components, consuming apps own backend communication.
2. keep component artifacts co-located (component, story, CT spec, unit test when needed, barrel export).
3. run verification commands before finishing changes.
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
src/                      # legacy shared library, being phased out
docs/agent-rules/         # task-type rulebooks
.github/workflows/        # ci workflows
```

## where to add code

- dashboard widget work: `packages/nxtcm-dashboard/src/`
- rosa hcp wizard work: `packages/nxtcm-rosa-hcp-wizard/src/`
- shared/legacy console ui: `src/components/` or `src/utilities/`
- co-location contract details: `docs/agent-rules/new-component.md`

## path aliases

- `@redhat-cloud-services/nxtcm-dashboard` → `packages/nxtcm-dashboard/src`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` → `packages/nxtcm-rosa-hcp-wizard/src`
- `@/` → resolves differently per tool (vite/ts: repo root, storybook/playwright/jest: `src/`)

## verification commands

run from repo root:

1. `npm run lint`
2. `npm run type-check`
3. `npm run test:all` (jest + playwright CT, does not include E2E)
4. `npm run test:e2e` (runs separately from `test:all`)
5. `npm run build`

## task routing

load these docs before writing code:

- new component: `docs/agent-rules/new-component.md` + relevant package overlay
- playwright CT: `docs/agent-rules/playwright-ct.md`
- storybook: `docs/agent-rules/storybook.md`
- ci/workflow: `docs/agent-rules/ci-workflows.md`
- typescript refactor: `docs/agent-rules/typescript.md`
- patternfly usage: `.agents/skills/patternfly/SKILL.md`
- PR creation: `.agents/skills/pr-release-agent/SKILL.md`
- mutation testing: `.agents/skills/stryker-mutation-test/SKILL.md`
- dashboard domain behavior: `packages/nxtcm-dashboard/AGENTS.md`
- wizard domain behavior: `packages/nxtcm-rosa-hcp-wizard/AGENTS.md`

## known quirks

- `prettier:check` still includes legacy cypress references.

