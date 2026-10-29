import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { CheckboxErrorStory, CheckboxHarness } from './Checkbox.story';
import {
  CHECKBOX_HARNESS_HELPER_TEXT,
  CHECKBOX_HARNESS_LABEL,
  CHECKBOX_HARNESS_TITLE,
} from './Checkbox.story-data';

test.describe('Checkbox', () => {
  test('passes accessibility check in the default unchecked state', async ({ mount }) => {
    const component = await mount<typeof CheckboxHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxHarness'
    );
    const checkbox = component.getByRole('checkbox', { name: CHECKBOX_HARNESS_LABEL });
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveAccessibleDescription(CHECKBOX_HARNESS_HELPER_TEXT);
    await checkAccessibility({ component });
  });

  test('renders title, label, and helper text', async ({ mount }) => {
    const mounted = await mount<typeof CheckboxHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxHarness'
    );
    await expect(mounted.getByRole('group', { name: CHECKBOX_HARNESS_TITLE })).toBeVisible();
    await expect(mounted.getByText(CHECKBOX_HARNESS_LABEL)).toBeVisible();
    await expect(mounted.getByText(CHECKBOX_HARNESS_HELPER_TEXT)).toBeVisible();
  });

  test('passes accessibility checks after checking and unchecking', async ({ mount }) => {
    const mounted = await mount<typeof CheckboxHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxHarness'
    );
    const checkboxInput = mounted.getByRole('checkbox', {
      name: new RegExp(CHECKBOX_HARNESS_LABEL, 'i'),
    });
    await expect(checkboxInput).not.toBeChecked();
    await checkboxInput.click();
    await expect(checkboxInput).toBeChecked();
    await checkAccessibility({ component: mounted });
    await checkboxInput.click();
    await expect(checkboxInput).not.toBeChecked();
    await checkAccessibility({ component: mounted });
  });

  test('passes accessibility check with an error message', async ({ mount }) => {
    const mounted = await mount<typeof CheckboxErrorStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/Checkbox/Checkbox/CheckboxErrorStory'
    );
    await expect(mounted.getByText('You must accept to continue.')).toBeVisible();
    await expect(mounted.getByRole('checkbox', { name: 'I agree' })).toHaveAccessibleDescription(
      /You must accept to continue\.\s*:\s*error status;/
    );
    await checkAccessibility({ component: mounted });
  });
});
