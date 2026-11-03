import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  RadioGroupHarness,
  RadioGroupWithoutLabelHarness,
  RadioWithChildHarness,
} from './RadioGroup.story';
import {
  RADIO_GROUP_HARNESS_HELPER_TEXT,
  RADIO_GROUP_HARNESS_LARGE_LABEL,
  RADIO_GROUP_HARNESS_MACHINE_TYPE_LABEL,
  RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS,
  RADIO_GROUP_HARNESS_PLAN_B_LABEL,
  RADIO_GROUP_HARNESS_SELECTED_STATUS_LABEL,
  RADIO_GROUP_HARNESS_SMALL_LABEL,
  RADIO_GROUP_HARNESS_VALUE_LARGE,
} from './RadioGroup.story-data';

test.describe('RadioGroup', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof RadioGroupHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness'
    );
    await checkAccessibility({ component });
  });

  test('passes accessibility check when required', async ({ mount }) => {
    const component = await mount<typeof RadioGroupHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness',
      { isRequired: true }
    );
    await expect(component.getByText('*', { exact: true })).toBeVisible();
    await checkAccessibility({ component });
  });

  test('passes accessibility check with error feedback', async ({ mount }) => {
    const component = await mount<typeof RadioGroupHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness',
      { isError: true, errorMessage: 'Choose a valid value.' }
    );
    await expect(component.getByText('Choose a valid value.', { exact: true })).toBeVisible();
    await checkAccessibility({ component });
  });

  test('passes accessibility check with no selection', async ({ mount }) => {
    const component = await mount<typeof RadioGroupHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness',
      { initial: null }
    );
    await expect(
      component.getByRole('radio', { name: RADIO_GROUP_HARNESS_SMALL_LABEL })
    ).not.toBeChecked();
    await expect(
      component.getByRole('radio', { name: RADIO_GROUP_HARNESS_LARGE_LABEL })
    ).not.toBeChecked();
    await checkAccessibility({ component });
  });

  test('renders radios inside a radiogroup with helper text', async ({ mount }) => {
    const mounted = await mount<typeof RadioGroupHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness'
    );
    await expect(
      mounted.getByRole('radiogroup', { name: RADIO_GROUP_HARNESS_MACHINE_TYPE_LABEL })
    ).toBeVisible();
    await expect(
      mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_SMALL_LABEL })
    ).toBeVisible();
    await expect(
      mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_LARGE_LABEL })
    ).toBeVisible();
    await expect(mounted.getByText(RADIO_GROUP_HARNESS_HELPER_TEXT)).toBeVisible();
  });

  test('updates selection when a different radio is chosen', async ({ mount }) => {
    const mounted = await mount<typeof RadioGroupHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness'
    );
    await mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_LARGE_LABEL }).click();
    await expect(
      mounted.getByRole('status', { name: RADIO_GROUP_HARNESS_SELECTED_STATUS_LABEL })
    ).toHaveText(RADIO_GROUP_HARNESS_VALUE_LARGE);
    await expect(
      mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_LARGE_LABEL })
    ).toBeChecked();
    await checkAccessibility({ component: mounted });
  });

  test('renders radios without a FormGroup label when label is omitted', async ({ mount }) => {
    const mounted = await mount<typeof RadioGroupWithoutLabelHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupWithoutLabelHarness'
    );
    const radiogroup = mounted.getByRole('radiogroup');
    await expect(radiogroup).toBeVisible();
    await expect(radiogroup).toHaveAccessibleName('');
    await expect(
      mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_SMALL_LABEL })
    ).toBeVisible();
    await expect(mounted.getByText(RADIO_GROUP_HARNESS_HELPER_TEXT)).toBeVisible();
  });

  test('shows radio body content only for the selected option', async ({ mount }) => {
    const mounted = await mount<typeof RadioWithChildHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioWithChildHarness'
    );
    await expect(mounted.getByText(RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS)).toBeVisible();
    await mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_PLAN_B_LABEL }).click();
    await expect(mounted.getByText(RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS)).toHaveCount(0);
  });
});
