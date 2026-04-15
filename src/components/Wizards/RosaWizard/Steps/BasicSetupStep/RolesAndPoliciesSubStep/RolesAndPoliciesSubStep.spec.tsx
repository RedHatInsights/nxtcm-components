import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import {
  mockInstallerRoles,
  mockSupportRoles,
  mockWorkerRoles,
  mockOIDCConfig,
} from './RolesAndPoliciesSubStep.story';
import { RolesAndPoliciesSubStepMount } from './RolesAndPoliciesSubStep.spec-helpers';
import type { Resource, Role } from '../../../../types';
import { defaultRosaWizardStrings } from '../../../rosaWizardStrings.defaults';

/** Minimal static `Resource` for CT props with inert `fetch`. */
const mockResource = <TData,>(data: TData): Resource<TData> => ({
  data,
  error: null,
  isFetching: false,
  fetch: async () => {},
});

/** Fetch-shaped `Resource` with noop `fetch` for installer/support/worker role bundles. */
const mockFetchResource = <TData, TArgs extends unknown[] = []>(
  data: TData
): Resource<TData, TArgs> & { fetch: (...args: TArgs) => Promise<void> } => ({
  data,
  error: null,
  isFetching: false,
  fetch: async (..._args: TArgs) => {},
});

/** CT for account/operator roles, refresh actions, auto-selection rules, and installer version gating. */
test.describe('RolesAndPoliciesSubStep', () => {
  /** Default mount passes accessibility checks. */
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);
    await checkAccessibility({ component });
  });

  /** Account roles section shows Installer role label and chrome. */
  test('should render Account roles section with Installer role select', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    await expect(component.getByText('Account roles', { exact: true })).toBeVisible();
    await expect(component.getByText('Installer role', { exact: true })).toBeVisible();
  });

  /** Operator roles block includes OIDC config ID field. */
  test('should render Operator roles section with OIDC config select', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    await expect(component.getByText('Operator roles', { exact: true })).toBeVisible();
    await expect(component.getByText('OIDC config ID', { exact: true })).toBeVisible();
  });

  /** ARNs expander reveals Support and Worker role comboboxes after opening. */
  test('should render ARNs expandable section with Support and Worker role selects', async ({
    mount,
  }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    const arnsToggle = component.getByRole('button', {
      name: /Amazon Resource Names \(ARNs\)/,
    });
    await expect(arnsToggle).toBeVisible();
    await arnsToggle.click();

    await expect(component.getByText('Support role', { exact: true })).toBeVisible();
    await expect(component.getByText('Worker role', { exact: true })).toBeVisible();
  });

  /** Installer role field group includes a Refresh toolbar action. */
  test('should display refresh button on Installer role', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    await expect(
      component
        .locator('#cluster-installer_role_arn-form-group')
        .getByLabel('Refresh', { exact: true })
    ).toBeVisible();
  });

  /** Installer Refresh invokes the injected `roles.fetch` spy once. */
  test('should call roles fetch callback when clicking refresh button on Installer role', async ({
    mount,
  }) => {
    let fetchCallCount = 0;

    const component = await mount(
      <RolesAndPoliciesSubStepMount
        roles={{
          data: [
            {
              installerRole: mockInstallerRoles[0],
              supportRole: mockSupportRoles,
              workerRole: mockWorkerRoles,
            },
          ],
          error: null,
          isFetching: false,
          // eslint-disable-next-line @typescript-eslint/require-await
          fetch: async () => {
            fetchCallCount++;
          },
        }}
      />
    );

    await component
      .locator('#cluster-installer_role_arn-form-group')
      .getByLabel('Refresh', { exact: true })
      .click();

    expect(fetchCallCount).toBe(1);
  });

  /** OIDC config field group shows Refresh next to the selector. */
  test('should display refresh button on OIDC config ID', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    await expect(
      component
        .locator('#cluster-byo_oidc_config_id-form-group')
        .getByLabel('Refresh', { exact: true })
    ).toBeVisible();
  });

  /** OIDC Refresh calls the provided `oidcConfig.fetch` counter once. */
  test('should call oidcConfig fetch callback when clicking refresh button on OIDC config ID', async ({
    mount,
  }) => {
    let fetchCallCount = 0;

    const component = await mount(
      <RolesAndPoliciesSubStepMount
        oidcConfig={{
          data: mockOIDCConfig,
          error: null,
          isFetching: false,
          // eslint-disable-next-line @typescript-eslint/require-await
          fetch: async () => {
            fetchCallCount++;
          },
        }}
      />
    );

    await component
      .locator('#cluster-byo_oidc_config_id-form-group')
      .getByLabel('Refresh', { exact: true })
      .click();

    expect(fetchCallCount).toBe(1);
  });

  /** Choosing installer auto-fills first support and worker options under ARNs. */
  test('should auto-select support and worker roles when installer role is selected', async ({
    mount,
    page,
  }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    const installerCombobox = component.getByRole('combobox', {
      name: 'Select an Installer role',
    });
    await installerCombobox.click();
    await page
      .getByRole('option', {
        name: /ManagedOpenShift-Installer-Role/,
      })
      .first()
      .click();

    const arnsToggle = component.getByRole('button', {
      name: /Amazon Resource Names \(ARNs\)/,
    });
    await arnsToggle.click();

    const supportCombobox = component.getByRole('combobox', {
      name: 'Select a support role',
    });
    const workerCombobox = component.getByRole('combobox', {
      name: 'Select a worker role',
    });

    await expect(supportCombobox).toHaveValue(mockSupportRoles[0].label);
    await expect(workerCombobox).toHaveValue(mockWorkerRoles[0].label);
  });

  /** Operator role prefix expander control is present in the operator roles area. */
  test('should render Operator role prefix expandable section', async ({ mount }) => {
    const component = await mount(<RolesAndPoliciesSubStepMount />);

    const operatorRolesToggle = component.getByRole('button', {
      name: /Operator role prefix/,
    });
    await expect(operatorRolesToggle).toBeVisible();
  });

  /** With cluster name override, operator roles prefix field label is shown for generated prefix UX. */
  test('should display Operator roles prefix input with autogenerated value', async ({ mount }) => {
    const component = await mount(
      <RolesAndPoliciesSubStepMount clusterOverrides={{ name: 'test-cluster' }} />
    );

    await expect(component.getByText('Operator roles prefix', { exact: true })).toBeVisible();
  });

  /** Expanded copy block includes `rosa create operator-roles` snippet for current form values. */
  test('should display the rosa create command in clipboard copy', async ({ mount }) => {
    const component = await mount(
      <RolesAndPoliciesSubStepMount
        clusterOverrides={{
          custom_operator_roles_prefix: 'my-prefix',
          byo_oidc_config_id: 'oidc-123',
          installer_role_arn: 'arn:aws:iam::123456789012:role/Installer',
        }}
      />
    );

    const expandToggle = component.getByRole('button', { name: 'Show content' });
    await expandToggle.click();

    await expect(component.getByText(/rosa create operator-roles/)).toBeVisible();
  });

  /** Empty support list after installer pick leaves support combobox unset. */
  test('should not auto-select roles when support roles list is empty', async ({ mount, page }) => {
    const component = await mount(
      <RolesAndPoliciesSubStepMount
        roles={mockFetchResource<Role[], [awsAccount: string]>([
          {
            installerRole: mockInstallerRoles[0],
            supportRole: [],
            workerRole: [],
          },
        ])}
        oidcConfig={mockResource(mockOIDCConfig)}
      />
    );

    const installerCombobox = component.getByRole('combobox', {
      name: 'Select an Installer role',
    });
    await installerCombobox.click();

    await page
      .getByRole('option', {
        name: /ManagedOpenShift-Installer-Role/,
      })
      .first()
      .click();
    await page.keyboard.press('Escape');

    const arnsToggle = component.getByRole('button', {
      name: /Amazon Resource Names \(ARNs\)/,
    });
    await arnsToggle.click();

    const supportCombobox = component.getByRole('combobox', {
      name: 'Select a support role',
    });
    await expect(supportCombobox).toHaveValue('');
  });

  /** Empty worker list after installer pick leaves worker combobox unset. */
  test('should not auto-select roles when worker roles list is empty', async ({ mount, page }) => {
    const component = await mount(
      <RolesAndPoliciesSubStepMount
        roles={mockFetchResource<Role[], [awsAccount: string]>([
          {
            installerRole: mockInstallerRoles[0],
            supportRole: [],
            workerRole: [],
          },
        ])}
        oidcConfig={mockResource(mockOIDCConfig)}
      />
    );

    const installerCombobox = component.getByRole('combobox', {
      name: 'Select an Installer role',
    });
    await installerCombobox.click();

    await page
      .getByRole('option', {
        name: /ManagedOpenShift-Installer-Role/,
      })
      .first()
      .click();
    await page.keyboard.press('Escape');

    const arnsToggle = component.getByRole('button', {
      name: /Amazon Resource Names \(ARNs\)/,
    });
    await arnsToggle.click();

    const workerCombobox = component.getByRole('combobox', {
      name: 'Select a worker role',
    });
    await expect(workerCombobox).toHaveValue('');
  });

  /** Installer option older than selected cluster version is exposed as a disabled menu item. */
  test('should mark installer role option aria-disabled when role version is below selected cluster version', async ({
    mount,
    page,
  }) => {
    const roles = mockFetchResource<Role[], [awsAccount: string]>([
      {
        installerRole: {
          ...mockInstallerRoles[0],
          roleVersion: '4.11.0',
        },
        supportRole: mockSupportRoles,
        workerRole: mockWorkerRoles,
      },
    ]);
    const component = await mount(
      <RolesAndPoliciesSubStepMount
        roles={roles}
        clusterOverrides={{ cluster_version: '4.12.0' }}
      />
    );

    await component.getByRole('combobox', { name: 'Select an Installer role' }).click();
    await expect(
      page.getByRole('option', { name: /ManagedOpenShift-Installer-Role/ })
    ).toBeDisabled();
  });

  /** Hovering disabled installer option shows the configured unsupported-version tooltip string. */
  test('should show tooltip on disabled installer role option when account role does not support selected OpenShift version', async ({
    mount,
    page,
  }) => {
    const installerRoleDisabledDescription =
      defaultRosaWizardStrings.rolesAndPolicies.installerRoleOptionDisabledDescription;
    const roles = mockFetchResource<Role[], [awsAccount: string]>([
      {
        installerRole: {
          ...mockInstallerRoles[0],
          roleVersion: '4.11.0',
        },
        supportRole: mockSupportRoles,
        workerRole: mockWorkerRoles,
      },
    ]);
    await mount(
      <RolesAndPoliciesSubStepMount
        roles={roles}
        clusterOverrides={{ cluster_version: '4.12.0' }}
      />
    );

    await page.getByRole('combobox', { name: 'Select an Installer role' }).click();
    await page.getByRole('option', { name: /ManagedOpenShift-Installer-Role/ }).hover();
    await expect(
      page.getByRole('tooltip', { name: installerRoleDisabledDescription, exact: true })
    ).toBeVisible();
  });

  /** Placeholder skipped test for clearing installer when version change invalidates selection. */
  test.skip('should clear installer role selection when selected role becomes disabled after cluster version change', async ({
    mount: _mount,
  }) => {});

  /** Placeholder skipped test for missing `roleVersion` keeping options enabled. */
  test.skip('should keep installer role option enabled when role has no roleVersion', async ({
    mount: _mount,
  }) => {});
});
