import React from 'react';

import { AdvisorSeverity as AdvisorSeverityStoryComponent } from './AdvisorSeverity';

type BrowserProps = NonNullable<React.ComponentProps<typeof AdvisorSeverityStoryComponent>>;

export type AdvisorSeverityStoryGalleryProps = Omit<BrowserProps, 'onViewMore'> & {
  onViewMore?: boolean;
};

export function AdvisorSeverityStory(props: AdvisorSeverityStoryGalleryProps): React.ReactElement {
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
      <AdvisorSeverityStoryComponent {...browserProps} />
      <div hidden>
        <input data-testid="onViewMore-calls" readOnly value={JSON.stringify(onViewMoreCalls)} />
        <input data-testid="onViewMore-count" readOnly value={String(onViewMoreCalls.length)} />
      </div>
    </>
  );
}
