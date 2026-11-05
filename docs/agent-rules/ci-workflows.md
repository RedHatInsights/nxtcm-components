# CI workflows

rules for modifying GitHub Actions workflows in this repo.

## workflow files

| file | purpose | trigger |
|------|---------|---------|
| `ci.yml` | main CI — lint, type-check, unit test, CT, E2E, build, storybook, coverage contract | push to main, PRs |
| `ct-triage-comment.yml` | posts classified failure comments on PRs | `workflow_run` (after CI completes) |
| `deploy-storybook.yml` | deploys storybook to pages | push to main |
| `check-links.yml` | validates external links in docs/code | scheduled + manual |

## action pinning (hard constraint)

all `uses:` references must pin to a full commit SHA, not a tag or branch:

```yaml
# correct
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

# wrong — supply chain risk
- uses: actions/checkout@v4
```

always add a comment with the human-readable version after the SHA.

## CI jobs structure

```text
lint → (independent)
type-check → (independent)
unit-test → (independent)
test (CT) → (independent)
e2e → (independent)
build → (independent)
storybook → (independent)
coverage-contract → needs: [unit-test, test, e2e]
```

jobs run in parallel except `coverage-contract` which assembles data from all test jobs.

## browser matrix

`test` (CT) and `e2e` use a matrix with `react: [18, 19]` and `browser: [chromium]`, plus `include` entries that add Firefox and WebKit for React 19 only. That gives four legs each: React 18 + Chromium, and React 19 + Chromium, Firefox and WebKit.

- each leg runs `npx playwright install --with-deps ${{ matrix.browser }}` (never install all engines) and `--project=components-${{ matrix.browser }}` / `--project=e2e-${{ matrix.browser }}`
- artifacts are per leg: `playwright-ct-report-react-<n>-<browser>` and `playwright-report-react-<n>-<browser>`
- `coverage-contract` only downloads the `-chromium` artifacts, so the contract totals (including the canonical `test-coverage-data` EPD reads) do not change with the extra engines
- `ct-triage-comment.yml` uses the same matrix as the CT job (keep the two in sync): each leg downloads its own `playwright-ct-report-react-<n>-<browser>` artifact and posts its own comment, labelled with the React version and browser (`--react-version`, `--browser`)
- the stable summary jobs (`Unit Tests`, `Component Tests`, `E2E Tests`) wait for every leg, so a Firefox or WebKit failure fails the required check
- multi-browser coverage is CI-only: the jobs call `playwright test --project=…` directly, while the local `npm run test:ct` / `test:e2e` scripts run Chromium only
- `react-compatibility` and Stryker stay Chromium-only

## CT triage pipeline

the component test job produces structured output consumed by downstream automation:

1. `ci.yml` runs CT tests with `--reporter=list,github,html,json,junit`
2. `utils/summarize-playwright-ct.mjs` parses JSON → `playwright-ct-summary.json` + `.md`
3. on failure, summary markdown is appended to `GITHUB_STEP_SUMMARY`
4. artifacts uploaded: report HTML, JSON results, summary JSON/MD
5. `ct-triage-comment.yml` runs via `workflow_run` with one leg per CT matrix leg, downloads that leg's summary JSON, and posts a classified PR comment (nothing when the leg has no failures or flaky tests)

## adding a new CI job

1. pin all actions to SHA
2. use `node-version-file: 'package.json'` (not a hardcoded version)
3. use `npm ci` (not `npm install`)
4. upload artifacts with `retention-days` set (7 for reports, 30 for coverage)
5. if job needs results from another job, use `needs:` and `download-artifact`

## environment variables

- `PLAYWRIGHT_JSON_OUTPUT_NAME` — where playwright writes JSON results
- `PLAYWRIGHT_JUNIT_OUTPUT_NAME` — where playwright writes JUnit XML
- `COVERAGE=true` — enables istanbul instrumentation

## permissions

workflows use least-privilege:
- `contents: read` on CI
- `pull-requests: write` only on `ct-triage-comment.yml` (needs to post comments)
- fork PRs can't get write access — that's why `ct-triage-comment.yml` uses `workflow_run`

## workflow_run security boundary (mandatory)

`ct-triage-comment.yml` is a privileged `workflow_run` job. treat everything produced by PR runs as untrusted.
follow GitHub's `workflow_run` untrusted-content guidance as a hard boundary: [Secure use reference](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#using-third-party-actions).

- never checkout PR head code in this workflow
- checkout only trusted default-branch helper files (`utils/ct-triage-comment.mjs` and `package.json`)
- never execute scripts or binaries from downloaded artifacts
- parse artifacts as data only (JSON parse + schema/shape validation)
- escape untrusted artifact content before building the PR comment body

current implementation expectation:
- `ct-triage-comment.yml` checks out default-branch files only via sparse checkout
- downloaded summary (`playwright-ct-summary.json`) is parsed and validated by `utils/ct-triage-comment.mjs`
- comment content is emitted as escaped markdown text only

## testing workflow changes

- use `act` as supplemental workflow validation, not a replacement for the required local checks
- for `workflow_run` triggers, the workflow file must exist on the default branch (main) before it fires
- test on a branch first, then merge the workflow file to main
