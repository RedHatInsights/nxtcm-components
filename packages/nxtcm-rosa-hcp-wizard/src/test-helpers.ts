import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator } from '@playwright/test';

/**
 * Accessibility testing helper for Playwright component tests.
 * Uses axe-core to scan components for WCAG violations and automatically
 * fails the test if any accessibility issues are found.
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

  await component.evaluate(async (node) => {
    await new Promise(requestAnimationFrame);
    // Wait for transitions, but allow continuous loading spinners to keep running.
    await Promise.allSettled(
      node
        .getAnimations({ subtree: true })
        .filter((animation) => Number.isFinite(animation.effect?.getComputedTiming().endTime))
        .map((animation) => animation.finished)
    );
  });

  const axeRootSelector = await component.evaluate((node: HTMLElement) => {
    // Preserve IDs used by dialog triggers and other ARIA relationships.
    node.id ||= `a11y-root-${crypto.randomUUID()}`;
    return `#${CSS.escape(node.id)}`;
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
