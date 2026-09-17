import { expect, test } from '@/ct-fixture';
import { checkAccessibility } from '../../test-helpers';

test.describe('ROSAHCPWizardReviewSections', () => {
  test('should render hook output with sections', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ROSAHCPWizardReviewSections/ROSAHCPWizardReviewSectionsMount'
    );
    const count = component.getByTestId('sections-count');
    await expect(count).toBeVisible();
    const countText = await count.textContent();
    expect(parseInt(countText || '0')).toBeGreaterThan(0);
  });

  test('should render section labels', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ROSAHCPWizardReviewSections/ROSAHCPWizardReviewSectionsMount'
    );
    // Check that at least one section is rendered
    const sections = component.locator('[data-testid^="section-"]');
    await expect(sections.first()).toBeVisible();
  });

  test('should filter sections when steps are hidden', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ROSAHCPWizardReviewSections/ROSAHCPWizardReviewSectionsMount',
      { hiddenSteps: ['cluster-updates-step' as const] }
    );
    const countText = await component.getByTestId('sections-count').textContent();
    const count = parseInt(countText || '0');

    // buildRosaHcpWizardReviewSections returns 7 sections; hiding one should yield 6
    await expect.poll(() => count).toBe(6);
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(
      'nxtcm-rosa-hcp-wizard/Steps/Review/ROSAHCPWizardReviewSections/ROSAHCPWizardReviewSectionsMount'
    );
    await checkAccessibility({ component });
  });
});
