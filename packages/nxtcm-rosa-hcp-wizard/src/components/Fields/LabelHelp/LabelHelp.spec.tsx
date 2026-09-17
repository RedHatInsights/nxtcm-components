import { expect, test } from '@/ct-fixture';

test.describe('LabelHelp', () => {
  test('renders nothing when labelHelp is omitted', async ({ mount }) => {
    const mounted = await mount(
      'nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/EmptyLabelHelpStory'
    );
    await expect(mounted.getByTestId('marker')).toBeVisible();
    await expect(mounted.getByRole('button', { name: 'More info' })).toHaveCount(0);
  });

  test('opens popover from plain label help control', async ({ mount, page }) => {
    await mount('nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/LabelHelpStory', {
      id: 'lh-plain',
      labelHelp: 'Use this setting only for test clusters.',
      labelHelpTitle: 'About this field',
    });
    await page.getByRole('button', { name: 'More info' }).click();
    await expect(page.getByText('About this field')).toBeVisible();
    await expect(page.getByText('Use this setting only for test clusters.')).toBeVisible();
  });

  test('opens popover from inline help button when useButton is true', async ({ mount, page }) => {
    await mount('nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/LabelHelpStory', {
      id: 'lh-btn',
      labelHelp: 'Details go here.',
      labelHelpTitle: 'Help',
      useButton: true,
    });
    await page.locator('#lh-btn-label-help-button').click();
    await expect(page.getByText('Details go here.')).toBeVisible();
  });
});
