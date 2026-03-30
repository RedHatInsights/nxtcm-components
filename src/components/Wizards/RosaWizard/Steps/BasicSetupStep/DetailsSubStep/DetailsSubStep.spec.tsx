import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { DetailsSubStepStory } from './DetailsSubStep.story';
import { mockSingleBillingAccount, mockRegions } from './DetailsSubStep.story';
import type { Resource, SelectDropdownType, OpenShiftVersions } from '../../../../types';

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

test.describe('DetailsSubStep', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);
    await checkAccessibility({ component });
  });

  test('should render OpenShift version select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
  });

  test('should disable OpenShift version select when versions are pending', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        openShiftVersions={{ data: [], error: null, isFetching: true, fetch: async () => {} }}
      />
    );

    const versionToggle = component.locator('#cluster-cluster_version .pf-v6-c-menu-toggle');
    await expect(versionToggle).toHaveClass(/pf-m-disabled/);
  });

  test('should render with empty options', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        openShiftVersions={mockResource<OpenShiftVersions[]>([])}
        regions={{ data: [], error: null, isFetching: false, fetch: async () => {} }}
        awsInfrastructureAccounts={mockResource<SelectDropdownType[]>([])}
        awsBillingAccounts={mockResource<SelectDropdownType[]>([])}
      />
    );

    await expect(component.getByText('Details', { exact: true })).toBeVisible();
    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
  });

  test('should render the Cluster name input', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: 'Cluster name' })).toBeVisible();
  });

  test('should render AWS infrastructure account select', async ({ mount }) => {
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

    await expect(page.getByText('OpenShift 4.16.2', { exact: true })).toBeVisible();
    await expect(page.getByText('OpenShift 4.16.0', { exact: true })).toBeVisible();
  });

  test.describe('DetailsSubStep - cluster name validation', () => {
    test('should display validation error for cluster name with uppercase characters', async ({
      mount,
    }) => {
      const component = await mount(<DetailsSubStepStory />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('MyCluster');
      await nameInput.blur();

      await expect(component.getByText(/can only contain lowercase/)).toBeVisible();
    });

    test('should display validation error for cluster name starting with a number', async ({
      mount,
    }) => {
      const component = await mount(<DetailsSubStepStory />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('1cluster');
      await nameInput.blur();

      await expect(component.getByText(/must not start with a number/)).toBeVisible();
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

    test('should not display async error when sync validation fails', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepStory
          clusterNameValidation={{
            error: 'Cluster name already exists.',
            isFetching: false,
          }}
          clusterOverrides={{ name: 'INVALID' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.click();
      await nameInput.blur();

      await expect(component.getByText(/can only contain lowercase/)).toBeVisible();
      await expect(component.getByText('Cluster name already exists.')).not.toBeVisible();
    });

    test('should not auto-select billing account when multiple are available', async ({
      mount,
    }) => {
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
      await page.getByText('OpenShift 4.16.2', { exact: true }).click();

      await expect(versionCombobox).toHaveValue('OpenShift 4.16.2');
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

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-name');

      await expect(component.getByText('Name is taken.')).not.toBeVisible();
    });
  });

  test.describe('DetailsSubStep - async cluster name uniqueness check', () => {
    test('should call checkClusterNameUniqueness when a valid name is typed', async ({ mount }) => {
      const calls: Array<{ name: string; region: string }> = [];

      const component = await mount(
        <DetailsSubStepStory
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
          }}
          clusterOverrides={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-cluster');

      // wait for debounce (500ms) + buffer
      await component.page().waitForTimeout(700);

      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[calls.length - 1].name).toBe('valid-cluster');
    });

    test('should NOT call checkClusterNameUniqueness for an invalid name', async ({ mount }) => {
      const calls: Array<{ name: string; region: string }> = [];

      const component = await mount(
        <DetailsSubStepStory
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
          }}
          clusterOverrides={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('INVALID_NAME');

      await component.page().waitForTimeout(700);

      expect(calls.length).toBe(0);
    });

    test('should debounce rapid typing so only the final value triggers the check', async ({
      mount,
    }) => {
      const calls: Array<{ name: string; region: string }> = [];

      const component = await mount(
        <DetailsSubStepStory
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
          }}
          clusterOverrides={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });

      await nameInput.pressSequentially('abc', { delay: 50 });

      await component.page().waitForTimeout(700);

      const validCalls = calls.filter((c) => c.name.length > 0);
      expect(validCalls.length).toBe(1);
      expect(validCalls[0].name).toBe('abc');
    });

    test('should call checkClusterNameUniqueness when region is selected and name exists', async ({
      mount,
      page,
    }) => {
      const calls: Array<{ name: string; region: string }> = [];

      const component = await mount(
        <DetailsSubStepStory
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
          }}
          clusterOverrides={{ name: 'my-cluster' }}
        />
      );

      const regionCombobox = component.getByRole('combobox', { name: /Select a region/ });
      await regionCombobox.click();
      await page.getByText('US East (N. Virginia)', { exact: true }).click();

      await component.page().waitForTimeout(700);

      const regionCalls = calls.filter((c) => c.region === 'us-east-1');
      expect(regionCalls.length).toBeGreaterThanOrEqual(1);
      expect(regionCalls[0].name).toBe('my-cluster');
    });

    test('should NOT call checkClusterNameUniqueness when region is selected but no name exists', async ({
      mount,
      page,
    }) => {
      const calls: Array<{ name: string; region: string }> = [];

      const component = await mount(
        <DetailsSubStepStory
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
          }}
        />
      );

      const regionCombobox = component.getByRole('combobox', { name: /Select a region/ });
      await regionCombobox.click();
      await page.getByText('US East (N. Virginia)', { exact: true }).click();

      await component.page().waitForTimeout(700);

      expect(calls.length).toBe(0);
    });

    test('should NOT call checkClusterNameUniqueness when callback is not provided', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsSubStepStory clusterOverrides={{ region: 'us-east-1' }} />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-cluster');

      await component.page().waitForTimeout(700);

      await expect(component.getByText('Details', { exact: true })).toBeVisible();
    });
  });
});
