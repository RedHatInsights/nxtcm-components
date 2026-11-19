/** Keyboard-driven wizard navigation and validation flows, with explicit focus assertions. */
import {
  expectFocusVisible,
  expectFocusVisibleOnContainerOf,
  focusWithKeyboard,
  tabUntilFocused,
} from '../focus-helpers';
import { expect, type Page, test } from './fixtures';
import {
  fillDetailsStep,
  fillMachinePoolsStep,
  fillNetworkingStep,
  fillRolesStep,
} from './helpers/yaml-editor-helpers';

const nextButton = (page: Page) => page.getByRole('button', { name: 'Next', exact: true });
const backButton = (page: Page) => page.getByRole('button', { name: 'Back', exact: true });
const skipToReviewButton = (page: Page) => page.getByRole('button', { name: /Skip to review/i });
const wizardNav = (page: Page) => page.getByRole('navigation', { name: 'Wizard steps' });

// Elements that only exist inside one step's content, used to identify where focus rests.
const detailsContent = (page: Page) => page.getByRole('textbox', { name: /Cluster name/i });
const rolesContent = (page: Page) => page.getByText('Account roles', { exact: true });
const reviewContent = (page: Page) => page.getByRole('button', { name: /Edit in YAML/i });

/** Fills Details, Roles, Machine pools, and Networking; ends on Encryption. */
async function navigateToEncryption(page: Page): Promise<void> {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  await fillMachinePoolsStep(page);
  await fillNetworkingStep(page);
}

test.describe('ROSA Wizard - keyboard and focus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('moves focus to the first invalid field when Next fails, and again on every retry', async ({
    page,
  }) => {
    const firstInvalid = page.getByRole('combobox', {
      name: /Associated AWS infrastructure account/i,
    });

    await nextButton(page).focus();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('alert')).toBeVisible();
    await expectFocusVisible(firstInvalid);
    await expect(firstInvalid).toHaveAttribute('aria-invalid', 'true');

    await nextButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(firstInvalid).toBeFocused();
  });

  test('Enter on Back and Next moves between steps and shows a focus ring on the step content', async ({
    page,
    tabKey,
    shiftTabKey,
  }) => {
    await fillDetailsStep(page);
    await expect(rolesContent(page)).toBeVisible();

    await focusWithKeyboard(page, backButton(page), { tabKey, shiftTabKey });
    await page.keyboard.press('Enter');
    await expect(detailsContent(page)).toBeVisible();
    await expectFocusVisibleOnContainerOf(detailsContent(page));

    await focusWithKeyboard(page, nextButton(page), { tabKey, shiftTabKey });
    await page.keyboard.press('Enter');
    await expect(rolesContent(page)).toBeVisible();
    await expectFocusVisibleOnContainerOf(rolesContent(page));
  });

  test('Tab reaches Next with a visible focus indicator and Enter advances', async ({
    page,
    tabKey,
  }) => {
    await fillDetailsStep(page);
    await backButton(page).focus();
    await page.keyboard.press('Enter');
    await expect(detailsContent(page)).toBeVisible();

    await tabUntilFocused(page, nextButton(page), { maxTabs: 80, tabKey });
    await expectFocusVisible(nextButton(page));
    await page.keyboard.press('Enter');

    await expect(rolesContent(page)).toBeVisible();
  });

  test('Enter on a visited step in the left nav opens it and keeps focus on the nav item', async ({
    page,
  }) => {
    await fillDetailsStep(page);
    await expect(rolesContent(page)).toBeVisible();
    const detailsNavItem = wizardNav(page).getByRole('button', { name: 'Details' });

    await detailsNavItem.focus();
    await page.keyboard.press('Enter');

    await expect(detailsContent(page)).toBeVisible();
    await expect(detailsNavItem).toBeFocused();
  });

  test('moves focus to the first invalid field when Skip to review fails', async ({ page }) => {
    await navigateToEncryption(page);
    await page.getByRole('checkbox', { name: /Enable additional etcd encryption/i }).check();

    await skipToReviewButton(page).focus();
    await page.keyboard.press('Enter');

    const etcdKeyArn = page.getByRole('textbox', { name: /Key ARN/i });
    await expect(page.getByRole('alert')).toBeVisible();
    await expectFocusVisible(etcdKeyArn);
    await expect(etcdKeyArn).toHaveAttribute('aria-invalid', 'true');
  });

  test('moves visible focus to the Review content when Skip to review succeeds', async ({
    page,
    tabKey,
    shiftTabKey,
  }) => {
    await navigateToEncryption(page);

    await focusWithKeyboard(page, skipToReviewButton(page), { tabKey, shiftTabKey });
    await page.keyboard.press('Enter');

    await expect(reviewContent(page)).toBeVisible();
    await expect(skipToReviewButton(page)).toBeHidden();
    await expectFocusVisibleOnContainerOf(reviewContent(page));
  });
});
