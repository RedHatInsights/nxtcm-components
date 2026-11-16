import React from 'react';

import { useWatch } from 'react-hook-form';
import semver from 'semver';

import { FIELD_NAME } from '../../../constants';
import { useRosaHcpWizardStrings } from '../../../stringsProvider/RosaHcpWizardStringsContext';
import { type InstallerRole, RolesResource, type ROSAHCPCluster } from '../../../types';

/**
 * Builds the installer role dropdown options for the selected OpenShift version.
 * Roles whose version is lower than the selected cluster version are marked `ariaDisabled`
 * and get a description of the incompatibility and the highest version they support.
 * Roles without a version, or with no cluster version selected, are returned unchanged.
 *
 * @param roles - Roles resource whose installer roles populate the options.
 * @returns Installer roles, with incompatible ones disabled and described.
 */
export const useInstallerRoleOptions = (roles: RolesResource): InstallerRole[] => {
  const { installerRoleOptionIncompatibleLead, installerRoleOptionSupportedUpToLead } =
    useRosaHcpWizardStrings().rolesAndPolicies;
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
            description: [
              `${installerRoleOptionIncompatibleLead} ${selectedClusterVersion}.`,
              `${installerRoleOptionSupportedUpToLead} ${role.roleVersion}.`,
            ].join(' '),
          }
        : role;
    });
  }, [
    roles.data,
    selectedClusterVersion,
    installerRoleOptionIncompatibleLead,
    installerRoleOptionSupportedUpToLead,
  ]);

  return installerRoleOptions;
};
