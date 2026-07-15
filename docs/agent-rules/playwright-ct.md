# playwright component tests

rules for writing and modifying Playwright CT specs in this repo.

## file naming and location

- `ComponentName.spec.tsx` — co-located next to the component
- `ComponentName.spec-helpers.tsx` — shared setup (providers, mock data, wrapper components)
- config: `playwright-ct.config.ts` at repo root

## selector rules (hard constraints)

| use | avoid |
|-----|-------|
| `getByRole('button', { name: /submit/i })` | `.locator('.pf-v6-c-button')` |
| `getByRole('heading', { name: /title/i })` | `.locator('.pf-v6-c-card__title')` |
| `getByText(/error message/i)` | `.locator('[class*="error"]')` |
| `getByTestId('cluster-count')` | `.locator('#cluster-count')` |
| `getByLabel('Cluster name')` | `.locator('input[name="cluster-name"]')` |

**never use CSS class selectors** — CSS modules mangle class names, PatternFly classes change between versions.

priority order: `getByRole` > `getByLabel` > `getByText` > `getByTestId` > `locator` (last resort only)

## spec-helpers pattern

complex components that need providers or mock data use a `*.spec-helpers.tsx` file:

```tsx
// MyComponent.spec-helpers.tsx
import { MyComponent, MyComponentProps } from './MyComponent';

export const defaultProps: MyComponentProps = {
  title: 'Test Title',
  data: { items: [] },
  isLoading: false,
};

export const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SomeProvider value={mockValue}>
    {children}
  </SomeProvider>
);
```

then in the spec:

```tsx
import { defaultProps, TestWrapper } from './MyComponent.spec-helpers';

test('renders with default props', async ({ mount }) => {
  const component = await mount(
    <TestWrapper>
      <MyComponent {...defaultProps} />
    </TestWrapper>
  );
  // assertions...
});
```

## test structure

follow arrange-act-assert:

```tsx
test('shows error when data fails to load', async ({ mount }) => {
  // arrange
  const props = { ...defaultProps, data: { ...defaultProps.data, error: new Error('fail') } };

  // act
  const component = await mount(<MyComponent {...props} />);

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
npx playwright test -c playwright-ct.config.ts path/to/Component.spec.tsx

# with coverage
npm run test:ct:coverage
```

## common pitfalls

- **CSS class selectors** — will break on PF upgrade. use role-based.
- **broad locators** like `locator('svg')` — add `data-testid` to the specific element instead.
- **inline mock data** — extract to spec-helpers for reuse and readability.
- **missing `await`** on assertions — playwright assertions are async, always await.
- **testing component from wrong package** — verify import path matches the package the component lives in.
