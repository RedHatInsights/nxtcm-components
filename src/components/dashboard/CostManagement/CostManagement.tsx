import React from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import styles from './CostManagement.module.scss';

export interface ClusterCost {
  /** unique cluster identifier */
  id: string;
  /** display name of the cluster */
  name: string;
  /** cost for this cluster */
  cost: number;
}

export interface CostManagementProps {
  /** total month-to-date cost */
  totalCost: number;
  /** top clusters sorted by cost descending */
  clusters: ClusterCost[];
  /** currency unit string, e.g. "USD" */
  currency?: string;
  /** fired when a cluster name link is clicked */
  onClusterClick?: (cluster: ClusterCost) => void;
  /** fired when "View more in Cost Management" is clicked */
  onViewMore?: () => void;
}

const formatCurrency = (value: number, units: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: units,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatPercentage = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const CostManagement: React.FC<CostManagementProps> = ({
  totalCost,
  clusters,
  currency = 'USD',
  onClusterClick,
  onViewMore,
}) => (
  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
    <FlexItem className={styles.section}>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FlexItem>
          <Title headingLevel="h3" size="md">
            Cost Management
          </Title>
        </FlexItem>
        <FlexItem>
          <div className={styles.totalValue} data-testid="total-cost">
            {formatCurrency(totalCost, currency)}
          </div>
        </FlexItem>
        <FlexItem>
          <div className={styles.description}>Month-to-date cost</div>
        </FlexItem>
      </Flex>
    </FlexItem>

    {clusters.length > 0 && (
      <>
        <Divider />

        <FlexItem className={styles.section}>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
            <FlexItem>
              <Title headingLevel="h4" size="md">
                Top clusters
              </Title>
            </FlexItem>
            <FlexItem>
              <DescriptionList data-testid="cluster-list">
                {clusters.map((cluster) => {
                  const percentage = totalCost > 0 ? cluster.cost / totalCost : 0;
                  const costLabel = `${formatCurrency(cluster.cost, currency)} (${formatPercentage(percentage)})`;

                  return (
                    <DescriptionListGroup key={cluster.id}>
                      <DescriptionListTerm data-testid={`cluster-name-${cluster.id}`}>
                        {onClusterClick ? (
                          <Button variant="link" isInline onClick={() => onClusterClick(cluster)}>
                            {cluster.name}
                          </Button>
                        ) : (
                          cluster.name
                        )}
                      </DescriptionListTerm>
                      <DescriptionListDescription data-testid={`cluster-cost-${cluster.id}`}>
                        {costLabel}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  );
                })}
              </DescriptionList>
            </FlexItem>
          </Flex>
        </FlexItem>
      </>
    )}

    {onViewMore && (
      <FlexItem className={styles.section}>
        <Button variant="link" isInline onClick={onViewMore}>
          View more in Cost Management
        </Button>
      </FlexItem>
    )}
  </Flex>
);
