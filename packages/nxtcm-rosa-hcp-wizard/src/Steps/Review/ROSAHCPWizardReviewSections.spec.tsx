import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { ROSAHCPWizardReviewSectionsMount } from './ROSAHCPWizardReviewSections.spec-helpers';

test.describe('ROSAHCPWizardReviewSections', () => {
  test('should render hook output with sections', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardReviewSectionsMount />);
    const count = component.getByTestId('sections-count');
    await expect(count).toBeVisible();
    const countText = await count.textContent();
    expect(parseInt(countText || '0')).toBeGreaterThan(0);
  });

  test('should render section labels', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardReviewSectionsMount />);
    // Check that at least one section is rendered
    const sections = component.locator('[data-testid^="section-"]');
    await expect(sections.first()).toBeVisible();
  });

  test('should filter sections when steps are hidden', async ({ mount }) => {
    const component = await mount(
      <ROSAHCPWizardReviewSectionsMount hiddenSteps={['cluster-updates-step' as const]} />
    );
    const countText = await component.getByTestId('sections-count').textContent();
    const count = parseInt(countText || '0');

    // buildRosaHcpWizardReviewSections returns 7 sections; hiding one should yield 6
    expect(count).toBe(6);
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardReviewSectionsMount />);
    await checkAccessibility({ component });
  });
});
