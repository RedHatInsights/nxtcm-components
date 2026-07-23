import React from 'react';
import { withRosaCt } from './WizFields/wizFieldCtSpecHelpers';
import { RolesAlert } from './RolesErrorAlert';

export interface RolesAlertMountProps {
  showMissingArnsError?: boolean;
  ocmRoleError?: string | null;
  userRoleError?: string | null;
}

export const RolesAlertMount: React.FC<RolesAlertMountProps> = ({
  showMissingArnsError = false,
  ocmRoleError = null,
  userRoleError = null,
}) => {
  return withRosaCt(
    <RolesAlert
      showMissingArnsError={showMissingArnsError}
      ocmRoleError={ocmRoleError}
      userRoleError={userRoleError}
    />
  );
};
