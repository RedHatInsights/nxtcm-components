import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';
import React from 'react';
import styles from './TotalClusters.module.scss';

export type TotalClustersData = {
  /** total number of managed clusters */
  total: number;
};

export type TotalClustersProps = {
  /** cluster data to display */
  data: TotalClustersData;
  /** card title — defaults to "Total clusters" */
  title?: string;
  /** callback when the cluster count is clicked (navigates to clusters page) */
  onViewMore?: () => void;
};

const DEFAULT_TITLE = 'Total clusters';

export const TotalClusters: React.FC<TotalClustersProps> = ({
  data,
  title = DEFAULT_TITLE,
  onViewMore,
}) => (
  <Flex direction={{ default: 'column' }} className={styles.container}>
    {title && (
      <FlexItem>
        <Title headingLevel="h3" size="md" data-testid="total-clusters-title">
          {title}
        </Title>
      </FlexItem>
    )}

    <Flex
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsXs' }}
      className={styles.totalSection}
    >
      <FlexItem data-testid="total-clusters">
        {onViewMore ? (
          <Button variant="link" isInline onClick={onViewMore} className={styles.totalNumberLink}>
            {data.total}
          </Button>
        ) : (
          <span className={styles.totalNumber}>{data.total}</span>
        )}
      </FlexItem>
      <FlexItem className={styles.totalLabel}>managed clusters</FlexItem>
    </Flex>
  </Flex>
);
