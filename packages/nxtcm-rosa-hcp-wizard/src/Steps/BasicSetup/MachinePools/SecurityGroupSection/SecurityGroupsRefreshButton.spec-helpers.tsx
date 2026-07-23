import React from 'react';
import { withRosaCt } from '../../../../components/WizFields/wizFieldCtSpecHelpers';
import { SecurityGroupsRefreshButton } from './SecurityGroupsRefreshButton';
import type { SecurityGroupsRefreshButtonProps } from './SecurityGroupsRefreshButton';

export interface SecurityGroupsRefreshButtonMountProps extends Partial<SecurityGroupsRefreshButtonProps> {
  onRefresh?: () => void;
}

export const SecurityGroupsRefreshButtonMount: React.FC<SecurityGroupsRefreshButtonMountProps> = ({
  onRefresh,
  isLoading = false,
  isDisabled = false,
}) => {
  return withRosaCt(
    <SecurityGroupsRefreshButton
      onRefresh={onRefresh}
      isLoading={isLoading}
      isDisabled={isDisabled}
    />
  );
};
