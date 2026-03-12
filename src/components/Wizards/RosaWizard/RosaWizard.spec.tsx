import { test, expect } from '@playwright/experimental-ct-react';
import { RosaWizardMount } from './RosaWizard.ct';

test.describe('RosaWizard validation', () => {
  test('required field empty: user cannot advance to next step and Next button is disabled', async ({
    mount,
  }) => {
    const component = await mount(<RosaWizardMount />);

    // Ensure we're on the Details step (Basic setup first substep) — Cluster name is visible
    const clusterNameInput = component.getByPlaceholder('Enter the cluster name');
    await expect(clusterNameInput).toBeVisible();

    const nextButton = component.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();

    // Try to go next without filling required Cluster name
    await nextButton.click();

    // User should still see Details content (Cluster name still visible) — did not advance
    await expect(clusterNameInput).toBeVisible();

    // Next button should be disabled when there are validation errors and we've tried to advance
    await expect(nextButton).toBeDisabled();
  });

  test('invalid data: field-level validation is shown and Next button is disabled', async ({
    mount,
  }) => {
    const component = await mount(<RosaWizardMount />);

    const clusterNameInput = component.getByPlaceholder('Enter the cluster name');
    await expect(clusterNameInput).toBeVisible();

    // Enter invalid cluster name (uppercase not allowed)
    await clusterNameInput.fill('Uppercase');
    await clusterNameInput.blur();

    // Field-level validation message should be visible (validateOnBlur triggers it)
    await expect(
      component.getByText(/This value can only contain lowercase alphanumeric/, { exact: false })
    ).toBeVisible();

    // Next button should be disabled when step has validation errors
    const nextButton = component.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeDisabled();
  });
});
