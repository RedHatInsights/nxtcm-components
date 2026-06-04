import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/experimental-ct-react';

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
