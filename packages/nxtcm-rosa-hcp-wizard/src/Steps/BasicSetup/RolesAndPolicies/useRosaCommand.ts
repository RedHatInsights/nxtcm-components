import { useWatch } from 'react-hook-form';

import { FIELD_NAME } from '../../../constants';
import type { ROSAHCPCluster } from '../../../types';

export const useRosaCommand = () => {
  const customOperatorRolesPrefix = useWatch<ROSAHCPCluster, typeof FIELD_NAME.CUSTOM_OPERATOR_ROLES_PREFIX>({
    name: FIELD_NAME.CUSTOM_OPERATOR_ROLES_PREFIX,
  });
  const byoOidcConfigId = useWatch<ROSAHCPCluster, typeof FIELD_NAME.BYO_OIDC_CONFIG_ID>({
    name: FIELD_NAME.BYO_OIDC_CONFIG_ID,
  });
  const installerRoleArn = useWatch<ROSAHCPCluster, typeof FIELD_NAME.INSTALLER_ROLE_ARN>({
    name: FIELD_NAME.INSTALLER_ROLE_ARN,
  });

  const rosaCommand = `rosa create operator-roles --prefix ${customOperatorRolesPrefix} --oidc-config-id ${byoOidcConfigId} --hosted-cp --installer-role-arn ${installerRoleArn}`;

  return rosaCommand;
};
