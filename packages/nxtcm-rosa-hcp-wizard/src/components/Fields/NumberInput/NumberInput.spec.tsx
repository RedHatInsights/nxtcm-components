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
    const input = mounted.getByRole('spinbutton', { name: workerCountLabel, exact: true });
    await expect(input).toHaveAttribute('id', 'ct-num');
    await expect(input).toHaveAttribute('placeholder', 'Enter the worker count');
    await expect(input).toHaveValue('2');
    await mounted.getByText(workerCountLabel, { exact: true }).click();
    await expect(input).toBeFocused();
    await checkAccessibility({ component: mounted });
  });

  test('describes the numeric input with its helper text', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { helperText: 'Choose the number of workers.' }
    );
    await expect(mounted.getByRole('spinbutton')).toHaveAccessibleDescription(
      'Choose the number of workers.'
    );
    await checkAccessibility({ component: mounted });
  });

  test('describes an invalid numeric input with its validation error', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      {
        helperText: 'Choose the number of workers.',
        errorMessage: 'Choose at least one worker.',
        isError: true,
        initial: 0,
      }
    );
    const input = mounted.getByRole('spinbutton');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(/Choose at least one worker\./);
    await checkAccessibility({ component: mounted });
  });

  test('restores helper text and removes stale error references when validation clears', async ({
    mount,
  }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { errorMessage: 'Choose at least one worker.', isError: true }
    );
    const input = mounted.getByRole('spinbutton');
    await expect(input).toHaveAccessibleDescription(/Choose at least one worker\./);

    await mounted.update({
      helperText: 'Choose the number of workers.',
      errorMessage: 'Choose at least one worker.',
      isError: false,
    });
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await expect(input).toHaveAccessibleDescription('Choose the number of workers.');

    await mounted.update({ errorMessage: 'Choose at least one worker.', isError: false });
    await expect(input).not.toHaveAttribute('aria-describedby');
    await expect(input).toHaveAccessibleDescription('');
    await checkAccessibility({ component: mounted });
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
    await expect(spinbutton).toHaveAccessibleName(workerCountLabel);
    await expect(spinbutton).not.toHaveAttribute('aria-describedby');
    await checkAccessibility({ component: mounted });
  });

  test('describes the spinbutton with helper text', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { helperText: 'Use a whole number.' }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await expect(mounted.getByText('Use a whole number.')).toBeVisible();
    await expect(spinbutton).toHaveAttribute('aria-describedby', 'ct-num-helper-text');
    await expect(mounted.locator('#ct-num-helper-text')).toBeVisible();
  });

  test('preserves caller and helper descriptions on the spinbutton', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      {
        helperText: 'Use a whole number.',
        inputProps: { 'aria-describedby': 'caller-description' },
      }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });

    await expect(spinbutton).toHaveAttribute(
      'aria-describedby',
      'caller-description ct-num-helper-text'
    );
  });

  test('describes the spinbutton with an error message', async ({ mount }) => {
    const mounted = await mount<typeof NumberHarness>(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { errorMessage: 'Enter a valid worker count.', isError: true }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });

    await expect(spinbutton).toHaveAttribute('aria-describedby', 'ct-num-helper-text');
    await expect(mounted.locator('#ct-num-helper-text')).toContainText(
      'Enter a valid worker count.'
    );
  });
});
