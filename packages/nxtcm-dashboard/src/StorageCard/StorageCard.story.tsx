import React from 'react';

import { StorageCard as StorageCardStoryComponent } from './StorageCard';

type BrowserProps = NonNullable<React.ComponentProps<typeof StorageCardStoryComponent>>;

export type StorageCardStoryGalleryProps = Omit<BrowserProps, 'onViewMore'> & {
  onViewMore?: boolean;
};

export function StorageCardStory(props: StorageCardStoryGalleryProps): React.ReactElement {
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
      <StorageCardStoryComponent {...browserProps} />
      <div hidden>
        <input data-testid="onViewMore-calls" readOnly value={JSON.stringify(onViewMoreCalls)} />
        <input data-testid="onViewMore-count" readOnly value={String(onViewMoreCalls.length)} />
      </div>
    </>
  );
}
