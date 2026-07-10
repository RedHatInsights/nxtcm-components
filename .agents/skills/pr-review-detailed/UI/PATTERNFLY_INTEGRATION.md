# PatternFly Integration Notes

## Cross-skill reference

The `UI/PATTERNFLY.md` checklist in pr-review-detailed **references** the repo's comprehensive [patternfly skill](../../patternfly/SKILL.md) as the authoritative source.

## Why this approach?

Instead of duplicating PatternFly rules across multiple files, we:

1. **Maintain one authoritative source:** [../../patternfly/SKILL.md](../../patternfly/SKILL.md)
   - Full PatternFly rules and workflow
   - MCP usage instructions
   - Component implementation guidance
   - Accessibility patterns
   - When to stop and ask user for MCP approval

2. **Use a focused review checklist:** [PATTERNFLY.md](PATTERNFLY.md)
   - References the main skill for each checklist item
   - Review-focused summary of what to check
   - Severity mapping for findings
   - Quick reference during PR reviews

## Benefits

- **Single source of truth:** PatternFly rules in one place
- **No duplication:** Updates to PatternFly skill automatically apply to reviews
- **Clear hierarchy:** Implementation guide → review checklist
- **Easier maintenance:** Update one file, not multiple

## Usage in reviews

When reviewing PatternFly changes:

1. **pr-review-detailed** applies the `UI/PATTERNFLY.md` checklist
2. Each checklist item references specific sections in `patternfly/SKILL.md`
3. For detailed guidance, reviewers/agents read the main PatternFly skill
4. Findings cite both the checklist item (e.g., `P3`) and the skill reference

## Example finding

```markdown
### Finding: Magic string instead of enum constant

**Severity:** medium
**File:** src/components/Alert/Alert.tsx:15
**Checklist:** UI/PATTERNFLY.md §P3

**Issue:** Using magic string `"danger"` instead of `AlertVariant.danger` enum

**Reference:** [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §4

**Fix:**
```diff
- <Alert variant="danger">
+ <Alert variant={AlertVariant.danger}>
```

**Why this matters (per patternfly/SKILL.md):**
Enum constants provide type safety and prevent typos
```

## Related files

| File | Purpose |
|------|---------|
| `../../patternfly/SKILL.md` | **Authoritative source** — full PatternFly implementation guide |
| `UI/PATTERNFLY.md` | Review checklist that references the skill |
| `UI/REACT.md` | React-specific review checklist (may overlap with PF for React components) |
| `UI/ACCESSIBILITY.md` | Accessibility checklist (referenced by PatternFly checklist for a11y) |

## Customization for other repos

If adopting pr-review-detailed in a non-PatternFly repo:

1. **Remove or replace** `UI/PATTERNFLY.md` with your design system checklist
2. **Keep the pattern:** reference a comprehensive skill/guide instead of duplicating rules
3. **Update README.md** to note which UI framework checklists are included
