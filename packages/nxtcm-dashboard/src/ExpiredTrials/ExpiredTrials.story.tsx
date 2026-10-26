import React from 'react';

import {
  ExpiredTrials,
  ExpiredTrials as ExpiredTrialsStoryComponent,
  ExpiredTrialsProps,
} from './ExpiredTrials';

// playwright CT can't serialize functions that return data across process
// boundaries, so this wrapper defines rowActions in the browser context
export const ExpiredTrialsWithActions: React.FC<{
  data: ExpiredTrialsProps['data'];
}> = ({ data }) => (
  <ExpiredTrials
    data={data}
    rowActions={() => [{ title: 'Edit subscription' }, { title: 'Archive cluster' }]}
  />
);

type BrowserProps = NonNullable<React.ComponentProps<typeof ExpiredTrialsStoryComponent>>;

export type ExpiredTrialsStoryGalleryProps = Omit<
  BrowserProps,
  'onTrialClick' | 'onPageChange' | 'onPageSizeChange'
> & {
  onTrialClick?: boolean;
  onPageChange?: boolean;
  onPageSizeChange?: boolean;
};

export function ExpiredTrialsStory(props: ExpiredTrialsStoryGalleryProps): React.ReactElement {
  const [onTrialClickCalls, setOnTrialClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onTrialClick']>>[]
  >([]);
  const [onPageChangeCalls, setOnPageChangeCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onPageChange']>>[]
  >([]);
  const [onPageSizeChangeCalls, setOnPageSizeChangeCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onPageSizeChange']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onTrialClick: props.onTrialClick
        ? (...args) => {
            setOnTrialClickCalls((calls) => [...calls, args]);
          }
        : undefined,
      onPageChange: props.onPageChange
        ? (...args) => {
            setOnPageChangeCalls((calls) => [...calls, args]);
          }
        : undefined,
      onPageSizeChange: props.onPageSizeChange
        ? (...args) => {
            setOnPageSizeChangeCalls((calls) => [...calls, args]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <ExpiredTrialsStoryComponent {...browserProps} />
      <div hidden>
        <input
          data-testid="onTrialClick-calls"
          readOnly
          value={JSON.stringify(onTrialClickCalls)}
        />
        <input data-testid="onTrialClick-count" readOnly value={String(onTrialClickCalls.length)} />
        <input
          data-testid="onPageChange-calls"
          readOnly
          value={JSON.stringify(onPageChangeCalls)}
        />
        <input data-testid="onPageChange-count" readOnly value={String(onPageChangeCalls.length)} />
        <input
          data-testid="onPageSizeChange-calls"
          readOnly
          value={JSON.stringify(onPageSizeChangeCalls)}
        />
        <input
          data-testid="onPageSizeChange-count"
          readOnly
          value={String(onPageSizeChangeCalls.length)}
        />
      </div>
    </>
  );
}
