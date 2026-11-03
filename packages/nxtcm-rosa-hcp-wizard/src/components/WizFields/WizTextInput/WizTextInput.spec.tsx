import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  WizTextInputBlurValidationHarness,
  WizTextInputExplicitControlOnlyHarness,
  WizTextInputExplicitHarness,
  WizTextInputExplicitIsRequiredHarness,
  WizTextInputExplicitPropsOverrideMetaHarness,
  WizTextInputNestedFallbackHarness,
  WizTextInputNumericMetaLabelHarness,
  WizTextInputSubmitValidationHarness,
  WizTextInputYupMetaHarness,
} from './WizTextInput.story';
import {
  WIZ_TEXT_INPUT_ALIAS_BLUR_ERROR,
  WIZ_TEXT_INPUT_ALIAS_BLUR_PLACEHOLDER,
  WIZ_TEXT_INPUT_EXPLICIT_HELPER,
  WIZ_TEXT_INPUT_EXPLICIT_LABEL,
  WIZ_TEXT_INPUT_META_LOSER_HELPER,
  WIZ_TEXT_INPUT_META_LOSER_LABEL,
  WIZ_TEXT_INPUT_OPTIONAL_SCHEMA_REQUIRED_UI_LABEL,
  WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_HELPER,
  WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_LABEL,
  WIZ_TEXT_INPUT_REMOTE_ONLY_LABEL,
  WIZ_TEXT_INPUT_REMOTE_ONLY_STATUS_LABEL,
  WIZ_TEXT_INPUT_SUBMIT_ERROR,
  WIZ_TEXT_INPUT_VALUE_STATUS_LABEL,
  WIZ_TEXT_INPUT_YUP_META_HELPER,
  WIZ_TEXT_INPUT_YUP_META_LABEL,
} from './WizTextInput.story-data';

