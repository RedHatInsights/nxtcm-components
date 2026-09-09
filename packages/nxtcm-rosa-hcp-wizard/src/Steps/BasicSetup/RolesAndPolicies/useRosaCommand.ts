import { FIELD_NAME } from '../../../constants';
import { useWatch } from 'react-hook-form';

export const useRosaCommand = () => {
  const customOperatorRolesPrefix = useWatch({ name: FIELD_NAME.CUSTOM_OPERATOR_ROLES_PREFIX });
  const byoOidcConfigId = useWatch({ name: FIELD_NAME.BYO_OIDC_CONFIG_ID });
  const installerRoleArn = useWatch({ name: FIELD_NAME.INSTALLER_ROLE_ARN });

  const rosaCommand = `rosa create operator-roles --prefix ${customOperatorRolesPrefix} --oidc-config-id ${byoOidcConfigId} --hosted-cp --installer-role-arn ${installerRoleArn}`;

  return rosaCommand;
};
