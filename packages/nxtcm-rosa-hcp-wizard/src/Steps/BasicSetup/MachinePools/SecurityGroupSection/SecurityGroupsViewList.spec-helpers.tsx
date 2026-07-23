import React from 'react';
import { withRosaCt } from '../../../../components/WizFields/wizFieldCtSpecHelpers';
import SecurityGroupsViewList from './SecurityGroupsViewList';
import type { SecurityGroup } from '../../../../types';

export interface SecurityGroupsViewListMountProps {
  securityGroups?: SecurityGroup[];
  emptyMessage?: string;
  onCloseItem?: (groupId: string) => void;
}

export const mockSecurityGroups: SecurityGroup[] = [
  { id: 'sg-123456', name: 'default' },
  { id: 'sg-789012', name: 'k8s-traffic-rules' },
  { id: 'sg-345678', name: 'web-server-sg' },
];

export const SecurityGroupsViewListMount: React.FC<SecurityGroupsViewListMountProps> = ({
  securityGroups = [],
  emptyMessage,
  onCloseItem,
}) => {
  return withRosaCt(
    <SecurityGroupsViewList
      securityGroups={securityGroups}
      emptyMessage={emptyMessage}
      onCloseItem={onCloseItem}
    />
  );
};
