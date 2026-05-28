import { Flex, FlexItem, Button, Skeleton } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import styles from './UpgradeRisks.module.scss';

export type UpgradeRisksProps = {
  totalRisks?: number;
  criticalCount?: number;
  warningCount?: number;
  infoCount?: number;
  onViewRisks?: () => void;
  className?: string;
  isLoading?: boolean;
};

export const UpgradeRisks = ({
  totalRisks,
  criticalCount,
  warningCount,
  infoCount,
  onViewRisks,
  isLoading,
}: UpgradeRisksProps) => {
  const showSkeleton = !!isLoading;

  if (showSkeleton) {
    return (
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
        <FlexItem>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            <Flex
              direction={{ default: 'column' }}
              spaceItems={{ default: 'spaceItemsXs' }}
              className={styles.totalSection}
            >
              <FlexItem>
                <Skeleton width="60px" height="38px" screenreaderText="Loading upgrade risks" />
              </FlexItem>
              <FlexItem>
                <Skeleton width="120px" fontSize="sm" />
              </FlexItem>
            </Flex>

            <Flex
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              spaceItems={{ default: 'spaceItemsMd' }}
            >
              {[0, 1, 2].map((col) => (
                <Flex
                  key={col}
                  direction={{ default: 'column' }}
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsXs' }}
                  flex={{ default: 'flex_1' }}
                >
                  <Flex
                    direction={{ default: 'row' }}
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsXs' }}
                  >
                    <FlexItem>
                      <Skeleton shape="circle" width="20px" height="20px" />
                    </FlexItem>
                    <FlexItem>
                      <Skeleton width="24px" height="28px" />
                    </FlexItem>
                  </Flex>
                  <FlexItem>
                    <Skeleton width="60px" fontSize="sm" />
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
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsXs' }}
        className={styles.totalSection}
      >
        <FlexItem className={styles.totalNumber} data-testid="total-risks">
          {totalRisks ?? 0}
        </FlexItem>
        <FlexItem className={styles.totalLabel}>total number of upgrade risks</FlexItem>
      </Flex>

      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsXs' }}
          flex={{ default: 'flex_1' }}
        >
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            <FlexItem className={styles.riskIcon}>
              <ExclamationCircleIcon className={styles.criticalIcon} />
            </FlexItem>
            <FlexItem className={styles.riskCount} data-testid="criticalCount">
              {criticalCount ?? 0}
            </FlexItem>
          </Flex>
          <FlexItem className={styles.riskLabel}>Critical</FlexItem>
        </Flex>

        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsXs' }}
          flex={{ default: 'flex_1' }}
        >
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            <FlexItem className={styles.riskIcon}>
              <ExclamationTriangleIcon className={styles.warningIcon} />
            </FlexItem>
            <FlexItem className={styles.riskCount} data-testid="warningCount">
              {warningCount ?? 0}
            </FlexItem>
          </Flex>
          <FlexItem className={styles.riskLabel}>Warning</FlexItem>
        </Flex>

        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsXs' }}
          flex={{ default: 'flex_1' }}
        >
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            <FlexItem className={styles.riskIcon}>
              <InfoCircleIcon className={styles.infoIcon} />
            </FlexItem>
            <FlexItem className={styles.riskCount} data-testid="infoCount">
              {infoCount ?? 0}
            </FlexItem>
          </Flex>
          <FlexItem className={styles.riskLabel}>Info</FlexItem>
        </Flex>
      </Flex>

      {onViewRisks && (
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }} className={styles.viewLink}>
          <FlexItem>
            <Button variant="link" onClick={onViewRisks}>
              View upgrade risks
            </Button>
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );
};
