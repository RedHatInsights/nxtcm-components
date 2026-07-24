# new component

rules for creating a new component in this repo. read this before writing any new component file.

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
- [ ] story renders in storybook (verify in browser)
- [ ] CT spec covers happy path + at least one edge case
- [ ] local barrel and package/root barrel both updated
- [ ] no `any`, no inline types, no CSS class selectors in tests
