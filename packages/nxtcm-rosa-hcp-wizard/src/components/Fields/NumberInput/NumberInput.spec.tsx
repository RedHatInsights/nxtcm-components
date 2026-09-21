import { expect, test } from '@/ct-fixture';

// Match NUMBER_HARNESS_FIELD_LABEL in the gallery story.
const workerCountLabel = 'Worker count';

test.describe('NumberInput', () => {
  test('renders label and default placeholder from label', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness'
    );
    await expect(mounted.getByText(workerCountLabel)).toBeVisible();
    await expect(
      mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') })
    ).toBeVisible();
    await expect(mounted.getByPlaceholder('Enter the worker count')).toBeVisible();
  });

  test('increments value when the plus control is activated', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { initial: 1 }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(spinbutton).toHaveValue('2');
  });

  test('decrements to zero in the field when zeroIsUndefined is true', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/NumberInput/NumberInput/NumberHarness',
      { zeroIsUndefined: true, initial: 1 }
    );
    const spinbutton = mounted.getByRole('spinbutton', { name: new RegExp(workerCountLabel, 'i') });
    await mounted.getByRole('button', { name: 'Minus' }).click();
    await expect(spinbutton).toHaveValue('');
  });
});
