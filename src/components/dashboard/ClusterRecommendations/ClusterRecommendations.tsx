import { Flex, FlexItem, Skeleton } from '@patternfly/react-core';
import { Critical, CriticalProps } from './Critical';
import {
  RecommendationByCategory,
  RecommendationByCategoryProps,
} from './RecommendationByCategory';

export type ClusterRecommendationProps = Partial<CriticalProps> &
  Partial<RecommendationByCategoryProps> & {
    isLoading?: boolean;
  };

export const ClusterRecommendations = ({
  count,
  onViewRecommendations = () => {},
  isLoading,
  serviceAvailability = 0,
  performance = 0,
  security = 0,
  faultTolerance = 0,
  onCategoryClick = () => {},
}: ClusterRecommendationProps) => {
  const showSkeleton = isLoading || count === undefined;

  if (showSkeleton) {
    return (
      <Flex direction={{ default: 'column' }} style={{ padding: '1rem' }}>
        <FlexItem data-testid="cluster-recommendations-skeleton">
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <FlexItem>
              <Skeleton
                width="200px"
                height="22px"
                screenreaderText="Loading cluster recommendations"
              />
            </FlexItem>
            <FlexItem>
              <Skeleton width="90%" height="14px" />
            </FlexItem>
            <FlexItem>
              <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }}>
                <FlexItem>
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <Skeleton shape="circle" width="24px" height="24px" />
                    <Skeleton width="30px" height="30px" />
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Skeleton width="150px" height="14px" />
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    );
  }

  return (
    <>
      <Critical count={count} onViewRecommendations={onViewRecommendations} />
      {count > 1 && (
        <RecommendationByCategory
          serviceAvailability={serviceAvailability}
          performance={performance}
          security={security}
          faultTolerance={faultTolerance}
          onCategoryClick={onCategoryClick}
        />
      )}
    </>
  );
};
