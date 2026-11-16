import { expect, type Locator, type Page, type PlaywrightTestArgs } from '@playwright/test';

import {
  expectFocusIndicator,
  expectNoHorizontalOverflow,
  expectReachable,
  REFLOW_VIEWPORT,
  setDarkTheme,
  setTextScale,
} from './display-a11y-helpers';
import { checkAccessibility } from './test-helpers';

type Mount = PlaywrightTestArgs['mount'];

export type DisplayView = {
  name: string;
  mount: (mount: Mount) => Promise<Locator>;
  /** puts the view into the state under test, e.g. submits to show errors or opens a menu */
  prepare?: (component: Locator, page: Page) => Promise<void>;
  /** visible text that carries meaning otherwise conveyed by color, charts, or icons */
  textEquivalents: (string | RegExp)[];
  /** primary interactive control, checked for reachability and a visible focus indicator */
  control?: (component: Locator, page: Page) => Locator;
  /** additional assertions for state-specific affordances in forced colors */
  forcedColorsCheck?: (component: Locator, page: Page) => Promise<void>;
};

async function expectTextEquivalents(page: Page, view: DisplayView): Promise<void> {
  for (const text of view.textEquivalents) {
    await expect(page.getByText(text, { exact: typeof text === 'string' }).first()).toBeVisible();
  }
}

/**
 * Display-setting checks run against every representative view. Specs register one
 * test per (view, check) so results stay attributed to the spec file.
 * Coverage matrix and documented exceptions: docs/accessibility/display-coverage.md
 */
export const displayChecks: Record<
  string,
  (view: DisplayView, mount: Mount, page: Page) => Promise<void>
> = {
  'has no axe violations in the dark theme': async (view, mount, page) => {
    const component = await view.mount(mount);
    await setDarkTheme(page);
    await view.prepare?.(component, page);
    await checkAccessibility({ component });
  },

  'reflows at 320 CSS px without horizontal scrolling': async (view, mount, page) => {
    await page.setViewportSize(REFLOW_VIEWPORT);
    const component = await view.mount(mount);
    await view.prepare?.(component, page);
    await expectNoHorizontalOverflow(page);
    if (view.control) await expectReachable(view.control(component, page));
  },

  'keeps content readable at 200% text size': async (view, mount, page) => {
    const component = await view.mount(mount);
    await setTextScale(page, 200);
    await view.prepare?.(component, page);
    await expectNoHorizontalOverflow(page);
    await expectTextEquivalents(page, view);
    if (view.control) await expectReachable(view.control(component, page));
  },

  'keeps text equivalents and focus visible in forced colors': async (view, mount, page) => {
    await page.emulateMedia({ forcedColors: 'active' });
    const component = await view.mount(mount);
    await view.prepare?.(component, page);
    await expectTextEquivalents(page, view);
    if (view.control) await expectFocusIndicator(view.control(component, page));
    await view.forcedColorsCheck?.(component, page);
  },
};
