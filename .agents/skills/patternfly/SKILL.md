# PatternFly application development

Use this guide when building or modifying UI that follows [PatternFly](https://www.patternfly.org/). PatternFly is the source of truth for components, **design guidelines**, layout, design tokens, and accessibility.

---

## PatternFly MCP (required)

Before implementing PatternFly UI, check whether **patternfly-mcp** is enabled.

**If unavailable:** do not guess APIs, props, or accessibility behavior. **Stop** and offer: (1) [enable PatternFly MCP](https://github.com/patternfly/patternfly-mcp) (preferred), or (2) user-approved fallback to [patternfly.org](https://www.patternfly.org/). Wait for the user's choice before proceeding.

**If available:** `searchPatternFlyDocs` → `usePatternFlyDocs`; match the repo's PF major version (e.g. `v6`); use returned schemas to validate props.

**Doc priority:** MCP → patternfly.org (fallback) → other sources only if PatternFly is silent.

---

## Rules

- Use **PatternFly React** (and documented extensions/component groups) instead of native HTML or one-off custom UI when an official component exists.
- Follow PatternFly **design guidelines** for how components are used and combined.  Spacing, hierarchy, layout, and UX patterns should match documented guidance, especially when assembling multiple components into a view.
- Import from the project's PF packages (`@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-icons`, etc.). Do not duplicate PF CSS or add parallel styling systems.
- Prop values: use exported enums/constants (`AlertVariant.danger`), not magic strings.
- Layout: PF primitives (**Page**, **Flex**, **Grid**, **Stack**, etc.); one primary layout per region.
- Styling: tokens/utilities (e.g. `pf-v6-u-*` for v6); custom CSS only when docs do not cover the need.
- Implement **ARIA roles, labels, and keyboard behavior** exactly as specified in PatternFly component documentation.
- Forms: use **Form** / **FormGroup** with documented `validated` / error patterns; associate **labels**, **descriptions**, and **errors** with inputs—do not rely on placeholder text alone.
- Icon-only controls need accessible names (`aria-label` or visible text); use **`@patternfly/react-icons`**, not ad-hoc SVG copies.
- Add **`checkAccessibility`** in component tests when the project provides it:

```tsx
test('should pass accessibility tests', async ({ mount }) => {
  const component = await mount(<MyCustomComponent />);
  await checkAccessibility({ component });
});
```

- Consult docs before inventing UI (empty states, loading, wizards, modals, tables, notifications).

---

## Workflow

1. Confirm **patternfly-mcp** is enabled.
2. **If not enabled:** stop → offer **install MCP (preferred)** or **use [patternfly.org](https://www.patternfly.org/) (user-approved fallback)** → wait for choice.
3. **Research:** MCP tools **or** patternfly.org (per choice above)—component docs **and design guidelines**; match the repo's PatternFly major version.
4. Implement with PF React, layout primitives, tokens/utilities, and enum props.
5. Add or update **`checkAccessibility`** tests; match existing project conventions. Avoid unrelated refactors.
