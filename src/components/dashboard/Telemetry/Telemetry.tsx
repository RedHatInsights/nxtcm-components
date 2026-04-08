import { Flex, FlexItem } from '@patternfly/react-core';
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
  data: TelemetryData;
};

export const Telemetry: React.FC<TelemetryProps> = ({ data }) => {
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
            <ConnectedIcon className={styles.connectedIcon} />
          </FlexItem>
          <FlexItem className={styles.count} data-testid="connected-count">
            {connected}
          </FlexItem>
          <FlexItem className={styles.label}>connected clusters</FlexItem>
        </Flex>
      </FlexItem>

      <div className={styles.divider} role="separator" />

      <FlexItem flex={{ default: 'flex_1' }}>
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          className={styles.section}
        >
          <FlexItem>
            <DisconnectedIcon className={styles.disconnectedIcon} />
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
