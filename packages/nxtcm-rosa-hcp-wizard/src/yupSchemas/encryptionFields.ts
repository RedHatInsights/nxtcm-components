import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import { ClusterEncryptionKeys, ROSAHCPCluster } from '../types';
import type { WizardFieldMeta } from './types';
import { ctx, rosaCommonRequiredNonEmptyTest } from './helpers';
import { validateAWSKMSKeyARN } from '../validators';
import { YUP_FIELD_REQUIRED_UI_META_KEY } from '../utilities/yupFieldRequired';

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

const kmsKeyArnFormatTest = { name: 'kms-key-arn', message: '', test: validateKmsArn };
const etcdKeyArnFormatTest = { name: 'etcd-key-arn', message: '', test: validateKmsArn };

export const encryptionKeysSchema = yup
  .string()
  .default(ClusterEncryptionKeys.default)
  .optional()
  .meta({
    id: 'encryption_keys',
    labelKey: 'encryption.keysGroupLabel',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'radio',
    noEditAfterSubmit: true,
    resetsFieldsToDefaultOnChange: ['kms_key_arn'],
  } satisfies WizardFieldMeta);

export const kmsKeyArnSchema = yup
  .string()
  .meta({
    id: 'kms_key_arn',
    labelKey: 'encryption.keyArnLabel',
    labelHelpKey: 'encryption.keyArnHelp',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'text',
    noEditAfterSubmit: true,
  } satisfies WizardFieldMeta)
  .when('encryption_keys', {
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
  .default(false)
  .optional()
  .meta({
    id: 'etcd_encryption',
    labelKey: 'encryption.etcdLabel',
    title: 'etcd encryption',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'checkbox',
    noEditAfterSubmit: true,
    reviewLabel: 'Additional etcd encryption',
    resetsFieldsToDefaultOnChange: ['etcd_key_arn'],
  } satisfies WizardFieldMeta);

export const etcdKeyArnSchema = yup
  .string()
  .meta({
    id: 'etcd_key_arn',
    labelKey: 'encryption.keyArnLabel',
    labelHelpKey: 'encryption.keyArnHelp',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'text',
    noEditAfterSubmit: true,
  } satisfies WizardFieldMeta)
  .when('etcd_encryption', {
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
