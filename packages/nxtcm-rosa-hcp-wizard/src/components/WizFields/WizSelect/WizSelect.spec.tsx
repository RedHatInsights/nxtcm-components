import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

import {
  WizSelectExplicitControlOnlyHarness,
  WizSelectExplicitHarness,
  WizSelectExplicitPropsOverrideMetaHarness,
  WizSelectNestedFallbackHarness,
  WizSelectNumericMetaLabelHarness,
  WizSelectSubmitValidationHarness,
  WizSelectTypeaheadClearHarness,
  WizSelectYupMetaHarness,
} from './WizSelect.spec-helpers';
import {
  WIZ_SELECT_CONTROL_ONLY_STATUS,
  WIZ_SELECT_EXPLICIT_HELPER,
  WIZ_SELECT_EXPLICIT_LABEL,
  WIZ_SELECT_EXPLICIT_TOGGLE_NAME,
  WIZ_SELECT_META_LOSER_HELPER,
  WIZ_SELECT_META_LOSER_LABEL,
  WIZ_SELECT_NESTED_LABEL_TOGGLE,
  WIZ_SELECT_NUMERIC_TOGGLE,
  WIZ_SELECT_ONLY_CONTROL_TOGGLE,
  WIZ_SELECT_OVERRIDE_HELPER,
  WIZ_SELECT_OVERRIDE_LABEL,
  WIZ_SELECT_SUBMIT_TOGGLE_NAME,
  WIZ_SELECT_SUBMIT_ERROR,
  WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL,
  WIZ_SELECT_VALUE_STATUS_LABEL,
  WIZ_SELECT_YUP_META_HELPER,
  WIZ_SELECT_YUP_META_LABEL,
  WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS,
  WIZ_SELECT_TYPEAHEAD_CLEAR_TOGGLE,
} from './WizSelect.spec-helpers';

test.describe('WizSelect', () => {
  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount(<WizSelectExplicitHarness />);
    await expect(mounted.getByText(WIZ_SELECT_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_EXPLICIT_HELPER, { exact: true })).toBeVisible();
  });

  test('writes the selected option to react-hook-form when the user picks from the menu', async ({
    mount,
    page,
  }) => {
    await mount(<WizSelectExplicitHarness />);
    const status = page.getByRole('status', { name: WIZ_SELECT_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    await page.getByRole('button', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME }).click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();

    await expect(status).toHaveText('eu-west-1');
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount(<WizSelectYupMetaHarness />);
    await expect(mounted.getByText(WIZ_SELECT_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when no option is selected', async ({ mount }) => {
    const mounted = await mount(<WizSelectSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(mounted.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user selects a value and submits again', async ({
    mount,
    page,
  }) => {
    await mount(<WizSelectSubmitValidationHarness />);
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: WIZ_SELECT_SUBMIT_TOGGLE_NAME }).click();
    await page.getByRole('option', { name: 'us-east-1' }).click();

    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).not.toBeVisible();
  });

  test('uses nested path fallback labels and records the chosen option in the form', async ({
    mount,
    page,
  }) => {
    await mount(<WizSelectNestedFallbackHarness />);
    await expect(page.getByRole('button', { name: WIZ_SELECT_NESTED_LABEL_TOGGLE })).toBeVisible();
    await page.getByRole('button', { name: WIZ_SELECT_NESTED_LABEL_TOGGLE }).click();
    await page.getByRole('option', { name: 'subnet-a' }).click();
    await expect(
      page.getByRole('status', { name: WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL })
    ).toHaveText('subnet-a');
  });

  test('prefers explicit label and helper props over Yup .meta()', async ({ mount }) => {
    const mounted = await mount(<WizSelectExplicitPropsOverrideMetaHarness />);
    await expect(mounted.getByText(WIZ_SELECT_OVERRIDE_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_OVERRIDE_HELPER, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_META_LOSER_LABEL, { exact: true })).toHaveCount(0);
    await expect(mounted.getByText(WIZ_SELECT_META_LOSER_HELPER, { exact: true })).toHaveCount(0);
  });

  test('shows a stringified numeric Yup .meta() label on the collapsed plain select', async ({
    mount,
    page,
  }) => {
    await mount(<WizSelectNumericMetaLabelHarness />);
    await expect(page.getByRole('button', { name: WIZ_SELECT_NUMERIC_TOGGLE })).toBeVisible();
  });

  test('clears react-hook-form value when the typeahead clear control is pressed', async ({
    mount,
    page,
  }) => {
    await mount(<WizSelectTypeaheadClearHarness />);
    const status = page.getByRole('status', { name: WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS });
    const combo = page.getByRole('combobox', { name: WIZ_SELECT_TYPEAHEAD_CLEAR_TOGGLE });

    await combo.click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await expect(status).toHaveText('eu-west-1');

    await page.getByRole('button', { name: 'Clear selection' }).click();
    await expect(status).toHaveText('(empty)');
    await expect(combo).toHaveValue('');
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount, page }) => {
    await mount(<WizSelectExplicitControlOnlyHarness />);
    const status = page.getByRole('status', { name: WIZ_SELECT_CONTROL_ONLY_STATUS });
    await expect(status).toHaveText('(empty)');
    await page.getByRole('button', { name: WIZ_SELECT_ONLY_CONTROL_TOGGLE }).click();
    await page.getByRole('option', { name: 'alpha' }).click();
    await expect(status).toHaveText('alpha');
  });
});
