import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import type { OpenShiftVersionsData, Resource, Role, SelectDropdownType } from '../../../../types';
import { defaultRosaWizardStrings } from '../../../rosaWizardStrings.defaults';
import { DetailsSubStepMount } from './DetailsSubStep.spec-helpers';
import { mockRegions, mockSingleBillingAccount } from './DetailsSubStep.fixtures';

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

/** latest, default, and previous releases differ so grouping yields three labeled sections. */
const mockVersionsLatestDefaultPrevious: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.14.0', value: '4.14.0' },
  default: { label: 'OpenShift 4.13.1', value: '4.13.1' },
  releases: [
    { label: 'OpenShift 4.12.0', value: '4.12.0' },
    { label: 'OpenShift 4.11.5', value: '4.11.5' },
  ],
};

const mockVersionsDefaultEqualsLatest: OpenShiftVersionsData = {
  latest: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  default: { label: 'OpenShift 4.12.0', value: '4.12.0' },
  releases: [{ label: 'OpenShift 4.11.5', value: '4.11.5' }],
};

const INSTALLER_ARN = 'arn:aws:iam::123456789012:role/rosa-installer';

const rolesWithInstallerVersion412: Resource<Role[], [awsAccount: string]> & {
  fetch: (awsAccount: string) => Promise<void>;
} = {
  data: [
    {
      installerRole: {
        label: 'Installer role A',
        value: INSTALLER_ARN,
        roleVersion: '4.12.0',
      },
      supportRole: [{ label: 'Support Role', value: 'arn:aws:iam::123456789012:role/support' }],
      workerRole: [{ label: 'Worker Role', value: 'arn:aws:iam::123456789012:role/worker' }],
    },
  ],
  isFetching: false,
  error: null,
  fetch: async () => {},
};

const versionDisabledDescription =
  defaultRosaWizardStrings.details.openShiftVersionOptionDisabledDescription;

