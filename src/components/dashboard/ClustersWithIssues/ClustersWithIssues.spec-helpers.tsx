import React from 'react';
import { ClustersWithIssues, ClustersWithIssuesProps } from './ClustersWithIssues';

// playwright CT can't serialize functions that return data across process
// boundaries, so this wrapper defines rowActions in the browser context
export const ClustersWithIssuesWithActions: React.FC<{
  data: ClustersWithIssuesProps['data'];
}> = ({ data }) => (
  <ClustersWithIssues data={data} rowActions={() => [{ title: 'Open console' }]} />
);
