import { STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';
import { ctx, rosaRequiredStringField, validateClusterNameSync } from './helpers';

export const nameSchema = rosaRequiredStringField()
  .default('')
  .meta({
    id: 'name',
    labelKey: 'details.clusterNameLabel',
    placeholderKey: 'details.clusterNamePlaceholder',
    labelHelpKey: 'details.clusterNameHelp',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'text',
    validateOnBlur: true,
  } satisfies WizardFieldMeta)
  .test('cluster-name-sync', '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    const error = validateClusterNameSync(value, msgs.clusterName);
    return error ? this.createError({ message: error }) : true;
  });

export const clusterVersionSchema = rosaRequiredStringField().meta({
  id: 'cluster_version',
  labelKey: 'details.openShiftVersionLabel',
  placeholderKey: 'details.openShiftVersionPlaceholder',
  labelHelpKey: 'details.openShiftVersionHelp',
  stepId: STEP_IDS.DETAILS,
  fieldType: 'select',
  optionsWizardDataResource: 'versions',
  reconcileValueWithOptions: true,
  resetsFieldsToDefaultOnChange: ['imds', 'security_groups_worker'],
} satisfies WizardFieldMeta);

export const associatedAwsIdSchema = rosaRequiredStringField().meta({
  id: 'associated_aws_id',
  labelKey: 'details.awsInfraLabel',
  labelHelpKey: 'details.awsInfraHelp',
  placeholderKey: 'details.awsInfraPlaceholder',
  stepId: STEP_IDS.DETAILS,
  fieldType: 'select',
  noEditAfterSubmit: true,
  optionsWizardDataResource: 'awsInfrastructureAccounts',
  reconcileValueWithOptions: true,
  resetsFieldsToDefaultOnChange: [
    'installer_role_arn',
    'support_role_arn',
    'worker_role_arn',
    'selected_vpc',
    'machine_pools_subnets',
    'cluster_privacy_public_subnet_id',
  ],
  refetchesResourcesOnChange: [
    { resource: 'regions', argFromField: 'associated_aws_id' },
    { resource: 'roles', argFromField: 'associated_aws_id' },
    { resource: 'oidcConfig', argFromField: 'associated_aws_id' },
  ],
} satisfies WizardFieldMeta);

export const billingAccountIdSchema = rosaRequiredStringField().meta({
  id: 'billing_account_id',
  labelKey: 'details.billingLabel',
  labelHelpKey: 'details.billingHelp',
  placeholderKey: 'details.billingPlaceholder',
  stepId: STEP_IDS.DETAILS,
  fieldType: 'select',
  noEditAfterSubmit: true,
  optionsWizardDataResource: 'awsBillingAccounts',
  reconcileValueWithOptions: true,
  reviewLabel: 'AWS billing account',
} satisfies WizardFieldMeta);

export const regionSchema = rosaRequiredStringField().meta({
  id: 'region',
  labelKey: 'details.regionLabel',
  placeholderKey: 'details.regionPlaceholder',
  stepId: STEP_IDS.DETAILS,
  fieldType: 'select',
  noEditAfterSubmit: true,
  optionsWizardDataResource: 'regions',
  reconcileValueWithOptions: true,
  resetsFieldsToDefaultOnChange: [
    'selected_vpc',
    'machine_pools_subnets',
    'security_groups_worker',
    'cluster_privacy_public_subnet_id',
  ],
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
} satisfies WizardFieldMeta);

export const detailsFields = {
  name: nameSchema,
  cluster_version: clusterVersionSchema,
  associated_aws_id: associatedAwsIdSchema,
  billing_account_id: billingAccountIdSchema,
  region: regionSchema,
};
