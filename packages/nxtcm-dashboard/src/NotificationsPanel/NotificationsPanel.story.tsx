import React from 'react';

// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { NotificationsPanel as NotificationsPanelStoryComponent } from './NotificationsPanel';

type BrowserProps = NonNullable<React.ComponentProps<typeof NotificationsPanelStoryComponent>>;

export type NotificationsPanelStoryGalleryProps = Omit<
  BrowserProps,
  'onNotificationClick' | 'notifications'
> & {
  onNotificationClick?: boolean;
  notifications?: (Omit<NonNullable<BrowserProps['notifications']>[number], 'onClick'> & {
    onClick?: boolean;
  })[];
};

export function NotificationsPanelStory(
  props: NotificationsPanelStoryGalleryProps
): React.ReactElement {
  const [onNotificationClickCalls, setOnNotificationClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onNotificationClick']>>[]
  >([]);
  const [onClickCalls, setOnClickCalls] = React.useState<
    Parameters<NonNullable<NonNullable<BrowserProps['notifications']>[number]['onClick']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onNotificationClick: props.onNotificationClick
        ? (...args) => {
            setOnNotificationClickCalls((calls) => [...calls, args]);
          }
        : undefined,
      notifications: props.notifications?.map((item) => ({
        ...item,
        onClick: item.onClick
          ? () => {
              setOnClickCalls((calls) => [...calls, []]);
            }
          : undefined,
      })),
    }),
    [props]
  );
  return (
    <>
      <NotificationsPanelStoryComponent {...browserProps} />
      <div hidden>
        <input
          data-testid="onNotificationClick-calls"
          readOnly
          value={JSON.stringify(onNotificationClickCalls)}
        />
        <input
          data-testid="onNotificationClick-count"
          readOnly
          value={String(onNotificationClickCalls.length)}
        />
        <input data-testid="onClick-calls" readOnly value={JSON.stringify(onClickCalls)} />
        <input data-testid="onClick-count" readOnly value={String(onClickCalls.length)} />
      </div>
    </>
  );
}
