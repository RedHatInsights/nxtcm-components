---
name: pr-scored-review
description: Review PRs using a three-lens scored methodology with evidence-gated findings. Orchestrates pr-review-detailed for comprehensive analysis, then scores findings across functionality, security, and quality lenses.
tags: [review, quality, testing]
---

# Scored Code Review (nxtcm-components)

Review PRs using a three-lens scored methodology with evidence-gated findings.
Delegates detailed analysis to **pr-review-detailed**, then scores findings across
functionality, security, and quality lenses to produce a verdict (LGTM, MINOR ISSUES, NEEDS_CHANGES).

**Trigger:** Use when reviewing any PR — yours or a teammate's — and you want
a rigorous, scored assessment with a clear verdict.

**Architecture:** This skill **orchestrates** the review workflow:
1. Gather PR context (diff, CI status, file categorization)
2. Delegate to **pr-review-detailed** for comprehensive checklist-driven analysis
3. Map findings to three scoring lenses
4. Calculate scores and verdict
5. Optional browser verification for UI changes

**Standalone alternative:** Use **pr-review-detailed** directly for detailed findings
without numeric scoring.

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

## Step 4 — Delegate to pr-review-detailed

Invoke the **pr-review-detailed** skill to perform comprehensive checklist-driven analysis.

**What pr-review-detailed does:**
1. Runs optional verification gate (lint, type-check, tests)
2. Discovers team standards via repo-team-standards command
3. Applies layered checklists:
   - Core: GENERAL.md, ARCHITECTURE.md, SECURITY.md, TESTING.md
   - Language-specific (e.g., LANGUAGE/JS_SECURITY.md)
   - Repo-specific (REPO_SPECIFIC/VERIFICATION.md, UNIT_TESTS.md)
   - UI checklists when applicable (UI/REACT.md, PATTERNFLY.md, ACCESSIBILITY.md)
4. Optional Jira alignment (if MCP available)
5. Returns structured findings with severity (minor/medium/major) and change scope (small/medium/large)

**Pass to pr-review-detailed:**
- The diff scope from Step 3
- CI status from Step 2
- Any user-specified base branch or commit range

**Receive back:**
- Structured findings list with severity, file/line, concrete fixes
- Verification results
- Jira alignment report (if applicable)
- Architecture/API change signals

See [../pr-review-detailed/SKILL.md](../pr-review-detailed/SKILL.md) for full details.

---

## Step 5 — Map findings to three lenses

Take pr-review-detailed findings and categorize them into scoring lenses:

### Lens 1: Functionality (does it work?)

**Sources:**
- GENERAL.md findings about correctness, logic errors, error handling
- TESTING.md findings about missing critical test coverage
- Jira AC gaps (major severity)
- UI/REACT.md findings about hooks, state management, event handling

**Focus:**
- State cascades and data flow bugs
- Resource pattern handling (loading/error/empty states)
- Form wizard validation and step transitions
- Async handling (promise rejections, race conditions)
- Integration errors (imports, exports, wiring)

### Lens 2: Security (is it safe?)

**Sources:**
- SECURITY.md findings (XSS, injection, secrets exposure)
- LANGUAGE/JS_SECURITY.md findings (npm audit, dependency advisories)
- UI/REACT.md security items (dangerouslySetInnerHTML, sanitization)

**Focus:**
- Unsanitized user input rendering
- Exposed secrets or API keys
- Dangerous functions (eval, new Function)
- Dependency vulnerabilities

**Context calibration:** nxtcm-components is a library, not a deployed app.
Most "security" findings are theoretical unless the pattern is passed through
to a consumer rendering user input. Calibrate accordingly.

### Lens 3: Quality (is it well-built?)

**Sources:**
- TESTING.md findings about test quality and coverage
- UI/ACCESSIBILITY.md findings
- UI/PATTERNFLY.md findings
- GENERAL.md findings about structure, maintainability
- ARCHITECTURE.md findings about design

**Focus:**
- Accessibility violations (aria-labels, focus, WCAG)
- Performance issues (unstable refs, missing memoization)
- Test coverage gaps (new logic without tests)
- Component structure (separation of concerns, props drilling)
- PatternFly usage correctness

---

## Step 6 — Map pr-review-detailed severity to points

pr-review-detailed uses severity levels (minor/medium/major). Map these to scoring points:

| pr-review-detailed severity | Points | Equivalent severity | Outcome |
|----------------------------|--------|---------------------|---------|
| major | 2 | Critical | Broken rendering, data loss, security hole, missing Jira AC |
| medium | 1 | Major | Wrong behavior, silent failure, missing error state, weak tests |
| minor | 0.5 | Minor | Maintainability, naming, style drift |

