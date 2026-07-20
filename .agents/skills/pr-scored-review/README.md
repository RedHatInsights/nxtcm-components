# pr-scored-review

A Fleet Engineering skill for PR review with numeric scoring and clear verdicts. Orchestrates **pr-review-detailed** for comprehensive analysis, then scores findings across three lenses to produce a go/no-go decision.

## What it does

Provides structured PR review with:
1. **Three-lens scoring** — functionality, security, quality (each scored 1-10)
2. **Clear verdict** — LGTM (9.9+), MINOR ISSUES (8-9.89), or NEEDS_CHANGES (<8)
3. **Comprehensive analysis** — delegates to pr-review-detailed for layered checklist coverage
4. **Evidence-gated findings** — every finding has file:line, severity, and concrete fix
5. **Optional browser verification** — visual testing for UI changes

## When to use this skill

Use **pr-scored-review** when you want:
- A **numeric score** and **verdict** for a PR
- **Go/no-go decision** for merging (LGTM vs NEEDS_CHANGES)
- **Three-lens analysis** across functionality, security, and quality
- **Scoring that reflects impact** (critical findings block merge)

## When NOT to use this skill

Use **pr-review-detailed** instead when you want:
- Detailed findings **without scoring overhead**
- **Exploratory analysis** before you're ready for a verdict
- Focus on **specific checklist categories** (e.g., just security)

## How it works

```text
┌─────────────────────────────────────┐
│ pr-scored-review                    │
│                                      │
│ 1. Get diff + CI status              │
│ 2. Categorize changed files          │
│ 3. Delegate to pr-review-detailed ──┼──→ Comprehensive checklist analysis
│ 4. Map findings to 3 lenses          │   Returns: structured findings
│ 5. Calculate scores (10 - points)    │
│ 6. Determine verdict                 │
│ 7. Browser verification (optional)   │
│ 8. Report + next steps               │
└─────────────────────────────────────┘
```

See [INTEGRATION.md](INTEGRATION.md) for detailed architecture and data flow.

## Scoring system

### Three lenses

| Lens | Focus |
|------|-------|
| **Functionality** | Does it work? Correctness, state management, error handling, integration |
| **Security** | Is it safe? XSS, secrets, injection, dependency vulnerabilities |
| **Quality** | Is it well-built? Accessibility, performance, tests, structure, maintainability |

### Severity to points

| Severity | Points | Impact |
|----------|--------|--------|
| major (critical) | 2 | Broken rendering, data loss, security hole, missing Jira AC |
| medium | 1 | Wrong behavior, silent failure, weak tests, missing error state |
| minor | 0.5 | Maintainability, naming, style drift |

**Silent failure rule:** Bugs that fail silently (no error shown, no console warning, no test failure) are promoted one severity level.

### Scoring formula

For each lens:

```text
lens_score = max(1, 10 - sum(finding_points))
```

Overall:

```text
overall_score = (functionality + security + quality) / 3
```

### Verdict thresholds

| Score | Verdict | Action |
|-------|---------|--------|
| 9.9+ | **LGTM** | Push/approve |
| 8.0–9.89 | **MINOR ISSUES** | Push with awareness, or fix first |
| < 8.0 | **NEEDS_CHANGES** | Fix before push |

**Hard rules (override score):**
- Any major finding (2pts) → always **NEEDS_CHANGES**
- Any medium finding (1pt) → at most **MINOR ISSUES** (never LGTM)

## Output format

