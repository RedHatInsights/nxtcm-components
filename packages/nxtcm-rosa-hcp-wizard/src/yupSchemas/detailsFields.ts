import type { WizardFieldMeta } from './types';
import { ctx, rosaRequiredStringField, validateClusterNameSync } from './helpers';
import { YUP } from './constants';

export const nameSchema = rosaRequiredStringField()
  .default(YUP.DETAILS.NAME_SCHEMA.DEFAULT)
  .meta({
    id: YUP.DETAILS.NAME_SCHEMA.META.ID,
    labelKey: YUP.DETAILS.NAME_SCHEMA.META.LABEL_KEY,
    placeholderKey: YUP.DETAILS.NAME_SCHEMA.META.PLACEHOLDER_KEY,
    labelHelpKey: YUP.DETAILS.NAME_SCHEMA.META.LABEL_HELP_KEY,
    stepId: YUP.DETAILS.NAME_SCHEMA.META.STEP_ID,
    fieldType: YUP.DETAILS.NAME_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.DETAILS.NAME_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    validateOnBlur: YUP.DETAILS.NAME_SCHEMA.META.VALIDATE_ON_BLUR,
  } satisfies WizardFieldMeta)
  .test('cluster-name-sync', '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    const error = validateClusterNameSync(value, msgs.clusterName);
    return error ? this.createError({ message: error }) : true;
  });

export const clusterVersionSchema = rosaRequiredStringField().meta({
  id: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.ID,
  labelKey: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.LABEL_KEY,
  placeholderKey: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.PLACEHOLDER_KEY,
  labelHelpKey: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.LABEL_HELP_KEY,
  stepId: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.STEP_ID,
  fieldType: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.FIELD_TYPE,
  optionsWizardDataResource: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
  reconcileValueWithOptions: YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  resetsFieldsToDefaultOnChange:
    YUP.DETAILS.CLUSTER_VERSION_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
} satisfies WizardFieldMeta);

export const associatedAwsIdSchema = rosaRequiredStringField().meta({
  id: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.ID,
  labelKey: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.LABEL_KEY,
  labelHelpKey: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.LABEL_HELP_KEY,
  placeholderKey: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.PLACEHOLDER_KEY,
  stepId: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.STEP_ID,
  fieldType: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.FIELD_TYPE,
  noEditAfterSubmit: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  optionsWizardDataResource: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
  reconcileValueWithOptions: YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  resetsFieldsToDefaultOnChange:
    YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  refetchesResourcesOnChange:
    YUP.DETAILS.ASSOCIATED_AWS_ID_SCHEMA.META.REFETCHES_RESOURCES_ON_CHANGE,
} satisfies WizardFieldMeta);

export const billingAccountIdSchema = rosaRequiredStringField().meta({
  id: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.ID,
  labelKey: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.LABEL_KEY,
  labelHelpKey: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.LABEL_HELP_KEY,
  placeholderKey: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.PLACEHOLDER_KEY,
  stepId: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.STEP_ID,
  fieldType: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.FIELD_TYPE,
  optionsWizardDataResource:
    YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
  reconcileValueWithOptions:
    YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  reviewLabel: YUP.DETAILS.BILLING_ACCOUNT_ID_SCHEMA.META.REVIEW_LABEL,
} satisfies WizardFieldMeta);

export const regionSchema = rosaRequiredStringField().meta({
  id: YUP.DETAILS.REGION_SCHEMA.META.ID,
  labelKey: YUP.DETAILS.REGION_SCHEMA.META.LABEL_KEY,
  placeholderKey: YUP.DETAILS.REGION_SCHEMA.META.PLACEHOLDER_KEY,
  stepId: YUP.DETAILS.REGION_SCHEMA.META.STEP_ID,
  fieldType: YUP.DETAILS.REGION_SCHEMA.META.FIELD_TYPE,
  noEditAfterSubmit: YUP.DETAILS.REGION_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  optionsWizardDataResource: YUP.DETAILS.REGION_SCHEMA.META.OPTIONS_WIZARD_DATA_RESOURCE,
  reconcileValueWithOptions: YUP.DETAILS.REGION_SCHEMA.META.RECONCILE_VALUE_WITH_OPTIONS,
  resetsFieldsToDefaultOnChange: YUP.DETAILS.REGION_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  refetchesResourcesOnChange: YUP.DETAILS.REGION_SCHEMA.META.REFETCHES_RESOURCES_ON_CHANGE,
} satisfies WizardFieldMeta);

export const detailsFields = {
  name: nameSchema,
  cluster_version: clusterVersionSchema,
  associated_aws_id: associatedAwsIdSchema,
  billing_account_id: billingAccountIdSchema,
  region: regionSchema,
};
