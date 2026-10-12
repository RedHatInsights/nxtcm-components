import React from 'react';

// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { TotalClusters as TotalClustersStoryComponent } from './TotalClusters';

type BrowserProps = NonNullable<React.ComponentProps<typeof TotalClustersStoryComponent>>;

export type TotalClustersStoryGalleryProps = Omit<BrowserProps, 'onViewMore'> & {
  onViewMore?: boolean;
};

export function TotalClustersStory(props: TotalClustersStoryGalleryProps): React.ReactElement {
  const [onViewMoreCalls, setOnViewMoreCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onViewMore']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onViewMore: props.onViewMore
        ? () => {
            setOnViewMoreCalls((calls) => [...calls, []]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <TotalClustersStoryComponent {...browserProps} />
      <div hidden>
        <input data-testid="onViewMore-calls" readOnly value={JSON.stringify(onViewMoreCalls)} />
        <input data-testid="onViewMore-count" readOnly value={String(onViewMoreCalls.length)} />
      </div>
    </>
  );
}
