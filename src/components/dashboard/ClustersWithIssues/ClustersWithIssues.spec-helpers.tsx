import React from 'react';
import { ClustersWithIssues, ClustersWithIssuesProps } from './ClustersWithIssues';

// playwright CT can't serialize functions across process boundaries,
// so this wrapper defines callbacks in the browser context
export const ClustersWithIssuesWithConsoleLink: React.FC<{
  data: ClustersWithIssuesProps['data'];
}> = ({ data }) => <ClustersWithIssues data={data} onOpenConsole={() => {}} />;
