---
name: scored-code-review
description: Review PRs using a three-lens scored methodology with evidence-gated findings
tags: [review, quality, testing]
---

# Scored Code Review (nxtcm-components)

Review PRs using a three-lens scored methodology with evidence-gated findings.
Every finding must quote code from the diff and propose a concrete fix.
Findings that fail the validation chain are removed before reporting.

**Trigger:** Use when reviewing any PR — yours or a teammate's — and you want
a rigorous, scored assessment rather than ad-hoc comments.

**Repo conventions:** for coding standards, patterns, and PatternFly rules, see
`AGENTS.md` and `.agents/skills/patternfly/SKILL.md`. This skill handles the
review *methodology* — those docs handle the *rules*.

---

## Step 1 — Get the diff

```bash
# if PR exists
gh pr diff <number> --repo RedHatInsights/nxtcm-components

# if local branch, no PR yet
git diff upstream/main...HEAD
```

Record: files changed, lines added/removed, PR description.

---

## Step 2 — Confirm CI and local checks

Before reviewing code, check the project's automated gates:

1. **CI status:** confirm all checks pass on the PR (lint, type-check, CT, E2E,
   build, storybook). If CI is red, that's a blocking finding — don't proceed
   with a scored review until CI is green.
2. **Jest (local only):** jest doesn't run in CI (see AGENTS.md). If the PR
   changes logic, confirm `npm test` passes locally. If you can't run it, note
   the gap in the output.

If CI is red or local tests can't run, produce a **blocked review** — skip
Steps 3–8, output the Step 9 template with `CI: red` or `Jest: blocked`, set
verdict to NEEDS_CHANGES, and list the failing gates as findings.

Don't re-run lint or type-check yourself — CI already covers those. Focus your
review on what CI and ESLint can't catch: logic, design, and integration.

---

## Step 3 — Categorize changed files

| Category | Pattern |
|----------|---------|
| New logic | New components, hooks, utilities |
| Modified logic | Changed behavior in existing code |
| Config/CI | Workflows, package.json, tsconfig, vite config |
| Types/API | Exported types, props interfaces, Resource shapes |
| Tests | spec.tsx, test.ts files |
| Stories | stories.tsx files |
| Styles | CSS modules, PatternFly token usage |
| Docs | README, AGENTS.md, rule files |

---

## Step 4 — Three-lens review

Focus on things CI and ESLint can't catch. For repo-specific coding standards
and PatternFly rules, see `AGENTS.md` and `.agents/skills/patternfly/SKILL.md`
— don't duplicate those here, just verify the diff follows them.

### Lens 1: Functionality (does it work?)

- **State cascades:** do onValueChange callbacks reset dependent fields correctly?
- **Resource pattern:** are loading/error/empty states handled for all Resource<T> props?
- **Form wizard:** step validation, conditional rendering, data flow between steps
- **Async:** unhandled promise rejections, race conditions in fetches
- **Integration:** is new code wired correctly (imports, exports, routing)?

### Lens 2: Security (is it safe?)

- `dangerouslySetInnerHTML` without sanitization
- Exposed secrets, API keys, tokens in source
- `eval()` or `new Function()`
- Unsanitized user input rendered directly

**Context calibration:** nxtcm-components is a library, not a deployed app.
Most "security" findings are theoretical unless the pattern is passed through
to a consumer rendering user input. Calibrate accordingly.

### Lens 3: Quality (is it well-built?)

- **Accessibility:** missing aria-labels, broken focus, WCAG violations
- **Performance:** unstable refs causing re-renders, missing memo/useMemo
- **Test coverage:** new logic branches without corresponding spec.tsx tests
- **Component structure:** logic mixed with rendering, excessive props drilling
- **PatternFly MCP:** for UI changes, invoke `searchPatternFlyDocs` when
  available to verify correct PF6 component usage, tokens, and patterns; if
  unavailable, record the gap and continue with browser/manual review

---

## Step 5 — Score each lens

### Severity

| Severity | Points | Outcome |
|----------|--------|---------|
| Critical | 2 | Broken rendering, data loss, security hole |
| Major | 1 | Wrong behavior, silent failure, missing error state |
| Minor | 0.5 | Caught by lint/tests, cosmetic issue |
| Nit | 0 | Style preference, no functional impact |

**Silent failure rule:** A defect that fails silently (no error shown to user,
no console warning, no test failure) is one severity level higher.

### Formula

```
lens_score = max(1, 10 - sum(deduction_points))
overall = average(functionality, security, quality)
```

### Verdict

| Score | Verdict |
|-------|---------|
| 9.9+ | LGTM — push/approve |
| 8.0–9.89 | MINOR ISSUES — push with awareness |
| < 8.0 | NEEDS_CHANGES — fix before push |

Hard rules (override score):
- Any Critical finding → always NEEDS_CHANGES.
- Any Major finding → at most MINOR ISSUES (never LGTM).

---

## Step 6 — Evidence gate

Every finding MUST include:

```
N. [Lens] [file:line] description
   - Evidence: `quoted code from the diff`
   - Confidence: HIGH | MEDIUM | LOW
   - Fix: exact code change
   - Points: N
```

If you can't quote the code or propose a fix → keep it as an unscored observation.

---

## Step 7 — Validation chain (7 gates)

Run on every finding before including it:

1. **Location:** file:line exists in the diff? No → REMOVE
2. **Evidence:** can you quote the code? No → REMOVE
3. **Fix:** concrete change proposed? No → keep as observation (0 points), not a finding
4. **Scope:** pre-existing or outside diff? Yes → REMOVE
5. **Materiality:** can it manifest? No → REMOVE
6. **Severity:** correct per table? No → REASSIGN
7. **Dedup:** already reported? Yes → MERGE

---

## Step 8 — Invalid deductions (don't score these)

- "Add tests" without a specific code path + assertion
- Commit message style
- Complexity of the change itself
- Cosmetic preferences (brace style, import order)
- Architectural decisions already made (score implementation, not the choice)
- Pre-existing issues not in this diff
- Theoretical concerns that can't realistically manifest

---

## Step 9 — Output format

```markdown
## Scored Review — [branch or PR#]

**Files:** N changed | **CI:** green/red | **Jest (local):** pass/skip/blocked

### Scores

| Lens | Score | Findings |
|------|-------|----------|
| Functionality | X/10 | N |
| Security | X/10 | N |
| Quality | X/10 | N |
| **Overall** | **X.X/10** | |

### Verdict: [LGTM | MINOR ISSUES | NEEDS_CHANGES]

---

### Findings

[grouped by lens, ordered by severity, evidence gate format]

---

### Incidental observations (not scored)

[pre-existing issues outside diff scope — informational only]
```

---

## Step 10 — Browser verification (if UI files changed)

**Requires:** browser MCP (e.g. cursor-ide-browser). If unavailable, skip this
step and note "browser verification skipped — no browser MCP available" in the
output.

If the diff includes `.tsx`, `.css`, or style changes and browser MCP is available:

1. Start storybook (`npm run storybook`)
2. Open changed components in browser via MCP
3. Visually verify rendering + at least one edge/error path
4. Save screenshots to `~/Documents/review-screenshots/`
5. Include verification summary in the report

If no UI files changed, skip and note it.

---

## Step 11 — Next steps

Based on verdict, offer:

- **NEEDS_CHANGES:** "There are critical/major findings. Want me to fix them?"
- **MINOR ISSUES:** "Minor issues found. Want me to fix these before pushing, or push as-is?"
- **LGTM:** "Clean review. Ready to push/approve."
