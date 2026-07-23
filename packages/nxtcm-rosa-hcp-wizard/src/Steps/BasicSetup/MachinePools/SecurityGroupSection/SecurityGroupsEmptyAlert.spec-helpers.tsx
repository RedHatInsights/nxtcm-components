import React from 'react';
import { withRosaCt } from '../../../../components/WizFields/wizFieldCtSpecHelpers';
import SecurityGroupsEmptyAlert from './SecurityGroupsEmptyAlert';

export interface SecurityGroupsEmptyAlertMountProps {
  refreshVPCCallback?: () => void;
  isVPCLoading?: boolean;
}

export const SecurityGroupsEmptyAlertMount: React.FC<SecurityGroupsEmptyAlertMountProps> = ({
  refreshVPCCallback,
  isVPCLoading = false,
}) => {
  return withRosaCt(
    <SecurityGroupsEmptyAlert refreshVPCCallback={refreshVPCCallback} isVPCLoading={isVPCLoading} />
  );
};
