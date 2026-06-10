import { expect, test } from '@playwright/experimental-ct-react';
import { ClusterUpgrade } from '../../../types';
import {
  defaultRosaHcpWizardStrings,
  defaultRosaHcpWizardValidatorStrings,
} from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import { ClusterUpdatesMount } from './ClusterUpdates.spec-helpers';

const cu = defaultRosaHcpWizardStrings.clusterUpdates;
const REQUIRED_FIELD_MESSAGE = defaultRosaHcpWizardValidatorStrings.commonRequired;

test.describe('ClusterUpdates (ROSA HCP)', () => {
  test('should render the cluster update strategy section', async ({ mount }) => {
    const component = await mount(<ClusterUpdatesMount />);
    await expect(component.getByText(cu.sectionLabel, { exact: true })).toBeVisible();
  });

  test('should render upgrade strategy radio options', async ({ mount }) => {
    const component = await mount(<ClusterUpdatesMount />);
    await expect(component.getByRole('radio', { name: cu.individualLabel })).toBeVisible();
    await expect(component.getByRole('radio', { name: cu.recurringLabel })).toBeVisible();
  });

  test('should not render a duplicate upgrade policy field label', async ({ mount }) => {
    const component = await mount(<ClusterUpdatesMount />);
    await expect(component.getByText(cu.upgradePolicyLabel, { exact: true })).toHaveCount(1);
    const radiogroup = component.getByRole('radiogroup');
    await expect(radiogroup).toBeVisible();
    await expect(radiogroup).toHaveAccessibleName('');
  });

  test('should show day and time selectors when recurring updates is selected by default', async ({
    mount,
  }) => {
    const component = await mount(<ClusterUpdatesMount />);
    await expect(component.getByRole('radio', { name: cu.recurringLabel })).toBeChecked();
    await expect(component.getByText(cu.dayTimeLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: cu.selectDayPlaceholder })).toBeVisible();
  });

  test('should hide day and time selectors when individual updates is selected', async ({
    mount,
    page,
  }) => {
    const component = await mount(<ClusterUpdatesMount />);

    await component.getByRole('radio', { name: cu.individualLabel }).click();
    await expect(component.getByText(cu.dayTimeLabel, { exact: true })).not.toBeVisible();
    await expect(page.getByRole('button', { name: cu.selectDayPlaceholder })).not.toBeVisible();
  });

  test('should show day and time selectors after selecting recurring updates', async ({
    mount,
  }) => {
    const component = await mount(
      <ClusterUpdatesMount defaultValues={{ upgrade_policy: ClusterUpgrade.manual }} />
    );

    await component.getByRole('radio', { name: cu.recurringLabel }).click();

    await expect(component.getByText(cu.dayTimeLabel, { exact: true })).toBeVisible();
    await expect(component.getByRole('button', { name: cu.selectDayPlaceholder })).toBeVisible();
  });

  test('should update upgrade schedule when day and time are selected', async ({ mount, page }) => {
    const component = await mount(
      <ClusterUpdatesMount defaultValues={{ upgrade_policy: ClusterUpgrade.automatic }} />
    );

    await component.getByRole('button', { name: cu.selectDayPlaceholder }).click();
    await page.getByRole('option', { name: 'Monday', exact: true }).click();

    await component.getByRole('button', { name: cu.selectTimePlaceholder }).click();
    await page.getByRole('option', { name: '09:00 UTC', exact: true }).click();

    await expect(component.getByRole('button', { name: 'Monday' })).toBeVisible();
    await expect(component.getByRole('button', { name: '09:00 UTC' })).toBeVisible();
  });

  test('should require day and time when automatic updates is selected without a schedule', async ({
    mount,
  }) => {
    const component = await mount(
      <ClusterUpdatesMount
        defaultValues={{ upgrade_policy: ClusterUpgrade.automatic, upgrade_schedule: '' }}
      />
    );

    await component.getByRole('button', { name: 'Validate' }).click();
    await expect(component.getByText(REQUIRED_FIELD_MESSAGE, { exact: true })).toBeVisible();
  });
});
