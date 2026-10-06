import { expect, type Locator, test as base } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export { expect };
export { storyCallback, storyCallbackCalls } from './playwright/story-callbacks';

declare global {
  interface Window {
    __coverage__?: unknown;
  }
}

export type MountResult = Locator & {
  update(props?: unknown): Promise<void>;
  unmount(): Promise<void>;
};

export const test = base.extend<{ _coverageCapture: void }>({
  _coverageCapture: [
    async ({ page }, runFixture) => {
      await runFixture();
      try {
        const coverage = await page.evaluate(() => window.__coverage__);
        if (!coverage) return;
        mkdirSync('.nyc_output', { recursive: true });
        const filename = join(
          '.nyc_output',
          `${Date.now()}-${Math.random().toString(36).slice(2)}.json`
        );
        writeFileSync(filename, JSON.stringify(coverage));
      } catch {
        // coverage capture is best-effort; do not fail the test
      }
    },
    { auto: true, scope: 'test' },
  ],
});
