import * as yup from 'yup';

import { FIELD_NAME } from '../constants';
import { ClusterEncryptionKeys, ROSAHCPCluster } from '../types';
import type { WizardFieldMeta } from './types';
import { ctx, rosaCommonRequiredNonEmptyTest } from './helpers';
import { validateAWSKMSKeyARN } from '../validators';
import { YUP_FIELD_REQUIRED_UI_META_KEY } from '../utilities/yupFieldRequired';
import { YUP } from './constants';

/** ARN format/region checks (required when shown is enforced via `.when()` on the field schema). */
function validateKmsArn(
  this: yup.TestContext,
  value: string | undefined
): boolean | yup.ValidationError {
  if (!value) return true;
  const { msgs } = ctx(this);
  const region = (this.parent as Partial<ROSAHCPCluster>).region;
  const error = validateAWSKMSKeyARN(value, region, msgs.kmsKeyArn);
  return error ? this.createError({ message: error }) : true;
}

const kmsKeyArnFormatTest = {
  name: FIELD_NAME.ENCRYPTION.KMS_KEY_ARN,
  message: '',
  test: validateKmsArn,
};
const etcdKeyArnFormatTest = {
  name: FIELD_NAME.ENCRYPTION.ETCD_KEY_ARN,
  message: '',
  test: validateKmsArn,
};

export const encryptionKeysSchema = yup
  .string()
  .default(YUP.ENCRYPTION.KEYS_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.ENCRYPTION.KEYS_SCHEMA.META.ID,
    labelKey: YUP.ENCRYPTION.KEYS_SCHEMA.META.LABEL_KEY,
    stepId: YUP.ENCRYPTION.KEYS_SCHEMA.META.STEP_ID,
    fieldType: YUP.ENCRYPTION.KEYS_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.ENCRYPTION.KEYS_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    resetsFieldsToDefaultOnChange:
      YUP.ENCRYPTION.KEYS_SCHEMA.META.RESETS_FIELDS_TO_DEFAULT_ON_CHANGE,
  } satisfies WizardFieldMeta);

export const kmsKeyArnSchema = yup
  .string()
  .meta({
    id: YUP.ENCRYPTION.KMS_KEY_ARN_SCHEMA.META.ID,
    labelKey: YUP.ENCRYPTION.KMS_KEY_ARN_SCHEMA.META.LABEL_KEY,
    labelHelpKey: YUP.ENCRYPTION.KMS_KEY_ARN_SCHEMA.META.LABEL_HELP_KEY,
    stepId: YUP.ENCRYPTION.KMS_KEY_ARN_SCHEMA.META.STEP_ID,
    fieldType: YUP.ENCRYPTION.KMS_KEY_ARN_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.ENCRYPTION.KMS_KEY_ARN_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  } satisfies WizardFieldMeta)
  .when(FIELD_NAME.ENCRYPTION.ENCRYPTION_KEYS, {
    is: ClusterEncryptionKeys.custom,
    then: (schema) =>
      schema
        .test(rosaCommonRequiredNonEmptyTest)
        .meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true })
        .test(kmsKeyArnFormatTest),
    otherwise: (schema) => schema.optional().test(kmsKeyArnFormatTest),
  });

export const etcdEncryptionSchema = yup
  .boolean()
  .default(YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.DEFAULT)
  .optional()
  .meta({
    id: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.ID,
    labelKey: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.LABEL_KEY,
    title: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.TITLE,
    stepId: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.STEP_ID,
    fieldType: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
    reviewLabel: YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.REVIEW_LABEL,
    resetsFieldsToDefaultOnChange:
      YUP.ENCRYPTION.ETCD_ENCRYPTION_SCHEMA.META.RESETS_FIELDS_TO_DEFAILT_ON_CHANGE,
  } satisfies WizardFieldMeta);

export const etcdKeyArnSchema = yup
  .string()
  .meta({
    id: YUP.ENCRYPTION.ETC_KEY_ARN_SCHEMA.META.ID,
    labelKey: YUP.ENCRYPTION.ETC_KEY_ARN_SCHEMA.META.LABEL_KEY,
    labelHelpKey: YUP.ENCRYPTION.ETC_KEY_ARN_SCHEMA.META.LABEL_HELP_KEY,
    stepId: YUP.ENCRYPTION.ETC_KEY_ARN_SCHEMA.META.STEP_ID,
    fieldType: YUP.ENCRYPTION.ETC_KEY_ARN_SCHEMA.META.FIELD_TYPE,
    noEditAfterSubmit: YUP.ENCRYPTION.ETC_KEY_ARN_SCHEMA.META.NO_EDIT_AFTER_SUBMIT,
  } satisfies WizardFieldMeta)
  .when(FIELD_NAME.ENCRYPTION.ETCD_ENCRYPTION, {
    is: true,
    then: (schema) =>
      schema
        .test(rosaCommonRequiredNonEmptyTest)
        .meta({ [YUP_FIELD_REQUIRED_UI_META_KEY]: true })
        .test(etcdKeyArnFormatTest),
    otherwise: (schema) => schema.optional().test(etcdKeyArnFormatTest),
  });

export const encryptionFields = {
  encryption_keys: encryptionKeysSchema,
  kms_key_arn: kmsKeyArnSchema,
  etcd_encryption: etcdEncryptionSchema,
  etcd_key_arn: etcdKeyArnSchema,
};
