# storybook stories

rules for writing Storybook stories in this repo.

## format

CSF3 (Component Story Format 3) — the only format used here.

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/Dashboard/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ComponentName>;
```

## when to write a story

| Kind | Story? | Conventions |
| --- | --- | --- |
| New exported React component (re-exported from `packages/*/src/index.ts`) | **Required** | `tags: ['autodocs']`. Title: `Components/Dashboard/<Name>` or `Wizards/<Name>`. Visible everywhere (local dev, CI static build, GitHub Pages). |
| New internal React component (not re-exported from package index) | **Required** | `tags: ['autodocs', 'internal']`. Title must begin with `Internal/` (e.g. `Internal/Form Elements/<Name>`). Local `npm run storybook` shows them in the sidebar; `storybook build` (CI and GitHub Pages) hides them from the sidebar and docs via `excludeFromSidebar` and `excludeFromDocsStories`. They remain in `index.json`, and a direct URL still opens them. |
| Hook / schema / type / context / helper | **No story** | Never write stories for non-UI elements. |

Do **not** rename internal story files to `*.private.stories.tsx` — visibility is controlled by Storybook tags and title prefixes.

## title conventions

use a stable path-style title: `<Area>/<Category>/<Name>`.

- **Public Dashboard Components**: `Components/Dashboard/<Name>`
- **Public Wizard**: `Wizards/RosaHCPWizard`
- **Internal Wizard Base Fields**: `Internal/Form Elements/<Name>`
- **Internal Wizard Connected Fields**: `Internal/Form Elements/Connected Form Elements/<Name>`
- **Internal Dashboard Components**: `Internal/Dashboard/<Name>`

for package-specific prefixes, check the relevant package overlay:
- `packages/nxtcm-dashboard/AGENTS.md`
- `packages/nxtcm-rosa-hcp-wizard/AGENTS.md`

## required elements

- `tags` array:
  - Public stories: `tags: ['autodocs']`
  - Internal stories: `tags: ['autodocs', 'internal']` (do not use `!dev` as that would hide from local dev too)
- Every story file **must export a `Default` story** (e.g. `export const Default: Story = { ... }`)
- add state stories (`Loading`, `Error`, `Empty`, `WithData`) when the component supports those states

## scripts & environments

| Script | Environment | Internal Stories |
| --- | --- | --- |
| `npm run storybook` | Local dev (`storybook dev -p 6006`) | **Included** (available in sidebar & tag filter) |
| `npm run build-storybook` | Static build (`storybook build` for CI & GitHub Pages) | Hidden from sidebar and docs via `excludeFromSidebar` and `excludeFromDocsStories` |
| `npm run build-storybook:internal` | Debug static build | Included in sidebar and docs |
| `npm run storybook:assert-public` | Public build validation | Verifies all required public components are present in `storybook-static/index.json` |

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
