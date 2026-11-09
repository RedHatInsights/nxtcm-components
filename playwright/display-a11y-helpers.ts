import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Display-setting helpers shared by component and E2E accessibility specs.
 *
 * Coverage matrix and documented exceptions: docs/accessibility/display-coverage.md
 */

/** WCAG 1.4.10 reference: 1280 CSS px at 400% zoom. */
export const REFLOW_VIEWPORT = { width: 320, height: 256 };

/**
 * Add the PatternFly dark theme class that host apps and Storybook put on `<html>`.
 * The test harnesses have no PatternFly page or card surface, so the body is painted
 * with the primary background token that host chrome would otherwise provide.
 */
export async function setDarkTheme(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.documentElement.classList.add('pf-v6-theme-dark');
    document.body.style.backgroundColor =
      'var(--pf-t--global--background--color--primary--default)';
  });
  await waitForAnimations(page);
}

/** Wait for finite CSS transitions/animations so scans see settled colors. */
export async function waitForAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await Promise.allSettled(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished)
    );
  });
}

/**
 * Scale the root font size. PatternFly sizes text in `rem`, so this models
 * browser text-only resizing (WCAG 1.4.4).
 */
export async function setTextScale(page: Page, percent: number): Promise<void> {
  await page.evaluate((size) => {
    document.documentElement.style.fontSize = size;
  }, `${percent}%`);
}

/**
 * Assert the document does not scroll horizontally. Elements matching
 * `allowSelector` are documented exceptions (for example a code editor) and
 * are hidden from layout before measuring.
 */
export async function expectNoHorizontalOverflow(
  page: Page,
  allowSelector?: string
): Promise<void> {
  const overflow = await page.evaluate((selector) => {
    const hidden = selector ? Array.from(document.querySelectorAll<HTMLElement>(selector)) : [];
    const previous = hidden.map((el) => el.style.display);
    hidden.forEach((el) => (el.style.display = 'none'));
    const root = document.scrollingElement ?? document.documentElement;
    const result = root.scrollWidth - root.clientWidth;
    hidden.forEach((el, i) => (el.style.display = previous[i]));
    return result;
  }, allowSelector);
  expect(overflow, 'page scrolls horizontally').toBeLessThanOrEqual(0);
}

/**
 * Assert a control is visible, inside the viewport horizontally, and not
 * covered by another element at its center point.
 */
export async function expectReachable(control: Locator): Promise<void> {
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeVisible();
  await expect(control).toBeInViewport();
  const isTopmost = await control.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return hit !== null && (el === hit || el.contains(hit) || hit.contains(el));
  });
  expect(isTopmost, 'control is covered by another element').toBe(true);
}

/**
 * Assert that keyboard focus visibly changes how a control is drawn. Forced-colors
 * mode drops `box-shadow` and author background colors, so focus styles built only
 * from those disappear. Compares pixels around the control before and after focus.
 */
export async function expectFocusIndicator(control: Locator): Promise<void> {
  const page = control.page();
  await control.scrollIntoViewIfNeeded();
  await control.evaluate((el) => (el as HTMLElement).blur());
  const box = await control.boundingBox();
  if (!box) throw new Error('control has no bounding box');
  // Focus rings are drawn outside the control's border box.
  const margin = 6;
  const clip = {
    x: Math.max(box.x - margin, 0),
    y: Math.max(box.y - margin, 0),
    width: box.width + margin * 2,
    height: box.height + margin * 2,
  };
  const before = await page.screenshot({ clip, animations: 'disabled' });
  // A key press makes the following programmatic focus match :focus-visible.
  await page.keyboard.press('Shift');
  await control.focus();
  await expect(control).toBeFocused();
  const after = await page.screenshot({ clip, animations: 'disabled' });
  expect(before.equals(after), 'focus does not change how the control is drawn').toBe(false);
}
