import React from 'react';

import { Subscriptions as SubscriptionsStoryComponent } from './Subscriptions';

type BrowserProps = NonNullable<React.ComponentProps<typeof SubscriptionsStoryComponent>>;

export type SubscriptionsStoryGalleryProps = Omit<
  BrowserProps,
  'onViewSubscriptions' | 'onSubscriptionsClick' | 'onInstancesClick'
> & {
  onViewSubscriptions?: boolean;
  onSubscriptionsClick?: boolean;
  onInstancesClick?: boolean;
};

export function SubscriptionsStory(props: SubscriptionsStoryGalleryProps): React.ReactElement {
  const [onViewSubscriptionsCalls, setOnViewSubscriptionsCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onViewSubscriptions']>>[]
  >([]);
  const [onSubscriptionsClickCalls, setOnSubscriptionsClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onSubscriptionsClick']>>[]
  >([]);
  const [onInstancesClickCalls, setOnInstancesClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onInstancesClick']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onViewSubscriptions: props.onViewSubscriptions
        ? () => {
            setOnViewSubscriptionsCalls((calls) => [...calls, []]);
          }
        : undefined,
      onSubscriptionsClick: props.onSubscriptionsClick
        ? () => {
            setOnSubscriptionsClickCalls((calls) => [...calls, []]);
          }
        : undefined,
      onInstancesClick: props.onInstancesClick
        ? () => {
            setOnInstancesClickCalls((calls) => [...calls, []]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <SubscriptionsStoryComponent {...browserProps} />
      <div hidden>
        <input
          data-testid="onViewSubscriptions-calls"
          readOnly
          value={JSON.stringify(onViewSubscriptionsCalls)}
        />
        <input
          data-testid="onViewSubscriptions-count"
          readOnly
          value={String(onViewSubscriptionsCalls.length)}
        />
        <input
          data-testid="onSubscriptionsClick-calls"
          readOnly
          value={JSON.stringify(onSubscriptionsClickCalls)}
        />
        <input
          data-testid="onSubscriptionsClick-count"
          readOnly
          value={String(onSubscriptionsClickCalls.length)}
        />
        <input
          data-testid="onInstancesClick-calls"
          readOnly
          value={JSON.stringify(onInstancesClickCalls)}
        />
        <input
          data-testid="onInstancesClick-count"
          readOnly
          value={String(onInstancesClickCalls.length)}
        />
      </div>
    </>
  );
}
