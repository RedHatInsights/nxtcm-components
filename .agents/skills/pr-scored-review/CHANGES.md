# Integration Changes Summary

## What was done

Integrated **pr-scored-review** and **pr-review-detailed** skills to work together as an orchestrated PR review system.

## Changes made

### 1. Created repo-team-standards command
**File:** `.agents/commands/repo-team-standards.md`

Discovers team coding conventions from the repository:
- Build and test tooling
- Code organization patterns
- Component patterns
- Import conventions
- TypeScript patterns
- Documentation locations
- Linting and formatting rules

Used by pr-review-detailed (§2) to inform review findings.

### 2. Updated pr-scored-review skill
**File:** `.agents/skills/pr-scored-review/SKILL.md`

**Architecture change:**
- Was: Standalone review skill with inline checklist logic
- Now: **Orchestrator** that delegates to pr-review-detailed for analysis, then scores findings

**New workflow:**
1. **Steps 1-3:** Setup (get diff, check CI, categorize files)
2. **Step 4:** Delegate to pr-review-detailed for comprehensive analysis
3. **Step 5:** Map pr-review-detailed findings to three lenses (functionality, security, quality)
4. **Step 6-7:** Calculate scores and verdict
5. **Step 8:** Validate findings for scoring
6. **Step 9:** Output scored report
7. **Step 10:** Browser verification (if UI changed)
8. **Step 11:** Next steps based on verdict

**Key additions:**
- Findings mapping (pr-review-detailed sources → scoring lenses)
- Severity mapping (major=2pts, medium=1pt, minor=0.5pt)
- Integration notes explaining relationship with pr-review-detailed

### 3. Updated pr-review-detailed skill
**File:** `.agents/skills/pr-review-detailed/SKILL.md`

**Added:** Relationship documentation
- Notes that pr-scored-review orchestrates this skill for analysis
- Clarifies when to use which skill (detailed vs scored)
- Maintains standalone usage capability

### 4. Created integration contract
**File:** `.agents/skills/pr-scored-review/INTEGRATION.md`

Comprehensive documentation of:
- Architecture diagram (orchestrator → analysis engine → scoring)
- Data flow (input/output contracts)
- Findings mapping table (which checklists map to which lenses)
- Severity mapping and scoring algorithm
- Example end-to-end flow
- Extension points for customization

### 5. Created pr-scored-review README
**File:** `.agents/skills/pr-scored-review/README.md`

User-facing documentation:
- What the skill does
- When to use it (vs pr-review-detailed)
- How it works
- Scoring system explained
- Output format example
- Integration details
- Customization guide

## Architecture

```
pr-scored-review (orchestrator)
    ↓ delegates analysis to
pr-review-detailed (analysis engine)
    ↓ runs layered checklists
    • Core: GENERAL, ARCHITECTURE, SECURITY, TESTING
    • Language: JS_SECURITY
    • UI: REACT, PATTERNFLY, ACCESSIBILITY
    • Repo: VERIFICATION, UNIT_TESTS
    ↓ returns structured findings
pr-scored-review (scoring)
    ↓ maps findings to lenses
    ↓ calculates scores (10 - points)
    ↓ determines verdict
    ↓ outputs scored report
```

## Findings mapping

| pr-review-detailed source | pr-scored-review lens |
|--------------------------|----------------------|
| GENERAL.md (correctness) | Functionality |
| GENERAL.md (structure) | Quality |
| SECURITY.md | Security |
| LANGUAGE/JS_SECURITY.md | Security |
| TESTING.md (coverage) | Functionality |
| TESTING.md (quality) | Quality |
| UI/REACT.md (state/hooks) | Functionality |
| UI/REACT.md (XSS) | Security |
| UI/PATTERNFLY.md | Quality |
| UI/ACCESSIBILITY.md | Quality |

## Severity mapping

| pr-review-detailed | Points | pr-scored-review |
|-------------------|--------|-----------------|
| major | 2 | Critical |
| medium | 1 | Major |
| minor | 0.5 | Minor |

## Scoring formula

