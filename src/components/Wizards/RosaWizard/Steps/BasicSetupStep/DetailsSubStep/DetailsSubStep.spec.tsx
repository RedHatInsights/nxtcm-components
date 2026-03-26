import { test, expect } from '@playwright/experimental-ct-react';
import { checkAccessibility } from '../../../../../../test-helpers';
import { DetailsSubStepStory } from './DetailsSubStep.story';
import type { Resource, SelectDropdownType } from '../../../../types';

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

  test('should render Details section with cluster name input', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Details', { exact: true })).toBeVisible();
    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
  });

  test('should render OpenShift version select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('OpenShift version', { exact: true })).toBeVisible();
  });

  test('should render AWS infrastructure account select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(
      component.getByText('Associated AWS infrastructure account', { exact: true })
    ).toBeVisible();
  });

  test('should render billing account select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(
      component.getByText('Associated AWS billing account', { exact: true })
    ).toBeVisible();
  });

  test('should render region select', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Region', { exact: true })).toBeVisible();
  });

  test('should disable OpenShift version select when versions are pending', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory versionsIsPending={true} />);

    const versionToggle = component.locator('#cluster-cluster_version .pf-v6-c-menu-toggle');
    await expect(versionToggle).toHaveClass(/pf-m-disabled/);
  });

  test('should render with empty options', async ({ mount }) => {
    const component = await mount(
      <DetailsSubStepStory
        openShiftVersions={[]}
        regions={mockResource<SelectDropdownType[]>([])}
        awsInfrastructureAccounts={mockResource<SelectDropdownType[]>([])}
        awsBillingAccounts={mockResource<SelectDropdownType[]>([])}
      />
    );

    await expect(component.getByText('Details', { exact: true })).toBeVisible();
    await expect(component.getByText('Cluster name', { exact: true })).toBeVisible();
  });

  test('should allow typing in the cluster name field', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
    await nameInput.fill('my-cluster');

    await expect(nameInput).toHaveValue('my-cluster');
  });

  test('should render "Associate a new account" link', async ({ mount }) => {
    const component = await mount(<DetailsSubStepStory />);

    await expect(component.getByText('Associate a new AWS account')).toBeVisible();
  });
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

  test('should display async validation error from clusterNameValidation prop', async ({
    mount,
  }) => {
    const component = await mount(
      <DetailsSubStepStory
        clusterNameValidation={{
          error: 'Cluster name "taken" already exists.',
          isFetching: false,
        }}
        clusterOverrides={{ name: 'taken' }}
      />
    );

    const nameInput = component.getByRole('textbox', { name: /Cluster name/ });
    await nameInput.click();
    await nameInput.blur();

    await expect(component.getByText('Cluster name "taken" already exists.')).toBeVisible();
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

  test('should not show validation error before blur when validateOnBlur is active', async ({
    mount,
  }) => {
    const component = await mount(
      <DetailsSubStepStory
        clusterNameValidation={{
          error: 'Name is taken.',
          isFetching: false,
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
