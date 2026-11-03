import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/**
 * Run axe against the complete browser document, including portalled content.
 *
 * Component tests intentionally scope axe to the mounted component. E2E tests
 * need a page-level scan so landmarks, overlays, dialogs, and other content
 * rendered outside the component root are included.
 */
export async function checkPageAccessibility(
  page: Page,
  state: string,
  ignoreRules: string[] = [],
  scope?: { include?: string; exclude?: string }
): Promise<void> {
  let axe = new AxeBuilder({ page }).options({ iframes: false }).disableRules(ignoreRules);
  if (scope?.include) axe = axe.include(scope.include);
  if (scope?.exclude) axe = axe.exclude(scope.exclude);
  const results = await axe.analyze();
  const details = results.violations
    .map(
      ({ id, help, nodes }) =>
        `${id} (${help}): ${nodes.map(({ target }) => target.join(', ')).join(' | ')}`
    )
    .join('\n');

  expect(results.violations, `Accessibility violations in ${state}:\n${details}`).toHaveLength(0);
}
