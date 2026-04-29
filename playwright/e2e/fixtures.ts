import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export { expect };
export type { Page };

export const test = base.extend<{ _coverageCapture: void }>({
  _coverageCapture: [
    async ({ page }, use) => {
      await use();
      const coverage = await page.evaluate(() => (window as any).__coverage__);
      if (coverage) {
        mkdirSync('.nyc_output', { recursive: true });
        const filename = join(
          '.nyc_output',
          `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
        );
        writeFileSync(filename, JSON.stringify(coverage));
      }
    },
    { auto: true, scope: 'test' },
  ],
});