test.describe('WizTextInput', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof WizTextInputExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitHarness'
    );
    await expect(component.getByRole('textbox')).toBeVisible();
    await expect(component.getByRole('textbox')).toHaveValue('');
    await checkAccessibility({ component });
  });

  test('passes accessibility check when disabled', async ({ mount }) => {
    const component = await mount<typeof WizTextInputExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitHarness',
      { isDisabled: true, initialValue: '10.0.0.0/16' }
    );
    const input = component.getByRole('textbox', { name: WIZ_TEXT_INPUT_EXPLICIT_LABEL });
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue('10.0.0.0/16');
    await checkAccessibility({ component });
  });

  test('passes accessibility check for a populated read-only field', async ({ mount }) => {
    const value = 'arn:aws:iam::123456789012:role/ManagedOpenShift-Installer-Role';
    const component = await mount<typeof WizTextInputExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitHarness',
      { readOnly: true, initialValue: value }
    );
    const input = component.getByRole('textbox', { name: WIZ_TEXT_INPUT_EXPLICIT_LABEL });
    await expect(input).toHaveValue(value);
    await expect(input).toHaveAttribute('readonly', '');
    await expect(input).toHaveAttribute('required', '');
    await expect(input).not.toBeEditable();
    await checkAccessibility({ component });
  });

  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount<typeof WizTextInputExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitHarness'
    );
    await expect(mounted.getByText(WIZ_TEXT_INPUT_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_EXPLICIT_HELPER, { exact: true })).toBeVisible();
    await expect(
      mounted.getByRole('textbox', { name: new RegExp(WIZ_TEXT_INPUT_EXPLICIT_LABEL, 'i') })
    ).toBeVisible();
  });

  test('writes the string value to react-hook-form when the user types', async ({ mount }) => {
    const mounted = await mount<typeof WizTextInputExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitHarness'
    );
    const status = mounted.getByRole('status', { name: WIZ_TEXT_INPUT_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    const textbox = mounted.getByRole('textbox', {
      name: new RegExp(WIZ_TEXT_INPUT_EXPLICIT_LABEL, 'i'),
    });
    await textbox.fill('cluster-a');
    await expect(status).toHaveText('cluster-a');
    await expect(textbox).toHaveValue('cluster-a');
    await checkAccessibility({ component: mounted });

    await textbox.fill('');
    await expect(status).toHaveText('(empty)');
    await expect(textbox).toHaveValue('');
    await checkAccessibility({ component: mounted });
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizTextInputYupMetaHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputYupMetaHarness'
    );
    await expect(mounted.getByText(WIZ_TEXT_INPUT_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when the field is empty', async ({ mount }) => {
    const mounted = await mount<typeof WizTextInputSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputSubmitValidationHarness'
    );
    await expect(mounted.getByRole('textbox', { name: /notes \(submit demo\)/i })).toHaveAttribute(
      'required',
      ''
    );
    await checkAccessibility({ component: mounted });
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_SUBMIT_ERROR, { exact: true })).toBeVisible();
    await checkAccessibility({ component: mounted });
  });

  test('clears Yup validation after the user enters a valid value and submits again', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizTextInputSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputSubmitValidationHarness'
    );
    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await mounted.getByRole('textbox', { name: /notes \(submit demo\)/i }).fill('Something useful');

    await mounted.getByRole('button', { name: 'Submit' }).click();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_SUBMIT_ERROR, { exact: true })).toBeHidden();
    await checkAccessibility({ component: mounted });
  });

  test('uses the last segment of a nested path as the field name when no label or Yup schema', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizTextInputNestedFallbackHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputNestedFallbackHarness'
    );
    await expect(
      mounted.getByRole('textbox', { name: new RegExp('\\bhost\\b', 'i') })
    ).toBeVisible();
  });

  test('prefers explicit label and helper props over Yup .meta()', async ({ mount }) => {
    const mounted = await mount<typeof WizTextInputExplicitPropsOverrideMetaHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitPropsOverrideMetaHarness'
    );
    await expect(
      mounted.getByText(WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_LABEL, { exact: true })
    ).toBeVisible();
    await expect(
      mounted.getByText(WIZ_TEXT_INPUT_OVERRIDE_BEATS_META_HELPER, { exact: true })
    ).toBeVisible();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_META_LOSER_LABEL, { exact: true })).toHaveCount(
      0
    );
    await expect(mounted.getByText(WIZ_TEXT_INPUT_META_LOSER_HELPER, { exact: true })).toHaveCount(
      0
    );
  });

  test('shows string or numeric Yup .meta() labels as the TextInput caption', async ({ mount }) => {
    const mounted = await mount<typeof WizTextInputNumericMetaLabelHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputNumericMetaLabelHarness'
    );
    await expect(mounted.getByText(String(2025), { exact: true })).toBeVisible();
    await expect(
      mounted.getByRole('textbox', { name: new RegExp(String(2025), 'i') })
    ).toBeVisible();
  });

  test('shows Yup validation after the field is blurred when validateOnBlur is set', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizTextInputBlurValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputBlurValidationHarness'
    );
    const input = mounted.getByPlaceholder(WIZ_TEXT_INPUT_ALIAS_BLUR_PLACEHOLDER);
    await input.focus();
    await input.blur();
    await expect(mounted.getByText(WIZ_TEXT_INPUT_ALIAS_BLUR_ERROR, { exact: true })).toBeVisible();
  });

  test('does not validate while the user is typing when validateOnBlur is set', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizTextInputBlurValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputBlurValidationHarness'
    );
    const input = mounted.getByPlaceholder(WIZ_TEXT_INPUT_ALIAS_BLUR_PLACEHOLDER);
    await input.focus();
    await input.fill('x');
    await expect(mounted.getByText(WIZ_TEXT_INPUT_ALIAS_BLUR_ERROR, { exact: true })).toHaveCount(
      0
    );
  });

  test('shows required UI when isRequired is set even though Yup treats the leaf as optional', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizTextInputExplicitIsRequiredHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitIsRequiredHarness'
    );
    await expect(
      mounted.getByLabel(WIZ_TEXT_INPUT_OPTIONAL_SCHEMA_REQUIRED_UI_LABEL)
    ).toBeVisible();
    await expect(
      mounted.locator('label').filter({ hasText: WIZ_TEXT_INPUT_OPTIONAL_SCHEMA_REQUIRED_UI_LABEL })
    ).toContainText('*');
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount }) => {
    const mounted = await mount<typeof WizTextInputExplicitControlOnlyHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizTextInput/WizTextInput/WizTextInputExplicitControlOnlyHarness'
    );
    const status = mounted.getByRole('status', {
      name: WIZ_TEXT_INPUT_REMOTE_ONLY_STATUS_LABEL,
    });
    await expect(status).toHaveText('(empty)');
    await mounted
      .getByRole('textbox', { name: new RegExp(WIZ_TEXT_INPUT_REMOTE_ONLY_LABEL, 'i') })
      .fill('abc');
    await expect(status).toHaveText('abc');
  });
});