```javascript
// For each lens
lens_score = max(1, 10 - sum(finding_points))

// Overall
overall = (functionality + security + quality) / 3

// Verdict
if (any finding has 2pts) → NEEDS_CHANGES
else if (any finding has 1pt) → max MINOR ISSUES
else if (overall >= 9.9) → LGTM
else if (overall >= 8.0) → MINOR ISSUES
else → NEEDS_CHANGES
```

## Both skills remain standalone

### pr-scored-review
Use when you want numeric scoring and a verdict (LGTM / MINOR ISSUES / NEEDS_CHANGES)

### pr-review-detailed
Use when you want detailed findings without scoring overhead, or exploratory analysis

## Testing checklist

- [x] Created repo-team-standards command
- [x] Updated pr-scored-review to delegate to pr-review-detailed
- [x] Updated pr-review-detailed with relationship notes
- [x] Created integration contract (INTEGRATION.md)
- [x] Created README for pr-scored-review
- [ ] Test pr-scored-review invocation
- [ ] Test pr-review-detailed standalone
- [ ] Verify findings mapping
- [ ] Verify scoring calculation
- [ ] Verify verdict thresholds

## Files modified/created

### Created
- `.agents/commands/repo-team-standards.md` (new command)
- `.agents/skills/pr-scored-review/SKILL.md` (updated from .claude/skills/)
- `.agents/skills/pr-scored-review/README.md` (new)
- `.agents/skills/pr-scored-review/INTEGRATION.md` (new)
- `.agents/skills/pr-review-detailed/` (entire skill - new)

### Modified
- `.agents/skills/pr-review-detailed/SKILL.md` (added relationship section)

### Deleted
- `.claude/skills/scored-code-review.md` (migrated to .agents/skills/pr-scored-review/)

## JavaScript security rules enhancement

### Additional change: Strengthened JS_SECURITY.md with absolute rules

**File:** `.agents/skills/pr-review-detailed/LANGUAGE/JS_SECURITY.md`

**Changes:**
- Added prominent **"⚠️ Absolute security rules (NEVER allow)"** warning section at the top
- Strengthened JS1: `dangerouslySetInnerHTML` is **NEVER** allowed (always major finding)
- Strengthened JS6: `eval()` or `new Function()` are **NEVER** allowed (always major findings)
- Updated severity mapping to explicitly list these as major findings
- Made it impossible to miss these critical security rules

**Rules:**
1. **NO `dangerouslySetInnerHTML`** - Even with sanitization, this is prohibited
2. **NO `eval()` or `new Function()`** - No legitimate use case in this codebase

**Benefits:**
- Crystal clear security boundaries
- Automatic major findings block merge in scored reviews
- Consistent enforcement across all PR reviews
- Developers get clear guidance on prohibited patterns

**Documentation:** See `.agents/skills/pr-review-detailed/LANGUAGE/README.md` for rationale and examples

---

## PatternFly skill integration

### Additional change: UI/PATTERNFLY.md now references existing PatternFly skill

**File:** `.agents/skills/pr-review-detailed/UI/PATTERNFLY.md`

**Change:** Updated to reference the repo's comprehensive [patternfly skill](../../patternfly/SKILL.md) as the authoritative source instead of duplicating PatternFly rules.

**Benefits:**
- Single source of truth for PatternFly rules
- No duplication between implementation guide and review checklist
- Easier maintenance (update one file, not multiple)
- Clear hierarchy: implementation guide → review checklist

**Files:**
- Updated: `.agents/skills/pr-review-detailed/UI/PATTERNFLY.md` (now references patternfly/SKILL.md)
- Updated: `.agents/skills/pr-review-detailed/README.md` (notes PatternFly integration)
- Created: `.agents/skills/pr-review-detailed/UI/README.md` (explains cross-skill reference; not executed as a checklist)

## Next steps

1. Stage and commit these changes
2. Test the integrated workflow on a real PR
3. Verify both skills work standalone
4. Verify PatternFly checklist correctly references the main PatternFly skill
5. ~~Update any documentation that references the old scored-code-review skill~~ — frontmatter `name` aligned to `pr-scored-review` (directory name). Legacy identifier `scored-code-review` from `.claude/skills/` migration is not a supported alias; invoke as **pr-scored-review**.
