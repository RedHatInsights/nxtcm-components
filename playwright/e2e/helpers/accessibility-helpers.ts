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
  ignoreRules: string[] = []
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .options({ iframes: false })
    .disableRules(ignoreRules)
    .analyze();
  const details = results.violations
    .map(
      ({ id, help, nodes }) =>
        `${id} (${help}): ${nodes.map(({ target }) => target.join(', ')).join(' | ')}`
    )
    .join('\n');

  expect(results.violations, `Accessibility violations in ${state}:\n${details}`).toHaveLength(0);
}
