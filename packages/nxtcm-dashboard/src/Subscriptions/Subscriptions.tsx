import { Button, Flex, FlexItem, Skeleton } from '@patternfly/react-core';
import FolderIcon from '@patternfly/react-icons/dist/esm/icons/folder-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import styles from './Subscriptions.module.scss';

export type SubscriptionsProps = {
  subscriptionCount?: number;
  instanceCount?: number;
  onViewSubscriptions?: () => void;
  onSubscriptionsClick?: () => void;
  onInstancesClick?: () => void;
  isLoading?: boolean;
};

export const Subscriptions = ({
  subscriptionCount,
  instanceCount,
  onViewSubscriptions,
  onSubscriptionsClick,
  onInstancesClick,
  isLoading,
}: SubscriptionsProps) => {
  const showSkeleton = !!isLoading;

  if (showSkeleton) {
    return (
      <Flex direction={{ default: 'column' }} className={styles.subscriptions}>
        <FlexItem>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <Skeleton width="80%" fontSize="sm" screenreaderText="Loading subscriptions" />
            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              spaceItems={{ default: 'spaceItemsLg' }}
              className={styles.metrics}
            >
              {[0, 1].map((col) => (
                <Flex
                  key={col}
                  direction={{ default: 'column' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsXs' }}
                  flex={{ default: 'flex_1' }}
                >
                  <FlexItem>
                    <Skeleton width="40px" height="28px" />
                  </FlexItem>
                  <FlexItem>
                    <Skeleton width="80px" fontSize="sm" />
                  </FlexItem>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </FlexItem>
      </Flex>
    );
  }

  return (
    <Flex direction={{ default: 'column' }} className={styles.subscriptions}>
      <FlexItem className={styles.description}>
        Monitor your OpenShift usage for both Annual and On-Demand subscriptions.
      </FlexItem>

      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsLg' }}
        className={styles.metrics}
      >
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsXs' }}
          flex={{ default: 'flex_1' }}
        >
          <FlexItem>
            {onSubscriptionsClick ? (
              <Button
                variant="plain"
                className={`${styles.count} ${styles.clickableCount}`}
                onClick={onSubscriptionsClick}
              >
                {subscriptionCount}
              </Button>
            ) : (
              <span className={styles.count}>{subscriptionCount}</span>
            )}
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
            >
              <FolderIcon className={styles.icon} />
              <span className={styles.label}>Subscriptions</span>
            </Flex>
          </FlexItem>
        </Flex>

        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsXs' }}
          flex={{ default: 'flex_1' }}
        >
          <FlexItem>
            {onInstancesClick ? (
              <Button
                variant="plain"
                className={`${styles.count} ${styles.clickableCount}`}
                onClick={onInstancesClick}
              >
                {instanceCount ?? 0}
              </Button>
            ) : (
              <span className={styles.count}>{instanceCount ?? 0}</span>
            )}
          </FlexItem>
          <FlexItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
            >
              <ServerIcon className={styles.icon} />
              <span className={styles.label}>Instances</span>
            </Flex>
          </FlexItem>
        </Flex>
      </Flex>

      {onViewSubscriptions && (
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} className={styles.viewLink}>
          <FlexItem>
            <Button variant="link" onClick={onViewSubscriptions}>
              View subscriptions
            </Button>
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );
};
