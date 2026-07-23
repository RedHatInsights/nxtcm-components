import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from './test-helpers';
import { ROSAHCPWizardMount } from './ROSAHCPWizard.spec-helpers';

test.describe('ROSAHCPWizard', () => {
  test('should render wizard with string provider', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    // Wizard should render with PatternFly wizard structure
    await expect(component.locator('.pf-v6-c-wizard')).toBeVisible();
  });

  test('should render wizard steps', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    // Should have navigation (step list)
    const nav = component.locator('.pf-v6-c-wizard__nav');
    await expect(nav).toBeVisible();
  });

  test('should render first step content', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    // Details step should be visible by default
    // Look for cluster name field
    const clusterNameInput = component.getByRole('textbox', { name: /cluster name/i });
    await expect(clusterNameInput).toBeVisible();
  });

  test('should render wizard footer with navigation buttons', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    // Footer should have Next and Cancel buttons
    await expect(component.getByRole('button', { name: /next/i })).toBeVisible();
    await expect(component.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('should support custom strings', async ({ mount }) => {
    const component = await mount(
      <ROSAHCPWizardMount wizardProps={{ title: 'Custom Wizard Title' }} />
    );
    await expect(component.getByText('Custom Wizard Title')).toBeVisible();
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
    // Wizard should still render
    await expect(component.locator('.pf-v6-c-wizard')).toBeVisible();
  });

  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<ROSAHCPWizardMount />);
    await checkAccessibility({ component });
  });
});
