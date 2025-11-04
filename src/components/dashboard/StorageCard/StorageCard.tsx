import React from 'react';
import { Card, CardTitle, CardBody, CardFooter } from '@patternfly/react-core';
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
  storageData: StorageData;
  /** callback when "view more" is clicked */
  onViewMore?: () => void;
}

/**
 * storage card displays storage usage statistics across different cluster types
 * with a visual percentage indicator
 */
export const StorageCard: React.FC<StorageCardProps> = ({ storageData, onViewMore }) => {
  const { rosaClusters, aroClusters, osdClusters, available } = storageData;

  // calculate totals
  const totalUsed = rosaClusters + aroClusters + osdClusters;
  const totalStorage = totalUsed + available;
  const usagePercentage = Math.round((totalUsed / totalStorage) * 100);

  // calculate stroke offset for circular progress (circumference = 2 * π * r)
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (usagePercentage / 100) * circumference;

  return (
    <Card className={styles.storageCard}>
      <CardTitle>Storage</CardTitle>
      <CardBody>
        <div className={styles.content}>
          {/* circular progress indicator */}
          <div className={styles.circularProgress}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* background circle */}
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#d2d2d2" strokeWidth="16" />
              {/* progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="#0066cc"
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
                className={styles.progressCircle}
              />
            </svg>
            <div className={styles.percentageLabel}>
              <div className={styles.percentage}>{usagePercentage}%</div>
              <div className={styles.sublabel}>of {totalStorage.toFixed(2)} TiB used</div>
            </div>
          </div>

          {/* storage details */}
          <div className={styles.details}>
            <div className={styles.totalStorage}>
              <div className={styles.totalValue}>{totalUsed.toFixed(2)} TiB</div>
              <div className={styles.totalLabel}>Total storage used</div>
            </div>

            <div className={styles.breakdown}>
              <div className={styles.breakdownItem}>
                <span className={`${styles.dot} ${styles.rosaDot}`}></span>
                <span className={styles.label}>ROSA clusters:</span>
                <span className={styles.value}>{rosaClusters.toFixed(2)} TiB</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={`${styles.dot} ${styles.aroDot}`}></span>
                <span className={styles.label}>ARO Clusters:</span>
                <span className={styles.value}>{aroClusters.toFixed(2)} TiB</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={`${styles.dot} ${styles.osdDot}`}></span>
                <span className={styles.label}>OSD Clusters:</span>
                <span className={styles.value}>{osdClusters.toFixed(2)} TiB</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.label}>Available:</span>
                <span className={styles.value}>{available.toFixed(2)} TiB</span>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      {onViewMore && (
        <CardFooter>
          <button onClick={onViewMore} className={styles.viewMore}>
            View more
          </button>
        </CardFooter>
      )}
    </Card>
  );
};
