import * as yup from 'yup';

import { DNS_LABEL_REGEXP, MAX_CUSTOM_OPERATOR_ROLES_PREFIX_LENGTH, STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';
import { ctx } from './helpers';

export const installerRoleArnSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'installer_role_arn',
    labelKey: 'rolesAndPolicies.installerRoleLabel',
    stepId: STEP_IDS.ROLES_AND_POLICIES,
    fieldType: 'select',
  } satisfies WizardFieldMeta);

export const supportRoleArnSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'support_role_arn',
    labelKey: 'rolesAndPolicies.supportRoleLabel',
    stepId: STEP_IDS.ROLES_AND_POLICIES,
    fieldType: 'select',
  } satisfies WizardFieldMeta);

export const workerRoleArnSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'worker_role_arn',
    labelKey: 'rolesAndPolicies.workerRoleLabel',
    stepId: STEP_IDS.ROLES_AND_POLICIES,
    fieldType: 'select',
  } satisfies WizardFieldMeta);

export const byoOidcConfigIdSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'byo_oidc_config_id',
    labelKey: 'rolesAndPolicies.oidcLabel',
    stepId: STEP_IDS.ROLES_AND_POLICIES,
    fieldType: 'select',
  } satisfies WizardFieldMeta);

export const customOperatorRolesPrefixSchema = yup
  .string()
  .default('')
  .required()
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
