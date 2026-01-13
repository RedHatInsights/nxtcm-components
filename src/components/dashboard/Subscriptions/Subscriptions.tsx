import { Button, Flex, FlexItem } from '@patternfly/react-core';
import FolderIcon from '@patternfly/react-icons/dist/esm/icons/folder-icon';
import ServerIcon from '@patternfly/react-icons/dist/esm/icons/server-icon';
import styles from './Subscriptions.module.scss';

export type SubscriptionsProps = {
  subscriptionCount: number;
  instanceCount: number;
  onViewSubscriptions?: () => void;
};

export const Subscriptions = ({
  subscriptionCount,
  instanceCount,
  onViewSubscriptions,
}: SubscriptionsProps) => {
  return (
    <Flex direction={{ default: 'column' }} className={styles.subscriptions}>
      <FlexItem className={styles.description} data-testid="subscriptions-description">
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
          <FlexItem className={styles.count} data-testid="subscription-count">
            {subscriptionCount}
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
          <FlexItem className={styles.count} data-testid="instance-count">
            {instanceCount}
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
