import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

import {
  WizRadioGroupExplicitControlOnlyHarness,
  WizRadioGroupExplicitHarness,
  WizRadioGroupExplicitPropsOverrideMetaHarness,
  WizRadioGroupNestedFallbackHarness,
  WizRadioGroupNumericMetaLabelHarness,
  WizRadioGroupSubmitValidationHarness,
  WizRadioGroupYupMetaHarness,
} from './WizRadioGroup.spec-helpers';
import {
  WIZ_RADIO_GROUP_CONTROL_ONLY_STATUS,
  WIZ_RADIO_GROUP_EXPLICIT_HELPER,
  WIZ_RADIO_GROUP_EXPLICIT_LABEL,
  WIZ_RADIO_GROUP_META_HELPER_LOSS,
  WIZ_RADIO_GROUP_META_LABEL_LOSS,
  WIZ_RADIO_GROUP_NESTED_STATUS_LABEL,
  WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL,
  WIZ_RADIO_GROUP_OPTION_BETA_LABEL,
  WIZ_RADIO_GROUP_OVERRIDE_RADIO_HELPER_WIN,
  WIZ_RADIO_GROUP_OVERRIDE_RADIO_LABEL_WIN,
  WIZ_RADIO_GROUP_SUBMIT_ERROR,
  WIZ_RADIO_GROUP_VALUE_STATUS_LABEL,
  WIZ_RADIO_GROUP_YUP_META_HELPER,
  WIZ_RADIO_GROUP_YUP_META_LABEL,
} from './WizRadioGroup.spec-helpers';

test.describe('WizRadioGroup', () => {
  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupExplicitHarness />);
    await expect(mounted.getByText(WIZ_RADIO_GROUP_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_RADIO_GROUP_EXPLICIT_HELPER, { exact: true })).toBeVisible();
    await expect(
      mounted.getByRole('radio', { name: new RegExp(WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL, 'i') })
    ).toBeVisible();
    await expect(
      mounted.getByRole('radio', { name: new RegExp(WIZ_RADIO_GROUP_OPTION_BETA_LABEL, 'i') })
    ).toBeVisible();
  });

  test('writes the selected value to react-hook-form when a radio is chosen', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupExplicitHarness />);
    const status = mounted.getByRole('status', { name: WIZ_RADIO_GROUP_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    await mounted
      .getByRole('radio', { name: new RegExp(WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL, 'i') })
      .click();
    await expect(status).toHaveText('alpha');

    await mounted
      .getByRole('radio', { name: new RegExp(WIZ_RADIO_GROUP_OPTION_BETA_LABEL, 'i') })
      .click();
    await expect(status).toHaveText('beta');
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount(<WizRadioGroupYupMetaHarness />);
    await expect(mounted.getByText(WIZ_RADIO_GROUP_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_RADIO_GROUP_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when no option is selected', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_RADIO_GROUP_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user selects a valid option and submits again', async ({
    mount,
  }) => {
    const mounted = await mount(<WizRadioGroupSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_RADIO_GROUP_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await mounted
      .getByRole('radio', { name: new RegExp(WIZ_RADIO_GROUP_OPTION_ALPHA_LABEL, 'i') })
      .click();

    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(
      mounted.getByText(WIZ_RADIO_GROUP_SUBMIT_ERROR, { exact: true })
    ).not.toBeVisible();
  });

  test('binds dotted field paths via fallback labeling when Yup is omitted', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupNestedFallbackHarness />);
    await expect(mounted.getByRole('radiogroup', { name: /\btarget\b/i })).toBeVisible();
    const status = mounted.getByRole('status', { name: WIZ_RADIO_GROUP_NESTED_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');
    await mounted.getByRole('radio', { name: /plan target option one/i }).click();
    await expect(status).toHaveText('one');
  });

  test('prefers explicit group label/helper over Yup meta', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupExplicitPropsOverrideMetaHarness />);
    await expect(
      mounted.getByText(WIZ_RADIO_GROUP_OVERRIDE_RADIO_LABEL_WIN, { exact: true })
    ).toBeVisible();
    await expect(
      mounted.getByText(WIZ_RADIO_GROUP_OVERRIDE_RADIO_HELPER_WIN, { exact: true })
    ).toBeVisible();
    await expect(mounted.getByText(WIZ_RADIO_GROUP_META_LABEL_LOSS, { exact: true })).toHaveCount(
      0
    );
    await expect(mounted.getByText(WIZ_RADIO_GROUP_META_HELPER_LOSS, { exact: true })).toHaveCount(
      0
    );
  });

  test('coerces Yup numeric meta labels into string group captions', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupNumericMetaLabelHarness />);
    await expect(mounted.getByText(String(909), { exact: true })).toBeVisible();
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount }) => {
    const mounted = await mount(<WizRadioGroupExplicitControlOnlyHarness />);
    const status = mounted.getByRole('status', { name: WIZ_RADIO_GROUP_CONTROL_ONLY_STATUS });
    await expect(status).toHaveText('(empty)');
    await mounted.getByRole('radio', { name: /tier standalone b/i }).click();
    await expect(status).toHaveText('b-standalone');
  });
});
