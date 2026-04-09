import { Divider, Flex, FlexItem } from '@patternfly/react-core';
import CheckCircleIcon from '@patternfly/react-icons/dist/esm/icons/check-circle-icon';
import InProgressIcon from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';
import SyncAltIcon from '@patternfly/react-icons/dist/esm/icons/sync-alt-icon';
import React from 'react';
import styles from './UpdateStatus.module.scss';

export type UpdateStatusData = {
  /** number of clusters running the latest version */
  upToDate: number;
  /** number of clusters with an update available */
  updateAvailable: number;
  /** number of clusters currently updating (omit if not applicable) */
  currentlyUpdating?: number;
};

export type UpdateStatusProps = {
  /** update status counts */
  data: UpdateStatusData;
};

export const UpdateStatus: React.FC<UpdateStatusProps> = ({ data }) => {
  const { upToDate, updateAvailable, currentlyUpdating } = data;
  const showUpdating = currentlyUpdating !== undefined;

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
            <CheckCircleIcon className={styles.upToDateIcon} aria-hidden="true" />
          </FlexItem>
          <FlexItem className={styles.count} data-testid="up-to-date-count">
            {upToDate}
          </FlexItem>
          <FlexItem className={styles.label}>clusters up-to-date</FlexItem>
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
            <SyncAltIcon className={styles.updateAvailableIcon} aria-hidden="true" />
          </FlexItem>
          <FlexItem className={styles.count} data-testid="update-available-count">
            {updateAvailable}
          </FlexItem>
          <FlexItem className={styles.label}>clusters with update available</FlexItem>
        </Flex>
      </FlexItem>

      {showUpdating && (
        <>
          <Divider orientation={{ default: 'vertical' }} />

          <FlexItem flex={{ default: 'flex_1' }}>
            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
              className={styles.section}
            >
              <FlexItem>
                <InProgressIcon className={styles.updatingIcon} aria-hidden="true" />
              </FlexItem>
              <FlexItem className={styles.count} data-testid="currently-updating-count">
                {currentlyUpdating}
              </FlexItem>
              <FlexItem className={styles.label}>currently updating</FlexItem>
            </Flex>
          </FlexItem>
        </>
      )}
    </Flex>
  );
};
