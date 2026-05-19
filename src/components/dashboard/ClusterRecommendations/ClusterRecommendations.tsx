import { Flex, FlexItem, Skeleton } from '@patternfly/react-core';
import { Critical } from './Critical';
import { Category, RecommendationByCategory } from './RecommendationByCategory';

export type ClusterRecommendationProps = {
  count?: number;
  onViewRecommendations: () => void;
  serviceAvailability: number;
  performance: number;
  security: number;
  faultTolerance: number;
  onCategoryClick: (category: Category) => void;
  isLoading?: boolean;
};

export const ClusterRecommendations = ({
  count,
  onViewRecommendations,
  isLoading,
  serviceAvailability,
  performance,
  security,
  faultTolerance,
  onCategoryClick,
}: ClusterRecommendationProps) => {
  if (isLoading) {
    return (
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsMd' }}
        alignItems={{ default: 'alignItemsCenter' }}
        style={{ padding: '1rem' }}
      >
        <FlexItem>
          <Skeleton
            width="200px"
            height="22px"
            screenreaderText="Loading cluster recommendations"
          />
        </FlexItem>
        <FlexItem>
          <Skeleton width="90%" fontSize="sm" />
        </FlexItem>
        <FlexItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            <FlexItem>
              <Skeleton shape="circle" width="24px" height="24px" />
            </FlexItem>
            <FlexItem>
              <Skeleton width="30px" height="30px" />
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Skeleton width="150px" fontSize="sm" />
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
