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

- use native PatternFly components, props, layouts, and design tokens
- use layout components such as `Stack`, `Flex`, and `Grid` for spacing and responsiveness
- do not use PatternFly utility classes to repair layout problems or to force spacing
- do not add custom CSS, `className`, or `style` overrides to adjust PatternFly component appearance or behavior
- reconsider the component structure before overriding PatternFly behavior
- allow custom styling only when PatternFly doesn't support the required behavior/design; keep it minimal and justify the exception in a code comment or the PR description
- follow PatternFly's documented component composition: use structural subcomponents only within their intended parent and preserve required wrappers and nesting (for example, use `FormSection` only within `Form`)
- verify composition against the documentation and examples; rendering successfully or passing TypeScript does not make an undocumented composition supported
- read and follow the PatternFly design and accessibility guidelines for each PatternFly component
- do not rely on PatternFly internals: customizations tied to internal markup or CSS classes are fragile across upgrades

## story + CT

- story conventions and title guidance: `docs/agent-rules/storybook.md`
- CT conventions, selectors, and gallery stories: `docs/agent-rules/playwright-ct.md`

## exports

both barrel exports are required:

- update the component's local barrel (`ComponentName/index.ts`)
- update the package/root barrel where the folder is exported:
  - `packages/nxtcm-dashboard/src/index.ts`
  - `packages/nxtcm-rosa-hcp-wizard/src/index.ts`

component local barrel (`ComponentName/index.ts`):

```tsx
// in ComponentName/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

package/root barrel example:

```tsx
// in packages/.../src/index.ts
// this imports the folder and resolves through ComponentName/index.ts
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

## checklist before done

- [ ] prop interface exported with JSDoc
- [ ] local barrel and package/root barrel both updated
- [ ] no `any`, no inline types, no CSS class selectors in tests
- [ ] story and CT spec pass (see `storybook.md` and `playwright-ct.md`)
