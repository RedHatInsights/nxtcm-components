import React from 'react';

import { UpgradeRisks as UpgradeRisksStoryComponent } from './UpgradeRisks';

type BrowserProps = NonNullable<React.ComponentProps<typeof UpgradeRisksStoryComponent>>;

export type UpgradeRisksStoryGalleryProps = Omit<BrowserProps, 'onViewRisks'> & {
  onViewRisks?: boolean;
};

export function UpgradeRisksStory(props: UpgradeRisksStoryGalleryProps): React.ReactElement {
  const [onViewRisksCalls, setOnViewRisksCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onViewRisks']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onViewRisks: props.onViewRisks
        ? () => {
            setOnViewRisksCalls((calls) => [...calls, []]);
          }
        : undefined,
    }),
    [props]
  );
  return (
    <>
      <UpgradeRisksStoryComponent {...browserProps} />
      <div hidden>
        <input data-testid="onViewRisks-calls" readOnly value={JSON.stringify(onViewRisksCalls)} />
        <input data-testid="onViewRisks-count" readOnly value={String(onViewRisksCalls.length)} />
      </div>
    </>
  );
}
