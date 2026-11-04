import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator } from '@playwright/test';

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
 * import { checkAccessibility } from '@/playwright/test-helpers';
 * import type { MyComponentStory } from './MyComponent.story';
 *
 * test('has no accessibility violations', async ({ mount }) => {
 *   const component = await mount<typeof MyComponentStory>('workspace/path/MyComponent');
 *   await checkAccessibility({ component });
 * });
 * ```
 */
export async function checkAccessibility({
  component,
  ignoreRules = [],
  enforceAllRules,
}: {
  component: Locator;
  ignoreRules?: string[];
  enforceAllRules?: boolean;
}): Promise<void> {
  await expect(component).toBeVisible();

  // Scan the settled state, not partially faded text during PatternFly transitions.
  await component.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished)
    );
  });

  const { axeRootSelector, previousRoot } = await component.evaluate((node: HTMLElement) => {
    const previousRoot = node.getAttribute('data-axe-root');
    const root = crypto.randomUUID();
    node.setAttribute('data-axe-root', root);
    return { axeRootSelector: `[data-axe-root="${root}"]`, previousRoot };
  });

  const disabledRules = [...ignoreRules];

  if (!enforceAllRules) {
    disabledRules.push('landmark-one-main', 'page-has-heading-one', 'region');
  }

  try {
    const results = await new AxeBuilder({ page: component.page() })
      .include(axeRootSelector)
      .options({ iframes: false })
      .disableRules(disabledRules)
      .analyze();

    expect(results.violations).toHaveLength(0);
  } finally {
    await component.evaluate((node, previous) => {
      if (previous === null) {
        node.removeAttribute('data-axe-root');
      } else {
        node.setAttribute('data-axe-root', previous);
      }
    }, previousRoot);
  }
}
