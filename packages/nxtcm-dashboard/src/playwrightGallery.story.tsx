// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { useState } from 'react';

export interface StatefulGalleryStoryProps {
  label?: string;
}

export function StatefulGalleryStory({
  label = 'Count',
}: StatefulGalleryStoryProps): React.ReactElement {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {label}: {count}
    </button>
  );
}

export function CallbackGalleryStory({
  onAction,
}: {
  onAction: (value: string) => void;
}): React.ReactElement {
  return (
    <button type="button" onClick={() => onAction('browser-value')}>
      Invoke callback
    </button>
  );
}

export const NonComponentExport = 'not a component';

export function ThrowingGalleryStory(): never {
  throw new Error('intentional gallery render failure');
}
