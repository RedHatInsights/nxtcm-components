import React from 'react';

import { Dashboard } from './Dashboard';
import { dashboardStoryProps } from './Dashboard.story-data';

export function DashboardStory(): React.ReactElement {
  return <Dashboard {...dashboardStoryProps} />;
}