**Silent failure rule:** A defect that fails silently (no error shown to user,
no console warning, no test failure) is one severity level higher. If pr-review-detailed
marks something as medium, and it fails silently, treat it as 2 points (major/critical).

---

## Step 7 — Score each lens

### Formula

For each lens (functionality, security, quality):

```
lens_score = max(1, 10 - sum(deduction_points))
```

Sum the points for all findings categorized to that lens (using Step 5 mapping and Step 6 point values).

```
overall = average(functionality, security, quality)
```

### Verdict

| Score | Verdict |
|-------|---------|
| 9.9+ | LGTM — push/approve |
| 8.0–9.89 | MINOR ISSUES — push with awareness |
| < 8.0 | NEEDS_CHANGES — fix before push |

Hard rules (override score):
- Any finding with 2 points (major from pr-review-detailed) → always NEEDS_CHANGES.
- Any finding with 1 point (medium from pr-review-detailed) → at most MINOR ISSUES (never LGTM).

---

## Step 8 — Validate and refine findings

pr-review-detailed already provides validated findings with concrete fixes. Review them for:

### Evidence gate (inherited from pr-review-detailed)

Each finding includes:
- **file:line** location
- **severity** (minor/medium/major)
- **change scope** (small/medium/large)
- **concrete fix** proposal
- **title** and description

If pr-review-detailed provided a finding, it already passed basic validation.

### Additional validation for scoring

Run these checks before scoring:

1. **Lens assignment:** Does the finding clearly belong to functionality, security, or quality? If ambiguous, assign to the most impacted lens.
2. **Severity confirmation:** Does the pr-review-detailed severity match the actual impact? Apply the silent failure rule if needed.
3. **Dedup:** Are multiple findings describing the same issue? MERGE them into one scored item.
4. **Materiality:** Can this realistically manifest in this library context? If not, downgrade or note as observation.

### Invalid deductions (don't score these)

Even if pr-review-detailed reports them, don't score:
- "Add tests" without a specific code path + assertion (score only if specific coverage gap)
- Commit message style
- Complexity of the change itself
- Cosmetic preferences already handled by lint/prettier
- Architectural decisions already made (score implementation bugs, not the design choice)
- Pre-existing issues explicitly marked as out-of-scope
- Theoretical concerns that can't realistically manifest in a component library

---

## Step 9 — Output format

```markdown
## Scored Review — [branch or PR#]

**Files:** N changed | **CI:** green/red | **Jest (local):** pass/skip/blocked

### Scores

| Lens | Score | Findings |
|------|-------|----------|
| Functionality | X/10 | N (N major, N medium, N minor) |
| Security | X/10 | N (N major, N medium, N minor) |
| Quality | X/10 | N (N major, N medium, N minor) |
| **Overall** | **X.X/10** | **N total findings** |

### Verdict: [LGTM | MINOR ISSUES | NEEDS_CHANGES]

---

### Findings by Lens

#### Functionality (X/10)

[findings mapped to this lens, ordered by severity (major → medium → minor)]

**Format per finding:**
```
N. [major/medium/minor] [file:line] title
   - Issue: description from pr-review-detailed
   - Fix: concrete fix proposal
   - Points: N
```

#### Security (X/10)

[findings mapped to this lens, ordered by severity]

#### Quality (X/10)

[findings mapped to this lens, ordered by severity]

---

### pr-review-detailed Context

**Verification:** [pass/fail/skipped + details]
**Team standards:** [discovered conventions summary]
**Jira alignment:** [key, link, AC status — if applicable]
**Architecture signals:** [structural or API changes flagged]

---

### Incidental observations (not scored)

[pre-existing issues outside diff scope, or findings excluded per Step 8 — informational only]
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
6. Add any visual bugs found to the appropriate lens (usually Quality)

If no UI files changed, skip and note it.

---

## Step 11 — Next steps

Based on verdict, offer:

- **NEEDS_CHANGES:** "There are [N] major/critical findings. Want me to fix them?"
- **MINOR ISSUES:** "[N] medium/minor issues found. Want me to fix these before pushing, or push as-is?"
- **LGTM:** "Clean review (X.X/10). Ready to push/approve."

---

## Integration notes

### Using pr-review-detailed

This skill **delegates analysis** to pr-review-detailed. Do not duplicate its checklists here.

**What this skill adds:**
- Three-lens scoring framework
- Numeric verdict calculation
- Evidence gate validation for scoring
- Browser verification
- Actionable next steps based on score

**What pr-review-detailed provides:**
- Comprehensive checklist coverage
- Team standards discovery
- Verification gate
- Jira alignment
- Structured findings with severity

### Standalone usage

Both skills can be used independently:
- **pr-scored-review:** When you want a scored verdict (this skill)
- **pr-review-detailed:** When you want detailed findings without numeric scoring
