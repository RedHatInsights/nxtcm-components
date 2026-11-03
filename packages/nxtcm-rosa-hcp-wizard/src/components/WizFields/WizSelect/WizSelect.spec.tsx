import type { Page } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import type {
  WizSelectDeferValidationHarness,
  WizSelectExplicitControlOnlyHarness,
  WizSelectExplicitHarness,
  WizSelectExplicitPropsOverrideMetaHarness,
  WizSelectNestedFallbackHarness,
  WizSelectNumericMetaLabelHarness,
  WizSelectOptionsReconcileHarness,
  WizSelectSubmitValidationHarness,
  WizSelectTypeaheadClearHarness,
  WizSelectYupMetaHarness,
} from './WizSelect.story';
import {
  WIZ_SELECT_CONTROL_ONLY_STATUS,
  WIZ_SELECT_DEFER_REVEAL_BUTTON,
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
  WIZ_SELECT_RECONCILE_REPLACE_OPTIONS,
  WIZ_SELECT_RECONCILE_STATUS,
  WIZ_SELECT_RECONCILE_TOGGLE,
  WIZ_SELECT_SUBMIT_ERROR,
  WIZ_SELECT_SUBMIT_TOGGLE_NAME,
  WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS,
  WIZ_SELECT_TYPEAHEAD_CLEAR_TOGGLE,
  WIZ_SELECT_VALUE_STATUS_LABEL,
  WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL,
  WIZ_SELECT_YUP_META_HELPER,
  WIZ_SELECT_YUP_META_LABEL,
} from './WizSelect.story-data';

// Scan the field together with portalled menus, tooltips, and error details.
async function checkOverlayAccessibility(page: Page): Promise<void> {
  const body = page.locator('body');
  await body.evaluate(async (element) => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished)
    );
  });
  await checkAccessibility({ component: body });
}

