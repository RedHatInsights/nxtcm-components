# Development Workflow

Practical rules for day-to-day development: validation, targeted test runs, PR creation.

## Mandatory Validation Checklist

**Never claim a task is complete without running all of these:**

```bash
# 1. TypeScript compilation
npm run build

# 2. Linting (must be zero errors)
npm run lint

# 3. Unit tests and Playwright component tests
npm run test:all:quiet

# 4. E2E tests (runs separately from `test:all:quiet`)
npm run test:e2e
```

All four **must** pass with exit code 0. Any failure means the work is not done.

### Critical: Failure Ownership Rule

**Any validation failure after your changes is YOUR responsibility, regardless of which files fail.**

Don't assume failures are "pre-existing" because you didn't modify those files. Your changes break files you didn't touch (changed props break consumers, removed exports break importers, type changes break dependents).

**Don't rationalize failures ("deps issues", "env problems"). Verify ownership:**

```bash
git stash
npm run build && npm run lint && npm run test:all:quiet && npm run test:e2e
git stash pop
```

Base passes + your branch fails → you broke it, fix it. If base also fails → document in Jira before proceeding.

**Never open a PR with failing CI.**

---

### Targeted runs (fast iteration)

Use these to iterate on a single file or component without running the full suite:

```bash
# Unit test — single file (Jest)
npm test -- packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/yupSchemas.test.ts

# Unit test — pattern match (runs all matching files)
npm test -- --testPathPattern="Footer"

# Component test — single spec (Playwright CT)
npm run test:ct -- packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.spec.tsx

# Component test — pattern match by file/directory name
npm run test:ct -- Footer

# Component test — grep by test title
npm run test:ct -- --grep "should render"

# Lint — single file
npm run lint -- packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx

```

For final validation before pushing, use `npm run test:all:quiet` and `npm run test:e2e`.

---

## PRs rules

When opening a PR, always follow the template located at `.github/pull_request_template.md`.

The PR title should follow the pattern: "[Jira code] Jira ticket title", for example "[FCN-123] Fix indentation issue".

If the PR is only covering part of the implementation of the ticket, you can replace the Jira ticket title with something reflecting the PR content.
