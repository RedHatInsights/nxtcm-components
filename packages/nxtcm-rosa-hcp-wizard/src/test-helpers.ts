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
  const axe = new AxeBuilder({ page: component.page() });

  const disabledRules = [...ignoreRules];

  if (!enforceAllRules) {
    disabledRules.push('landmark-one-main', 'page-has-heading-one', 'region');
  }
  axe.disableRules(disabledRules);

  const results = await axe.analyze();

  expect(results.violations).toHaveLength(0);
}
