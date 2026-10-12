// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import React from 'react';

import {
  ClustersWithIssues,
  ClustersWithIssues as ClustersWithIssuesStoryComponent,
  ClustersWithIssuesProps,
} from './ClustersWithIssues';

// playwright CT can't serialize functions across process boundaries,
// so this wrapper defines callbacks in the browser context
export const ClustersWithIssuesWithConsoleLink: React.FC<{
  data: ClustersWithIssuesProps['data'];
}> = ({ data }) => <ClustersWithIssues data={data} onOpenConsole={() => {}} />;

type BrowserProps = NonNullable<React.ComponentProps<typeof ClustersWithIssuesStoryComponent>>;

export type ClustersWithIssuesStoryGalleryProps = Omit<BrowserProps, 'onClusterClick'> & {
  onClusterClick?: boolean;
};

export function ClustersWithIssuesStory(
  props: ClustersWithIssuesStoryGalleryProps
): React.ReactElement {
  const [onClusterClickCalls, setOnClusterClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onClusterClick']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onClusterClick: props.onClusterClick
        ? (...args) => {
            setOnClusterClickCalls((calls) => [...calls, args]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <ClustersWithIssuesStoryComponent {...browserProps} />
      <div hidden>
        <input
          data-testid="onClusterClick-calls"
          readOnly
          value={JSON.stringify(onClusterClickCalls)}
        />
        <input
          data-testid="onClusterClick-count"
          readOnly
          value={String(onClusterClickCalls.length)}
        />
      </div>
    </>
  );
}
