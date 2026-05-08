import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

import {
  WizNumberInputExplicitControlOnlyHarness,
  WizNumberInputExplicitHarness,
  WizNumberInputMinusClearsHarness,
  WizNumberInputNestedFallbackHarness,
  WizNumberInputSubmitValidationHarness,
  WizNumberInputYupMetaHarness,
} from './WizNumberInput.spec-helpers';
import {
  WIZ_NUMBER_INPUT_CONTROL_ONLY_LABEL,
  WIZ_NUMBER_INPUT_CONTROL_ONLY_STATUS,
  WIZ_NUMBER_INPUT_EXPLICIT_HELPER,
  WIZ_NUMBER_INPUT_EXPLICIT_LABEL,
  WIZ_NUMBER_INPUT_SLOT_STATUS_LABEL,
  WIZ_NUMBER_INPUT_TOPOLOGY_POOL_STATUS_LABEL,
  WIZ_NUMBER_INPUT_SUBMIT_ERROR,
  WIZ_NUMBER_INPUT_VALUE_STATUS_LABEL,
  WIZ_NUMBER_INPUT_YUP_META_HELPER,
  WIZ_NUMBER_INPUT_YUP_META_LABEL,
} from './WizNumberInput.spec-helpers';

test.describe('WizNumberInput', () => {
  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount(<WizNumberInputExplicitHarness />);
    await expect(mounted.getByText(WIZ_NUMBER_INPUT_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(
      mounted.getByText(WIZ_NUMBER_INPUT_EXPLICIT_HELPER, { exact: true })
    ).toBeVisible();
    await expect(
      mounted.getByRole('spinbutton', { name: new RegExp(WIZ_NUMBER_INPUT_EXPLICIT_LABEL, 'i') })
    ).toBeVisible();
  });

  test('increments the bound value through the Plus button like a spinner control', async ({
    mount,
  }) => {
    const mounted = await mount(<WizNumberInputExplicitHarness />);
    const status = mounted.getByRole('status', { name: WIZ_NUMBER_INPUT_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(status).toHaveText('1');

    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(status).toHaveText('2');
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount(<WizNumberInputYupMetaHarness />);
    await expect(mounted.getByText(WIZ_NUMBER_INPUT_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(
      mounted.getByText(WIZ_NUMBER_INPUT_YUP_META_HELPER, { exact: true })
    ).toBeVisible();
  });

  test('shows Yup validation after submit when the field is empty', async ({ mount }) => {
    const mounted = await mount(<WizNumberInputSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_NUMBER_INPUT_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user sets a valid value and submits again', async ({
    mount,
  }) => {
    const mounted = await mount(<WizNumberInputSubmitValidationHarness />);
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_NUMBER_INPUT_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await mounted.getByRole('button', { name: 'Plus' }).click();

    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(
      mounted.getByText(WIZ_NUMBER_INPUT_SUBMIT_ERROR, { exact: true })
    ).not.toBeVisible();
  });

  test('uses dotted-path fallback for nested fields and updates watched values via Plus', async ({
    mount,
  }) => {
    const mounted = await mount(<WizNumberInputNestedFallbackHarness />);
    await expect(mounted.getByRole('spinbutton', { name: /\bpoolsize\b/i })).toBeVisible();
    const status = mounted.getByRole('status', {
      name: WIZ_NUMBER_INPUT_TOPOLOGY_POOL_STATUS_LABEL,
    });
    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(status).toHaveText('1');
  });

  test('decrements the bound value until the NumberInput clamps at min (0)', async ({ mount }) => {
    const mounted = await mount(<WizNumberInputMinusClearsHarness />);
    const status = mounted.getByRole('status', { name: WIZ_NUMBER_INPUT_SLOT_STATUS_LABEL });
    await expect(status).toHaveText('2');
    await mounted.getByRole('button', { name: 'Minus' }).click();
    await expect(status).toHaveText('1');
    await mounted.getByRole('button', { name: 'Minus' }).click();
    await expect(status).toHaveText('0');
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount }) => {
    const mounted = await mount(<WizNumberInputExplicitControlOnlyHarness />);
    const status = mounted.getByRole('status', { name: WIZ_NUMBER_INPUT_CONTROL_ONLY_STATUS });
    await expect(status).toHaveText('(empty)');
    await mounted
      .getByRole('spinbutton', { name: new RegExp(WIZ_NUMBER_INPUT_CONTROL_ONLY_LABEL, 'i') })
      .focus();
    await mounted.getByRole('button', { name: 'Plus' }).click();
    await expect(status).toHaveText('1');
  });
});
