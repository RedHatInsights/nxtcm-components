import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import type { Resource, Role } from '../../../types';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import rosaHcpWizardFixtures from '../../../ROSAHCPWizard.fixtures';
import { makeVpcListResource } from '../../../rosaHcpWizardCtSpecHelpers';
import { DetailsMount } from './Details.spec-helpers';
import {
  INSTALLER_ARN_412,
  mockRegions,
  mockVersionsDefaultEqualsLatest,
  mockVersionsLatestDefaultPrevious,
  rolesWithInstallerVersion412,
} from './Details.fixtures';

const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

const d = defaultRosaHcpWizardStrings.details;

const versionDisabledDescription = d.openShiftVersionOptionDisabledDescription;

test.describe('Details (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<DetailsMount />);
    await checkAccessibility({ component });
  });

  test('should render the Details section title', async ({ mount }) => {
    const component = await mount(<DetailsMount />);
    await expect(component.getByText('Cluster details', { exact: true })).toBeVisible();
  });

  test('should render OpenShift version select', async ({ mount }) => {
    const component = await mount(<DetailsMount />);
    await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
  });

  test('should render with empty options', async ({ mount }) => {
    const component = await mount(
      <DetailsMount
        versions={{
          data: { releases: [] },
          error: null,
          isFetching: false,
          fetch: async () => {},
        }}
        regions={{ data: [], error: null, isFetching: false, fetch: async () => {} }}
        awsInfrastructureAccounts={mockResource([])}
        awsBillingAccounts={mockResource([])}
      />
    );

    await expect(component.getByText('Cluster details', { exact: true })).toBeVisible();
    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
  });

  test('should render the Cluster name input', async ({ mount }) => {
    const component = await mount(<DetailsMount />);

    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
    await expect(component.getByRole('textbox', { name: 'Cluster name' })).toBeVisible();
  });

  test('should render the Associated AWS infrastructure account select', async ({ mount }) => {
    const component = await mount(<DetailsMount />);

    await expect(
      component.getByText('Associated AWS infrastructure account', { exact: true })
    ).toBeVisible();
  });

  test('should render the Associated AWS billing account select', async ({ mount }) => {
    const component = await mount(<DetailsMount />);

    await expect(
      component.getByText('Associated AWS billing account', { exact: true })
    ).toBeVisible();
  });

  test('should render the Region select', async ({ mount }) => {
    const component = await mount(<DetailsMount />);

    await expect(component.getByText('Region', { exact: true })).toBeVisible();
  });

  test('should render the Associate a new AWS account button', async ({ mount }) => {
    const component = await mount(<DetailsMount />);

    await expect(component.getByText('Associate a new AWS account')).toBeVisible();
  });

  test.describe('Details — cluster name validation', () => {
    test('should display validation error for cluster name with invalid characters', async ({
      mount,
    }) => {
      const component = await mount(<DetailsMount />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('MyCluster');
      await nameInput.blur();

      await expect(
        component.getByText(/This value can only contain lowercase alphanumeric characters/)
      ).toBeVisible();
    });

    test('should display validation error for cluster name starting with a number', async ({
      mount,
    }) => {
      const component = await mount(<DetailsMount />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('1cluster');
      await nameInput.blur();

      await expect(component.getByText(/This value must not start with a number/)).toBeVisible();
    });

    test('should cancel pending async check when name becomes sync-invalid', async ({ mount }) => {
      const calls: Array<{ name: string; region: string | undefined }> = [];
      const component = await mount(
        <DetailsMount
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
            return Promise.resolve(null);
          }}
          defaultValues={{ region: 'us-east-1' }}
        />
      );
      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('taken');
      await nameInput.fill('TAKEN');
      await nameInput.blur();
      await expect(
        component.getByText(/This value can only contain lowercase alphanumeric characters/)
      ).toBeVisible();
      await expect.poll(() => calls.length).toBe(0);
    });

    test('should not display async error when sync validation fails', async ({ mount }) => {
      const component = await mount(
        <DetailsMount
          checkClusterNameUniqueness={() => Promise.resolve('Cluster name already exists.')}
          defaultValues={{ name: 'INVALID' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.click();
      await nameInput.blur();

      await expect(
        component.getByText(/This value can only contain lowercase alphanumeric characters/)
      ).toBeVisible();
      await expect(component.getByText('Cluster name already exists.')).not.toBeVisible();
    });

    test('should allow typing a cluster name', async ({ mount }) => {
      const component = await mount(<DetailsMount />);

      const nameInput = component.getByRole('textbox', { name: 'Cluster name' });
      await nameInput.fill('my-test-cluster');

      await expect(nameInput).toHaveValue('my-test-cluster');
    });
  });

  test.describe('Details — associated AWS infrastructure account select', () => {
    test('should show AWS infrastructure account options in dropdown', async ({ mount, page }) => {
      const component = await mount(<DetailsMount />);

      await component
        .locator('#associated_aws_id-form-group')
        .getByRole('combobox', { name: d.awsInfraPlaceholder, exact: true })
        .click();

      await expect(
        page.getByText('AWS Account - Production (123456789012)', { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText('AWS Account - Staging (234567890123)', { exact: true })
      ).toBeVisible();
    });

    test('should show pending state for AWS infrastructure account when loading', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsMount awsInfrastructureAccounts={{ data: [], isFetching: true, error: null }} />
      );

      const awsCombo = component
        .locator('#associated_aws_id-form-group')
        .getByRole('combobox', { name: d.awsInfraPlaceholder, exact: true });
      await expect(awsCombo).toHaveValue('Loading...');
    });

    test('should show spinner in AWS infrastructure account dropdown when loading', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <DetailsMount awsInfrastructureAccounts={{ data: [], isFetching: true, error: null }} />
      );

      await component
        .locator('#associated_aws_id-form-group')
        .getByRole('combobox', { name: d.awsInfraPlaceholder, exact: true })
        .click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should disable refresh button for AWS infrastructure account when loading', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsMount
          awsInfrastructureAccounts={{
            data: [],
            isFetching: true,
            error: null,
            fetch: async () => {},
          }}
        />
      );

      const refreshButton = component
        .locator('#associated_aws_id-form-group')
        .getByRole('button', { name: 'Refresh', exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });
  });

  test.describe('Details — AWS billing account select', () => {
    test('should show pending state for AWS billing account when loading', async ({ mount }) => {
      const component = await mount(
        <DetailsMount awsBillingAccounts={{ data: [], isFetching: true, error: null }} />
      );

      const billingCombo = component
        .locator('#billing_account_id-form-group')
        .getByRole('combobox', { name: d.billingPlaceholder, exact: true });
      await expect(billingCombo).toHaveValue('Loading...');
    });

    test('should show spinner in AWS billing account dropdown when loading', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <DetailsMount awsBillingAccounts={{ data: [], isFetching: true, error: null }} />
      );

      await component
        .locator('#billing_account_id-form-group')
        .getByRole('combobox', { name: d.billingPlaceholder, exact: true })
        .click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should disable refresh button for AWS billing account when loading', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsMount
          awsBillingAccounts={{
            data: [],
            isFetching: true,
            error: null,
            fetch: async () => {},
          }}
        />
      );

      const refreshButton = component
        .locator('#billing_account_id-form-group')
        .getByRole('button', { name: 'Refresh', exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });

    test('should render the Connect ROSA to a new AWS billing account link', async ({ mount }) => {
      const component = await mount(<DetailsMount />);

      await expect(component.getByText('Connect ROSA to a new AWS billing account')).toBeVisible();
    });
  });

  test.describe('Details — region select', () => {
    test('should show region options in dropdown', async ({ mount, page }) => {
      const component = await mount(<DetailsMount />);

      await component
        .locator('#region-form-group')
        .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
        .click();

      for (const region of mockRegions) {
        await expect(page.getByText(region.label, { exact: true })).toBeVisible();
      }
    });

    test('should show pending state for Region select when loading', async ({ mount }) => {
      const component = await mount(
        <DetailsMount
          regions={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      const regionCombo = component
        .locator('#region-form-group')
        .getByRole('combobox', { name: d.regionPlaceholder, exact: true });
      await expect(regionCombo).toHaveValue('Loading...');
    });

    test('should show spinner in Region dropdown when loading', async ({ mount, page }) => {
      const component = await mount(
        <DetailsMount
          regions={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      await component
        .locator('#region-form-group')
        .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
        .click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should disable refresh button for Region when loading and account is selected', async ({
      mount,
    }) => {
      const component = await mount(
        <DetailsMount
          defaultValues={{ associated_aws_id: 'aws-prod-123456789012' }}
          regions={{
            data: [],
            isFetching: true,
            error: null,
            fetch: async () => {},
          }}
        />
      );

      const refreshButton = component
        .locator('#region-form-group')
        .getByRole('button', { name: 'Refresh', exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });

    test('should render with empty regions', async ({ mount }) => {
      const component = await mount(
        <DetailsMount
          regions={{ data: [], isFetching: false, error: null, fetch: async () => {} }}
        />
      );

      await expect(component.getByText('Region', { exact: true })).toBeVisible();
    });

    test('should select a region', async ({ mount, page }) => {
      const component = await mount(<DetailsMount />);

      await component
        .locator('#region-form-group')
        .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
        .click();
      await page.getByText('US East (N. Virginia)', { exact: true }).click();

      await expect(
        component
          .locator('#region-form-group')
          .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
      ).toHaveValue('US East (N. Virginia)');
    });

    test('should refetch VPCs when region changes from Details', async ({ mount, page }) => {
      let vpcFetchCount = 0;
      const vpcList = makeVpcListResource({
        // eslint-disable-next-line @typescript-eslint/require-await
        fetch: async () => {
          vpcFetchCount += 1;
        },
      });

      const component = await mount(
        <DetailsMount
          vpcList={vpcList}
          defaultValues={{
            region: 'us-east-1',
            selected_vpc: rosaHcpWizardFixtures.mockVPCs[0].id,
          }}
        />
      );

      await expect.poll(() => vpcFetchCount >= 1).toBe(true);
      const callsAfterMount = vpcFetchCount;

      await expect(component.getByTestId('ct-selected-vpc')).toHaveText(
        rosaHcpWizardFixtures.mockVPCs[0].id
      );

      await component
        .locator('#region-form-group')
        .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
        .click();
      // Typeahead: filter control lives in a child input (id is on the PF wrapper).
      await component
        .locator('#region-form-group')
        .locator('#region-typeahead-input')
        .locator('input')
        .fill('Oregon');
      await page.getByRole('option', { name: 'US West (Oregon)', exact: true }).click();

      await expect.poll(() => vpcFetchCount > callsAfterMount).toBe(true);
      await expect(component.getByTestId('ct-selected-vpc')).toHaveText('');
    });
  });

  test.describe('Details — OpenShift version select', () => {
    test('should show OpenShift version options in dropdown', async ({ mount, page }) => {
      const component = await mount(<DetailsMount />);

      await component
        .locator('#cluster_version-form-group')
        .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
        .click();

      await expect(page.getByText('OpenShift 4.16.2', { exact: true })).toBeVisible();
      await expect(page.getByText('OpenShift 4.16.0', { exact: true })).toBeVisible();
    });

    test('should render with empty OpenShift versions', async ({ mount }) => {
      const component = await mount(
        <DetailsMount
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

    test('should select an OpenShift version', async ({ mount, page }) => {
      const component = await mount(<DetailsMount />);

      await component
        .locator('#cluster_version-form-group')
        .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
        .click();
      await page.getByText('OpenShift 4.16.2', { exact: true }).click();

      await expect(
        component
          .locator('#cluster_version-form-group')
          .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
      ).toHaveValue('OpenShift 4.16.2');
    });
  });

  test.describe('Details — async cluster name uniqueness check', () => {
    test('should call checkClusterNameUniqueness when a valid name is typed', async ({ mount }) => {
      const calls: Array<{ name: string; region: string | undefined }> = [];

      const component = await mount(
        <DetailsMount
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
            return Promise.resolve(null);
          }}
          defaultValues={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-cluster');
      await nameInput.blur();

      await expect.poll(() => calls.some((c) => c.name === 'valid-cluster')).toBe(true);
    });

    test('should NOT call checkClusterNameUniqueness for an invalid name', async ({ mount }) => {
      const calls: Array<{ name: string; region: string | undefined }> = [];

      const component = await mount(
        <DetailsMount
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
            return Promise.resolve(null);
          }}
          defaultValues={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('INVALID_NAME');
      await nameInput.blur();

      await expect(
        component.getByText(/This value can only contain lowercase alphanumeric characters/)
      ).toBeVisible();
      await expect.poll(() => calls.length).toBe(0);
    });

    test('should run async uniqueness check once after blur with a valid name', async ({
      mount,
    }) => {
      const calls: Array<{ name: string; region: string | undefined }> = [];

      const component = await mount(
        <DetailsMount
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
            return Promise.resolve(null);
          }}
          defaultValues={{ region: 'us-east-1' }}
        />
      );

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('abc');
      await nameInput.blur();

      await expect.poll(() => calls.some((c) => c.name === 'abc')).toBe(true);
    });

    test('should NOT call checkClusterNameUniqueness when region is selected but no name exists', async ({
      mount,
      page,
    }) => {
      const calls: Array<{ name: string; region?: string }> = [];

      const component = await mount(
        <DetailsMount
          checkClusterNameUniqueness={(name, region) => {
            calls.push({ name, region });
            return Promise.resolve(null);
          }}
        />
      );

      await component
        .locator('#region-form-group')
        .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
        .click();
      await page.getByText('US East (N. Virginia)', { exact: true }).click();

      await expect(
        component
          .locator('#region-form-group')
          .getByRole('combobox', { name: d.regionPlaceholder, exact: true })
      ).toHaveValue('US East (N. Virginia)');
      await expect.poll(() => calls.length).toBe(0);
    });

    test('should NOT call checkClusterNameUniqueness when callback is not provided', async ({
      mount,
    }) => {
      const component = await mount(<DetailsMount defaultValues={{ region: 'us-east-1' }} />);

      const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
      await nameInput.fill('valid-cluster');
      await nameInput.blur();

      await expect(nameInput).toHaveValue('valid-cluster');
      await expect(component.getByText('Cluster details', { exact: true })).toBeVisible();
    });
  });

  test('version dropdown displays latest, default, and other versions correctly in grouped sections', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <DetailsMount
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    await component
      .locator('#cluster_version-form-group')
      .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
      .click();

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
      <DetailsMount
        versions={{
          data: mockVersionsDefaultEqualsLatest,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    await component
      .locator('#cluster_version-form-group')
      .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
      .click();

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

  test('should disable OpenShift version options newer than the selected installer role version', async ({
    mount,
    page,
  }) => {
    const rolesResource: Resource<Role[], [awsAccount: string]> & {
      fetch: (awsAccount: string) => Promise<void>;
    } = {
      data: rolesWithInstallerVersion412,
      isFetching: false,
      error: null,
      fetch: async () => {},
    };

    const component = await mount(
      <DetailsMount
        roles={rolesResource}
        defaultValues={{ installer_role_arn: INSTALLER_ARN_412 }}
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    await component
      .locator('#cluster_version-form-group')
      .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
      .click();

    await expect(page.getByRole('option', { name: /^OpenShift 4\.14\.0$/ })).toBeDisabled();
    await expect(page.getByRole('option', { name: /^OpenShift 4\.13\.1$/ })).toBeDisabled();
    await expect(page.getByRole('option', { name: /^OpenShift 4\.12\.0$/ })).toBeEnabled();
    await expect(page.getByRole('option', { name: /^OpenShift 4\.11\.5$/ })).toBeEnabled();
  });

  test('should show tooltip on disabled OpenShift version options when installer role is older', async ({
    mount,
    page,
  }) => {
    const rolesResource: Resource<Role[], [awsAccount: string]> & {
      fetch: (awsAccount: string) => Promise<void>;
    } = {
      data: rolesWithInstallerVersion412,
      isFetching: false,
      error: null,
      fetch: async () => {},
    };

    const component = await mount(
      <DetailsMount
        roles={rolesResource}
        defaultValues={{ installer_role_arn: INSTALLER_ARN_412 }}
        versions={{
          data: mockVersionsLatestDefaultPrevious,
          isFetching: false,
          error: null,
          fetch: async () => {},
        }}
      />
    );

    await component
      .locator('#cluster_version-form-group')
      .getByRole('combobox', { name: d.openShiftVersionPlaceholder, exact: true })
      .click();

    await page.getByRole('option', { name: /^OpenShift 4\.14\.0$/ }).hover();
    await expect(
      page.getByRole('tooltip', { name: versionDisabledDescription, exact: true })
    ).toBeVisible();
  });
});