test.describe('DetailsSubStep', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);
    await checkAccessibility({ component });
  });

  test('should render the Details section title', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);
    await expect(component.getByText('Details', { exact: true })).toBeVisible();
  });

  test('should render OpenShift version select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);
    await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
  });

  test('should render with empty options', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepMount
        versions={{
          data: { releases: [] },
          error: null,
          isFetching: false,
          fetch: async () => {},
        }}
        regions={{ data: [], error: null, isFetching: false, fetch: async () => {} }}
        awsInfrastructureAccounts={mockResource<SelectDropdownType[]>([])}
        awsBillingAccounts={mockResource<SelectDropdownType[]>([])}
      />
    );

    await expect(component.getByText('Details', { exact: true })).toBeVisible();
    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
  });

  test('should render the Cluster name input', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);

    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: 'Cluster name' })).toBeVisible();
  });

  test('should render the Associated AWS infrastructure account select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);

    await expect(
      component.getByText('Associated AWS infrastructure account', { exact: true })
    ).toBeVisible();
  });

  test('should render the Associated AWS billing account select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);

    await expect(
      component.getByText('Associated AWS billing account', { exact: true })
    ).toBeVisible();
  });

  test('should render the Region select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);

    await expect(component.getByText('Region', { exact: true })).toBeVisible();
  });

  test('should render the Associate a new AWS account button', async ({ mount }) => {
    const component = await mount(<DetailsSubStepMount />);

    await expect(component.getByText('Associate a new AWS account')).toBeVisible();
  });

  test('should show OpenShift version options in dropdown', async ({ mount, page }) => {
    const component = await mount(<DetailsSubStepMount />);

    const versionCombobox = component.locator('#cluster-cluster_version [role="combobox"]');
    await versionCombobox.click();

    await expect(page.getByText('OpenShift 4.16.2', { exact: true })).toBeVisible();
    await expect(page.getByText('OpenShift 4.16.0', { exact: true })).toBeVisible();
  });

  test.describe('DetailsSubStep - cluster name validation', () => {
    test('should display validation error for cluster name with uppercase characters', async ({
      mount,
    }) => {
      const component = await mount(<DetailsSubStepMount />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('MyCluster');
      await nameInput.blur();

      await expect(component.getByText(/can only contain lowercase/)).toBeVisible();
    });

    test('should display validation error for cluster name starting with a number', async ({
      mount,
    }) => {
      const component = await mount(<DetailsSubStepMount />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('1cluster');
      await nameInput.blur();

      await expect(component.getByText(/must not start with a number/)).toBeVisible();
    });

    test('should cancel pending async check when name becomes sync-invalid', async ({ mount }) => {
      const calls: Array<{ name: string; region: string }> = [];
      const component = await mount(
        <DetailsSubStepMount
          checkClusterNameUniqueness={(name, region) => {
            if (region) calls.push({ name, region });
          }}
          clusterOverrides={{ region: 'us-east-1' }}
        />
      );
      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('taken');
      await nameInput.fill('TAKEN');
      await component.page().waitForTimeout(700);
      expect(calls.length).toBe(0);
    });

    test('should show AWS infrastructure account options in dropdown', async ({ mount, page }) => {
      const component = await mount(<DetailsSubStepMount />);

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
      const component = await mount(<DetailsSubStepMount />);

      const regionCombobox = component.locator('#cluster-region [role="combobox"]');
      await regionCombobox.click();

      for (const region of mockRegions) {
        await expect(page.getByText(region.label, { exact: true })).toBeVisible();
      }
    });

    test('should show pending state for AWS infrastructure account when loading', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsSubStepMount
          awsInfrastructureAccounts={{ data: [], isFetching: true, error: null }}
        />
      );

      const awsCombobox = component.locator('#cluster-associated_aws_id [role="combobox"]');
      await expect(awsCombobox).toBeVisible();
      await expect(awsCombobox).toHaveValue('Loading...');
    });

    test('should show pending state for AWS billing account when loading', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount awsBillingAccounts={{ data: [], isFetching: true, error: null }} />
      );

      const billingCombobox = component.locator('#cluster-billing_account_id [role="combobox"]');
      await expect(billingCombobox).toBeVisible();
      await expect(billingCombobox).toHaveValue('Loading...');
    });

    test('should show pending state for Region select when loading', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount
          regions={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      const regionCombobox = component.locator('#cluster-region [role="combobox"]');
      await expect(regionCombobox).toBeVisible();
      await expect(regionCombobox).toHaveValue('Loading...');
    });

    test('should show spinner in AWS infrastructure account dropdown when loading', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <DetailsSubStepMount
          awsInfrastructureAccounts={{ data: [], isFetching: true, error: null }}
        />
      );

      const awsCombobox = component.locator('#cluster-associated_aws_id [role="combobox"]');
      await awsCombobox.click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should show spinner in AWS billing account dropdown when loading', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <DetailsSubStepMount awsBillingAccounts={{ data: [], isFetching: true, error: null }} />
      );

      const billingCombobox = component.locator('#cluster-billing_account_id [role="combobox"]');
      await billingCombobox.click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should show spinner in Region dropdown when loading', async ({ mount, page }) => {
      const component = await mount(
        <DetailsSubStepMount
          regions={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      const regionCombobox = component.locator('#cluster-region [role="combobox"]');
      await regionCombobox.click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should disable refresh button for AWS infrastructure account when loading', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsSubStepMount
          awsInfrastructureAccounts={{
            data: [],
            isFetching: true,
            error: null,
            fetch: async () => {},
          }}
        />
      );

      const refreshButton = component
        .locator('#cluster-associated_aws_id')
        .getByLabel('Refresh', { exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });

    test('should disable refresh button for AWS billing account when loading', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsSubStepMount
          awsBillingAccounts={{
            data: [],
            isFetching: true,
            error: null,
            fetch: async () => {},
          }}
        />
      );

      const refreshButton = component
        .locator('#cluster-billing_account_id')
        .getByLabel('Refresh', { exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });

    test('should auto-select billing account when only one is available', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount
          awsBillingAccounts={{ data: mockSingleBillingAccount, isFetching: false, error: null }}
        />
      );

      const billingCombobox = component.locator('#cluster-billing_account_id [role="combobox"]');
      await expect(billingCombobox).toHaveValue(mockSingleBillingAccount[0].label);
    });

    test('should not display async error when sync validation fails', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount
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
      const component = await mount(<DetailsSubStepMount />);

      const billingCombobox = component.locator('#cluster-billing_account_id [role="combobox"]');
      await expect(billingCombobox).toHaveValue('');
    });

    test('should render with empty OpenShift versions', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount
          versions={{
            data: { releases: [] },
            isFetching: false,
            error: null,
            fetch: async () => {},
          }}
        />
      );

      await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
    });

    test('should render with empty regions', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount
          regions={{ data: [], isFetching: false, error: null, fetch: async () => {} }}
        />
      );

      await expect(component.getByText('Region', { exact: true })).toBeVisible();
    });

    test('should render the Connect ROSA to a new AWS billing account link', async ({ mount }) => {
      const component = await mount(<DetailsSubStepMount />);

      await expect(component.getByText('Connect ROSA to a new AWS billing account')).toBeVisible();
    });

    test('should allow typing a cluster name', async ({ mount }) => {
      const component = await mount(<DetailsSubStepMount />);

      const nameInput = component.getByRole('textbox', { name: 'Cluster name' });
      await nameInput.fill('my-test-cluster');

      await expect(nameInput).toHaveValue('my-test-cluster');
    });

    test('should select an OpenShift version', async ({ mount, page }) => {
      const component = await mount(<DetailsSubStepMount />);

      const versionCombobox = component.locator('#cluster-cluster_version [role="combobox"]');
      await versionCombobox.click();
      await page.getByText('OpenShift 4.16.2', { exact: true }).click();

      await expect(versionCombobox).toHaveValue('OpenShift 4.16.2');
    });

    test('should select a region', async ({ mount, page }) => {
      const component = await mount(<DetailsSubStepMount />);

      const regionCombobox = component.locator('#cluster-region [role="combobox"]');
      await regionCombobox.click();
      await page.getByText('US East (N. Virginia)', { exact: true }).click();

      await expect(regionCombobox).toHaveValue('US East (N. Virginia)');
    });

    test('should render pre-filled cluster data', async ({ mount }) => {
      const component = await mount(
        <DetailsSubStepMount
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
        <DetailsSubStepMount
          checkClusterNameUniqueness={(name, region) => {
            if (region) calls.push({ name, region });
          }}
          clusterOverrides={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-cluster');

      await component.page().waitForTimeout(700);

      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[calls.length - 1].name).toBe('valid-cluster');
    });

    test('should NOT call checkClusterNameUniqueness for an invalid name', async ({ mount }) => {
      const calls: Array<{ name: string; region: string }> = [];

      const component = await mount(
        <DetailsSubStepMount
          checkClusterNameUniqueness={(name, region) => {
            if (region) calls.push({ name, region });
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
        <DetailsSubStepMount
          checkClusterNameUniqueness={(name, region) => {
            if (region) calls.push({ name, region });
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
        <DetailsSubStepMount
          checkClusterNameUniqueness={(name, region) => {
            if (region) calls.push({ name, region });
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
      const calls: Array<{ name: string; region?: string }> = [];

      const component = await mount(
        <DetailsSubStepMount
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
        <DetailsSubStepMount clusterOverrides={{ region: 'us-east-1' }} />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-cluster');

      await component.page().waitForTimeout(700);

      await expect(component.getByText('Details', { exact: true })).toBeVisible();
    });
  });

  test('version dropdown displays latest, default, and other versions correctly in grouped sections', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <DetailsSubStepMount
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    const versionCombobox = component.getByRole('combobox', {
      name: 'Select an OpenShift version',
    });
    await versionCombobox.click();

    const latestGroup = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Latest release', exact: true }),
    });
    await expect(latestGroup.getByText('OpenShift 4.14.0', { exact: true })).toBeVisible();

    const defaultGroup = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Default release', exact: true }),
    });
    await expect(defaultGroup.getByText('OpenShift 4.13.1', { exact: true })).toBeVisible();

    const previousGroup = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Previous releases', exact: true }),
    });
    await expect(previousGroup.getByText('OpenShift 4.12.0', { exact: true })).toBeVisible();
    await expect(previousGroup.getByText('OpenShift 4.11.5', { exact: true })).toBeVisible();
  });

  test('version dropdown shows Default (Recommended) and Previous releases only when latest and default share the same value', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <DetailsSubStepMount
        versions={{
          data: mockVersionsDefaultEqualsLatest,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    const versionCombobox = component.getByRole('combobox', {
      name: 'Select an OpenShift version',
    });
    await versionCombobox.click();

    await expect(
      page.getByRole('heading', { name: 'Default (Recommended)', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Previous releases', exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Latest release', exact: true })
    ).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Default release', exact: true })
    ).not.toBeVisible();

    const recommendedGroup = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Default (Recommended)', exact: true }),
    });
    await expect(recommendedGroup.getByText('OpenShift 4.12.0', { exact: true })).toBeVisible();
  });

  test('grouped OpenShift version typeahead shows No results found when the filter matches nothing', async ({
    mount,
    page,
  }) => {
    await mount(
      <DetailsSubStepMount
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    const versionField = page.locator('#cluster-cluster_version');
    await versionField.getByRole('combobox').click();
    await versionField.locator('input').fill('3rf2wrf23');

    await expect(page.getByRole('option', { name: 'No results found', exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Latest release', exact: true })
    ).not.toBeVisible();
  });

  test('should disable OpenShift version options newer than the selected installer role version', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <DetailsSubStepMount
        roles={rolesWithInstallerVersion412}
        clusterOverrides={{ installer_role_arn: INSTALLER_ARN }}
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    await component.getByRole('combobox', { name: 'Select an OpenShift version' }).click();

    // Incompatible versions use `isAriaDisabled` + tooltip (not inline description).
    await expect(page.getByRole('option', { name: /^OpenShift 4\.14\.0$/ })).toBeDisabled();
    await expect(page.getByRole('option', { name: /^OpenShift 4\.13\.1$/ })).toBeDisabled();
    await expect(page.getByRole('option', { name: /^OpenShift 4\.12\.0$/ })).toBeEnabled();
    await expect(page.getByRole('option', { name: /^OpenShift 4\.11\.5$/ })).toBeEnabled();
  });

  test('should show tooltip on disabled OpenShift version options when installer role is older', async ({
    mount,
    page,
  }) => {
    await mount(
      <DetailsSubStepMount
        roles={rolesWithInstallerVersion412}
        clusterOverrides={{ installer_role_arn: INSTALLER_ARN }}
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();

    await page.getByRole('option', { name: /^OpenShift 4\.14\.0$/ }).hover();
    await expect(
      page.getByRole('tooltip', { name: versionDisabledDescription, exact: true })
    ).toBeVisible();
  });
});
