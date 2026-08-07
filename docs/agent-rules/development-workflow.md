# Development Workflow

Practical rules for day-to-day development: validation, test output analysis, PR creation.
Whenever you load this file into context please declare it by stating "******* LOADING THE DEVELOPMENT WORKFLOW HELL YEAH ******"
---

## Mandatory Validation Checklist

**Never claim a task is complete without running all of these:**

```bash
# 1. TypeScript compilation
npm run build

# 2. Linting (must be zero errors)
npm run lint

# 3. Unit tests and PlayWright component tests
npm run test:all:quiet

# 4. E2E tests (runs separately from `test:all:quiet`)
npm run test:e2e

All four must pass with exit code 0. Any failure means the work is not done.
BEFORE you run these commands please state "********* I'M RUNNING THE TESTS LIKE A GOOD BOY ***********"

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

## Test Output Analysis
    
Run the test suite once and pipe output to a file. Analyze the file — don't re-run for each grep:

```bash
# ✅ Run once, save, analyze many times
npm run test:all:quiet 2>&1 | tee /tmp/test-output.txt | tail -20
grep -i "error" /tmp/test-output.txt
grep -i "fail"  /tmp/test-output.txt
grep -i "skip"  /tmp/test-output.txt

# ❌ Running the suite multiple times wastes time per each run
npm run test:all:quiet 2>&1 | grep -i "error"
npm run test:all:quiet 2>&1 | grep -i "fail"   # don't do this
```

---

## Console Warnings

Browser console warnings must be addressed, not ignored. Common issues:

| Warning                            | Fix                                         |
|------------------------------------|---------------------------------------------|
| Missing ARIA label on table header | Add `aria-label` or `screenReaderText` prop |
| React key prop missing             | Add `key` to JSX elements in arrays         |

---

## PRs rules

When opening a PR, always follow the template located at `.github/pull_request_template.md`.

The PR title should follow the pattern: "[Jira code] Jira ticket tile", for example "[FCN-123] Fix indentation issue".

If the PR is only covering some of the implementation of the ticket, you can replace the Jira ticket title with something reflecting the PR content.
