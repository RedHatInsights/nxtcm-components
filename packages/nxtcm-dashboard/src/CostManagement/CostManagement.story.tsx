import React from 'react';

// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { CostManagement as CostManagementStoryComponent } from './CostManagement';

type BrowserProps = NonNullable<React.ComponentProps<typeof CostManagementStoryComponent>>;

export type CostManagementStoryGalleryProps = Omit<
  BrowserProps,
  'onClusterClick' | 'onViewMore'
> & {
  onClusterClick?: boolean;
  onViewMore?: boolean;
};

export function CostManagementStory(props: CostManagementStoryGalleryProps): React.ReactElement {
  const [onClusterClickCalls, setOnClusterClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onClusterClick']>>[]
  >([]);
  const [onViewMoreCalls, setOnViewMoreCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onViewMore']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onClusterClick: props.onClusterClick
        ? (...args) => {
            setOnClusterClickCalls((calls) => [...calls, args]);
          }
        : undefined,
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
      <CostManagementStoryComponent {...browserProps} />
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
        <input data-testid="onViewMore-calls" readOnly value={JSON.stringify(onViewMoreCalls)} />
        <input data-testid="onViewMore-count" readOnly value={String(onViewMoreCalls.length)} />
      </div>
    </>
  );
}
