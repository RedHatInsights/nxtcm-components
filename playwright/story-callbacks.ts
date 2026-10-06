import type { Locator, Page } from '@playwright/test';

export type StoryCallbackCall = unknown[];

export type StoryCallbackOptions<Result> = {
  result?: Result;
  async?: boolean;
};

export type StoryCallbackDescriptor<Result = unknown> = {
  __storyCallback: string;
  options?: StoryCallbackOptions<Result>;
};

export function storyCallback<Args extends unknown[] = [], Result = void>(
  name: string,
  options?: StoryCallbackOptions<Result>
): (...args: Args) => Result {
  return { __storyCallback: name, options } as unknown as (...args: Args) => Result;
}

export async function storyCallbackCalls(
  target: Locator | Page,
  name: string
): Promise<StoryCallbackCall[]> {
  if ('mainFrame' in target) {
    return target.evaluate((callbackName) => window.__storyCallbackCalls[callbackName] ?? [], name);
  }

  return target.evaluate(
    (_element, callbackName) => window.__storyCallbackCalls[callbackName] ?? [],
    name
  );
}

declare global {
  interface Window {
    __storyCallbackCalls: Record<string, StoryCallbackCall[]>;
  }
}
