import { Button, Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';
import styles from './TotalClusters.module.scss';

export type TotalClustersData = {
  /** total number of managed clusters */
  total: number;
};

export type TotalClustersProps = {
  /** cluster data to display */
  data: TotalClustersData;
  /** callback when "View all clusters" is clicked */
  onViewMore?: () => void;
};

export const TotalClusters: React.FC<TotalClustersProps> = ({ data, onViewMore }) => (
  <Flex direction={{ default: 'column' }} className={styles.container}>
    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
      className={styles.totalSection}
    >
      <FlexItem className={styles.totalNumber} data-testid="total-clusters">
        {data.total}
      </FlexItem>
      <FlexItem className={styles.totalLabel}>total managed clusters</FlexItem>
    </Flex>

    {onViewMore && (
      <FlexItem className={styles.viewLink}>
        <Button variant="link" isInline onClick={onViewMore}>
          View all clusters
        </Button>
      </FlexItem>
    )}
  </Flex>
);
