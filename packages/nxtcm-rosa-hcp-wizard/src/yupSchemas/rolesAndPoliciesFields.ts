import { DNS_LABEL_REGEXP, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH, STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';
import { ctx, rosaRequiredStringField } from './helpers';

export const installerRoleArnSchema = rosaRequiredStringField().meta({
  id: 'installer_role_arn',
  labelKey: 'rolesAndPolicies.installerRoleLabel',
  labelHelpKey: 'rolesAndPolicies.installerRoleHelp',
  placeholderKey: 'rolesAndPolicies.installerRolePlaceholder',
  stepId: STEP_IDS.ROLES_AND_POLICIES,
  fieldType: 'select',
  optionsWizardDataResource: 'roles',
  refetchesResourcesOnChange: [
    {
      resource: 'vpcList',
      argsFromFields: {
        account_id: 'associated_aws_id',
        role_arn: 'installer_role_arn',
        region: 'region',
      },
    },
    {
      resource: 'machineTypes',
      argsFromFields: {
        role_arn: 'installer_role_arn',
        region: 'region',
        availability_zones: 'selected_vpc',
      },
    },
  ],
  reconcileValueWithOptions: true,
  derivedFieldsSyncOnChange: 'installerRoleDependentRoles',
} satisfies WizardFieldMeta);

export const supportRoleArnSchema = rosaRequiredStringField().meta({
  id: 'support_role_arn',
  labelKey: 'rolesAndPolicies.supportRoleLabel',
  labelHelpKey: 'rolesAndPolicies.supportHelp',
  placeholderKey: 'rolesAndPolicies.supportPlaceholder',
  stepId: STEP_IDS.ROLES_AND_POLICIES,
  fieldType: 'select',
  optionsWizardDataResource: 'roles',
  reconcileValueWithOptions: true,
} satisfies WizardFieldMeta);

export const workerRoleArnSchema = rosaRequiredStringField().meta({
  id: 'worker_role_arn',
  labelKey: 'rolesAndPolicies.workerRoleLabel',
  labelHelpKey: 'rolesAndPolicies.workerHelp',
  placeholderKey: 'rolesAndPolicies.workerPlaceholder',
  stepId: STEP_IDS.ROLES_AND_POLICIES,
  fieldType: 'select',
  optionsWizardDataResource: 'roles',
  reconcileValueWithOptions: true,
} satisfies WizardFieldMeta);

export const byoOidcConfigIdSchema = rosaRequiredStringField().meta({
  id: 'byo_oidc_config_id',
  labelKey: 'rolesAndPolicies.oidcLabel',
  labelHelpKey: 'rolesAndPolicies.oidcHelp',
  placeholderKey: 'rolesAndPolicies.oidcPlaceholder',
  labelHelpTitleKey: 'rolesAndPolicies.oidcPopoverTitle',
  stepId: STEP_IDS.ROLES_AND_POLICIES,
  fieldType: 'select',
  optionsWizardDataResource: 'oidcConfig',
  reconcileValueWithOptions: true,
} satisfies WizardFieldMeta);

export const customOperatorRolesPrefixSchema = rosaRequiredStringField()
  .default('')
  .meta({
    id: 'custom_operator_roles_prefix',
    labelKey: 'rolesAndPolicies.operatorPrefixLabel',
    stepId: STEP_IDS.ROLES_AND_POLICIES,
    fieldType: 'text',
  } satisfies WizardFieldMeta)
  .test('operator-roles-prefix', '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    const label = msgs.operatorRolesPrefix.fieldLabel;
    if (!DNS_LABEL_REGEXP.test(value)) {
      return this.createError({ message: msgs.operatorRolesPrefix.invalidFormat(label, value) });
    }
    if (value.length > MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH) {
      return this.createError({
        message: msgs.operatorRolesPrefix.tooLong(label, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH),
      });
    }
    return true;
  });

export const rolesAndPoliciesFields = {
  installer_role_arn: installerRoleArnSchema,
  support_role_arn: supportRoleArnSchema,
  worker_role_arn: workerRoleArnSchema,
  byo_oidc_config_id: byoOidcConfigIdSchema,
  custom_operator_roles_prefix: customOperatorRolesPrefixSchema,
};
