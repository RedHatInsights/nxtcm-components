import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

// CT transform only turns an import into importRefs if every specifier is JSX; keep harness imports separate from consts.
import {
  WizCheckboxExplicitControlOnlyHarness,
  WizCheckboxExplicitHarness,
  WizCheckboxExplicitPropsOverrideMetaHarness,
  WizCheckboxNestedFallbackHarness,
  WizCheckboxSubmitValidationHarness,
  WizCheckboxYupMetaHarness,
} from './WizCheckbox.spec-helpers';
import {
  WIZ_CHECKBOX_EXPLICIT_HELPER,
  WIZ_CHECKBOX_EXPLICIT_LABEL,
  WIZ_CHECKBOX_EXPLICIT_TITLE,
  WIZ_CHECKBOX_META_LOSE_HELPER,
  WIZ_CHECKBOX_META_LOSE_LABEL,
  WIZ_CHECKBOX_META_LOSE_TITLE,
  WIZ_CHECKBOX_OVERRIDE_HELPER_PROPS,
  WIZ_CHECKBOX_OVERRIDE_LABEL_PROPS,
  WIZ_CHECKBOX_OVERRIDE_TITLE_PROPS,
  WIZ_CHECKBOX_SOLO_CONTROL_STATUS,
  WIZ_CHECKBOX_SUBMIT_ERROR,
  WIZ_CHECKBOX_VALUE_STATUS_LABEL,
  WIZ_CHECKBOX_YUP_META_HELPER,
  WIZ_CHECKBOX_YUP_META_LABEL,
  WIZ_CHECKBOX_YUP_META_TITLE,
} from './WizCheckbox.spec-helpers';

test.describe('WizCheckbox', () => {
  test('renders explicit title, label, and helper text', async ({ mount }) => {
    const mounted = await mount(<WizCheckboxExplicitHarness />);
    await expect(mounted.getByRole('group', { name: WIZ_CHECKBOX_EXPLICIT_TITLE })).toBeVisible();
    await expect(mounted.getByText(WIZ_CHECKBOX_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_CHECKBOX_EXPLICIT_HELPER, { exact: true })).toBeVisible();
  });

  test('writes the boolean value to react-hook-form when toggled', async ({ mount }) => {
    const mounted = await mount(<WizCheckboxExplicitHarness />);
    const status = mounted.getByRole('status', { name: WIZ_CHECKBOX_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('false');

    const checkboxInput = mounted.getByRole('checkbox', {
      name: new RegExp(WIZ_CHECKBOX_EXPLICIT_LABEL, 'i'),
    });
    await checkboxInput.click();
    await expect(status).toHaveText('true');
    await checkboxInput.click();
    await expect(status).toHaveText('false');
  });

  test('derives title, label, and helper text from Yup schema meta when props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount(<WizCheckboxYupMetaHarness />);
    await expect(mounted.getByRole('group', { name: WIZ_CHECKBOX_YUP_META_TITLE })).toBeVisible();
    await expect(mounted.getByText(WIZ_CHECKBOX_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_CHECKBOX_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when the checkbox stays unchecked', async ({ mount }) => {
    const mounted = await mount(<WizCheckboxSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_CHECKBOX_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user checks the box and submits again', async ({
    mount,
  }) => {
    const mounted = await mount(<WizCheckboxSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_CHECKBOX_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await mounted.getByRole('checkbox', { name: /accept the terms/i }).click();
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_CHECKBOX_SUBMIT_ERROR, { exact: true })).not.toBeVisible();
  });

  test('uses nested path segment fallback for the checkbox accessible name without Yup', async ({
    mount,
  }) => {
    const mounted = await mount(<WizCheckboxNestedFallbackHarness />);
    const box = mounted.getByRole('checkbox', { name: /digest/i });
    await box.click();
    await expect(box).toBeChecked();
  });

  test('prefers explicit title, label, and helper props over Yup .meta()', async ({ mount }) => {
    const mounted = await mount(<WizCheckboxExplicitPropsOverrideMetaHarness />);
    await expect(
      mounted.getByRole('group', { name: WIZ_CHECKBOX_OVERRIDE_TITLE_PROPS })
    ).toBeVisible();
    await expect(
      mounted.getByText(WIZ_CHECKBOX_OVERRIDE_LABEL_PROPS, { exact: true })
    ).toBeVisible();
    await expect(
      mounted.getByText(WIZ_CHECKBOX_OVERRIDE_HELPER_PROPS, { exact: true })
    ).toBeVisible();
    await expect(mounted.getByRole('group', { name: WIZ_CHECKBOX_META_LOSE_TITLE })).toHaveCount(0);
    await expect(mounted.getByText(WIZ_CHECKBOX_META_LOSE_LABEL, { exact: true })).toHaveCount(0);
    await expect(mounted.getByText(WIZ_CHECKBOX_META_LOSE_HELPER, { exact: true })).toHaveCount(0);
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount }) => {
    const mounted = await mount(<WizCheckboxExplicitControlOnlyHarness />);
    const status = mounted.getByRole('status', {
      name: WIZ_CHECKBOX_SOLO_CONTROL_STATUS,
    });
    await expect(status).toHaveText('false');
    await mounted.getByRole('checkbox', { name: /solo toggle only control prop/i }).click();
    await expect(status).toHaveText('true');
  });
});
