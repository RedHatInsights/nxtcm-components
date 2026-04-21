import React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
import { TotalCost } from './TotalCost';
import { CostChart } from './CostChart';

export interface ClusterCostData {
  rosaClusters: number;
  osdClusters: number;
  aroClusters: number;
}

export interface CostManagementProps {
  costData: ClusterCostData;
  currency?: string;
  onViewMore?: () => void;
}

export const CostManagement: React.FC<CostManagementProps> = ({
  costData,
  currency = '$',
  onViewMore,
}) => {
  const { rosaClusters, osdClusters, aroClusters } = costData;
  const totalCost = rosaClusters + osdClusters + aroClusters;

  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%' }}>
      <FlexItem>
        <TotalCost totalCost={totalCost} currency={currency} />
      </FlexItem>
      <FlexItem spacer={{ default: 'spacerMd' }}>
        <CostChart costData={costData} currency={currency} />
      </FlexItem>
      {onViewMore && (
        <FlexItem
          style={{
            paddingInline: 'var(--pf-t--global--spacer--md)',
            paddingBlockEnd: 'var(--pf-t--global--spacer--md)',
          }}
        >
          <Button variant="link" isInline onClick={onViewMore}>
            View more cost information
          </Button>
        </FlexItem>
      )}
    </Flex>
  );
};
