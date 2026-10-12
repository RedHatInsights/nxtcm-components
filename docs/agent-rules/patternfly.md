# patternfly ui

rules for PatternFly React work in this repo. read [`ui-component.md`](ui-component.md) for file structure and component conventions first.

## patternfly mcp (required)

before implementing PatternFly UI, check whether **patternfly-mcp** is enabled.

**if unavailable:** do not guess APIs, props, or accessibility behavior. stop and offer: (1) [enable PatternFly MCP](https://github.com/patternfly/patternfly-mcp) (preferred), or (2) user-approved fallback to [patternfly.org](https://www.patternfly.org/). wait for the user's choice.

**if available:** `searchPatternFlyDocs` → `usePatternFlyDocs`; match the repo's PF major version (e.g. `v6`).

**doc priority:** MCP → patternfly.org → other sources only if PatternFly is silent.

## rules

- use PatternFly React (and documented extensions) instead of one-off custom UI when an official component exists.
- follow PatternFly design guidelines for layout, spacing, and UX patterns.
- import from `@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-icons`, etc.; do not duplicate PF CSS.
- prop values: use exported enums/constants (`AlertVariant.danger`), not magic strings.
- layout and spacing: PF primitives (**Page**, **Flex**, **Grid**, **Stack**). use design tokens for color and typography. do not use PatternFly utility classes (`pf-v6-u-*`) to repair layout or force spacing.
- forms: **Form** / **FormGroup** with documented `validated` / error patterns; labels and errors associated with inputs.
- icon-only controls: `aria-label` or visible text; use `@patternfly/react-icons`.
- add **`checkAccessibility`** in CT when the project provides it (see existing widget specs).

## workflow

1. confirm patternfly-mcp (or user-approved patternfly.org fallback).
2. research component docs and design guidelines for the repo's PF major version.
3. implement; add or update tests to match repo conventions.
