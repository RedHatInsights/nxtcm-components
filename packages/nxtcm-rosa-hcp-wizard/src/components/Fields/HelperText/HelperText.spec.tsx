import { expect, test } from '@/playwright/ct-fixture';

import type { EmptyHelperTextStory, HelperTextStory } from './HelperText.story';

test.describe('HelperText', () => {
  test('renders helper text when provided', async ({ mount }) => {
    const mounted = await mount<typeof HelperTextStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/HelperText/HelperText/HelperTextStory',
      { id: 'f1', helperText: 'Choose a value that fits your workload.' }
    );
    await expect(mounted.getByText('Choose a value that fits your workload.')).toBeVisible();
  });

  test('renders error message when isError and errorMessage are set', async ({ mount }) => {
    const mounted = await mount<typeof HelperTextStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/HelperText/HelperText/HelperTextStory',
      { id: 'f2', isError: true, errorMessage: 'This field is required.' }
    );
    await expect(mounted.getByText('This field is required.')).toBeVisible();
  });

  test('renders nothing when there is no helper text and no error to show', async ({ mount }) => {
    const mounted = await mount<typeof EmptyHelperTextStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/HelperText/HelperText/EmptyHelperTextStory'
    );
    await expect(mounted.getByTestId('anchor')).toBeVisible();
    await expect(mounted.locator('#f3-helper-text')).toHaveCount(0);
  });

  test('renders success message when isSuccess and successMessage are set', async ({ mount }) => {
    const mounted = await mount<typeof HelperTextStory>(
      'nxtcm-rosa-hcp-wizard/components/Fields/HelperText/HelperText/HelperTextStory',
      { id: 'f4', isSuccess: true, successMessage: 'Saved successfully.' }
    );
    await expect(mounted.getByText('Saved successfully.')).toBeVisible();
    await expect(mounted.locator('#f4-helper-text')).toBeVisible();
  });
});
