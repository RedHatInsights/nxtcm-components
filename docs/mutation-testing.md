# Mutation testing (Stryker)

[Stryker](https://stryker-mutator.io/) is a mutation testing framework. **Mutation testing** measures how effective your tests are at catching bugs — not just whether they pass.

Stryker makes small, deliberate changes (*mutants*) to your source code — for example, flipping a condition, removing a statement, or changing an operator. For each mutant, it re-runs your tests:

- If a test **fails**, the mutant was **killed** — your tests caught the change.
- If all tests **still pass**, the mutant **survived** — your tests may not be exercising that behavior.

The **mutation score** (killed mutants ÷ total mutants) is a rough signal of test quality: are your tests actually detecting potential bugs, or only checking happy paths?

## How it works in this repo

Our Stryker setup is scoped to individual components:

- Pass a **component** `.tsx` file as the target — not the spec file.
- Stryker mutates that component and runs **only the co-located Playwright component test** (`ComponentName.spec.tsx` next to `ComponentName.tsx`).
- **Jest unit tests are not run** by Stryker today; only Playwright CT (`*.spec.tsx`) specs are supported.
- E2E tests are not included.

Reach for mutation testing anytime you are updating tests, reviewing a PR that touches specs, or suspect a component test is not fully exercising the component — for example, it passes but only covers rendering or a single happy path. It is also useful before refactoring, when you want confidence that existing tests would catch regressions.

## Running a mutation test

From the repo root, pass one or more component paths after `--`:

```bash
npm run test:stryker -- packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.tsx
```

Multiple components in one run:

```bash
npm run test:stryker -- \
  packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.tsx \
  packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx
```

Generate an HTML report when finished:

```bash
npm run test:stryker:report -- packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.tsx
```

Limit parallel workers on a laptop or while you are working on other tasks:

```bash
STRYKER_CONCURRENCY=2 npm run test:stryker -- path/to/Component.tsx
```

## Building commands with natural language

You can describe what you want to mutate in your AI coding tool instead of assembling paths by hand. Attach or invoke the **stryker-mutation-test** skill (`.agents/skills/stryker-mutation-test/SKILL.md`) and ask in plain language — it will output a copy-paste command without running it.

Example prompt:

> I want to run /stryker-mutation-test on all files that have tests located in nxtcm-components/packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup and its subdirectories

## Runtime expectations

Mutation testing is **slow**. Each mutant spins up Playwright CT with a fresh cache and port. A single component can take several minutes; runs across many files or directories can take **multiple hours**, depending on mutant count and your machine. Plan accordingly — this is a local quality check, not part of CI.

When the run completes, Stryker prints a summary (mutation score, killed/survived counts). Paste that output into a chat if you want help interpreting survived mutants.
