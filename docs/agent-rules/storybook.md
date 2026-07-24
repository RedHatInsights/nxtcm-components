# storybook stories

rules for writing Storybook stories in this repo.

## format

CSF3 (Component Story Format 3) — the only format used here.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ComponentName>;
```

## title conventions

use a stable path-style title: `<Area>/<Category>/<Name>`.

for root `src/` components, use `Components/<Category>/<Name>` (e.g. `Components/Navigation/ConsoleBreadcrumbs`).

for package-specific prefixes, check the relevant package overlay:
- `packages/nxtcm-dashboard/AGENTS.md`
- `packages/nxtcm-rosa-hcp-wizard/AGENTS.md`

## required elements

- `tags: ['autodocs']` — generates docs page automatically
- at least one `Default` story with typical props
- add state stories (`Loading`, `Error`, `Empty`, `WithData`) when the component supports those states

## args and argTypes

use `args` for static prop values, `argTypes` for controls:

```tsx
export const Default: Story = {
  args: {
    title: 'My Widget',
    count: 42,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};
```

## decorators

for components that need context providers:

```tsx
const meta: Meta<typeof ComponentName> = {
  // ...
  decorators: [
    (Story) => (
      <SomeProvider value={mockValue}>
        <Story />
      </SomeProvider>
    ),
  ],
};
```

## console.log

`no-console: error` is the lint rule, but it's relaxed in `*.stories.tsx` files. you can use `console.log` in action handlers for stories.

## verification

after writing a story:
1. run `npm run storybook`
2. navigate to the story in browser
3. verify rendering in both light and dark mode
4. check controls panel works
5. verify autodocs page generates correctly
