# Integration Contract: pr-scored-review ↔ pr-review-detailed

This document defines how **pr-scored-review** orchestrates **pr-review-detailed** for comprehensive PR analysis with numeric scoring.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ pr-scored-review (orchestrator)                             │
│                                                               │
│ Step 1-3: Setup                                              │
│   • Get diff (gh pr diff or git diff)                       │
│   • Confirm CI + local checks                               │
│   • Categorize changed files                                │
│                                                               │
│ Step 4: Delegate ──────────────┐                            │
└────────────────────────────────┼────────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────────────────┐
         │ pr-review-detailed (analysis engine)               │
         │                                                     │
         │ §1: Verification gate (optional)                   │
         │ §2: Discover team standards                        │
         │ §3: Determine diff scope                           │
         │ §4: Jira alignment (optional MCP)                  │
         │ §5: Scope rules (strict)                           │
         │ §6-10: Layered checklists                          │
         │   • Core: GENERAL, ARCHITECTURE, SECURITY, TESTING │
         │   • Language: JS_SECURITY                          │
         │   • Repo: VERIFICATION, UNIT_TESTS                 │
         │   • UI: REACT, PATTERNFLY, ACCESSIBILITY           │
         │ §11: Structured findings format                    │
         │ §12: Report assembly                               │
         │ §13: Cleanup temp files                            │
         │                                                     │
         │ Returns:                                            │
         │   • Findings (severity, file:line, fix)            │
         │   • Verification results                           │
         │   • Team standards summary                         │
         │   • Jira alignment (if applicable)                 │
         │   • Architecture signals                           │
         └────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────┼────────────────────────────┐
│ pr-scored-review (scoring)      │                            │
│                                                               │
│ Step 5: Map findings to lenses                               │
│   • Functionality (correctness, integration, state)          │
│   • Security (XSS, secrets, injection, deps)                 │
│   • Quality (a11y, performance, tests, structure)            │
│                                                               │
│ Step 6-7: Score                                              │
│   • Map severity (major=2pts, medium=1pt, minor=0.5pt)       │
│   • Calculate lens scores (10 - sum of points)               │
│   • Calculate verdict (LGTM / MINOR ISSUES / NEEDS_CHANGES)  │
│                                                               │
│ Step 8: Validate for scoring                                 │
│   • Apply silent failure rule                                │
│   • Dedup findings                                           │
│   • Filter invalid deductions                                │
│                                                               │
│ Step 9: Output scored report                                 │
│ Step 10: Browser verification (if UI changed)                │
│ Step 11: Next steps based on verdict                         │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow

### Input to pr-review-detailed

pr-scored-review passes:

| Data | Source | Example |
|------|--------|---------|
| Diff scope | Step 3 | `main...HEAD` or `PR #123` |
| CI status | Step 2 | `green`, `red`, or check details |
| Base branch | User or default | `main`, `upstream/main` |
| Commit range | User or detected | `abc123..def456` |

### Output from pr-review-detailed

pr-review-detailed returns structured findings:

```typescript
interface Finding {
  severity: 'minor' | 'medium' | 'major';
  changeScope: 'small' | 'medium' | 'large';
  title: string;
  file: string;
  line?: number;
  issue: string;
  fix: string;
  source: string; // which checklist file (e.g., "GENERAL.md", "SECURITY.md")
}

interface ReviewResult {
  findings: Finding[];
  verification: {
    status: 'pass' | 'fail' | 'skipped';
    details: string;
  };
  teamStandards: {
    discovered: boolean;
    summary: string;
  };
  jira?: {
    key: string;
    link: string;
    acMatched: string[];
    acGaps: string[];
  };
  architecture?: {
    signals: string[]; // e.g., "API change: medium scale"
  };
}
```

## Findings Mapping

### How pr-scored-review categorizes pr-review-detailed findings

| pr-review-detailed source | pr-scored-review lens |
|--------------------------|----------------------|
| GENERAL.md (correctness, logic, error handling) | Functionality |
| GENERAL.md (structure, maintainability) | Quality |
| SECURITY.md | Security |
| LANGUAGE/JS_SECURITY.md | Security |
| TESTING.md (coverage gaps for critical paths) | Functionality |
| TESTING.md (test quality, structure) | Quality |
| UI/REACT.md (hooks, state, events) | Functionality |
| UI/REACT.md (XSS, dangerouslySetInnerHTML) | Security |
| UI/PATTERNFLY.md | Quality |
| UI/ACCESSIBILITY.md | Quality |
| ARCHITECTURE.md | Quality (unless it breaks behavior → Functionality) |
| Jira AC gaps (major) | Functionality |
| Jira AC gaps (medium, partial) | Quality |

### Severity mapping

| pr-review-detailed severity | Points | pr-scored-review equivalent |
|----------------------------|--------|---------------------------|
| major | 2 | Critical |
| medium | 1 | Major |
| minor | 0.5 | Minor |

**Silent failure rule:** If a finding fails silently (no error to user, no console warning, no test failure), promote it one level:
- medium → major (1pt → 2pts)
- minor → medium (0.5pt → 1pt)

## Scoring Algorithm

For each lens (functionality, security, quality):

