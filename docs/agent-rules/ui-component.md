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

## story + CT

- story conventions and title guidance: `docs/agent-rules/storybook.md`
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
