// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
export { HelperText as HelperTextStory } from './HelperText';

import { HelperText } from './HelperText';

export function EmptyHelperTextStory(): React.ReactElement {
  return (
    <div>
      <span data-testid="anchor">above</span>
      <HelperText id="f3" />
    </div>
  );
}
