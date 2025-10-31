import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Button,
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import styles from './UpgradeRisks.module.scss';

export interface UpgradeRisksProps {
  totalRisks: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  onViewRisks?: () => void;
  className?: string;
}

export const UpgradeRisks: React.FC<UpgradeRisksProps> = ({
  totalRisks,
  criticalCount,
  warningCount,
  infoCount,
  onViewRisks,
  className = '',
}) => {
  return (
    <Card className={`${styles.upgradeRisksCard} ${className}`}>
      <CardHeader data-testid="header">
        <CardTitle className={styles.cardTitle}>Upgrade risks</CardTitle>
      </CardHeader>
      <CardBody>
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
              <FlexItem className={styles.riskIcon}>
                <ExclamationCircleIcon className={styles.criticalIcon} />
              </FlexItem>
              <FlexItem className={styles.riskCount} data-testid="criticalCount">
                {criticalCount}
              </FlexItem>
              <FlexItem className={styles.riskLabel}>Critical</FlexItem>
            </Flex>

            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
              flex={{ default: 'flex_1' }}
            >
              <FlexItem className={styles.riskIcon}>
                <ExclamationTriangleIcon className={styles.warningIcon} />
              </FlexItem>
              <FlexItem className={styles.riskCount} data-testid="warningCount">
                {warningCount}
              </FlexItem>
              <FlexItem className={styles.riskLabel}>Warning</FlexItem>
            </Flex>

            <Flex
              direction={{ default: 'column' }}
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsXs' }}
              flex={{ default: 'flex_1' }}
            >
              <FlexItem className={styles.riskIcon}>
                <InfoCircleIcon className={styles.infoIcon} />
              </FlexItem>
              <FlexItem className={styles.riskCount} data-testid="infoCount">
                {infoCount}
              </FlexItem>
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
      </CardBody>
    </Card>
  );
};
