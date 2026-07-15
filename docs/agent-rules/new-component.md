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
  index.ts                    # barrel: export { ComponentName } from './ComponentName'
```

place it under:
- `packages/nxtcm-dashboard/src/` for dashboard widgets
- `packages/nxtcm-rosa-hcp-wizard/src/` for wizard steps/fields
- `src/components/` for shared console UI

if the component is under a package, load the package overlay first:
- `packages/nxtcm-dashboard/AGENTS.md`
- `packages/nxtcm-rosa-hcp-wizard/AGENTS.md`

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

## async data pattern

components must not own API clients or direct network calls. consuming apps own fetching and pass data down.

**ROSA HCP wizard** uses `Resource<T>` with `isFetching` + optional `fetch` callback:

```tsx
interface Resource<T> {
  data: T;
  error: string | null;
  isFetching: boolean;
  fetch?: (...args: unknown[]) => Promise<void>;
}
```

**Dashboard widgets** use simpler `data` + `isLoading` props (no Resource wrapper):

```tsx
interface WidgetProps {
  data?: WidgetData;
  isLoading?: boolean;
}
```

check the relevant package AGENTS.md for which pattern applies to your component.

## story (same directory)

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/Category/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: { title: 'Example' },
};
```

## CT spec (same directory)

```tsx
import { test, expect } from '@playwright/experimental-ct-react';
import { MyComponent } from './MyComponent';

test('renders title', async ({ mount }) => {
  const component = await mount(<MyComponent title="Hello" />);
  await expect(component.getByRole('heading', { name: /hello/i })).toBeVisible();
});
```

- use role/testid selectors, never CSS classes
- use spec-helpers for complex setup (providers, mock data)

## exports

add to the package's `index.ts`:

```tsx
export { MyComponent } from './MyComponent';
export type { MyComponentProps } from './MyComponent';
```

## checklist before done

- [ ] prop interface exported with JSDoc
- [ ] story renders in storybook (verify in browser)
- [ ] CT spec covers happy path + at least one edge case
- [ ] barrel export added to package index
- [ ] no `any`, no inline types, no CSS class selectors in tests
