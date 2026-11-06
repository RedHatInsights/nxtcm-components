/** Keyboard-only YAML editor flows. No clicks into Monaco, no setValue(). */
import { expect, type Page, test } from './fixtures';
import { expectFocusVisible, tabUntilFocused } from './helpers/focus-helpers';
import {
  getMonacoYaml,
  INVALID_YAML_SUFFIX,
  makeFirstLineInvalid,
  navigateToReview,
  navigateToYamlEditor,
  waitForYamlEditorReady,
  YAML_EDITOR_NAME,
} from './helpers/yaml-editor-helpers';

const editorWrapper = (page: Page) => page.getByRole('group', { name: YAML_EDITOR_NAME });
const editorTextbox = (page: Page) => page.getByRole('textbox', { name: YAML_EDITOR_NAME });
const validationRegion = (page: Page) => page.getByTestId('yaml-validation-live-region');
const schemaToggle = (page: Page) => page.getByRole('button', { name: 'Toggle schema panel' });
const schemaHeading = (page: Page) =>
  page.getByRole('heading', { name: /ROSAControlPlane schema/i });
const discardButton = (page: Page) =>
  page.getByRole('button', { name: /Discard changes and go back to Review step/i });

test.describe('ROSA Wizard - YAML Editor keyboard access', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens the YAML editor from Review with the keyboard', async ({ page }) => {
    await navigateToReview(page);

    const editInYaml = page.getByRole('button', { name: /Edit in YAML/i });
    // The Review nav item sits just before the Review content.
    await page
      .getByRole('navigation', { name: 'Wizard steps' })
      .getByRole('button', { name: 'Review' })
      .focus();
    await tabUntilFocused(page, editInYaml);
    await expectFocusVisible(editInYaml);

    await page.keyboard.press('Enter');
    await waitForYamlEditorReady(page);

    // Review unmounts, so focus falls back to <body>.
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });

  test('enters, edits, and leaves the editor with the keyboard', async ({ page }) => {
    await navigateToYamlEditor(page);

    await schemaToggle(page).focus();
    await tabUntilFocused(page, editorWrapper(page));
    await expectFocusVisible(editorWrapper(page));

    await page.keyboard.press('ArrowDown');
    await expect(editorTextbox(page)).toBeFocused();

    // No Enter: it could accept a suggestion.
    await page.keyboard.type('# edited from the keyboard ');
    await page.keyboard.press('Escape'); // close suggestions
    await expect.poll(() => getMonacoYaml(page)).toMatch(/^# edited from the keyboard /);
    await expect(editorTextbox(page)).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(editorWrapper(page)).toBeFocused();

    // Tab moves past the editor.
    await page.keyboard.press('Tab');
    await expect(editorWrapper(page)).not.toBeFocused();
    await expect(editorTextbox(page)).not.toBeFocused();
  });

  test('announces invalid YAML, reaches the problem with F8, and recovers', async ({ page }) => {
    await navigateToYamlEditor(page);
    const originalFirstLine = (await getMonacoYaml(page)).split('\n')[0];

    await expect(validationRegion(page)).toHaveAttribute('aria-live', 'polite');
    await expect(validationRegion(page).getByRole('listitem')).toHaveCount(0);

    await makeFirstLineInvalid(page);
    // Blur shows the banner.
    await page.keyboard.press('Shift+Tab');

    await expect(validationRegion(page).getByRole('listitem')).toHaveCount(1);
    await expect(validationRegion(page)).toContainText(/validation errors? found/);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('F8');
    // The marker widget has no role.
    await expect(page.locator('.monaco-editor .marker-widget')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.monaco-editor .marker-widget')).toBeHidden();
    await expect(editorTextbox(page)).toBeFocused();

    await page.keyboard.press('End');
    for (let i = 0; i < INVALID_YAML_SUFFIX.length; i++) {
      await page.keyboard.press('Backspace');
    }
    await expect
      .poll(async () => (await getMonacoYaml(page)).split('\n')[0])
      .toBe(originalFirstLine);

    // A visible banner clears on edit.
    await expect(validationRegion(page).getByRole('listitem')).toHaveCount(0);
    await expect(editorTextbox(page)).toBeFocused();
  });

  test('toggles the schema panel with the keyboard', async ({ page }) => {
    await navigateToYamlEditor(page);

    const toggle = schemaToggle(page);
    await page.getByRole('button', { name: 'Download code' }).focus();
    await tabUntilFocused(page, toggle);
    await expectFocusVisible(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Enter');
    await expect(schemaHeading(page)).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(schemaHeading(page)).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toBeFocused();

    const closeButton = page.getByRole('button', { name: 'Close schema panel' });
    await tabUntilFocused(page, closeButton);
    await page.keyboard.press('Enter');
    await expect(schemaHeading(page)).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('downloads the YAML with the keyboard', async ({ page }) => {
    await navigateToYamlEditor(page);

    const download = page.getByRole('button', { name: 'Download code' });
    await page.getByRole('button', { name: 'Copy code to clipboard' }).focus();
    await tabUntilFocused(page, download);

    const downloadEvent = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    expect((await downloadEvent).suggestedFilename()).toMatch(/\S/);
  });

  test('confirms a keyboard copy in the copy tooltip', async ({ page }) => {
    await navigateToYamlEditor(page);

    await page.getByRole('button', { name: 'Copy code to clipboard' }).focus();
    // Not Enter: it toggles PatternFly's tooltip off, hiding the success text.
    await page.keyboard.press('Space');

    await expect(page.getByText('Content added to clipboard')).toBeVisible();
  });

  test('copies the YAML to the clipboard with the keyboard', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(
      browserName !== 'chromium',
      'Only Chromium lets tests grant clipboard-read; the tooltip test covers other engines.'
    );
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await navigateToYamlEditor(page);

    await page.getByRole('button', { name: 'Copy code to clipboard' }).focus();
    await page.keyboard.press('Enter');

    const expected = await getMonacoYaml(page);
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
  });

  test('keeps focus inside the discard dialog and returns it on close', async ({ page }) => {
    await navigateToYamlEditor(page);

    await discardButton(page).focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: /Discard YAML changes/i });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Close discard changes dialog' })
    ).toBeFocused();

    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(discardButton(page)).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: /^Cancel$/ }).focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(discardButton(page)).toBeFocused();
    await expect(page.locator('.monaco-editor')).toBeVisible();
  });
});
