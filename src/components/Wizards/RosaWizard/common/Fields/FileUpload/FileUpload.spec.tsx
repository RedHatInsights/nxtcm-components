import { test, expect } from '@playwright/experimental-ct-react';

import {
  FILE_UPLOAD_HARNESS_HELPER_TEXT,
  FILE_UPLOAD_HARNESS_LABEL,
} from './FileUpload.spec-helpers';
import { FileUploadHarness } from './FileUpload.spec-helpers';

test.describe('FileUpload', () => {
  test('renders label and helper text', async ({ mount: mountComponent }) => {
    const mounted = await mountComponent(<FileUploadHarness />);
    await expect(mounted.getByText(FILE_UPLOAD_HARNESS_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(FILE_UPLOAD_HARNESS_HELPER_TEXT)).toBeVisible();
  });

  test('accepts a file and shows the filename', async ({ mount: mountComponent, page }) => {
    const mounted = await mountComponent(<FileUploadHarness />);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await mounted.getByRole('button', { name: /browse/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'pull-secret.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"auths":{}}'),
    });
    await expect(mounted.getByRole('textbox', { name: /read only filename/i })).toHaveValue(
      'pull-secret.json'
    );
  });
});
