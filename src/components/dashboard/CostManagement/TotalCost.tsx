import React from 'react';
import { Flex, FlexItem, Title } from '@patternfly/react-core';
import styles from './TotalCost.module.scss';

export interface TotalCostProps {
  totalCost: number;
  currency?: string;
}

export const TotalCost: React.FC<TotalCostProps> = ({ totalCost, currency = '$' }) => (
  <Flex
    direction={{ default: 'column' }}
    style={{
      paddingInline: 'var(--pf-t--global--spacer--md)',
      paddingBlockStart: 'var(--pf-t--global--spacer--md)',
    }}
  >
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
          <div className={styles.description}>
            This type of cost is the sum of the infrastructure cost and supplementary cost
          </div>
        </FlexItem>
      </Flex>
    </FlexItem>
  </Flex>
);
