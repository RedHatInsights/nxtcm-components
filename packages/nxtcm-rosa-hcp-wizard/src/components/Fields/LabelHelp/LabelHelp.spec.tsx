import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type { EmptyLabelHelpStory, LabelHelpStory } from './LabelHelp.story';

test.describe('LabelHelp', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof EmptyLabelHelpStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/EmptyLabelHelpStory'
    );
    await checkAccessibility({ component });
  });

  test('renders nothing when labelHelp is omitted', async ({ mount }) => {
    const mounted = await mount<typeof EmptyLabelHelpStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/EmptyLabelHelpStory'
    );
    await expect(mounted.getByTestId('marker')).toBeVisible();
    await expect(mounted.getByRole('button', { name: 'More info' })).toHaveCount(0);
  });

  test('passes accessibility check with the plain label help popover open', async ({
    mount,
    page,
  }) => {
    await mount<typeof LabelHelpStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/LabelHelpStory',
      {
        id: 'lh-plain',
        labelHelp: 'Use this setting only for test clusters.',
        labelHelpTitle: 'About this field',
      }
    );
    await page.getByRole('button', { name: 'More info' }).click();
    await expect(page.getByText('About this field')).toBeVisible();
    await expect(page.getByText('Use this setting only for test clusters.')).toBeVisible();
    // Include the trigger and the popover content portalled outside the mounted component.
    await checkAccessibility({ component: page.locator('body') });
  });

  test('passes accessibility check with the inline help button popover open', async ({
    mount,
    page,
  }) => {
    await mount<typeof LabelHelpStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/LabelHelp/LabelHelp/LabelHelpStory',
      {
        id: 'lh-btn',
        labelHelp: 'Details go here.',
        labelHelpTitle: 'Help',
        useButton: true,
      }
    );
    await page.getByRole('button', { name: 'More info' }).click();
    await expect(page.getByText('Help', { exact: true })).toBeVisible();
    await expect(page.getByText('Details go here.')).toBeVisible();
    await checkAccessibility({ component: page.locator('body') });
  });
});
