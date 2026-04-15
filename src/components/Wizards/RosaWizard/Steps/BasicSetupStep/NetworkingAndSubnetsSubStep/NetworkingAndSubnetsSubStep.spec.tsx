import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { NetworkingSubStepStory } from './NetworkingAndSubnetsSubStep.story';

/** CT for networking mode, advanced expand, proxy hint, and CIDR default/disable behavior. */
test.describe('NetworkingAndSubnetsSubStep', () => {
  /** Default story mount satisfies accessibility checks. */
  test('should pass accessibility tests', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);
    await checkAccessibility({ component });
  });

  /** Public/Private radio group and Networking heading render. */
  test('should render Networking section with radio options', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(component.getByText('Networking', { exact: true })).toBeVisible();
    await expect(component.getByRole('radio', { name: 'Public' })).toBeVisible();
    await expect(component.getByRole('radio', { name: 'Private' })).toBeVisible();
  });

  /** Private cluster radio is visible, enabled, and accepts a click. */
  test('should have Private radio option clickable', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const privateRadio = component.getByRole('radio', { name: 'Private' });
    await expect(privateRadio).toBeVisible();
    await expect(privateRadio).toBeEnabled();
    await privateRadio.click();
  });

  /** Advanced networking toggle button is present before expansion. */
  test('should render the advanced networking expandable section', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    await expect(
      component.getByRole('button', {
        name: /Advanced networking configuration \(optional\)/,
      })
    ).toBeVisible();
  });

  /** Expanding advanced shows proxy and default-CIDR checkboxes. */
  test('should expand advanced networking section on click', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(
      component.getByRole('checkbox', { name: /Configure a cluster-wide proxy/ })
    ).toBeVisible();
    await expect(component.getByRole('checkbox', { name: /Use default values/ })).toBeVisible();
  });

  /** Cluster-wide proxy checkbox and helper copy appear when advanced is expanded. */
  test('should display cluster-wide proxy checkbox inside expanded section', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    const proxyCheckbox = component.getByRole('checkbox', {
      name: /Configure a cluster-wide proxy/,
    });
    await expect(proxyCheckbox).toBeVisible();
    await expect(proxyCheckbox).toBeEnabled();
    await expect(
      component.getByText(
        'Enable an HTTP or HTTPS proxy to deny direct access to the internet from your cluster.'
      )
    ).toBeVisible();
  });

  /** Pre-enabled proxy via overrides shows the "configure in next step" info alert. */
  test('should show proxy info alert when proxy checkbox is checked', async ({ mount }) => {
    const component = await mount(
      <NetworkingSubStepStory clusterOverrides={{ configure_proxy: true }} />
    );

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(
      component.getByText(
        'You will be able to configure cluster-wide proxy details in the next step'
      )
    ).toBeVisible();
  });

  /** Immutable CIDR warning alert is visible under advanced networking. */
  test('should display CIDR warning alert inside expanded section', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(
      component.getByText('CIDR ranges cannot be changed after you create your cluster')
    ).toBeVisible();
  });

  /** "Use default values" checkbox and its explanatory helper text render when expanded. */
  test('should display Use default values checkbox', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    const defaultValuesCheckbox = component.getByRole('checkbox', { name: /Use default values/ });
    await expect(defaultValuesCheckbox).toBeVisible();
    await expect(
      component.getByText(
        'The values are safe defaults. However, you must ensure that the Machine CIDR matches the selected VPC subnets.'
      )
    ).toBeVisible();
  });

  /** Advanced section lists Machine/Service/Pod CIDR labels and Host prefix field. */
  test('should render CIDR and host prefix inputs inside expanded section', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(component.getByText('Machine CIDR', { exact: true })).toBeVisible();
    await expect(component.getByText('Service CIDR', { exact: true })).toBeVisible();
    await expect(component.getByText('Pod CIDR', { exact: true })).toBeVisible();
    await expect(component.getByText('Host prefix', { exact: true })).toBeVisible();
  });

  /** Inline helper strings for CIDR mask constraints appear alongside the fields. */
  test('should show CIDR helper texts', async ({ mount }) => {
    const component = await mount(<NetworkingSubStepStory />);

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(component.getByText('Subnet mask must be between /16 and /25')).toBeVisible();
    await expect(component.getByText('Subnet mask must be at most /24')).toBeVisible();
    await expect(component.getByText('Subnet mask must allow for at least 32 nodes')).toBeVisible();
    await expect(component.getByText('Must be between /23 and /26')).toBeVisible();
  });

  /** With `cidr_default` true, all CIDR/host inputs are disabled in the advanced form. */
  test('should have CIDR inputs disabled when default values is checked', async ({ mount }) => {
    const component = await mount(
      <NetworkingSubStepStory clusterOverrides={{ cidr_default: true }} />
    );

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(component.getByRole('textbox', { name: 'Machine CIDR' })).toBeDisabled();
    await expect(component.getByRole('textbox', { name: 'Service CIDR' })).toBeDisabled();
    await expect(component.getByRole('textbox', { name: 'Pod CIDR' })).toBeDisabled();
    await expect(component.getByRole('textbox', { name: 'Host prefix' })).toBeDisabled();
  });

  /** With `cidr_default` false, CIDR/host inputs are editable after expanding advanced. */
  test('should have CIDR inputs enabled when default values is unchecked', async ({ mount }) => {
    const component = await mount(
      <NetworkingSubStepStory clusterOverrides={{ cidr_default: false }} />
    );

    const toggle = component.getByRole('button', {
      name: /Advanced networking configuration \(optional\)/,
    });
    await toggle.click();

    await expect(component.getByRole('textbox', { name: 'Machine CIDR' })).toBeEnabled();
    await expect(component.getByRole('textbox', { name: 'Service CIDR' })).toBeEnabled();
    await expect(component.getByRole('textbox', { name: 'Pod CIDR' })).toBeEnabled();
    await expect(component.getByRole('textbox', { name: 'Host prefix' })).toBeEnabled();
  });
});