```markdown
## Scored Review — PR #299

**Files:** 6 changed | **CI:** green | **Jest (local):** pass

### Scores

| Lens | Score | Findings |
|------|-------|----------|
| Functionality | 8/10 | 1 (1 major) |
| Security | 10/10 | 0 |
| Quality | 8.5/10 | 2 (1 medium, 1 minor) |
| **Overall** | **8.83/10** | **3 total findings** |

### Verdict: NEEDS_CHANGES

---

### Findings by Lens

#### Functionality (8/10)

1. [major] [Widget.tsx:42] Missing error boundary for async component
   - Issue: Component fetches data but has no error boundary
   - Fix: Wrap with ErrorBoundary or add error state handling
   - Points: 2

#### Security (10/10)

No findings ✓

#### Quality (8.5/10)

2. [medium] [useWidgetData.ts:15] useWidgetData hook not tested
   - Issue: New custom hook has no spec.tsx test
   - Fix: Add useWidgetData.spec.tsx with CT tests
   - Points: 1

3. [minor] [Widget.tsx:67] Button missing accessible label
   - Issue: Icon-only button has no aria-label
   - Fix: Add aria-label="Close widget"
   - Points: 0.5

---

### pr-review-detailed Context

**Verification:** pass — lint, type-check, jest, CT all passed
**Team standards:** Discovered React/PatternFly/TypeScript conventions
**Jira alignment:** skipped (no MCP)
**Architecture signals:** none

---

3 findings (1 major, 1 medium, 1 minor). There are major findings — want me to fix them before pushing?
```

## Integration with pr-review-detailed

This skill **delegates analysis** to pr-review-detailed for:
- Verification gate (lint, type-check, tests)
- Team standards discovery
- Layered checklists (GENERAL, SECURITY, TESTING, LANGUAGE/*, UI/*, REPO_SPECIFIC/*)
- Jira alignment (optional)
- Structured findings with severity + fix

Then **adds scoring** on top:
- Maps findings to three lenses
- Calculates numeric scores
- Determines verdict
- Browser verification
- Actionable next steps

See [INTEGRATION.md](INTEGRATION.md) for the full contract.

## What pr-review-detailed provides

pr-review-detailed runs these checklists (when applicable):

| Category | Checklists |
|----------|------------|
| **Core (always)** | GENERAL.md, ARCHITECTURE.md, SECURITY.md, TESTING.md |
| **Language** | LANGUAGE/JS_SECURITY.md (for this repo; customizable) |
| **UI (when UI changed)** | UI/REACT.md, UI/PATTERNFLY.md, UI/ACCESSIBILITY.md |
| **Repo-specific** | REPO_SPECIFIC/VERIFICATION.md, UNIT_TESTS.md |

## Browser verification

When the diff includes UI changes (`.tsx`, `.css`, style files):

1. Starts Storybook (`npm run storybook`)
2. Opens changed components in browser via MCP
3. Visually verifies rendering + edge cases
4. Saves screenshots to `~/Documents/review-screenshots/`
5. Adds any visual bugs to findings (usually Quality lens)

**Requires:** browser MCP (e.g., cursor-ide-browser). Skipped if unavailable.

## Example usage

In your AI tool:

```text
"Review this PR and score it"
"Score the current branch against main"
"Run scored review on PR #299"
```

The skill will:
1. Get the diff
2. Check CI status
3. Delegate to pr-review-detailed for analysis
4. Score findings across three lenses
5. Calculate verdict
6. Report results with next steps

## Customization

### Adjust scoring weights

Edit [SKILL.md](SKILL.md) Step 6 to change point values:

```markdown
| severity | Points |
|----------|--------|
| major | 3 | ← increase for more impact
| medium | 1 |
| minor | 0.25 | ← decrease to reduce impact
```

### Add new checklists

Add checklist files to pr-review-detailed:
- `LANGUAGE/*.md` for language-specific rules
- `UI/*.md` for frontend frameworks
- `REPO_SPECIFIC/*.md` for project conventions
- `OTHER/*.md` for compliance, licensing, etc.

pr-scored-review automatically picks them up via pr-review-detailed and maps them to the appropriate lens.

### Modify lens mapping

Edit [SKILL.md](SKILL.md) Step 5 to change how checklist findings map to lenses (functionality, security, quality).

## Files

```text
pr-scored-review/
├── SKILL.md          # Main skill workflow (read by AI agents)
├── README.md         # This file (documentation)
├── INTEGRATION.md    # Integration contract with pr-review-detailed
```

## Related skills

| Skill | Purpose |
|-------|---------|
| **pr-review-detailed** | Detailed findings without scoring |
| **pr-review** | GitHub PR review with inline comments |
| **/code-review** | Built-in Claude Code review skill |

---

*Originally created by Kim Doberstein.*
