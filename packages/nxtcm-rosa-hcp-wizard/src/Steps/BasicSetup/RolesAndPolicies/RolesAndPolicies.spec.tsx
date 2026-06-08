import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import fixtures from '../../../ROSAHCPWizard.fixtures';
import { RolesAndPoliciesMount } from './RolesAndPolicies.spec-helpers';

const rp = defaultRosaHcpWizardStrings.rolesAndPolicies;
const { mockRoles, mockOicdConfig } = fixtures;
const INSTALLER_ARN = mockRoles[0].installerRole.value;

test.describe('RolesAndPolicies (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesMount />);
    await checkAccessibility({ component });
  });

  test('should render the Account roles section title', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesMount />);
    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();
  });

  test('should render the Operator roles section title', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesMount />);
    await expect(component.getByText(rp.operatorRolesSection, { exact: true })).toBeVisible();
  });

  test('should render the Installer role select', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesMount />);
    await expect(component.getByText(rp.installerRoleLabel, { exact: true })).toBeVisible();
  });

  test('should render the OIDC config ID select', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesMount />);
    await expect(component.getByText(rp.oidcLabel, { exact: true })).toBeVisible();
  });

  test('should render with empty roles and OIDC configs', async ({ mount }) => {
    const component = await mount(
      <RolesAndPoliciesMount
        roles={{ data: [], isFetching: false, error: null, fetch: async () => {} }}
        oidcConfig={{ data: [], isFetching: false, error: null, fetch: async () => {} }}
      />
    );

    await expect(component.getByText(rp.accountRolesSection, { exact: true })).toBeVisible();
    await expect(component.getByText(rp.operatorRolesSection, { exact: true })).toBeVisible();
  });

  test.describe('RolesAndPolicies — installer role select', () => {
    test('should show installer role options in dropdown', async ({ mount, page }) => {
      const component = await mount(<RolesAndPoliciesMount />);

      await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();

      for (const role of mockRoles) {
        await expect(page.getByRole('option', { name: role.installerRole.label })).toBeVisible();
      }
    });

    test('should select an installer role', async ({ mount, page }) => {
      const component = await mount(<RolesAndPoliciesMount />);

      await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
      await page.getByRole('option', { name: mockRoles[0].installerRole.label }).click();

      await expect(
        component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle')
      ).toContainText(mockRoles[0].installerRole.label);
    });

    test('should show loading state for installer role when loading', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount
          roles={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      await expect(
        component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle')
      ).toContainText('Loading...');
    });

    test('should show spinner in installer role dropdown when loading', async ({ mount, page }) => {
      const component = await mount(
        <RolesAndPoliciesMount
          roles={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should disable refresh button for installer role when loading', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount
          roles={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      const refreshButton = component
        .locator('#installer_role_arn-form-group')
        .getByRole('button', { name: 'Refresh', exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });

    test('should mark installer role option aria-disabled when role version is below selected cluster version', async ({
      mount,
      page,
    }) => {
      const roles = {
        data: [
          {
            installerRole: {
              ...mockRoles[0].installerRole,
              roleVersion: '4.11.0',
            },
            supportRole: mockRoles[0].supportRole,
            workerRole: mockRoles[0].workerRole,
          },
        ],
        isFetching: false,
        error: null,
        fetch: async () => {},
      };
      const component = await mount(
        <RolesAndPoliciesMount roles={roles} defaultValues={{ cluster_version: '4.12.0' }} />
      );

      await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
      await expect(
        page.getByRole('option', { name: mockRoles[0].installerRole.label })
      ).toBeDisabled();
    });

    test('should show tooltip on disabled installer role option when account role does not support selected OpenShift version', async ({
      mount,
      page,
    }) => {
      const installerRoleDisabledDescription = rp.installerRoleOptionDisabledDescription;
      const roles = {
        data: [
          {
            installerRole: {
              ...mockRoles[0].installerRole,
              roleVersion: '4.11.0',
            },
            supportRole: mockRoles[0].supportRole,
            workerRole: mockRoles[0].workerRole,
          },
        ],
        isFetching: false,
        error: null,
        fetch: async () => {},
      };
      await mount(
        <RolesAndPoliciesMount roles={roles} defaultValues={{ cluster_version: '4.12.0' }} />
      );

      await page.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
      await page.getByRole('option', { name: mockRoles[0].installerRole.label }).hover();
      await expect(
        page.getByRole('tooltip', { name: installerRoleDisabledDescription, exact: true })
      ).toBeVisible();
    });
  });

  test.describe('RolesAndPolicies — ARNs expandable section', () => {
    test('should render the ARNs toggle button', async ({ mount }) => {
      const component = await mount(<RolesAndPoliciesMount />);
      await expect(component.getByText(rp.arnsToggle, { exact: true })).toBeVisible();
    });

    test('should show support and worker role selects after expanding ARNs', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount defaultValues={{ installer_role_arn: INSTALLER_ARN }} />
      );

      await component.getByText(rp.arnsToggle, { exact: true }).click();

      await expect(component.getByText(rp.supportRoleLabel, { exact: true })).toBeVisible();
      await expect(component.getByText(rp.workerRoleLabel, { exact: true })).toBeVisible();
    });

    test('should auto-populate support role when installer role is selected', async ({
      mount,
      page,
    }) => {
      const component = await mount(<RolesAndPoliciesMount />);

      await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
      await page.getByRole('option', { name: mockRoles[0].installerRole.label }).click();

      await component.getByText(rp.arnsToggle, { exact: true }).click();

      await expect(
        component.locator('#support_role_arn-form-group .pf-v6-c-menu-toggle')
      ).toContainText(mockRoles[0].supportRole[0].label);
    });

    test('should auto-populate worker role when installer role is selected', async ({
      mount,
      page,
    }) => {
      const component = await mount(<RolesAndPoliciesMount />);

      await component.locator('#installer_role_arn-form-group .pf-v6-c-menu-toggle').click();
      await page.getByRole('option', { name: mockRoles[0].installerRole.label }).click();

      await component.getByText(rp.arnsToggle, { exact: true }).click();

      await expect(
        component.locator('#worker_role_arn-form-group .pf-v6-c-menu-toggle')
      ).toContainText(mockRoles[0].workerRole[0].label);
    });

    test('should have support role select disabled', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount defaultValues={{ installer_role_arn: INSTALLER_ARN }} />
      );

      await component.getByText(rp.arnsToggle, { exact: true }).click();

      await expect(
        component.locator('#support_role_arn-form-group .pf-v6-c-menu-toggle')
      ).toBeDisabled();
    });

    test('should have worker role select disabled', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount defaultValues={{ installer_role_arn: INSTALLER_ARN }} />
      );

      await component.getByText(rp.arnsToggle, { exact: true }).click();

      await expect(
        component.locator('#worker_role_arn-form-group .pf-v6-c-menu-toggle')
      ).toBeDisabled();
    });
  });

  test.describe('RolesAndPolicies — OIDC config select', () => {
    test('should show OIDC config options in dropdown', async ({ mount, page }) => {
      const component = await mount(<RolesAndPoliciesMount />);

      await component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle').click();

      for (const config of mockOicdConfig) {
        await expect(page.getByRole('option', { name: config.label })).toBeVisible();
      }
    });

    test('should select an OIDC config', async ({ mount, page }) => {
      const component = await mount(<RolesAndPoliciesMount />);

      await component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle').click();
      await page.getByRole('option', { name: mockOicdConfig[0].label }).click();

      await expect(
        component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle')
      ).toContainText(mockOicdConfig[0].label);
    });

    test('should show loading state for OIDC config when loading', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount
          oidcConfig={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      await expect(
        component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle')
      ).toContainText('Loading...');
    });

    test('should show spinner in OIDC config dropdown when loading', async ({ mount, page }) => {
      const component = await mount(
        <RolesAndPoliciesMount
          oidcConfig={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      await component.locator('#byo_oidc_config_id-form-group .pf-v6-c-menu-toggle').click();

      await expect(page.getByRole('option', { name: /Loading/ })).toBeVisible();
    });

    test('should disable refresh button for OIDC config when loading', async ({ mount }) => {
      const component = await mount(
        <RolesAndPoliciesMount
          oidcConfig={{ data: [], isFetching: true, error: null, fetch: async () => {} }}
        />
      );

      const refreshButton = component
        .locator('#byo_oidc_config_id-form-group')
        .getByRole('button', { name: 'Refresh', exact: true });
      await expect(refreshButton).toBeVisible();
      await expect(refreshButton).toBeDisabled();
    });

    test('should render the OIDC config popover hint', async ({ mount }) => {
      const component = await mount(<RolesAndPoliciesMount />);
      await expect(component.getByText(rp.oidcPopoverTitle)).toBeVisible();
    });
  });

  test.describe('RolesAndPolicies — operator roles prefix', () => {
    test('should render the operator role prefix toggle', async ({ mount }) => {
      const component = await mount(<RolesAndPoliciesMount />);
      await expect(component.getByText(rp.operatorPrefixToggle, { exact: true })).toBeVisible();
    });

    test('should render the operator roles prefix input', async ({ mount }) => {
      const component = await mount(<RolesAndPoliciesMount />);
      await expect(component.getByText(rp.operatorPrefixLabel, { exact: true })).toBeVisible();
    });

    test('should render the operator prefix helper text', async ({ mount }) => {
      const component = await mount(<RolesAndPoliciesMount />);
      await expect(component.getByText(rp.operatorPrefixHelper)).toBeVisible();
    });

    test('should render the clipboard copy for rosa command', async ({ mount }) => {
      const component = await mount(<RolesAndPoliciesMount />);
      await expect(component.getByRole('button', { name: rp.clipboardCopyAria })).toBeVisible();
    });
  });
});
