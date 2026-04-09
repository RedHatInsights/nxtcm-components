import { Button, Flex, FlexItem } from '@patternfly/react-core';
import ClusterIcon from '@patternfly/react-icons/dist/esm/icons/cluster-icon';
import React from 'react';
import styles from './TotalClusters.module.scss';

export type ClusterBreakdown = {
  /** cluster type label (e.g. "ROSA", "ARO", "OSD") */
  label: string;
  /** number of clusters of this type */
  count: number;
};

export type TotalClustersData = {
  /** total number of managed clusters */
  total: number;
  /** optional per-type breakdown */
  breakdown?: ClusterBreakdown[];
};

export type TotalClustersProps = {
  /** cluster data to display */
  data: TotalClustersData;
  /** callback when "View all clusters" is clicked */
  onViewMore?: () => void;
};

export const TotalClusters: React.FC<TotalClustersProps> = ({ data, onViewMore }) => {
  const { total, breakdown } = data;

  return (
    <Flex direction={{ default: 'column' }} className={styles.container}>
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsXs' }}
        className={styles.totalSection}
      >
        <FlexItem className={styles.totalNumber} data-testid="total-clusters">
          {total}
        </FlexItem>
        <FlexItem className={styles.totalLabel}>total managed clusters</FlexItem>
      </Flex>

      {breakdown && breakdown.length > 0 && (
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          spaceItems={{ default: 'spaceItemsMd' }}
          className={styles.breakdown}
        >
          {breakdown.map((item) => (
            <Flex
              key={item.label}
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
              flex={{ default: 'flex_1' }}
            >
              <FlexItem className={styles.breakdownCount} data-testid={`count-${item.label}`}>
                {item.count}
              </FlexItem>
              <FlexItem>
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsXs' }}
                >
                  <ClusterIcon className={styles.icon} />
                  <span className={styles.breakdownLabel}>{item.label}</span>
                </Flex>
              </FlexItem>
            </Flex>
          ))}
        </Flex>
      )}

      {onViewMore && (
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} className={styles.viewLink}>
          <FlexItem>
            <Button variant="link" onClick={onViewMore}>
              View all clusters
            </Button>
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );
};
