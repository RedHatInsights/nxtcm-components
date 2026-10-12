import React from 'react';

// See docs/agent-rules/playwright-ct.md for Playwright component test conventions.
import { CVECard as CVECardStoryComponent } from './CVECard';

type BrowserProps = NonNullable<React.ComponentProps<typeof CVECardStoryComponent>>;

export type CVECardStoryGalleryProps = Omit<BrowserProps, 'cveData'> & {
  cveData?: (Omit<NonNullable<BrowserProps['cveData']>[number], 'onViewClick'> & {
    onViewClick?: boolean;
  })[];
};

export function CVECardStory(props: CVECardStoryGalleryProps): React.ReactElement {
  const [onViewClickCalls, setOnViewClickCalls] = React.useState<
    Parameters<NonNullable<NonNullable<BrowserProps['cveData']>[number]['onViewClick']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      cveData: props.cveData?.map((item) => ({
        ...item,
        onViewClick: item.onViewClick
          ? () => {
              setOnViewClickCalls((calls) => [...calls, []]);
            }
          : undefined,
      })),
    }),
    [props]
  );
  return (
    <>
      <CVECardStoryComponent {...browserProps} />
      <div hidden>
        <input data-testid="onViewClick-calls" readOnly value={JSON.stringify(onViewClickCalls)} />
        <input data-testid="onViewClick-count" readOnly value={String(onViewClickCalls.length)} />
      </div>
    </>
  );
}
