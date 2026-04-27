---
name: nxtcm-storybook
description: >-
  Writes and updates Storybook CSF3 stories (*.stories.tsx) for NXTCM
  components, co-located next to the component, with autodocs and
  PatternFly-appropriate layout. Use when creating or changing Storybook stories,
  .stories.tsx files, or visual/demos in Storybook. Does not require the agent to start servers
  unless the user asked to run Storybook.
---

# NXTCM Storybook (CSF3)

Follow `.cursor/rules/storybook.mdc` and `.cursor/rules/core-standards.mdc` for the library (PatternFly, typed props, no direct HTTP in components; inject callbacks/mocks in stories).

## Conventions

- **File name**: `ComponentName.stories.tsx` next to `ComponentName.tsx` (PascalCase).
- **Format**: CSF3 — `import type { Meta, StoryObj } from '@storybook/react'`.
- **Title**: `Components/<Category>/<ComponentName>` (see existing groupings, e.g. `Components/ConsoleBreadcrumbs` or `Components/.../Dashboard` patterns).
- **Autodocs**: add `tags: ['autodocs']` to `meta` when the component should get generated docs.
- **Decorators**: use when the component needs padding, width, or layout context; keep them minimal and consistent with siblings in the same folder.
- **argTypes**: use `argTypes` to document props; set `table: { disable: true }` for render-props, internal helpers, or props that are awkward in Controls (e.g. `getLabel`, `LinkComponent`).

## Mocks in stories

- For routing, use a small inline mock link component with `onClick` preventing default, or the pattern the component folder already uses.
- For `Resource`/`fetch` shapes, follow patterns in complex stories (e.g. `mockResource`, `mockFetchResource` style in [`src/components/Wizards/RosaWizard/RosaWizard.stories.tsx`](../../../src/components/Wizards/RosaWizard/RosaWizard.stories.tsx)) when the real console would inject data.
- **Do not** add HTTP from story files; use static data or stubbed async that resolves locally.

## Reference files

| Style | File |
|-------|------|
| Simpler story (meta, args, argTypes, decorator) | [`src/components/ConsoleBreadcrumbs/ConsoleBreadcrumbs.stories.tsx`](../../../src/components/ConsoleBreadcrumbs/ConsoleBreadcrumbs.stories.tsx) |
| Heavier mocks, multiple stories, async loading | [`src/components/Wizards/RosaWizard/RosaWizard.stories.tsx`](../../../src/components/Wizards/RosaWizard/RosaWizard.stories.tsx) |

## Commands (for the user unless they asked to run them)

- `npm run storybook` — dev on port 6006.
- `npm run build-storybook` — static build for CI or review.

**Do not** run these in the terminal by default; mention them in your reply if helpful.

## Checklist before finishing

- [ ] `default` export of `meta`; named exports for each story.
- [ ] Types for `Meta<typeof ...>` and `StoryObj<...Props>` (or the props type exported from the component) where applicable.
- [ ] `tags: ['autodocs']` if the team expects docs for this component.
- [ ] Story file imports align with the repo’s import order (React, third-party, internal, then relative).
