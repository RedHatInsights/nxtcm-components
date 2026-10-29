import type { Page } from '@playwright/test';

import { expect, test } from '@/playwright/ct-fixture';
import { checkAccessibility } from '@/playwright/test-helpers';

import { MAX_SECURITY_GROUPS } from '../../../constants';
import { defaultRosaHcpWizardValidatorStrings } from '../../../stringsProvider/rosaHcpWizardStrings.defaults';
import type {
  WizMultiSelectApiErrorHarness,
  WizMultiSelectExplicitControlOnlyHarness,
  WizMultiSelectExplicitHarness,
  WizMultiSelectSecurityGroupsHarness,
  WizMultiSelectSubmitValidationHarness,
  WizMultiSelectYupMetaHarness,
} from './WizMultiSelect.story';
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
} from './WizMultiSelect.story-data';

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

test.describe('WizMultiSelect', () => {
  test('passes accessibility check', async ({ mount }) => {
    const component = await mount<typeof WizMultiSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectExplicitHarness'
    );
    await expect(
      component.getByRole('button', { name: WIZ_MULTI_EXPLICIT_TOGGLE_NAME })
    ).toBeVisible();
    await expect(component.getByRole('status', { name: WIZ_MULTI_VALUE_STATUS_LABEL })).toHaveText(
      '(empty)'
    );
    await checkAccessibility({ component });
  });

  test('passes accessibility checks while loading with the menu closed and open', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizMultiSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectExplicitHarness',
      { isLoading: true }
    );
    const toggle = page.getByRole('button', { name: /^loading/i });
    await expect(toggle).toBeVisible();
    await checkOverlayAccessibility(page);
    await toggle.click();
    await expect(page.getByRole('menuitem', { name: /loading/i })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('passes accessibility check with an empty options menu after an API error', async ({
    mount,
    page,
  }) => {
    // EditSecurityGroups only renders an empty select when an API error is present.
    await mount<typeof WizMultiSelectApiErrorHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectApiErrorHarness',
      { options: [] }
    );
    await expect(page.getByRole('button', { name: 'Show error details' })).toBeVisible();
    await page.getByRole('button', { name: /select the security groups/i }).click();
    await expect(page.getByRole('menuitem', { name: 'No results found' })).toBeVisible();
    await checkOverlayAccessibility(page);
  });

  test('passes accessibility checks for the production security-group limit and recovery', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizMultiSelectSecurityGroupsHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectSecurityGroupsHarness'
    );
    const toggle = page.getByRole('button', { name: /select the security groups/i });
    const error = page.getByText(
      defaultRosaHcpWizardValidatorStrings.securityGroups.maxExceeded(MAX_SECURITY_GROUPS),
      { exact: true }
    );
    const count = page.getByRole('status', { name: 'Selected security groups' });
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(count).toHaveText('0');
    await expect(error).toBeHidden();
    await checkOverlayAccessibility(page);

    await toggle.click();
    for (let i = 1; i <= MAX_SECURITY_GROUPS + 1; i++) {
      await page.getByRole('checkbox', { name: `sg-${i}`, exact: true }).check();
    }
    await expect(count).toHaveText(String(MAX_SECURITY_GROUPS + 1));
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(error).toBeVisible();
    await checkOverlayAccessibility(page);

    await toggle.click();
    await expect(error).toBeHidden();
    await page
      .getByRole('checkbox', { name: `sg-${MAX_SECURITY_GROUPS + 1}`, exact: true })
      .uncheck();
    await expect(count).toHaveText(String(MAX_SECURITY_GROUPS));
    await checkOverlayAccessibility(page);
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(error).toBeHidden();
    await checkOverlayAccessibility(page);
  });

  test('renders explicit label and helper text', async ({ mount }) => {
    const mounted = await mount<typeof WizMultiSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectExplicitHarness'
    );
    await expect(mounted.getByText(WIZ_MULTI_EXPLICIT_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_MULTI_EXPLICIT_HELPER, { exact: true })).toBeVisible();
  });

  test('writes selected options to react-hook-form', async ({ mount, page }) => {
    await mount<typeof WizMultiSelectExplicitHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectExplicitHarness'
    );
    const status = page.getByRole('status', { name: WIZ_MULTI_VALUE_STATUS_LABEL });
    await expect(status).toHaveText('(empty)');

    await page.getByRole('button', { name: WIZ_MULTI_EXPLICIT_TOGGLE_NAME }).click();
    const listbox = page.locator('#wiz-multi-ct-explicit-listbox');
    await expect(listbox).toBeVisible();
    await checkOverlayAccessibility(page);
    await listbox.getByText('eu-west-1', { exact: true }).click();
    await listbox.getByText('us-east-1', { exact: true }).click();

    await expect(status).toHaveText('eu-west-1,us-east-1');
    await expect(page.getByRole('checkbox', { name: 'eu-west-1', exact: true })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'us-east-1', exact: true })).toBeChecked();
    await checkOverlayAccessibility(page);
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await checkOverlayAccessibility(page);
  });

  test('derives label and helper text from Yup schema meta when those props are omitted', async ({
    mount,
  }) => {
    const mounted = await mount<typeof WizMultiSelectYupMetaHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectYupMetaHarness'
    );
    await expect(mounted.getByText(WIZ_MULTI_YUP_META_LABEL, { exact: true })).toBeVisible();
    await expect(mounted.getByText(WIZ_MULTI_YUP_META_HELPER, { exact: true })).toBeVisible();
  });

  test('shows Yup validation after submit when nothing is selected', async ({ mount }) => {
    const mounted = await mount<typeof WizMultiSelectSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectSubmitValidationHarness'
    );
    await mounted.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(mounted.getByText(WIZ_MULTI_SUBMIT_ERROR, { exact: true })).toBeVisible();
  });

  test('clears Yup validation after the user selects values and submits again', async ({
    mount,
    page,
  }) => {
    await mount<typeof WizMultiSelectSubmitValidationHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectSubmitValidationHarness'
    );
    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_MULTI_SUBMIT_ERROR, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: WIZ_MULTI_SUBMIT_TOGGLE_NAME }).click();
    const submitList = page.locator('#wiz-multi-ct-submit-listbox');
    await expect(submitList).toBeVisible();
    await submitList.getByText('us-east-1', { exact: true }).click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Submit', exact: true }).click();
    await expect(page.getByText(WIZ_MULTI_SUBMIT_ERROR, { exact: true })).toBeHidden();
  });

  test('binds through the control prop without a FormProvider wrapper', async ({ mount, page }) => {
    await mount<typeof WizMultiSelectExplicitControlOnlyHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectExplicitControlOnlyHarness'
    );
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
    const mounted = await mount<typeof WizMultiSelectApiErrorHarness>(
      'nxtcm-rosa-hcp-wizard/components/WizFields/WizMultiSelect/WizMultiSelect/WizMultiSelectApiErrorHarness'
    );
    await expect(
      mounted.getByText(`Error loading ${WIZ_MULTI_API_ERROR_FIELD_LABEL} list`)
    ).toBeVisible();
    await checkOverlayAccessibility(page);
    await mounted.getByRole('button', { name: 'Show error details' }).click();
    await expect(page.getByText(WIZ_MULTI_API_ERROR_DETAIL)).toBeVisible({ timeout: 10_000 });
    await checkOverlayAccessibility(page);
  });
});
