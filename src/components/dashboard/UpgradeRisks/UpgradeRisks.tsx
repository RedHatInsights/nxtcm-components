import { Flex, FlexItem, Button } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import styles from './UpgradeRisks.module.scss';

export type UpgradeRisksProps = {
  totalRisks: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  onViewRisks?: () => void;
  className?: string;
};

export const UpgradeRisks = ({
  totalRisks,
  criticalCount,
  warningCount,
  infoCount,
  onViewRisks,
}: UpgradeRisksProps) => {
  return (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
      <Flex
        direction={{ default: 'column' }}
        spaceItems={{ default: 'spaceItemsXs' }}
        className={styles.totalSection}
      >
        <FlexItem className={styles.totalNumber} data-testid="total-risks">
          {totalRisks}
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
              {criticalCount}
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
              {warningCount}
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
              {infoCount}
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
