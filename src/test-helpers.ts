import prettier from 'prettier';

/**
 * Shared test utilities for Playwright Component Tests.
 * 
 * These helpers are available to all component tests within the src/ directory.
 */

/**
 * Debug helper for Playwright component tests.
 * Formats and logs the HTML of a mounted component for easier inspection.
 * Similar to React Testing Library's screen.debug().
 *
 * @param component - The Playwright component locator from mount()
 *
 * @example
 * ```typescript
 * import { debug } from '../../test-helpers';
 *
 * test('renders correctly', async ({ mount }) => {
 *   const component = await mount(<MyComponent />);
 *   await debug(component); // Logs pretty-printed HTML
 * });
 * ```
 */
export async function debug(component: any): Promise<void> {
  const html = await component.evaluate((node: HTMLElement) => node.outerHTML);
  const formatted = await prettier.format(html, { parser: 'html' });
  console.log(formatted);
}
