import React from 'react';
import { ExpiredTrials, ExpiredTrialsProps } from './ExpiredTrials';

// playwright CT can't serialize functions that return data across process
// boundaries, so this wrapper defines rowActions in the browser context
export const ExpiredTrialsWithActions: React.FC<{
  data: ExpiredTrialsProps['data'];
}> = ({ data }) => (
  <ExpiredTrials
    data={data}
    rowActions={() => [{ title: 'Edit subscription' }, { title: 'Archive cluster' }]}
  />
);
