import { useWatch } from 'react-hook-form';

import { FIELD_NAME } from '../../../constants';
import type { ROSAHCPCluster } from '../../../types';

export const useRosaCommand = () => {
  const customOperatorRolesPrefix = useWatch<ROSAHCPCluster, 'custom_operator_roles_prefix'>({
    name: FIELD_NAME.CUSTOM_OPERATOR_ROLES_PREFIX,
  });
  const byoOidcConfigId = useWatch<ROSAHCPCluster, 'byo_oidc_config_id'>({
    name: FIELD_NAME.BYO_OIDC_CONFIG_ID,
  });
  const installerRoleArn = useWatch<ROSAHCPCluster, 'installer_role_arn'>({
    name: FIELD_NAME.INSTALLER_ROLE_ARN,
  });

  const rosaCommand = `rosa create operator-roles --prefix ${customOperatorRolesPrefix ?? ''} --oidc-config-id ${byoOidcConfigId ?? ''} --hosted-cp --installer-role-arn ${installerRoleArn ?? ''}`;

  return rosaCommand;
};
