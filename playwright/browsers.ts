import { devices, type PlaywrightTestProject } from '@playwright/test';

/** How an engine moves keyboard focus; tests read it as fixtures (see focus-fixtures.ts). */
export type FocusBehavior = {
  tabKey: string;
  shiftTabKey: string;
  clicksFocusButtons: boolean;
};

const standardFocus: FocusBehavior = {
  tabKey: 'Tab',
  shiftTabKey: 'Shift+Tab',
  clicksFocusButtons: true,
};

// Safari and Playwright's WebKit: Tab skips buttons (Option+Tab reaches them), clicks don't focus.
const webkitFocus: FocusBehavior = {
  tabKey: 'Alt+Tab',
  shiftTabKey: 'Alt+Shift+Tab',
  clicksFocusButtons: false,
};

export const browsers = [
  { engine: 'chromium', device: devices['Desktop Chrome'], focus: standardFocus },
  { engine: 'firefox', device: devices['Desktop Firefox'], focus: standardFocus },
  { engine: 'webkit', device: devices['Desktop Safari'], focus: webkitFocus },
] as const;

/** One project per engine, named `<prefix>-<engine>` (e.g. `components-firefox`). */
export const projectsFor = (
  prefix: string,
  options: Omit<PlaywrightTestProject, 'name' | 'use'> & {
    use?: PlaywrightTestProject['use'];
  } = {}
): PlaywrightTestProject[] =>
  browsers.map(({ engine, device, focus }) => ({
    ...options,
    name: `${prefix}-${engine}`,
    use: { ...device, ...focus, ...options.use },
  }));
