import React from 'react';
import { withRosaCt } from '../WizFields/wizFieldCtSpecHelpers';
import { TabGroup } from './TabGroup';

export interface TabGroupMountProps {
  tabs?: { title: string; body: React.ReactElement; 'data-testid'?: string; id: string }[];
}

const defaultTabs = [
  {
    id: 'tab1',
    title: 'Tab 1',
    body: <div>Tab 1 Content</div>,
    'data-testid': 'tab-1',
  },
  {
    id: 'tab2',
    title: 'Tab 2',
    body: <div>Tab 2 Content</div>,
    'data-testid': 'tab-2',
  },
  {
    id: 'tab3',
    title: 'Tab 3',
    body: <div>Tab 3 Content</div>,
    'data-testid': 'tab-3',
  },
];

export const TabGroupMount: React.FC<TabGroupMountProps> = ({ tabs = defaultTabs }) => {
  return withRosaCt(<TabGroup tabs={tabs} />);
};
