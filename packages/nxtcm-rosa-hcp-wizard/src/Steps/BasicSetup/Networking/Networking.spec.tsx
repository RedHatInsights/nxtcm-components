import { expect, test } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../test-helpers';
import { defaultRosaHcpWizardStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { ClusterNetwork } from '../../../types';
import { NetworkingMount } from './Networking.spec-helpers';

const n = defaultRosaHcpWizardStrings.networking;

test.describe('Networking (ROSA HCP)', () => {
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<NetworkingMount />);
    await checkAccessibility({ component });
  });

  test('should render the Networking section title', async ({ mount }) => {
    const component = await mount(<NetworkingMount />);
    await expect(component.getByText(n.sectionLabel, { exact: true })).toBeVisible();
  });

  test('should render the privacy description', async ({ mount }) => {
    const component = await mount(<NetworkingMount />);
    await expect(component.getByText(n.privacyHelper)).toBeVisible();
  });

  test.describe('Networking — cluster privacy radio group', () => {
    test('should render Public radio option', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);
      await expect(component.getByRole('radio', { name: n.publicLabel })).toBeVisible();
    });

    test('should render Private radio option', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);
      await expect(component.getByRole('radio', { name: n.privateLabel })).toBeVisible();
    });

    test('should have Public selected by default', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);
      await expect(component.getByRole('radio', { name: n.publicLabel })).toBeChecked();
    });

    test('should select Private when clicked', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByRole('radio', { name: n.privateLabel }).click();

      await expect(component.getByRole('radio', { name: n.privateLabel })).toBeChecked();
      await expect(component.getByRole('radio', { name: n.publicLabel })).not.toBeChecked();
    });

    test('should render with Private selected when defaultValues specify internal', async ({
      mount,
    }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ cluster_privacy: ClusterNetwork.internal }} />
      );

      await expect(component.getByRole('radio', { name: n.privateLabel })).toBeChecked();
    });
  });

  test.describe('Networking — advanced networking configuration', () => {
    test('should render the advanced networking toggle', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);
      await expect(component.getByText(n.advancedToggle)).toBeVisible();
    });

    test('should expand advanced section when toggle is clicked', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByText(n.cidrAlertTitle)).toBeVisible();
    });

    test('should render configure proxy checkbox in advanced section', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('checkbox', { name: n.proxyCheckboxLabel })).toBeVisible();
    });

    test('should render CIDR alert in advanced section', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByText(n.cidrAlertTitle)).toBeVisible();
    });

    test('should render use default values checkbox in advanced section', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('checkbox', { name: n.useDefaultsLabel })).toBeVisible();
    });

    test('should have use default values checked by default', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('checkbox', { name: n.useDefaultsLabel })).toBeChecked();
    });
  });

  test.describe('Networking — CIDR fields', () => {
    test('should render Machine CIDR field as disabled when defaults are used', async ({
      mount,
    }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      const machineInput = component.getByRole('textbox', { name: n.machineCidrLabel });
      await expect(machineInput).toBeVisible();
      await expect(machineInput).toBeDisabled();
    });

    test('should render Service CIDR field as disabled when defaults are used', async ({
      mount,
    }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      const serviceInput = component.getByRole('textbox', { name: n.serviceCidrLabel });
      await expect(serviceInput).toBeVisible();
      await expect(serviceInput).toBeDisabled();
    });

    test('should render Pod CIDR field as disabled when defaults are used', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      const podInput = component.getByRole('textbox', { name: n.podCidrLabel });
      await expect(podInput).toBeVisible();
      await expect(podInput).toBeDisabled();
    });

    test('should render Host prefix field as disabled when defaults are used', async ({
      mount,
    }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      const hostInput = component.getByRole('textbox', { name: n.hostPrefixLabel });
      await expect(hostInput).toBeVisible();
      await expect(hostInput).toBeDisabled();
    });

    test('should enable CIDR fields when "Use default values" is unchecked', async ({ mount }) => {
      const component = await mount(<NetworkingMount defaultValues={{ cidr_default: false }} />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('textbox', { name: n.machineCidrLabel })).toBeEnabled();
      await expect(component.getByRole('textbox', { name: n.serviceCidrLabel })).toBeEnabled();
      await expect(component.getByRole('textbox', { name: n.podCidrLabel })).toBeEnabled();
      await expect(component.getByRole('textbox', { name: n.hostPrefixLabel })).toBeEnabled();
    });

    test('should show default value for Machine CIDR', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('textbox', { name: n.machineCidrLabel })).toHaveValue(
        '10.0.0.0/16'
      );
    });

    test('should show default value for Service CIDR', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('textbox', { name: n.serviceCidrLabel })).toHaveValue(
        '172.30.0.0/16'
      );
    });

    test('should show default value for Pod CIDR', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('textbox', { name: n.podCidrLabel })).toHaveValue(
        '10.128.0.0/14'
      );
    });

    test('should show default value for Host prefix', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('textbox', { name: n.hostPrefixLabel })).toHaveValue('/23');
    });
  });

  test.describe('Networking — CIDR validation', () => {
    test('should display validation error for invalid Machine CIDR notation', async ({ mount }) => {
      const component = await mount(<NetworkingMount defaultValues={{ cidr_default: false }} />);

      await component.getByText(n.advancedToggle).click();

      const machineInput = component.getByRole('textbox', { name: n.machineCidrLabel });
      await machineInput.fill('invalid-cidr');
      await machineInput.blur();

      await expect(component.getByText(/isn.t valid CIDR notation/)).toBeVisible();
    });

    test('should display validation error for invalid Service CIDR notation', async ({ mount }) => {
      const component = await mount(<NetworkingMount defaultValues={{ cidr_default: false }} />);

      await component.getByText(n.advancedToggle).click();

      const serviceInput = component.getByRole('textbox', { name: n.serviceCidrLabel });
      await serviceInput.fill('not-a-cidr');
      await serviceInput.blur();

      await expect(component.getByText(/isn.t valid CIDR notation/)).toBeVisible();
    });

    test('should display validation error for invalid Pod CIDR notation', async ({ mount }) => {
      const component = await mount(<NetworkingMount defaultValues={{ cidr_default: false }} />);

      await component.getByText(n.advancedToggle).click();

      const podInput = component.getByRole('textbox', { name: n.podCidrLabel });
      await podInput.fill('bad-value');
      await podInput.blur();

      await expect(component.getByText(/isn.t valid CIDR notation/)).toBeVisible();
    });

    test('should display validation error for invalid Host prefix format', async ({ mount }) => {
      const component = await mount(<NetworkingMount defaultValues={{ cidr_default: false }} />);

      await component.getByText(n.advancedToggle).click();

      const hostInput = component.getByRole('textbox', { name: n.hostPrefixLabel });
      await hostInput.fill('abc');
      await hostInput.blur();

      await expect(component.getByText(/isn.t a valid subnet mask/)).toBeVisible();
    });

    test('should allow typing a valid Machine CIDR', async ({ mount }) => {
      const component = await mount(<NetworkingMount defaultValues={{ cidr_default: false }} />);

      await component.getByText(n.advancedToggle).click();

      const machineInput = component.getByRole('textbox', { name: n.machineCidrLabel });
      await machineInput.fill('10.1.0.0/16');

      await expect(machineInput).toHaveValue('10.1.0.0/16');
    });
  });

  test.describe('Networking — configure proxy checkbox', () => {
    test('should not be checked by default', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await expect(
        component.getByRole('checkbox', { name: n.proxyCheckboxLabel })
      ).not.toBeChecked();
    });

    test('should be checkable', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      await component.getByRole('checkbox', { name: n.proxyCheckboxLabel }).click();

      await expect(component.getByRole('checkbox', { name: n.proxyCheckboxLabel })).toBeChecked();
    });

    test('should render checked when defaultValues specify configure_proxy true', async ({
      mount,
    }) => {
      const component = await mount(<NetworkingMount defaultValues={{ configure_proxy: true }} />);

      await component.getByText(n.advancedToggle).click();

      await expect(component.getByRole('checkbox', { name: n.proxyCheckboxLabel })).toBeChecked();
    });
  });

  test.describe('Networking — CIDR learn more link', () => {
    test('should render the learn more link in advanced section', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await component.getByText(n.advancedToggle).click();

      const alert = component.locator('[data-ouia-component-id="networkingCidrAlert"]');
      await alert.getByRole('button').first().click();

      await expect(component.getByText(n.cidrLearnMoreLink)).toBeVisible();
    });
  });

  test.describe('Networking — public subnet select', () => {
    test('should render the public subnet select when Public radio is selected', async ({
      mount,
    }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ selected_vpc: 'vpc-12345' }} />
      );

      await expect(
        component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') })
      ).toBeVisible();
    });

    test('should hide the public subnet select when Private radio is selected', async ({
      mount,
    }) => {
      const component = await mount(
        <NetworkingMount
          defaultValues={{
            cluster_privacy: ClusterNetwork.internal,
            selected_vpc: 'vpc-12345',
          }}
        />
      );

      await expect(
        component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') })
      ).toHaveCount(0);
    });

    test('should hide the public subnet select after switching from Public to Private', async ({
      mount,
    }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ selected_vpc: 'vpc-12345' }} />
      );

      await expect(
        component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') })
      ).toBeVisible();

      await component.getByRole('radio', { name: n.privateLabel }).click();

      await expect(
        component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') })
      ).toHaveCount(0);
    });

    test('should show public subnet options from the selected VPC', async ({ mount, page }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ selected_vpc: 'vpc-12345' }} />
      );

      await component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') }).click();

      await expect(page.getByRole('option', { name: 'public-subnet-a' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'public-subnet-b' })).toBeVisible();
    });

    test('should not list private subnets in the public subnet select', async ({ mount, page }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ selected_vpc: 'vpc-12345' }} />
      );

      await component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') }).click();

      await expect(page.getByRole('option', { name: 'private-subnet-a' })).toHaveCount(0);
    });

    test('should allow selecting a public subnet option', async ({ mount, page }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ selected_vpc: 'vpc-12345' }} />
      );

      await component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') }).click();

      await page.getByRole('option', { name: 'public-subnet-a' }).click();

      await expect(component.getByText('public-subnet-a')).toBeVisible();
    });

    test('should show no public subnet options when a VPC with no public subnets is selected', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <NetworkingMount defaultValues={{ selected_vpc: 'vpc-67890' }} />
      );

      await component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') }).click();

      await expect(page.getByRole('option', { name: /no results found/i })).toBeVisible();
    });

    test('should show no public subnet options when no VPC is selected', async ({ mount }) => {
      const component = await mount(<NetworkingMount />);

      await expect(
        component.getByRole('button', { name: new RegExp(n.publicSubnetLabel, 'i') })
      ).toBeVisible();
    });
  });
});