test.describe('WizSelect', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness'
    );
    await expect(
      component.getByRole('button', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME })
    ).toBeVisible();
    await expect(component.getByRole('status', { name: WIZ_SELECT_VALUE_STATUS_LABEL })).toHaveText(
      '(empty)'
    );
    await checkAccessibility({ component });
  });

  for (const isTypeAhead of [false, true]) {
    test(`passes accessibility check for a disabled ${isTypeAhead ? 'typeahead' : 'plain'} select`, async ({
      mount,
      page,
    }) => {
      await mount<typeof WizSelectExplicitHarness>(
        'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness',
        { isDisabled: true, isTypeAhead }
      );
      await expect(
        page.getByRole(isTypeAhead ? 'combobox' : 'button', {
          name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME,
        })
      ).toBeDisabled();
      await expect(page.getByText('Choose an AWS account first.', { exact: true })).toBeVisible();
      await checkOverlayAccessibility(page);
    });

    test(`passes accessibility check with an empty ${isTypeAhead ? 'typeahead' : 'plain'} menu`, async ({
      mount,
      page,
    }) => {
      await mount<typeof WizSelectExplicitHarness>(
        'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness',
        { options: [], isTypeAhead }
      );
      await page
        .getByRole(isTypeAhead ? 'combobox' : 'button', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME })
        .click();
      await expect(page.getByRole('option', { name: 'No results found' })).toBeVisible();
      await checkOverlayAccessibility(page);
    });
  }

  test('passes accessibility checks while a typeahead is loading with the menu closed and open', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness',
      { isTypeAhead: true, isLoading: true }
    );
    const combo = page.getByRole('combobox', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME });
    await expect(combo).toHaveValue('Loading...');
    await checkOverlayAccessibility(page);
    await combo.click();
    await expect(page.getByRole('option', { name: /loading/i })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('passes accessibility checks for grouped typeahead options, selection, and no results', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness',
      {
        isTypeAhead: true,
        optionGroups: [
          { label: 'Recommended versions', options: ['4.20.0', '4.19.0'] },
          { label: 'Other versions', options: ['4.18.0'] },
        ],
      }
    );
    const combo = page.getByRole('combobox', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME });
    await expect(combo).toHaveValue('');
    await checkOverlayAccessibility(page);
    await combo.click();
    await expect(page.getByRole('option', { name: '4.20.0', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: '4.18.0', exact: true })).toBeVisible();
    await expect(page.getByText('Recommended versions', { exact: true })).toBeVisible();
    await expect(page.getByText('Other versions', { exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);

    await page.getByRole('option', { name: '4.20.0', exact: true }).click();
    await expect(combo).toHaveValue('4.20.0');
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    await checkOverlayAccessibility(page);

    await combo.click();
    await combo.fill('missing-version');
    await expect(page.getByRole('option', { name: 'No results found' })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('passes accessibility check when filtering flat typeahead options finds no results', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness',
      { isTypeAhead: true }
    );
    const combo = page.getByRole('combobox', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME });
    await combo.click();
    await expect(page.getByRole('option', { name: 'eu-west-1', exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);
    await combo.fill('missing-region');
    await expect(page.getByRole('option', { name: 'No results found' })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('passes accessibility checks for an API error and its open details popover', async ({
    mount,
    page,
  }) => {
    const detail = 'The region list could not be loaded.';
    await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness',
      { isTypeAhead: true, apiError: detail }
    );
    await expect(page.getByRole('button', { name: 'Show error details' })).toBeVisible();
    await checkOverlayAccessibility(page);
    await page.getByRole('button', { name: 'Show error details' }).click();
    await expect(page.getByText(detail, { exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness'
    );
    await expect(mounted.getByText(WIZ_SELECT_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_EXPLICIT_HELPER, { exact: true })).toBeVisible();
  });

  test('writes the selected option to react-hook-form when the user picks from the menu', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitHarness'
    );
    const status = page.getByRole('status', { name: WIZ_SELECT_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    await page.getByRole('button', { name: WIZ_SELECT_EXPLICIT_TOGGLE_NAME }).click();
    await expect(page.getByRole('option', { name: 'eu-west-1', exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);
    await page.getByRole('option', { name: 'eu-west-1' }).click();

    await expect(status).toHaveText('eu-west-1');
    await expect(page.getByRole('option', { name: 'eu-west-1', exact: true })).toBeHidden();
    await checkOverlayAccessibility(page);
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizSelectYupMetaHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectYupMetaHarness'
    );
    await expect(mounted.getByText(WIZ_SELECT_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when no option is selected', async ({ mount, page }) => {
    const mounted = await mount<typeof WizSelectSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectSubmitValidationHarness'
    );
    await expect(mounted.getByText('*', { exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);
    await mounted.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(mounted.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('does not show required validation after clearing a typeahead selection until validation is revealed', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectDeferValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectDeferValidationHarness'
    );
    const combo = page.getByRole('combobox', { name: /select the region/i });

    await combo.click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await page.getByRole('button', { name: 'Clear selection' }).click();

    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeHidden();

    await page.getByRole('button', { name: WIZ_SELECT_DEFER_REVEAL_BUTTON, exact: true }).click();
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeVisible();
    await checkOverlayAccessibility(page);

    await combo.click();
    await expect(page.getByRole('option', { name: 'us-east-1', exact: true })).toBeVisible();
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeHidden();
    await checkOverlayAccessibility(page);
    await page.getByRole('option', { name: 'us-east-1', exact: true }).click();
    await expect(combo).toHaveValue('us-east-1');
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeHidden();
    await checkOverlayAccessibility(page);
  });

  test('clears Yup validation after the user selects a value and submits again', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectSubmitValidationHarness'
    );
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: WIZ_SELECT_SUBMIT_TOGGLE_NAME }).click();
    await page.getByRole('option', { name: 'us-east-1' }).click();

    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_SELECT_SUBMIT_ERROR, { exact: true })).toBeHidden();
    await checkOverlayAccessibility(page);
  });

  test('uses nested path fallback labels and records the chosen option in the form', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectNestedFallbackHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectNestedFallbackHarness'
    );
    await expect(page.getByRole('button', { name: WIZ_SELECT_NESTED_LABEL_TOGGLE })).toBeVisible();
    await page.getByRole('button', { name: WIZ_SELECT_NESTED_LABEL_TOGGLE }).click();
    await page.getByRole('option', { name: 'subnet-a' }).click();
    await expect(
      page.getByRole('status', { name: WIZ_SELECT_VPC_SUBNET_FORM_VALUE_LABEL })
    ).toHaveText('subnet-a');
  });

  test('prefers explicit label and helper props over Yup .meta()', async ({ mount }) => {
    const mounted = await mount<typeof WizSelectExplicitPropsOverrideMetaHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitPropsOverrideMetaHarness'
    );
    await expect(mounted.getByText(WIZ_SELECT_OVERRIDE_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_OVERRIDE_HELPER, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_SELECT_META_LOSER_LABEL, { exact: true })).toHaveCount(0);
    await expect(mounted.getByText(WIZ_SELECT_META_LOSER_HELPER, { exact: true })).toHaveCount(0);
  });

  test('shows a stringified numeric Yup .meta() label on the collapsed plain select', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectNumericMetaLabelHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectNumericMetaLabelHarness'
    );
    await expect(page.getByRole('button', { name: WIZ_SELECT_NUMERIC_TOGGLE })).toBeVisible();
  });

  test('clears react-hook-form value when the typeahead clear control is pressed', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectTypeaheadClearHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectTypeaheadClearHarness'
    );
    const status = page.getByRole('status', { name: WIZ_SELECT_TYPEAHEAD_CLEAR_STATUS });
    const combo = page.getByRole('combobox', { name: WIZ_SELECT_TYPEAHEAD_CLEAR_TOGGLE });

    await expect(combo).toHaveValue('');
    await checkOverlayAccessibility(page);
    await combo.click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await expect(status).toHaveText('eu-west-1');
    await expect(combo).toHaveValue('eu-west-1');
    await checkOverlayAccessibility(page);

    await page.getByRole('button', { name: 'Clear selection' }).click();
    await expect(status).toHaveText('(empty)');
    await expect(combo).toHaveValue('');
    await checkOverlayAccessibility(page);
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount, page }) => {
    await mount<typeof WizSelectExplicitControlOnlyHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectExplicitControlOnlyHarness'
    );
    const status = page.getByRole('status', { name: WIZ_SELECT_CONTROL_ONLY_STATUS });
    await expect(status).toHaveText('(empty)');
    await page.getByRole('button', { name: WIZ_SELECT_ONLY_CONTROL_TOGGLE }).click();
    await page.getByRole('option', { name: 'alpha' }).click();
    await expect(status).toHaveText('alpha');
  });

  test('clears the form value when new options no longer include the selection', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizSelectOptionsReconcileHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizSelect/WizSelect/WizSelectOptionsReconcileHarness'
    );
    const status = page.getByRole('status', { name: WIZ_SELECT_RECONCILE_STATUS });
    await expect(status).toHaveText('(empty)');

    await page.getByRole('button', { name: WIZ_SELECT_RECONCILE_TOGGLE }).click();
    await page.getByRole('option', { name: 'eu-west-1' }).click();
    await expect(status).toHaveText('eu-west-1');

    await page
      .getByRole('button', { name: WIZ_SELECT_RECONCILE_REPLACE_OPTIONS, exact: true })
      .click();
    await expect(status).toHaveText('(empty)');
  });
});
