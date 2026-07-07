import React from 'react';
import { Button, Flex, FlexItem, Skeleton } from '@patternfly/react-core';
import {
  ChartDonutUtilization,
  ChartLabel,
  ChartThemeColor,
  getTheme,
} from '@patternfly/react-charts/victory';
import styles from './StorageCard.module.scss';

export interface StorageData {
  /** storage usage by rosa clusters in tib */
  rosaClusters: number;
  /** storage usage by aro clusters in tib */
  aroClusters: number;
  /** storage usage by osd clusters in tib */
  osdClusters: number;
  /** total available storage in tib */
  available: number;
}

export interface StorageCardProps {
  /** storage data for different cluster types */
  storageData?: StorageData;
  /** callback when "view more" is clicked */
  onViewMore?: () => void;
  isLoading?: boolean;
}

const chartLabelFill = 'var(--pf-t--chart--global--label--fill, #1f1f1f)';

const clusterTypes: { key: keyof Omit<StorageData, 'available'>; label: string }[] = [
  { key: 'rosaClusters', label: 'ROSA clusters' },
  { key: 'aroClusters', label: 'ARO Clusters' },
  { key: 'osdClusters', label: 'OSD Clusters' },
];

export const StorageCard: React.FC<StorageCardProps> = ({ storageData, onViewMore, isLoading }) => {
  const blueTheme = getTheme(ChartThemeColor.blue);
  const legendColors = (blueTheme.chart?.colorScale?.slice(0, 3) ?? []) as string[];

  if (isLoading) {
    return (
      <Flex className={styles.content}>
        <FlexItem>
          <Flex
            spaceItems={{ default: 'spaceItemsLg' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <Skeleton
                shape="circle"
                width="200px"
                height="200px"
                screenreaderText="Loading storage data"
              />
            </FlexItem>
            <FlexItem>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Skeleton width="150px" fontSize="sm" />
                <Skeleton width="130px" fontSize="sm" />
                <Skeleton width="120px" fontSize="sm" />
                <Skeleton width="100px" fontSize="sm" />
              </Flex>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
    );
  }

  if (!storageData) return null;
  const { rosaClusters, aroClusters, osdClusters, available } = storageData;

  const totalUsed = rosaClusters + aroClusters + osdClusters;
  const totalStorage = totalUsed + available;
  const usagePercentage = totalStorage > 0 ? Math.round((totalUsed / totalStorage) * 100) : 0;

  return (
    <>
      <div className={styles.content}>
        <div className={styles.chartWrapper}>
          <ChartDonutUtilization
            ariaDesc="Storage utilization"
            ariaTitle="Storage utilization chart"
            constrainToVisibleArea
            data={{ x: 'Storage used', y: usagePercentage }}
            height={200}
            subTitle={`of ${totalStorage.toFixed(2)} TiB used`}
            title={`${usagePercentage}%`}
            titleComponent={<ChartLabel style={{ fill: chartLabelFill, fontSize: 22 }} />}
            subTitleComponent={<ChartLabel style={{ fill: chartLabelFill, fontSize: 14 }} />}
            width={200}
            padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
            name="storage-donut"
          />
        </div>

        <div className={styles.details}>
          <div className={styles.totalStorage}>
            <div className={styles.totalValue} data-testid="total-used">
              {totalUsed.toFixed(2)} TiB
            </div>
            <div className={styles.totalLabel}>Total storage used</div>
          </div>

          <div className={styles.breakdown}>
            {clusterTypes.map((type, idx) => (
              <div key={type.key} className={styles.breakdownItem}>
                <span className={styles.legendDot} style={{ backgroundColor: legendColors[idx] }} />
                <span className={styles.label}>{type.label}:</span>
                <span className={styles.value} data-testid={type.key}>
                  {storageData[type.key].toFixed(2)} TiB
                </span>
              </div>
            ))}
            <div className={styles.breakdownItem}>
              <span className={styles.label}>Available:</span>
              <span className={styles.value} data-testid="available">
                {available.toFixed(2)} TiB
              </span>
            </div>
          </div>
        </div>
      </div>
      {onViewMore && (
        <FlexItem className={styles.viewLink}>
          <Button variant="link" isInline onClick={onViewMore}>
            View more
          </Button>
        </FlexItem>
      )}
    </>
  );
};
