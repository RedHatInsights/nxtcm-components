import {
  expectFocusIndicator,
  expectNoHorizontalOverflow,
  expectReachable,
  REFLOW_VIEWPORT,
  setDarkTheme,
  setTextScale,
} from '../display-a11y-helpers';
import type { Page } from './fixtures';
import { expect, test } from './fixtures';
import { checkPageAccessibility, harnessRules } from './helpers/accessibility-helpers';
import { navigateToReview, navigateToYamlEditor } from './helpers/yaml-editor-helpers';

// Coverage matrix and documented exceptions: docs/accessibility/display-coverage.md

// Code lines must not wrap, so the YAML editor scrolls horizontally by design.
const yamlEditor = '.monaco-editor';

async function expectFooterReachable(page: Page): Promise<void> {
  const footer = page.getByRole('contentinfo');
  await expectReachable(footer.getByRole('button', { name: 'Next' }));
  await expectReachable(footer.getByRole('button', { name: 'Cancel' }));
}

async function revealStepErrors(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/required/i).first()).toBeVisible();
}

test.describe('Wizard in the dark theme', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setDarkTheme(page);
  });

  test('scans the initial page and step validation errors', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Cluster name/i })).toBeVisible();
    await checkPageAccessibility(page, 'dark initial wizard', harnessRules);
    await revealStepErrors(page);
    await checkPageAccessibility(page, 'dark step validation errors', harnessRules);
  });

  test('scans an open select', async ({ page }) => {
    await page.getByRole('combobox', { name: /^OpenShift version$/i }).click();
    await expect(page.getByRole('option', { name: /OpenShift 4\.12\.0/i })).toBeVisible();
    await checkPageAccessibility(page, 'dark open version select', harnessRules);
  });

  test('scans the review page', async ({ page }) => {
    await navigateToReview(page);
    await expect(page.getByRole('button', { name: /Create cluster/i })).toBeVisible();
    await checkPageAccessibility(page, 'dark review page', harnessRules);
  });

  test('scans the YAML editor and discard dialog', async ({ page }) => {
    await navigateToYamlEditor(page);
    await expect(page.locator(yamlEditor)).toBeVisible();
    // Monaco's syntax highlighting colors are owned by the editor theme.
    await checkPageAccessibility(page, 'dark YAML editor', [...harnessRules, 'color-contrast']);
    await page.getByRole('button', { name: /Discard changes and go back to Review step/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await checkPageAccessibility(page, 'dark YAML discard dialog', harnessRules, {
      include: '[role="dialog"]',
    });
  });
});

test.describe('Wizard reflow at 320 CSS px', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(REFLOW_VIEWPORT);
    await page.goto('/');
  });

  test('keeps the details step, step errors, and footer usable', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: /Cluster name/i })).toBeAttached();
    await expectNoHorizontalOverflow(page);
    await expectFooterReachable(page);
    await revealStepErrors(page);
    await expectNoHorizontalOverflow(page);
  });

  test('collapses step navigation behind a reachable toggle', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Wizard toggle' });
    await expectReachable(toggle);
    await toggle.click();
    const nav = page.getByRole('navigation', { name: 'Wizard steps' });
    await expectReachable(nav.getByRole('button', { name: 'Details' }));
    await expectNoHorizontalOverflow(page);
  });

  test('keeps the review page usable', async ({ page }) => {
    await navigateToReview(page);
    // PatternFly's wizard footer action list does not wrap, so Cancel overflows
    // next to "Create cluster" (documented exception).
    await expectNoHorizontalOverflow(page, 'footer');
    await expectReachable(page.getByRole('button', { name: /Create cluster/i }));
  });

  test('keeps the YAML editor controls usable apart from the code area', async ({ page }) => {
    await navigateToYamlEditor(page);
    await expectNoHorizontalOverflow(page, yamlEditor);
    await expectReachable(
      page.getByRole('button', { name: /Discard changes and go back to Review step/i })
    );
  });
});

test.describe('Wizard at 200% text size', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await setTextScale(page, 200);
  });

  test('keeps the details step and step errors readable', async ({ page }) => {
    await expect(page.getByText('Cluster name', { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectFooterReachable(page);
    await revealStepErrors(page);
    await expectNoHorizontalOverflow(page);
  });

  test('keeps the review page readable', async ({ page }) => {
    await navigateToReview(page);
    await expectNoHorizontalOverflow(page);
    await expectReachable(page.getByRole('button', { name: /Create cluster/i }));
  });
});

test.describe('Wizard in forced colors', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
  });

  test('shows a focus indicator on fields, selects, navigation, and footer buttons', async ({
    page,
  }) => {
    await expectFocusIndicator(page.getByRole('textbox', { name: /Cluster name/i }));
    await expectFocusIndicator(page.getByRole('combobox', { name: /^OpenShift version$/i }));
    const nav = page.getByRole('navigation', { name: 'Wizard steps' });
    await expectFocusIndicator(nav.getByRole('button', { name: 'Details' }));
    const footer = page.getByRole('contentinfo');
    await expectFocusIndicator(footer.getByRole('button', { name: 'Next' }));
    await expectFocusIndicator(footer.getByRole('button', { name: 'Cancel' }));
  });

  test('shows step validation errors as text', async ({ page }) => {
    await revealStepErrors(page);
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });
});
