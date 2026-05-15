import { useWatch } from 'react-hook-form';

export const useRosaCommand = () => {
  const customOperatorRolesPrefix = useWatch({ name: 'custom_operator_roles_prefix' });
  const byoOidcConfigId = useWatch({ name: 'byo_oidc_config_id' });
  const installerRoleArn = useWatch({ name: 'installer_role_arn' });

  const rosaCommand = `rosa create operator-roles --prefix ${customOperatorRolesPrefix} --oidc-config-id ${byoOidcConfigId} --hosted-cp --installer-role-arn ${installerRoleArn}`;

  return rosaCommand;
};
