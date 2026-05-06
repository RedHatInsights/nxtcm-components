import { test, expect } from '@playwright/experimental-ct-react';

// CT transform only turns an import into importRefs if every specifier is JSX; keep harness imports separate from consts.
import { TwoRadioHarness } from './Radio.spec-helpers';
import {
  RADIO_HARNESS_EAST_DESCRIPTION,
  RADIO_HARNESS_SELECTED_STATUS_LABEL,
  RADIO_HARNESS_US_WEST_LABEL,
  RADIO_HARNESS_VALUE_WEST,
} from './Radio.spec-helpers';

test.describe('Radio (with RadioGroupContext)', () => {
  test('renders description on the selected radio', async ({ mount }) => {
    const mounted = await mount(<TwoRadioHarness />);
    await expect(mounted.getByText(RADIO_HARNESS_EAST_DESCRIPTION)).toBeVisible();
  });

  test('calls context setValue when a radio is selected', async ({ mount }) => {
    const mounted = await mount(<TwoRadioHarness />);
    await mounted.getByRole('radio', { name: RADIO_HARNESS_US_WEST_LABEL }).click();
    await expect(
      mounted.getByRole('status', { name: RADIO_HARNESS_SELECTED_STATUS_LABEL })
    ).toHaveText(RADIO_HARNESS_VALUE_WEST);
    await expect(mounted.getByRole('radio', { name: RADIO_HARNESS_US_WEST_LABEL })).toBeChecked();
  });
});
