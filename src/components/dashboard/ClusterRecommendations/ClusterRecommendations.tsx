import { Critical, CriticalProps } from './Critical';
import {
  RecommendationByCategory,
  RecommendationByCategoryProps,
} from './RecommendationByCategory';

export type ClusterRecommendationProps = CriticalProps & RecommendationByCategoryProps;

export const ClusterRecommendations = ({
  count,
  onViewRecommendations,
  ...rest
}: ClusterRecommendationProps) => (
  <>
    <Critical count={count} onViewRecommendations={onViewRecommendations} />
    {count > 1 && <RecommendationByCategory {...rest} />}
  </>
);
