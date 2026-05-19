import { Divider, Flex, FlexItem, Skeleton } from '@patternfly/react-core';
import ConnectedIcon from '@patternfly/react-icons/dist/esm/icons/connected-icon';
import DisconnectedIcon from '@patternfly/react-icons/dist/esm/icons/disconnected-icon';
import React from 'react';
import styles from './Telemetry.module.scss';

export type TelemetryData = {
  /** number of clusters reporting telemetry */
  connected: number;
  /** number of clusters not checking in */
  disconnected: number;
};

export type TelemetryProps = {
  /** telemetry status counts */
  data?: TelemetryData;
  /** renders skeleton placeholders when true or when data is undefined */
  isLoading?: boolean;
};

const SkeletonSection: React.FC<{ screenreaderText?: string }> = ({ screenreaderText }) => (
  <Flex
    direction={{ default: 'column' }}
    alignItems={{ default: 'alignItemsCenter' }}
    spaceItems={{ default: 'spaceItemsSm' }}
    className={styles.section}
  >
    <FlexItem>
      <Skeleton shape="circle" width="24px" height="24px" screenreaderText={screenreaderText} />
    </FlexItem>
    <FlexItem>
      <Skeleton width="40px" height="28px" />
    </FlexItem>
    <FlexItem>
      <Skeleton width="110px" fontSize="sm" />
    </FlexItem>
  </Flex>
);

export const Telemetry: React.FC<TelemetryProps> = ({ data, isLoading }) => {
  const showSkeleton = !!isLoading;

  if (showSkeleton) {
    return (
      <Flex className={styles.container}>
        <FlexItem flex={{ default: 'flex_1' }}>
          <SkeletonSection screenreaderText="Loading telemetry data" />
        </FlexItem>
        <Divider orientation={{ default: 'vertical' }} />
        <FlexItem flex={{ default: 'flex_1' }}>
          <SkeletonSection />
        </FlexItem>
      </Flex>
    );
  }

  if (!data) return null;
  const { connected, disconnected } = data;

  return (
    <Flex className={styles.container}>
      <FlexItem flex={{ default: 'flex_1' }}>
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          className={styles.section}
        >
          <FlexItem>
            <ConnectedIcon className={styles.connectedIcon} aria-hidden="true" />
          </FlexItem>
          <FlexItem className={styles.count} data-testid="connected-count">
            {connected}
          </FlexItem>
          <FlexItem className={styles.label}>connected clusters</FlexItem>
        </Flex>
      </FlexItem>

      <Divider orientation={{ default: 'vertical' }} />

      <FlexItem flex={{ default: 'flex_1' }}>
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          className={styles.section}
        >
          <FlexItem>
            <DisconnectedIcon className={styles.disconnectedIcon} aria-hidden="true" />
          </FlexItem>
          <FlexItem className={styles.count} data-testid="disconnected-count">
            {disconnected}
          </FlexItem>
          <FlexItem className={styles.label}>clusters not checking in</FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
};
