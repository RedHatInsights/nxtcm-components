import React from 'react';
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
    <>
      <TotalCost totalCost={totalCost} currency={currency} onViewMore={onViewMore} />
      <CostChart costData={costData} currency={currency} />
    </>
  );
};
