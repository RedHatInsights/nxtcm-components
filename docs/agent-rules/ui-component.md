# Component guidelines

Rules for UI components patterns used in nxtcm-components. Read this before working on any component file.

Always read the related guidelines before proceeding:
- [TypeScript guidelines](typescript.md) - patterns and rules specifically for TS

## file structure (mandatory)

every component gets its own directory with co-located files:

```text
ComponentName/
  ComponentName.tsx           # the component
  ComponentName.stories.tsx   # storybook story (CSF3)
  ComponentName.spec.tsx      # playwright CT test
  ComponentName.test.ts       # jest unit test (only if complex logic)
  index.ts                    # local barrel in this folder:
                              # export { ComponentName } from './ComponentName';
                              # export type { ComponentNameProps } from './ComponentName';
```

placement rules live in root `AGENTS.md` (`## where to add code`).

## prop interface

```tsx
export interface MyComponentProps {
  /** required: short JSDoc on each prop */
  title: string;
  /** optional props get ? */
  onSave?: (data: FormData) => void;
}
```

- explicit interface, not inline types
- export the interface alongside the component
- JSDoc on each prop (one line, lowercase)
- no `any` — use `unknown` if truly unknown

## component shape

```tsx
export const MyComponent = ({ title, onSave }: MyComponentProps): React.ReactElement => {
  // ...
};
```

- functional only, no classes
- explicit return type
- named export (not default)

## PatternFly usage

### patternfly mcp (required)

before implementing PatternFly UI, check whether **patternfly-mcp** is enabled.

**if unavailable:** do not guess APIs, props, or accessibility behavior. stop and offer: (1) [enable PatternFly MCP](https://github.com/patternfly/patternfly-mcp) (preferred), or (2) user-approved fallback to [patternfly.org](https://www.patternfly.org/). wait for the user's choice.

**if available:** `searchPatternFlyDocs` → `usePatternFlyDocs`; match the repo's PF major version (e.g. `v6`).

**doc priority:** MCP → patternfly.org → other sources only if PatternFly is silent.

**workflow:** (1) confirm MCP or fallback, (2) research component docs and design guidelines for the repo's PF major version, (3) implement and add or update tests to match repo conventions.

### rules

- use native PatternFly components, props, layouts, and design tokens
- use layout components such as `Stack`, `Flex`, and `Grid` for spacing and responsiveness
- import from `@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-icons`, etc.; do not duplicate PF CSS
- prop values: use exported enums/constants (`AlertVariant.danger`), not magic strings
- do not use PatternFly utility classes (`pf-v6-u-*`) to repair layout problems or to force spacing
- do not add custom CSS, `className`, or `style` overrides to adjust PatternFly component appearance or behavior
- reconsider the component structure before overriding PatternFly behavior
- allow custom styling only when PatternFly doesn't support the required behavior/design; keep it minimal and justify the exception in a code comment or the PR description
- follow PatternFly's documented component composition: use structural subcomponents only within their intended parent and preserve required wrappers and nesting (for example, use `FormSection` only within `Form`)
- verify composition against the documentation and examples; rendering successfully or passing TypeScript does not make an undocumented composition supported
- read and follow the PatternFly design and accessibility guidelines for each PatternFly component
- do not rely on PatternFly internals: customizations tied to internal markup or CSS classes are fragile across upgrades
- forms: use **Form** / **FormGroup** with documented `validated` / error patterns; associate labels and errors with inputs
- icon-only controls: `aria-label` or visible text; use `@patternfly/react-icons`
- add **`checkAccessibility`** in CT when the project provides it (see existing widget specs)

## story + CT

- story conventions, public vs internal visibility, and title guidance: `docs/agent-rules/storybook.md`
- CT conventions, selectors, and spec-helpers: `docs/agent-rules/playwright-ct.md`

## exports

every component has a local barrel (`ComponentName/index.ts`).

package barrels differ:

- dashboard widgets are public API — also re-export from `packages/nxtcm-dashboard/src/index.ts`
- the ROSA HCP wizard package barrel (`packages/nxtcm-rosa-hcp-wizard/src/index.ts`) is the public entry only (`RosaHCPWizard`, public types, and host-app integration helpers). do not add internal fields, steps, or yup schemas there

component local barrel (`ComponentName/index.ts`):

```tsx
// in ComponentName/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

dashboard package barrel example:

```tsx
// in packages/nxtcm-dashboard/src/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

## checklist before done

- [ ] prop interface exported with JSDoc
- [ ] local barrel updated (and dashboard package barrel if it is a public widget)
- [ ] no `any`, no inline types, no CSS class selectors in tests
- [ ] story and CT spec pass (see `storybook.md` and `playwright-ct.md`)
