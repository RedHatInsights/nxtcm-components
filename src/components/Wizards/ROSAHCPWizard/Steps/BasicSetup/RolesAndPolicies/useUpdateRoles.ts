import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { DropdownType, RolesResource, ROSAHCPCluster } from '../../../types';

interface UseDependentRolesResult {
  supportRoleOptions: DropdownType[];
  workerRoleOptions: DropdownType[];
}
export const useDependentRoles = (roles: RolesResource): UseDependentRolesResult => {
  const { setValue } = useFormContext<ROSAHCPCluster>();
  const selectedInstallerArn = useWatch({ name: 'installer_role_arn' });
  const selectedRole = React.useMemo(
    () => roles.data.find((r) => r.installerRole.value === selectedInstallerArn),
    [roles, selectedInstallerArn]
  );
  const supportRoleOptions = selectedRole?.supportRole ?? [];
  const workerRoleOptions = selectedRole?.workerRole ?? [];
  React.useEffect(() => {
    setValue('support_role_arn', selectedRole?.supportRole[0]?.value ?? '');
    setValue('worker_role_arn', selectedRole?.workerRole[0]?.value ?? '');
  }, [selectedRole, setValue]);
  return { supportRoleOptions, workerRoleOptions };
};
