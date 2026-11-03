import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { NumberHarness } from './NumberInput.story';

// Match NUMBER_HARNESS_FIELD_LABEL in the gallery story.
const workerCountLabel = 'Worker count';

test.describe('NumberInput', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness'
    );
    await checkAccessibility({ component });
  });

  test('passes accessibility check when required', async ({ mount }) => {
    const component = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { isRequired: true }
    );
    await expect(component.getByText('*', { exact: true })).toBeVisible();
    await checkAccessibility({ component });
  });

  test('passes accessibility check with error feedback', async ({ mount }) => {
    const component = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { isError: true, errorMessage: 'Choose a valid value.' }
    );
    await expect(component.getByText('Choose a valid value.', { exact: true })).toBeVisible();
    await checkAccessibility({ component });
  });

  test('renders label and default placeholder from label', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness'
    );
    await expect(mounted.getByText(workerCountLabel)).toBeVisible();
    await expect(
      mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') })
    ).toBeVisible();
    await expect(mounted.getByPlaceholder('Enter the worker count')).toBeVisible();
  });

  test('increments value when the plus control is activated', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { initial: 1 }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(spinbutton).toHaveValue('2');
    await checkAccessibility({ component: mounted });
  });

  test('decrements to zero in the field when zeroIsUndefined is true', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { zeroIsUndefined: true, initial: 1 }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await mounted.getByRole('button', { name: 'Minus' }).click();
    await expect(spinbutton).toHaveValue('');
  });
});
