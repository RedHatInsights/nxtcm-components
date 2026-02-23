import React from 'react';
import { Button, Flex, FlexItem, Title } from '@patternfly/react-core';
import styles from './TotalCost.module.scss';

export interface TotalCostProps {
  totalCost: number;
  currency?: string;
  onViewMore?: () => void;
}

export const TotalCost: React.FC<TotalCostProps> = ({ totalCost, currency = '$', onViewMore }) => (
  <Flex direction={{ default: 'column' }} style={{ height: '100%', padding: '1rem' }}>
    <FlexItem data-testid="cost-title">
      <Title headingLevel="h3" size="md">
        Cost Management
      </Title>
    </FlexItem>
    <FlexItem data-testid="cost-description">
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <div className={styles.totalValue} data-testid="total-cost">
            {currency}
            {totalCost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </FlexItem>
        <FlexItem>
          <Flex
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            alignItems={{ default: 'alignItemsCenter' }}
          >
            <FlexItem>
              <div className={styles.description}>
                This type of cost is the sum of the infrastructure cost and supplementary cost
              </div>
            </FlexItem>
            {onViewMore && (
              <FlexItem>
                <Button variant="link" isInline onClick={onViewMore}>
                  View more cost information
                </Button>
              </FlexItem>
            )}
          </Flex>
        </FlexItem>
      </Flex>
    </FlexItem>
  </Flex>
);
