import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

// Playwright CT Babel: only strip/replace imports when every specifier is a JSX component.
// Split harness vs constants (same pattern as WizSelect.spec.tsx + WizSelect.spec-helpers.tsx).
import {
  WizMultiSelectApiErrorHarness,
  WizMultiSelectExplicitControlOnlyHarness,
  WizMultiSelectExplicitHarness,
  WizMultiSelectSubmitValidationHarness,
  WizMultiSelectYupMetaHarness,
} from './WizMultiSelect.spec-helpers';
import {
  WIZ_MULTI_API_ERROR_DETAIL,
  WIZ_MULTI_API_ERROR_FIELD_LABEL,
  WIZ_MULTI_CONTROL_ONLY_STATUS,
  WIZ_MULTI_EXPLICIT_HELPER,
  WIZ_MULTI_EXPLICIT_LABEL,
  WIZ_MULTI_EXPLICIT_TOGGLE_NAME,
  WIZ_MULTI_ONLY_CONTROL_TOGGLE,
  WIZ_MULTI_SUBMIT_ERROR,
  WIZ_MULTI_SUBMIT_TOGGLE_NAME,
  WIZ_MULTI_VALUE_STATUS_LABEL,
  WIZ_MULTI_YUP_META_HELPER,
  WIZ_MULTI_YUP_META_LABEL,
} from './WizMultiSelect.spec-helpers';

test.describe('WizMultiSelect', () => {
  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount(<WizMultiSelectExplicitHarness />);
    await expect(mounted.getByText(WIZ_MULTI_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_MULTI_EXPLICIT_HELPER, { exact: true })).toBeVisible();
  });

  test('writes selected options to react-hook-form', async ({ mount, page }) => {
    await mount(<WizMultiSelectExplicitHarness />);
    const status = page.getByRole('status', { name: WIZ_MULTI_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    await page.getByRole('button', { name: WIZ_MULTI_EXPLICIT_TOGGLE_NAME }).click();
    const listbox = page.locator('#wiz-multi-ct-explicit-listbox');
    await expect(listbox).toBeVisible();
    await listbox.getByText('eu-west-1', { exact: true }).click();
    await listbox.getByText('us-east-1', { exact: true }).click();

    await expect(status).toHaveText('eu-west-1,us-east-1');
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount(<WizMultiSelectYupMetaHarness />);
    await expect(mounted.getByText(WIZ_MULTI_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_MULTI_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when nothing is selected', async ({ mount }) => {
    const mounted = await mount(<WizMultiSelectSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(mounted.getByText(WIZ_MULTI_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user selects values and submits again', async ({
    mount,
    page,
  }) => {
    await mount(<WizMultiSelectSubmitValidationHarness />);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_MULTI_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: WIZ_MULTI_SUBMIT_TOGGLE_NAME }).click();
    const submitList = page.locator('#wiz-multi-ct-submit-listbox');
    await expect(submitList).toBeVisible();
    await submitList.getByText('us-east-1', { exact: true }).click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_MULTI_SUBMIT_ERROR, { exact: true })).not.toBeVisible();
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount, page }) => {
    await mount(<WizMultiSelectExplicitControlOnlyHarness />);
    const status = page.getByRole('status', { name: WIZ_MULTI_CONTROL_ONLY_STATUS });
    await expect(status).toHaveText('(empty)');
    await page.getByRole('button', { name: WIZ_MULTI_ONLY_CONTROL_TOGGLE }).click();
    await page
      .locator('#wiz-multi-ct-control-only-listbox')
      .getByText('alpha', { exact: true })
      .click();
    await expect(status).toHaveText('alpha');
  });

  test('wraps the field in FieldWithAPIErrorAlert when apiError is set', async ({
    mount,
    page,
  }) => {
    const mounted = await mount(<WizMultiSelectApiErrorHarness />);
    await expect(
      mounted.getByText(`Error loading ${WIZ_MULTI_API_ERROR_FIELD_LABEL} list`)
    ).toBeVisible();
    await mounted.getByRole('button', { name: 'Show error details' }).click();
    await expect(page.getByText(WIZ_MULTI_API_ERROR_DETAIL)).toBeVisible({ timeout: 10_000 });
  });
});
