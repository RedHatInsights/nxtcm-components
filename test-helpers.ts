import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/experimental-ct-react';

/**
 * Shared test utilities for Playwright Component Tests.
 *
 * These helpers are available to all component tests within the src/ directory.
 */

/**
 * Accessibility testing helper for Playwright component tests.
 * Uses axe-core to scan components for WCAG violations and automatically
 * fails the test if any accessibility issues are found.
 *
 * By default, this helper disables component-level rules that are not
 * applicable when testing isolated components (landmark-one-main, page-has-heading-one).
 *
 * @param options - Configuration options for accessibility testing
 * @param options.component - The Playwright component locator from mount()
 * @param options.ignoreRules - Array of axe rule IDs to disable for this test (default: [])
 * @param options.enforceAllRules - If true, enables all rules including landmark/heading rules (default: false)
 *
 * @throws {AssertionError} When accessibility violations are detected
 *
 * @example
 * ```typescript
 * import { checkAccessibility } from '../../test-helpers';
 *
 * test('has no accessibility violations', async ({ mount }) => {
 *   const component = await mount(<MyComponent />);
 *   await checkAccessibility({ component });
 * });
 * ```
 */
export async function checkAccessibility({
  component,
  ignoreRules = [],
  enforceAllRules,
}: {
  component: any;
  ignoreRules?: string[];
  enforceAllRules?: boolean;
}): Promise<void> {
  await expect(component).toBeVisible();

  const axeRootSelector = await component.evaluate((node: HTMLElement) => {
    const id = `a11y-root-${crypto.randomUUID()}`;
    node.id = id;
    return `#${CSS.escape(id)}`;
  });

  const disabledRules = [...ignoreRules];

  if (!enforceAllRules) {
    disabledRules.push('landmark-one-main', 'page-has-heading-one', 'region');
  }

  const results = await new AxeBuilder({ page: component.page() })
    .include(axeRootSelector)
    .disableRules(disabledRules)
    .options({ iframes: false })
    .analyze();

  expect(results.violations).toHaveLength(0);
}
