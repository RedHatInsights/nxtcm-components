import React from 'react';

import { ResourceUtilization as ResourceUtilizationStoryComponent } from './ResourceUtilization';

type BrowserProps = NonNullable<React.ComponentProps<typeof ResourceUtilizationStoryComponent>>;

export type ResourceUtilizationStoryGalleryProps = Omit<BrowserProps, 'onViewMore'> & {
  onViewMore?: boolean;
};

export function ResourceUtilizationStory(
  props: ResourceUtilizationStoryGalleryProps
): React.ReactElement {
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
      <ResourceUtilizationStoryComponent {...browserProps} />
      <div hidden>
        <input data-testid="onViewMore-calls" readOnly value={JSON.stringify(onViewMoreCalls)} />
        <input data-testid="onViewMore-count" readOnly value={String(onViewMoreCalls.length)} />
      </div>
    </>
  );
}
