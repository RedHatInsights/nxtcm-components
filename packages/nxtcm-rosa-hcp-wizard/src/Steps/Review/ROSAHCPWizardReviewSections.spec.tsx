import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../test-helpers';
import { ROSAHCPWizardReviewSectionsMount } from './ROSAHCPWizardReviewSections.spec-helpers';

test.describe('ROSAHCPWizardReviewSections', () => {
  test('should display the seven expected review section labels', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardReviewSectionsMount />);
    await expect(component.getByTestId('sections-count')).toHaveText('7');
    await expect(component.getByTestId(/^section-/)).toHaveText([
      'Details',
      'Roles and policies',
      'Machine pool',
      'Networking',
      'Cluster-wide proxy',
      'Encryption (optional)',
      'Cluster updates (optional)',
    ]);
  });

  test('should filter sections when steps are hidden', async ({ mount }) => {
    const component = await mount(
      <ROSAHCPWizardReviewSectionsMount hiddenSteps={['cluster-updates-step' as const]} />
    );
    await expect(component.getByTestId('sections-count')).toHaveText('6');
    await expect(component.getByText('Cluster updates (optional)', { exact: true })).toHaveCount(0);
    await expect(component.getByText('Encryption (optional)', { exact: true })).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardReviewSectionsMount />);
    await checkAccessibility({ component });
  });
});
