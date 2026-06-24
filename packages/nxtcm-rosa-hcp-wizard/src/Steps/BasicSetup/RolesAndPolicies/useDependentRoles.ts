import React from 'react';
import { useWatch } from 'react-hook-form';

import type { DropdownType, RolesResource } from '../../../types';

interface UseDependentRolesResult {
  supportRoleOptions: DropdownType[];
  workerRoleOptions: DropdownType[];
  isIncompleteRoleSet: boolean;
}

/** Options for support/worker roles based on the selected installer role. Values sync via Yup derived-field meta. */
export const useDependentRoles = (roles: RolesResource): UseDependentRolesResult => {
  const selectedInstallerArn = useWatch({ name: 'installer_role_arn' });
  const selectedRole = React.useMemo(
    () => roles.data.find((role) => role.installerRole.value === selectedInstallerArn),
    [roles.data, selectedInstallerArn]
  );

  const isIncompleteRoleSet = React.useMemo(
    () =>
      selectedRole != null &&
      (selectedRole.supportRole.length === 0 || selectedRole.workerRole.length === 0),
    [selectedRole]
  );

  return {
    supportRoleOptions: selectedRole?.supportRole ?? [],
    workerRoleOptions: selectedRole?.workerRole ?? [],
    isIncompleteRoleSet,
  };
};
