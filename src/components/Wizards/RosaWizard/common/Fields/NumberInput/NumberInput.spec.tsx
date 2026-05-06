import { test, expect } from '@playwright/experimental-ct-react';

import { NumberHarness } from './NumberInput.spec-helpers';

// Match NUMBER_HARNESS_FIELD_LABEL in spec-helpers (importing both breaks Playwright CT mount).
const workerCountLabel = 'Worker count';

test.describe('NumberInput', () => {
  test('renders label and default placeholder from label', async ({ mount }) => {
    const mounted = await mount(<NumberHarness />);
    await expect(mounted.getByText(workerCountLabel)).toBeVisible();
    await expect(
      mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') })
    ).toBeVisible();
    await expect(mounted.getByPlaceholder('Enter the worker count')).toBeVisible();
  });

  test('increments value when the plus control is activated', async ({ mount }) => {
    const mounted = await mount(<NumberHarness initial={1} />);
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(spinbutton).toHaveValue('2');
  });

  test('decrements to zero in the field when zeroIsUndefined is true', async ({ mount }) => {
    const mounted = await mount(<NumberHarness zeroIsUndefined initial={1} />);
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await mounted.getByRole('button', { name: 'Minus' }).click();
    await expect(spinbutton).toHaveValue('');
  });
});
