import { expect, test } from '@/ct-fixture';
import {
  CHECKBOX_HARNESS_HELPER_TEXT,
  CHECKBOX_HARNESS_LABEL,
  CHECKBOX_HARNESS_TITLE,
} from './Checkbox.story-data';

test.describe('Checkbox', () => {
  test('renders title, label, and helper text', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxHarness'
    );
    await expect(mounted.getByRole('group', { name: CHECKBOX_HARNESS_TITLE })).toBeVisible();
    await expect(mounted.getByText(CHECKBOX_HARNESS_LABEL)).toBeVisible();
    await expect(mounted.getByText(CHECKBOX_HARNESS_HELPER_TEXT)).toBeVisible();
  });

  test('toggles checked state when the user clicks the checkbox', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxHarness'
    );
    const checkboxInput = mounted.getByRole('checkbox', {
      name: new RegExp(CHECKBOX_HARNESS_LABEL, 'i'),
    });
    await expect(checkboxInput).not.toBeChecked();
    await checkboxInput.click();
    await expect(checkboxInput).toBeChecked();
    await checkboxInput.click();
    await expect(checkboxInput).not.toBeChecked();
  });

  test('shows error helper when isError and errorMessage are set', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxErrorStory'
    );
    await expect(mounted.getByText('You must accept to continue.')).toBeVisible();
  });
});
