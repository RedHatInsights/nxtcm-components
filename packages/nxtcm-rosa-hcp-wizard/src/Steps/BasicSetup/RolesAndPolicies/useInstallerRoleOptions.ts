import React from 'react';

import { useWatch } from 'react-hook-form';
import semver from 'semver';

import { FIELD_NAME } from '../../../constants';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { type InstallerRole, RolesResource, type ROSAHCPCluster } from '../../../types';

export const useInstallerRoleOptions = (roles: RolesResource): InstallerRole[] => {
  const { installerRoleOptionDisabledDescription } = useRosaHcpWizardStrings().rolesAndPolicies;
  const selectedClusterVersion = useWatch<ROSAHCPCluster, typeof FIELD_NAME.CLUSTER_VERSION>({
    name: FIELD_NAME.CLUSTER_VERSION,
  });
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
            description: installerRoleOptionDisabledDescription(
              selectedClusterVersion,
              role.roleVersion
            ),
          }
        : role;
    });
  }, [roles.data, selectedClusterVersion, installerRoleOptionDisabledDescription]);

  return installerRoleOptions;
};
