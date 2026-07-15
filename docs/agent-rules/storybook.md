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

| package | title pattern | example |
|---------|---------------|---------|
| root `src/` | `Components/<Category>/<Name>` | `Components/Navigation/ConsoleBreadcrumbs` |
| nxtcm-dashboard | `Components/Dashboard/<Name>` | `Components/Dashboard/TotalClusters` |
| nxtcm-rosa-hcp-wizard fields | `Form Elements/<Name>` | `Form Elements/Select` |
| nxtcm-rosa-hcp-wizard connected fields | `Form Elements/Connected Form Elements/<Name>` | `Form Elements/Connected Form Elements/WizSelect` |
| nxtcm-rosa-hcp-wizard full wizard | `Wizards/RosaHCPWizard` | `Wizards/RosaHCPWizard` |

## required elements

- `tags: ['autodocs']` — generates docs page automatically
- at least one `Default` story with typical props
- additional stories for states: `Loading`, `Error`, `Empty`, `WithData`

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

## where stories live

co-located next to the component:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.stories.tsx   <-- here
  ComponentName.spec.tsx
```

legacy dashboard and wizard stories under `src/components/dashboard/` and `src/components/Wizards/ROSAHCPWizard/` are excluded from Storybook. new stories go in `packages/nxtcm-dashboard/src/` and `packages/nxtcm-rosa-hcp-wizard/src/`.

## console.log

`no-console: error` is the lint rule, but it's relaxed in `*.stories.tsx` files. you can use `console.log` in action handlers for stories.

## verification

after writing a story:
1. run `npm run storybook`
2. navigate to the story in browser
3. verify rendering in both light and dark mode
4. check controls panel works
5. verify autodocs page generates correctly
