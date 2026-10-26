import React from 'react';

import { ClusterRecommendations as ClusterRecommendationsStoryComponent } from './ClusterRecommendations';

type BrowserProps = NonNullable<React.ComponentProps<typeof ClusterRecommendationsStoryComponent>>;

export type ClusterRecommendationsStoryGalleryProps = Omit<
  BrowserProps,
  'onViewRecommendations' | 'onCategoryClick'
> & {
  onViewRecommendations?: boolean;
  onCategoryClick?: boolean;
};

export function ClusterRecommendationsStory(
  props: ClusterRecommendationsStoryGalleryProps
): React.ReactElement {
  const [onViewRecommendationsCalls, setOnViewRecommendationsCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onViewRecommendations']>>[]
  >([]);
  const [onCategoryClickCalls, setOnCategoryClickCalls] = React.useState<
    Parameters<NonNullable<BrowserProps['onCategoryClick']>>[]
  >([]);
  const browserProps = React.useMemo<BrowserProps>(
    () => ({
      ...props,
      onViewRecommendations: props.onViewRecommendations
        ? () => {
            setOnViewRecommendationsCalls((calls) => [...calls, []]);
          }
        : () => {},
      onCategoryClick: props.onCategoryClick
        ? (...args) => {
            setOnCategoryClickCalls((calls) => [...calls, args]);
          }
        : () => {},
    }),
    [props]
  );
  return (
    <>
      <ClusterRecommendationsStoryComponent {...browserProps} />
      <div hidden>
        <input
          data-testid="onViewRecommendations-calls"
          readOnly
          value={JSON.stringify(onViewRecommendationsCalls)}
        />
        <input
          data-testid="onViewRecommendations-count"
          readOnly
          value={String(onViewRecommendationsCalls.length)}
        />
        <input
          data-testid="onCategoryClick-calls"
          readOnly
          value={JSON.stringify(onCategoryClickCalls)}
        />
        <input
          data-testid="onCategoryClick-count"
          readOnly
          value={String(onCategoryClickCalls.length)}
        />
      </div>
    </>
  );
}
