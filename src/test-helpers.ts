import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/experimental-ct-react';
import prettier from 'prettier';

/**
 * Shared test utilities for Playwright Component Tests.
 *
 * These helpers are available to all component tests within the src/ directory.
 */

/**
 * Debug helper for Playwright component tests.
 * Formats and logs the HTML of a mounted component for easier inspection.
 * Similar to React Testing Library's screen.debug().
 *
 * @param component - The Playwright component locator from mount()
 *
 * @example
 * ```typescript
 * import { debug } from '../../test-helpers';
 *
 * test('renders correctly', async ({ mount }) => {
 *   const component = await mount(<MyComponent />);
 *   await debug(component); // Logs pretty-printed HTML
 * });
 * ```
 */
export async function debug(component: any): Promise<void> {
  const html = await component.evaluate((node: HTMLElement) => node.outerHTML);
  const formatted = await prettier.format(html, { parser: 'html' });
  // eslint-disable-next-line no-console
  console.log(formatted);
}

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
  const axe = new AxeBuilder({ page: component.page() });

  const disabledRules = [...ignoreRules];

  if (!enforceAllRules) {
    disabledRules.push('landmark-one-main', 'page-has-heading-one', 'region');
  }
  axe.disableRules(disabledRules);

  // Since we are testing components, we can ignore the following rules:
  const results = await axe.analyze();

  expect(results.violations).toHaveLength(0);
}
