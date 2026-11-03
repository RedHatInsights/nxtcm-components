import { devices, type PlaywrightTestProject } from '@playwright/test';

export const browsers = [
  { engine: 'chromium', device: devices['Desktop Chrome'] },
  { engine: 'firefox', device: devices['Desktop Firefox'] },
  { engine: 'webkit', device: devices['Desktop Safari'] },
] as const;

/** One project per engine, named `<prefix>-<engine>` (e.g. `components-firefox`). */
export const projectsFor = (
  prefix: string,
  options: Omit<PlaywrightTestProject, 'name' | 'use'> & {
    use?: PlaywrightTestProject['use'];
  } = {}
): PlaywrightTestProject[] =>
  browsers.map(({ engine, device }) => ({
    ...options,
    name: `${prefix}-${engine}`,
    use: { ...device, ...options.use },
  }));
