import { Button, Flex, FlexItem, Skeleton, Title } from '@patternfly/react-core';
import React from 'react';
import styles from './TotalClusters.module.scss';

export type TotalClustersData = {
  /** total number of managed clusters */
  total: number;
};

export type TotalClustersProps = {
  /** cluster data to display */
  data?: TotalClustersData;
  /** card title — defaults to "Total clusters" */
  title?: string;
  /** callback when the cluster count is clicked (navigates to clusters page) */
  onViewMore?: () => void;
  /** renders skeleton placeholders when true */
  isLoading?: boolean;
};

const DEFAULT_TITLE = 'Total clusters';

export const TotalClusters: React.FC<TotalClustersProps> = ({
  data,
  title = DEFAULT_TITLE,
  onViewMore,
  isLoading,
}) => {
  const showSkeleton = !!isLoading;

  return (
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
        {showSkeleton ? (
          <>
            <FlexItem>
              <Skeleton width="60px" height="38px" screenreaderText="Loading cluster count" />
            </FlexItem>
            <FlexItem>
              <Skeleton width="120px" fontSize="sm" />
            </FlexItem>
          </>
        ) : data ? (
          <>
            <FlexItem data-testid="total-clusters">
              {onViewMore ? (
                <Button
                  variant="link"
                  isInline
                  onClick={onViewMore}
                  className={styles.totalNumberLink}
                >
                  {data.total}
                </Button>
              ) : (
                <span className={styles.totalNumber}>{data.total}</span>
              )}
            </FlexItem>
            <FlexItem className={styles.totalLabel}>managed clusters</FlexItem>
          </>
        ) : null}
      </Flex>
    </Flex>
  );
};