```
lens_findings = findings.filter(f => f.lens === current_lens)
lens_points = sum(lens_findings.map(f => f.points))
lens_score = max(1, 10 - lens_points)
```

Overall score:

```
overall_score = (functionality_score + security_score + quality_score) / 3
```

Verdict:

```
if (any finding has 2 points) → NEEDS_CHANGES
else if (any finding has 1 point) → MINOR ISSUES (at most)
else if (overall_score >= 9.9) → LGTM
else if (overall_score >= 8.0) → MINOR ISSUES
else → NEEDS_CHANGES
```

## Example Flow

### User invokes pr-scored-review

```bash
# User asks:
"Review this PR and give me a score"
```

### pr-scored-review orchestration

**Step 1-3:** Setup
- Gets diff: `gh pr diff 299`
- Checks CI: all green ✓
- Categories: 3 components changed, 2 test files, 1 story

**Step 4:** Delegates to pr-review-detailed
```
Invoke pr-review-detailed with:
  - diff scope: upstream/main...HEAD
  - CI status: green
  - base: main
```

### pr-review-detailed analysis

**§1:** Verification - runs lint, type-check, tests → all pass ✓  
**§2:** Team standards - discovers React/PatternFly/TypeScript conventions  
**§3:** Diff scope - 6 files changed  
**§4:** Jira - skipped (no MCP available)  
**§6-10:** Checklists run:
- GENERAL.md → 1 finding: missing error boundary (major)
- TESTING.md → 1 finding: new hook not tested (medium)
- UI/ACCESSIBILITY.md → 1 finding: missing aria-label (minor)
- UI/PATTERNFLY.md → clean ✓

**Returns to pr-scored-review:**
```javascript
{
  findings: [
    {
      severity: 'major',
      title: 'Missing error boundary for async component',
      file: 'src/components/Widget/Widget.tsx',
      line: 42,
      issue: 'Component fetches data but has no error boundary',
      fix: 'Wrap with ErrorBoundary or add error state',
      source: 'GENERAL.md'
    },
    {
      severity: 'medium',
      title: 'useWidgetData hook not tested',
      file: 'src/components/Widget/useWidgetData.ts',
      line: 15,
      issue: 'New custom hook has no spec.tsx test',
      fix: 'Add useWidgetData.spec.tsx with CT tests',
      source: 'TESTING.md'
    },
    {
      severity: 'minor',
      title: 'Button missing accessible label',
      file: 'src/components/Widget/Widget.tsx',
      line: 67,
      issue: 'Icon-only button has no aria-label',
      fix: 'Add aria-label="Close widget"',
      source: 'UI/ACCESSIBILITY.md'
    }
  ],
  verification: { status: 'pass', details: 'All checks passed' },
  teamStandards: { discovered: true, summary: '...' }
}
```

### pr-scored-review scoring

**Step 5:** Map to lenses
- Finding 1 (major, missing error boundary) → **Functionality**
- Finding 2 (medium, hook not tested) → **Quality**
- Finding 3 (minor, aria-label) → **Quality**

**Step 6-7:** Calculate scores
- Functionality: 10 - 2 = **8/10** (1 major finding)
- Security: 10 - 0 = **10/10** (0 findings)
- Quality: 10 - 1.5 = **8.5/10** (1 medium + 1 minor)
- Overall: (8 + 10 + 8.5) / 3 = **8.83/10**

**Verdict:** MINOR ISSUES (has 1 major finding → can't be LGTM, but score > 8.0)

**Step 11:** Next steps
> "3 findings (1 major, 1 medium, 1 minor). Want me to fix these before pushing, or push as-is?"

## Standalone Usage

### When to use pr-scored-review
- You want a **numeric score** and **verdict** (LGTM / MINOR ISSUES / NEEDS_CHANGES)
- You want **three-lens analysis** (functionality, security, quality)
- You need a **go/no-go decision** for merging

### When to use pr-review-detailed
- You want **detailed findings** without scoring overhead
- You're doing **exploratory analysis** before implementation
- You want to focus on **specific checklist categories** (e.g., just security)
- You're **not ready for a verdict** yet

## Extension Points

### Adding new checklists to pr-review-detailed

When you add a new checklist to pr-review-detailed (e.g., `LANGUAGE/GO.md` or `OTHER/COMPLIANCE.md`):

1. pr-review-detailed automatically picks it up (§7-§10)
2. Update the findings mapping table above to show which lens those findings map to
3. No changes needed to pr-scored-review's core algorithm

### Customizing scoring weights

To adjust how severely findings impact scores, modify the severity mapping in pr-scored-review Step 6:

```markdown
| pr-review-detailed severity | Points |
|----------------------------|--------|
| major | 3 | ← increase to make major findings more impactful
| medium | 1 |
| minor | 0.25 | ← decrease to reduce minor finding impact
```

## Testing the Integration

See task #4 for testing checklist:
- [ ] pr-scored-review can invoke pr-review-detailed
- [ ] Findings map correctly to lenses
- [ ] Scores calculate accurately
- [ ] Verdicts follow hard rules
- [ ] Both skills work standalone
- [ ] pr-review-detailed cleanup runs
- [ ] Browser verification integrates (if UI changed)
