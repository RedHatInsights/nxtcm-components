import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from './test-helpers';
import { ROSAHCPWizardMount } from './ROSAHCPWizard.spec-helpers';

test.describe('ROSAHCPWizard', () => {
  test('should open Details with step navigation and footer actions', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    const nav = component.getByRole('navigation');
    await expect(nav).toBeVisible();
    await expect(nav.getByText('Details', { exact: true })).toBeVisible();
    await expect(
      nav.getByRole('button', {
        name: 'Cluster updates (optional)',
        exact: true,
        includeHidden: true,
      })
    ).toHaveCount(1);
    await expect(component.getByRole('textbox', { name: /cluster name/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /^next$/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /^cancel$/i })).toBeVisible();
  });

  test('should support custom strings', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount strings={{ wizard: { next: 'Proceed' } }} />);
    await expect(component.getByRole('button', { name: /proceed/i })).toBeVisible();
  });

  test('should support hidden steps via config', async ({ mount }) => {
    const component = await mount(
      <ROSAHCPWizardMount
        wizardProps={{
          config: {
            hiddenSteps: ['cluster-updates-step' as const],
          },
        }}
      />
    );
    const nav = component.getByRole('navigation');
    await expect(
      nav.getByRole('button', {
        name: 'Cluster updates (optional)',
        exact: true,
        includeHidden: true,
      })
    ).toHaveCount(0);
    await expect(
      nav.getByRole('button', { name: 'Encryption (optional)', exact: true, includeHidden: true })
    ).toHaveCount(1);
    await expect(nav.getByText('Review', { exact: true })).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    await checkAccessibility({ component });
  });
});
