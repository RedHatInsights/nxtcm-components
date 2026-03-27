import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { DetailsSubStepStory } from './DetailsSubStep.story';
import { mockRegions, mockSingleBillingAccount } from './DetailsSubStep.story';

test.describe('DetailsSubStep', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);
    await checkAccessibility({ component });
  });

  test('should render the Details section title', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Details', { exact: true })).toBeVisible();
  });

  test('should render the Cluster name input', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: 'Cluster name' })).toBeVisible();
  });

  test('should render the OpenShift version select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
  });

  test('should render the Associated AWS infrastructure account select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(
      component.getByText('Associated AWS infrastructure account', { exact: true })
    ).toBeVisible();
  });

  test('should render the Associated AWS billing account select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(
      component.getByText('Associated AWS billing account', { exact: true })
    ).toBeVisible();
  });

  test('should render the Region select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Region', { exact: true })).toBeVisible();
  });

  test('should render the Associate a new AWS account button', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Associate a new AWS account')).toBeVisible();
  });

  test('should show OpenShift version options in dropdown', async ({ mount, page }) => {
    const component = await mount(<DetailsSubStepStory />);

    const versionCombobox = component.locator('#cluster-cluster_version [role="combobox"]');
    await versionCombobox.click();

    await expect(page.getByText('OpenShift 4.12.0', { exact: true })).toBeVisible();
    await expect(page.getByText('OpenShift 4.11.5', { exact: true })).toBeVisible();
  });

  test('should show AWS infrastructure account options in dropdown', async ({ mount, page }) => {
    const component = await mount(<DetailsSubStepStory />);

    const awsCombobox = component.locator('#cluster-associated_aws_id [role="combobox"]');
    await awsCombobox.click();

    await expect(
      page.getByText('AWS Account - Production (123456789012)', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('AWS Account - Staging (234567890123)', { exact: true })
    ).toBeVisible();
  });

  test('should show region options in dropdown', async ({ mount, page }) => {
    const component = await mount(<DetailsSubStepStory />);

    const regionCombobox = component.locator('#cluster-region [role="combobox"]');
    await regionCombobox.click();

    for (const region of mockRegions) {
      await expect(page.getByText(region.label, { exact: true })).toBeVisible();
    }
  });

  test('should show disabled state for AWS infrastructure account when loading', async ({
    mount,
  }) => {
    const component = await mount(
      <DetailsSubStepStory
        awsInfrastructureAccounts={{ data: [], isFetching: true, error: null }}
      />
    );

    const awsSelect = component.locator('#cluster-associated_aws_id');
    await expect(awsSelect).toBeVisible();
    await expect(awsSelect.locator('.pf-m-disabled')).toBeVisible();
  });

  test('should show disabled state for AWS billing account when loading', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory awsBillingAccounts={{ data: [], isFetching: true, error: null }} />
    );

    const billingSelect = component.locator('#cluster-billing_account_id');
    await expect(billingSelect).toBeVisible();
    await expect(billingSelect.locator('.pf-m-disabled')).toBeVisible();
  });

  test('should show disabled state for Region select when loading', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        regions={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
      />
    );

    const regionSelect = component.locator('#cluster-region');
    await expect(regionSelect).toBeVisible();
    await expect(regionSelect.locator('.pf-m-disabled')).toBeVisible();
  });

  test('should auto-select billing account when only one is available', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        awsBillingAccounts={{ data: mockSingleBillingAccount, isFetching: false, error: null }}
      />
    );

    const billingCombobox = component.locator('#cluster-billing_account_id [role="combobox"]');
    await expect(billingCombobox).toHaveValue(mockSingleBillingAccount[0].label);
  });

  test('should not auto-select billing account when multiple are available', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    const billingCombobox = component.locator('#cluster-billing_account_id [role="combobox"]');
    await expect(billingCombobox).toHaveValue('');
  });

  test('should render with empty OpenShift versions', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory openShiftVersions={{ data: [], isFetching: false, error: null }} />
    );

    await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
  });

  test('should render with empty regions', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        regions={{ data: [], isFetching: false, error: null, fetch: async () => {} }}
      />
    );

    await expect(component.getByText('Region', { exact: true })).toBeVisible();
  });

  test('should render the Connect ROSA to a new AWS billing account link', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Connect ROSA to a new AWS billing account')).toBeVisible();
  });

  test('should allow typing a cluster name', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    const nameInput = component.getByRole('textbox', { name: 'Cluster name' });
    await nameInput.fill('my-test-cluster');

    await expect(nameInput).toHaveValue('my-test-cluster');
  });

  test('should select an OpenShift version', async ({ mount, page }) => {
    const component = await mount(<DetailsSubStepStory />);

    const versionCombobox = component.locator('#cluster-cluster_version [role="combobox"]');
    await versionCombobox.click();
    await page.getByText('OpenShift 4.12.0', { exact: true }).click();

    await expect(versionCombobox).toHaveValue('OpenShift 4.12.0');
  });

  test('should select a region', async ({ mount, page }) => {
    const component = await mount(<DetailsSubStepStory />);

    const regionCombobox = component.locator('#cluster-region [role="combobox"]');
    await regionCombobox.click();
    await page.getByText('US East (N. Virginia)', { exact: true }).click();

    await expect(regionCombobox).toHaveValue('US East (N. Virginia)');
  });

  test('should render pre-filled cluster data', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        clusterOverrides={{
          name: 'existing-cluster',
          billing_account_id: 'billing-main-123456789012',
        }}
      />
    );

    const nameInput = component.getByRole('textbox', { name: 'Cluster name' });
    await expect(nameInput).toHaveValue('existing-cluster');
  });
});
