import { expect, type Locator, type Page } from '@playwright/test';

/** Focused element summary for failure messages. */
async function describeFocused(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return '<body>';
    const role = el.getAttribute('role');
    const name = el.getAttribute('aria-label') ?? (el.textContent ?? '').trim().slice(0, 40);
    return `${el.tagName.toLowerCase()}${role ? `[role=${role}]` : ''} "${name}"`;
  });
}

async function isFocused(target: Locator): Promise<boolean> {
  return target
    .evaluate((el) => el === document.activeElement, undefined, { timeout: 1000 })
    .catch(() => false);
}

/** Tab until `target` is focused; on failure, lists the elements visited. */
export async function tabUntilFocused(
  page: Page,
  target: Locator,
  { maxTabs = 40, tabKey = 'Tab' }: { maxTabs?: number; tabKey?: string } = {}
): Promise<void> {
  const visited: string[] = [];
  for (let i = 0; i < maxTabs; i++) {
    if (await isFocused(target)) return;
    await page.keyboard.press(tabKey);
    visited.push(await describeFocused(page));
  }
  await expect(
    target,
    `Not reached after ${maxTabs} Tab presses. Focus visited:\n${visited.join('\n')}`
  ).toBeFocused({ timeout: 1000 });
}

/**
 * Focus `target` the way a keyboard user arrives at it: Firefox only draws a focus ring on later
 * script-driven focus moves if the previous focus came from the keyboard. Needs a focusable
 * control before `target`.
 */
export async function focusWithKeyboard(
  page: Page,
  target: Locator,
  { tabKey = 'Tab', shiftTabKey = 'Shift+Tab' }: { tabKey?: string; shiftTabKey?: string } = {}
): Promise<void> {
  await target.focus();
  await page.keyboard.press(shiftTabKey);
  await page.keyboard.press(tabKey);
  await expect(target).toBeFocused();
}

/** `target` is focused and shows a focus ring. Use after keyboard navigation. */
export async function expectFocusVisible(target: Locator): Promise<void> {
  await expect(target).toBeFocused();
  const indicator = await target.evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
      boxShadow: style.boxShadow !== 'none',
      matchesFocusVisible: el.matches(':focus-visible'),
    };
  });
  expect(indicator.matchesFocusVisible, 'element should match :focus-visible').toBe(true);
  expect(
    indicator.outline || indicator.boxShadow,
    'focused element should draw an outline or box-shadow'
  ).toBe(true);
}

/**
 * Focus rests on a container holding `content` (not `<body>` and not `content` itself) and that
 * container shows a focus ring. Use for focus targets without a role, such as wizard step content.
 */
export async function expectFocusVisibleOnContainerOf(content: Locator): Promise<void> {
  await expect
    .poll(() =>
      content.evaluate((element) => {
        const focused = document.activeElement as HTMLElement | null;
        if (!focused || focused === document.body) {
          return 'focus is not on a container of the content';
        }
        if (focused === element) {
          return 'focus is on the content itself, not on a container of it';
        }
        if (!focused.contains(element)) {
          return 'focus is not on a container of the content';
        }
        if (!focused.matches(':focus-visible')) {
          return 'focused container should match :focus-visible';
        }
        const style = getComputedStyle(focused);
        const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        return outline || style.boxShadow !== 'none'
          ? 'ok'
          : 'focused container should draw an outline or box-shadow';
      })
    )
    .toBe('ok');
}
