# PatternFly code review checklist

For changed `@patternfly/*`, PF layout/utility classes, or `.tsx` using PatternFly (§5).

**Primary reference:** This repo has a comprehensive PatternFly skill at [../../patternfly/SKILL.md](../../patternfly/SKILL.md). Use that skill as the **authoritative source** for PatternFly rules, workflows, and MCP usage. The checklist below is a review-focused summary.

**Primary checks:** (1) the **recommended** PatternFly component or pattern is used for the UI need — verify against docs, not guess; (2) the change follows PatternFly **design guidelines** (composition, spacing, hierarchy, layout, UX patterns), not just correct component props.

**Docs source** (per [patternfly/SKILL.md](../../patternfly/SKILL.md)):

| Priority | Source | Notes |
|----------|--------|-------|
| 1 | **PatternFly MCP** (`user-patternfly-docs`) | `searchPatternFlyDocs` → `usePatternFlyDocs` — component docs **and** design guidelines |
| 2 | [PatternFly.org](https://www.patternfly.org/) | Fallback when MCP unavailable (user-approved only) |

**If PatternFly MCP unavailable:** Do not guess. Note in findings and follow [patternfly/SKILL.md](../../patternfly/SKILL.md) §1 (stop → offer to enable MCP or use patternfly.org with user approval).

If no docs available, note in findings; fall back to repo neighbors. Do not block the review.

| # | Check | Reference |
|---|--------|-----------|
| P1 | **Recommended component** — chosen PF component/pattern is the one docs recommend for this use case; flag custom HTML, one-off UI, or weaker substitutes when an official component exists | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §1 |
| P2 | **Design guidelines** — spacing, hierarchy, layout, composition, and UX patterns match PatternFly **design guidelines**, especially when combining multiple components into a view | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §2 |
| P3 | **Props/composition** match component docs (variants, required props, children); enum constants not magic strings (`AlertVariant.danger`, not `"danger"`) | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §4 |
| P4 | No **deprecated** components/APIs | [patternfly/SKILL.md](../../patternfly/SKILL.md) |
| P5 | **Layout primitives** — use **Page**, **Flex**, **Grid**, **Stack** etc.; **tokens/utilities** (`pf-v6-u-*` for v6); not ad-hoc CSS fighting the design system | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §5-6 |
| P6 | **Forms** — use **Form** / **FormGroup** with documented `validated` / error patterns; labels, descriptions, and errors associated with inputs (not placeholder-only) | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §8 |
| P7 | **Icon-only controls** need accessible names (`aria-label` or visible text); use `@patternfly/react-icons` | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §9 |
| P8 | **Accessibility** → [ACCESSIBILITY.md](ACCESSIBILITY.md) + `checkAccessibility` tests when project provides it; follow ARIA patterns from PF docs | [patternfly/SKILL.md](../../patternfly/SKILL.md) Rules §7, §10 |

**PatternFly severity:** 
- **major** — breaks documented behavior, user-facing a11y violation, or uses deprecated APIs
- **medium** — wrong/suboptimal component choice, design-guideline drift, magic strings instead of enums
- **minor** — missing `checkAccessibility` test (when project has it), style/token usage that could be cleaner

**When in doubt:** Consult [../../patternfly/SKILL.md](../../patternfly/SKILL.md) for full PatternFly rules and workflow.
