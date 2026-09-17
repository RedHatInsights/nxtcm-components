import { test, expect } from '@/ct-fixture';
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
  test('renders radios inside a radiogroup with helper text', async ({ mount }) => {
    const mounted = await mount(
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
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioGroupHarness'
    );
    await mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_LARGE_LABEL }).click();
    await expect(
      mounted.getByRole('status', { name: RADIO_GROUP_HARNESS_SELECTED_STATUS_LABEL })
    ).toHaveText(RADIO_GROUP_HARNESS_VALUE_LARGE);
    await expect(
      mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_LARGE_LABEL })
    ).toBeChecked();
  });

  test('renders radios without a FormGroup label when label is omitted', async ({ mount }) => {
    const mounted = await mount(
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
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/RadioGroup/RadioGroup/RadioWithChildHarness'
    );
    await expect(mounted.getByText(RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS)).toBeVisible();
    await mounted.getByRole('radio', { name: RADIO_GROUP_HARNESS_PLAN_B_LABEL }).click();
    await expect(mounted.getByText(RADIO_GROUP_HARNESS_PLAN_A_EXTRA_DETAILS)).toHaveCount(0);
  });
});
