import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

// CT transform only turns an import into importRefs if every specifier is JSX; keep harness imports separate from consts.
import {
  WizFileUploadClearViaButtonHarness,
  WizFileUploadExplicitControlOnlyHarness,
  WizFileUploadExplicitHarness,
  WizFileUploadNestedFallbackHarness,
  WizFileUploadSubmitValidationHarness,
  WizFileUploadYupMetaHarness,
} from './WizFileUpload.spec-helpers';
import {
  WIZ_FILE_UPLOAD_CONTROL_BODY_STATUS,
  WIZ_FILE_UPLOAD_DOC_CLEAR_STATUS,
  WIZ_FILE_UPLOAD_EXPLICIT_HELPER,
  WIZ_FILE_UPLOAD_EXPLICIT_LABEL,
  WIZ_FILE_UPLOAD_NESTED_FIELD_LABEL,
  WIZ_FILE_UPLOAD_NESTED_MANIFEST_STATUS,
  WIZ_FILE_UPLOAD_SUBMIT_ERROR,
  WIZ_FILE_UPLOAD_VALUE_STATUS_LABEL,
  WIZ_FILE_UPLOAD_YUP_META_HELPER,
  WIZ_FILE_UPLOAD_YUP_META_LABEL,
} from './WizFileUpload.spec-helpers';

test.describe('WizFileUpload', () => {
  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount(<WizFileUploadExplicitHarness />);
    await expect(mounted.getByText(WIZ_FILE_UPLOAD_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_FILE_UPLOAD_EXPLICIT_HELPER, { exact: true })).toBeVisible();
  });

  test('writes file contents to react-hook-form when a file is chosen', async ({ mount, page }) => {
    const mounted = await mount(<WizFileUploadExplicitHarness />);
    const status = mounted.getByRole('status', { name: WIZ_FILE_UPLOAD_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

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
    await expect(status).toHaveText('{"auths":{}}');
  });

  test('derives label and helper text from Yup schema meta when props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount(<WizFileUploadYupMetaHarness />);
    await expect(mounted.getByText(WIZ_FILE_UPLOAD_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_FILE_UPLOAD_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when the field is empty', async ({ mount }) => {
    const mounted = await mount(<WizFileUploadSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_FILE_UPLOAD_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user uploads a file and submits again', async ({
    mount,
    page,
  }) => {
    const mounted = await mount(<WizFileUploadSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_FILE_UPLOAD_SUBMIT_ERROR, { exact: true })).toBeVisible();

    const fileChooserPromise = page.waitForEvent('filechooser');
    await mounted.getByRole('button', { name: /browse/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'secret.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{}'),
    });

    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(
      mounted.getByText(WIZ_FILE_UPLOAD_SUBMIT_ERROR, { exact: true })
    ).not.toBeVisible();
  });

  test('writes nested-path uploads into react-hook-form state', async ({ mount, page }) => {
    const mounted = await mount(<WizFileUploadNestedFallbackHarness />);
    await expect(
      mounted.getByText(WIZ_FILE_UPLOAD_NESTED_FIELD_LABEL, { exact: true })
    ).toBeVisible();
    const status = mounted.getByRole('status', {
      name: WIZ_FILE_UPLOAD_NESTED_MANIFEST_STATUS,
    });
    await expect(status).toHaveText('(empty)');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await mounted.getByRole('button', { name: /browse/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'bundle.yaml',
      mimeType: 'text/yaml',
      buffer: Buffer.from('apiVersion: demo'),
    });

    await expect(status).toHaveText('apiVersion: demo');
  });

  test('clears uploaded text from react-hook-form when the user clicks Clear', async ({
    mount,
    page,
  }) => {
    const mounted = await mount(<WizFileUploadClearViaButtonHarness />);
    const status = mounted.getByRole('status', {
      name: WIZ_FILE_UPLOAD_DOC_CLEAR_STATUS,
    });
    const fileChooserPromise = page.waitForEvent('filechooser');
    await mounted.getByRole('button', { name: /browse/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'temp.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('payload'),
    });
    await expect(status).toHaveText('payload');

    await mounted.getByRole('button', { name: 'Clear' }).click();
    await expect(status).toHaveText('(empty)');
  });

  test('binds uploads through the control prop without a FormProvider wrapper', async ({
    mount,
    page,
  }) => {
    const mounted = await mount(<WizFileUploadExplicitControlOnlyHarness />);
    const status = mounted.getByRole('status', {
      name: WIZ_FILE_UPLOAD_CONTROL_BODY_STATUS,
    });
    await expect(status).toHaveText('(empty)');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await mounted.getByRole('button', { name: /browse/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'body.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hi'),
    });
    await expect(status).toHaveText('hi');
  });
});
