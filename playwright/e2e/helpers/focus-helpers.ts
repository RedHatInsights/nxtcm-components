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
export async function tabUntilFocused(page: Page, target: Locator, maxTabs = 40): Promise<void> {
  const visited: string[] = [];
  for (let i = 0; i < maxTabs; i++) {
    if (await isFocused(target)) return;
    await page.keyboard.press('Tab');
    visited.push(await describeFocused(page));
  }
  await expect(
    target,
    `Not reached after ${maxTabs} Tab presses. Focus visited:\n${visited.join('\n')}`
  ).toBeFocused({ timeout: 1000 });
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
