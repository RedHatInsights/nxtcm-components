# Test Plan section

Apply when drafting the **Test Plan** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## Test Plan` |
| **Required** | yes |
| **Discovery** | what to verify and how — from user input or repo test norms |
| **Breakdown trace** | `TP` (test/docs tasks in jira-epic-breakdown) |
| **Owns** | What to test and how |
| **Does not own** | AC outcomes duplicated verbatim |
| **Length target** | **4–10** bullets |
| **Research feeds** | Test scripts, frameworks, CI workflows |

What will need to be **tested** and **how** — epic-level verification strategy, not a story-level test case dump.

**Style:** [WRITING.md](../WRITING.md) — plain language bullets.

---

## Format

- Bullet list grouped by area when helpful
- Each bullet: **what** to verify + **how** (manual, unit, component, e2e, integration)
- **4–10 bullets** typical

Example pattern:

```markdown
- **Happy path — create flow:** Manual or e2e — user completes prerequisites, wizard, and submit; cluster creation is queued.
- **Service account auth:** Integration — wizard data loads using selected credentials; failures show clear errors.
- **RBAC:** Manual — unauthorized users cannot access the create route.
- **Submit / CRDs:** Integration or unit — host `onSubmit` produces expected hub resources.
- **Error states:** Component or manual — API timeout, invalid credentials, submit failure each surface actionable messages.
```

---

## Coverage checklist

Ensure relevant rows when applicable (not every epic needs every row):

| Area | Prompt |
|------|--------|
| Happy path | End-to-end user flow from entry to confirmation |
| Prerequisites / gates | Preconditions block or allow progress correctly |
| Data integration | External data loads and displays |
| Submit / side effects | Artifacts created; downstream process starts |
| Error handling | Fetch, auth, validation, submit failures |
| RBAC / auth | Unauthorized access blocked |
| Regression | Existing flows unaffected |
| Accessibility | Key flows keyboard-navigable and labeled (when UI epic) |
| Docs | Operator or team docs accurate (when user implied) |

Match test **level** to team norms from conversation or repo (e.g. Playwright e2e in `console-acm`, component tests in library packages).

---

## Do not

- Duplicate acceptance criteria verbatim — Test Plan says **how** to verify, AC says **what** must be true
- List every unit test file or describe block
- Invent test tooling the user never mentioned unless research found standard scripts in repo
- Add performance or load testing unless user requested

---

## Section template

```markdown
## Test Plan

- …
- …
```
