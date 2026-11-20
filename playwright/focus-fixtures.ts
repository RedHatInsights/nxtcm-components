import { expect, type Locator, test as base } from '@playwright/test';

import type { FocusBehavior } from './browsers';

type FocusFixtures = FocusBehavior & {
  /** Asserts `control` is focused after a click, in engines that focus clicked buttons. */
  expectFocusedAfterClick: (control: Locator) => Promise<void>;
};

/** Shared base for the CT and e2e tests; the options are set per project in browsers.ts. */
export const focusTest = base.extend<FocusFixtures>({
  tabKey: ['Tab', { option: true }],
  shiftTabKey: ['Shift+Tab', { option: true }],
  clicksFocusButtons: [true, { option: true }],
  expectFocusedAfterClick: async ({ clicksFocusButtons }, runFixture) => {
    await runFixture(async (control) => {
      if (clicksFocusButtons) await expect(control).toBeFocused();
    });
  },
});
