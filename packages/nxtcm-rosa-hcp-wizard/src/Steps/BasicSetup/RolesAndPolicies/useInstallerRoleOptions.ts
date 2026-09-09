import React from 'react';
import semver from 'semver';
import { RolesResource } from '../../../types';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { useWatch } from 'react-hook-form';
import { FIELD_NAME } from '../../../constants';

export const useInstallerRoleOptions = (roles: RolesResource) => {
  const rp = useRosaHcpWizardStrings().rolesAndPolicies;
  const selectedClusterVersion = useWatch({ name: FIELD_NAME.CLUSTER_VERSION });
  const installerRoleOptions = React.useMemo(() => {
    const clusterVer =
      selectedClusterVersion && semver.valid(semver.coerce(selectedClusterVersion));
    return roles.data.map((r) => {
      const role = r.installerRole;
      if (!role.roleVersion || !clusterVer) {
        return role;
      }
      const roleVer = semver.valid(semver.coerce(role.roleVersion));
      const disabled = roleVer != null && semver.lt(roleVer, clusterVer);
      return disabled
        ? {
            ...role,
            ariaDisabled: true,
            tooltipProps: { content: rp.installerRoleOptionDisabledDescription },
          }
        : { ...role };
    });
  }, [roles.data, selectedClusterVersion, rp.installerRoleOptionDisabledDescription]);

  return installerRoleOptions;
};
