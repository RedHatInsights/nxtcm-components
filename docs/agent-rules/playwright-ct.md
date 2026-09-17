# playwright component tests

rules for writing and modifying Playwright CT specs in this repo.

## file naming and location

- `ComponentName.spec.tsx` — co-located next to the component
- `ComponentName.story.tsx` — gallery stories (providers, mock data, wrapper components)
- config: `playwright-ct.config.ts` at repo root

## selector rules (hard constraints)

| use                                        | avoid                                    |
| ------------------------------------------ | ---------------------------------------- |
| `getByRole('button', { name: /submit/i })` | `.locator('.pf-v6-c-button')`            |
| `getByRole('heading', { name: /title/i })` | `.locator('.pf-v6-c-card__title')`       |
| `getByText(/error message/i)`              | `.locator('[class*="error"]')`           |
| `getByTestId('cluster-count')`             | `.locator('#cluster-count')`             |
| `getByLabel('Cluster name')`               | `.locator('input[name="cluster-name"]')` |

**never use CSS class selectors** — CSS modules mangle class names, PatternFly classes change between versions.

priority order: `getByRole` > `getByLabel` > `getByText` > `getByTestId` > `locator` (last resort only)

## gallery story pattern

Component tests mount named function exports from a `*.story.tsx` gallery module. Keep providers,
callbacks, JSX children, and complex resources in the story; pass only serializable props from specs.

```tsx
// MyComponent.story.tsx
import type { ReactElement } from 'react';
import { MyComponent, MyComponentProps } from './MyComponent';

export const defaultProps: MyComponentProps = {
  title: 'Test Title',
  data: { items: [] },
  isLoading: false,
};

export const MyComponentStory = ({ title = defaultProps.title }): ReactElement => (
  <SomeProvider value={mockValue}>
    <MyComponent {...defaultProps} title={title} />
  </SomeProvider>
);
```

then in the spec:

```tsx
test('renders with default props', async ({ mount }) => {
  const component = await mount('nxtcm-dashboard/MyComponent/MyComponentStory');
  // assertions...
});
```

## test structure

follow arrange-act-assert:

```tsx
test('shows error when data fails to load', async ({ mount }) => {
  // arrange
  // act
  const component = await mount('nxtcm-dashboard/MyComponent/MyComponentStory', {
    state: 'error',
  });

  // assert
  await expect(component.getByRole('alert')).toBeVisible();
  await expect(component.getByText(/fail/i)).toBeVisible();
});
```

## what to test

- happy path rendering
- loading state
- error state
- empty/zero state
- user interactions (click, type, select)
- conditional rendering (props that show/hide sections)
- callback invocations (verify `onSomething` was called)

## what NOT to test

- internal implementation details (state values, hook internals)
- PatternFly internals (class presence, DOM structure)
- snapshot tests (not used in this repo)

## running tests

```bash
# all CT tests
npm run test:ct

# single file
npm run test:ct -- path/to/Component.spec.tsx

# with coverage
npm run test:ct:coverage
```

## fixing flaky a11y tests caused by CSS transitions

PatternFly v6 components (e.g. `ExpandableSection`) use CSS transitions on `opacity`, `translate`, `visibility`, and `max-height`. When axe-core scans the DOM mid-transition, partially faded text can fail WCAG contrast-ratio checks, producing **flaky false positives**.

`page.emulateMedia({ reducedMotion: 'reduce' })` does **not** help — PF v6 only gates the slide transition on `prefers-reduced-motion`, not the opacity fade.

**fix:** after triggering the transition (e.g. clicking an expand toggle), wait for all CSS animations to finish using the browser-native `getAnimations()` API:

```tsx
// click the toggle that starts the transition
await component.getByRole('button', { name: /advanced/i }).click();

// wait for all CSS transitions/animations on the component subtree to settle
await component.evaluate(async (el) => {
  await new Promise(requestAnimationFrame); // yield so transitions start
  await Promise.allSettled(el.getAnimations({ subtree: true }).map((a) => a.finished));
});

// now safe to run axe-core
await checkAccessibility({ component });
```

## common pitfalls

- **CSS class selectors** — will break on PF upgrade. use role-based.
- **broad locators** like `locator('svg')` — add `data-testid` to the specific element instead.
- **inline JSX mounts** — add a named `*.story.tsx` export and mount its exact story ID.
- **missing `await`** on assertions — playwright assertions are async, always await.
- **testing component from wrong package** — verify import path matches the package the component lives in.
- **a11y scan during CSS transition** — axe-core flags intermediate opacity as contrast failure. use `getAnimations()` pattern above.
