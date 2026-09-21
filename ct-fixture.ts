import { expect, test as base, type Locator, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export { expect };
type StoryProps = Record<string, unknown>;
type MountRequest = { story: string; props?: StoryProps };

export type MountResult = Locator & {
  update(props?: unknown): Promise<void>;
  unmount(): Promise<void>;
};

type Mount = <Story = Record<string, unknown>>(
  story: string,
  props?: Story
) => Promise<MountResult>;
type Callback = (...args: unknown[]) => unknown;

async function installCallbackBridge(page: Page, callbacks: Map<string, Callback>): Promise<void> {
  await page.exposeBinding('__pwInvokeCallback', (_source, id: string, args: unknown[]) => {
    const callback = callbacks.get(id);
    if (!callback) throw new Error(`Unknown component-test callback "${id}".`);
    return callback(...args);
  });
  await page.addInitScript(() => {
    Object.assign(window, {
      __pwReviveCallbacks(value: unknown): unknown {
        if (Array.isArray(value)) {
          return value.map((item) => window.__pwReviveCallbacks(item));
        }
        if (!value || typeof value !== 'object') return value;
        if ('__pwCallback' in value) {
          const id = String(value.__pwCallback);
          return (...args: unknown[]) => {
            const sanitizedArgs = sanitize(args);
            return window.__pwInvokeCallback(id, Array.isArray(sanitizedArgs) ? sanitizedArgs : []);
          };
        }
        return Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [key, window.__pwReviveCallbacks(nested)])
        );
      },
    });

    function sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
      if (value == null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
      if (Array.isArray(value)) return value.map((item) => sanitize(item, seen));
      if (value instanceof Event || value instanceof Node) return null;
      if (typeof value === 'object') {
        if (seen.has(value)) return null;
        seen.add(value);
        const prototype = Object.getPrototypeOf(value);
        if (prototype !== Object.prototype && prototype !== null) return null;
        const output: Record<string, unknown> = {};
        for (const [key, nested] of Object.entries(value)) {
          if (typeof nested !== 'function') output[key] = sanitize(nested, seen);
        }
        return output;
      }
      return undefined;
    }
  });
}

declare global {
  interface Window {
    __pwInvokeCallback(id: string, args: unknown[]): Promise<unknown>;
    __pwReviveCallbacks(value: unknown): unknown;
    mount(request: MountRequest): Promise<void>;
    unmount(): Promise<void>;
    __coverage__?: unknown;
  }
}

export const test = base.extend<{ mount: Mount; _coverageCapture: void }>({
  mount: async ({ page }, runFixture) => {
    const callbacks = new Map<string, Callback>();
    let callbackSequence = 0;
    await installCallbackBridge(page, callbacks);
    await page.goto('/');

    const serialize = (value: unknown): unknown => {
      if (typeof value === 'function') {
        const id = `callback-${callbackSequence++}`;
        callbacks.set(id, value as Callback);
        return { __pwCallback: id };
      }
      if (Array.isArray(value)) return value.map(serialize);
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, nested]) => [key, serialize(nested)])
        );
      }
      return value;
    };

    const mount: Mount = async (story, props) => {
      const request = { story, props: serialize(props ?? {}) as StoryProps };
      await page.evaluate(async (serializedRequest) => {
        await window.mount(window.__pwReviveCallbacks(serializedRequest) as MountRequest);
      }, request);
      const locator = page.locator('#root');
      return Object.assign(locator, {
        async update(nextProps: unknown = {}): Promise<void> {
          const nextRequest = { story, props: serialize(nextProps) as StoryProps };
          await page.evaluate(async (serializedRequest) => {
            await window.mount(window.__pwReviveCallbacks(serializedRequest) as MountRequest);
          }, nextRequest);
        },
        async unmount(): Promise<void> {
          await page.evaluate(() => window.unmount());
        },
      });
    };

    await runFixture(mount);
  },
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
