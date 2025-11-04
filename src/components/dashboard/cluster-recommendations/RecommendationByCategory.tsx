import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { SquareFullIcon } from '@patternfly/react-icons';

import styles from './RecommendationByCategory.module.scss';

export type Category = 'serviceAvailability' | 'performance' | 'security' | 'faultTolerance';

export type RecommendationByCategoryProps = {
  serviceAvailability: number;
  performance: number;
  security: number;
  faultTolerance: number;
  onCategoryClick: (category: Category) => void;
};

export const RecommendationByCategory = ({
  serviceAvailability,
  performance,
  security,
  faultTolerance,
  onCategoryClick,
}: RecommendationByCategoryProps) => {
  const total = serviceAvailability + performance + security + faultTolerance;
  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%', padding: '1rem' }}>
      <FlexItem>
        <h3>Recommendation by Category</h3>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Flex className={styles.legend}>
          <FlexItem>
            <SquareFullIcon className={styles.serviceAvailability} />
            <Button onClick={() => onCategoryClick('serviceAvailability')} variant="link">
              Service availability: {serviceAvailability}
            </Button>
          </FlexItem>
          <FlexItem>
            <SquareFullIcon className={styles.performance} />
            <Button onClick={() => onCategoryClick('performance')} variant="link">
              Performance: {performance}
            </Button>
          </FlexItem>
          <FlexItem>
            <SquareFullIcon className={styles.security} />
            <Button onClick={() => onCategoryClick('security')} variant="link">
              Security: {security}
            </Button>
          </FlexItem>
          <FlexItem>
            <SquareFullIcon className={styles.faultTolerance} />
            <Button onClick={() => onCategoryClick('faultTolerance')} variant="link">
              Fault tolerance: {faultTolerance}
            </Button>
          </FlexItem>
        </Flex>
        <div className={styles.bar}>
          <div
            className={styles.serviceAvailability}
            style={{ width: `${(serviceAvailability / total) * 100}%` }}
          >
            &nbsp;
          </div>
          <div className={styles.performance} style={{ width: `${(performance / total) * 100}%` }}>
            &nbsp;
          </div>
          <div className={styles.security} style={{ width: `${(security / total) * 100}%` }}>
            &nbsp;
          </div>
          <div
            className={styles.faultTolerance}
            style={{ width: `${(faultTolerance / total) * 100}%` }}
          >
            &nbsp;
          </div>
        </div>
      </FlexItem>
    </Flex>
  );
};
