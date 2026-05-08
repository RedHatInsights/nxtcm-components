import * as yup from 'yup';

import {
  AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX,
  AWS_KMS_SERVICE_ACCOUNT_REGEX,
  STEP_IDS,
} from '../constants';
import type { ClusterFormData } from '../../types';
import type { WizardFieldMeta } from './types';
import { ctx } from './helpers';

function validateKmsArn(
  this: yup.TestContext,
  value: string | undefined
): boolean | yup.ValidationError {
  if (!value) return true;
  const { msgs } = ctx(this);
  if (/\s/.test(value)) {
    return this.createError({ message: msgs.kmsKeyArn.noWhitespace });
  }
  if (
    value.includes(':key/mrk-')
      ? !AWS_KMS_MULTI_REGION_SERVICE_ACCOUNT_REGEX.test(value)
      : !AWS_KMS_SERVICE_ACCOUNT_REGEX.test(value)
  ) {
    return this.createError({ message: msgs.kmsKeyArn.invalidArn });
  }
  const region = (this.parent as Partial<ClusterFormData>).region;
  const kmsRegion = value.split('kms:')?.pop()?.split(':')[0];
  if (kmsRegion !== region) {
    return this.createError({ message: msgs.kmsKeyArn.wrongRegion });
  }
  return true;
}

export const encryptionKeysSchema = yup
  .string()
  .optional()
  .meta({
    id: 'encryption_keys',
    labelKey: 'encryption.keysLabel',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'radio',
    showInReview: true,
  } satisfies WizardFieldMeta);

export const kmsKeyArnSchema = yup
  .string()
  .optional()
  .meta({
    id: 'kms_key_arn',
    labelKey: 'encryption.kmsKeyArnLabel',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'text',
    showInReview: true,
  } satisfies WizardFieldMeta)
  .test('kms-key-arn', '', validateKmsArn);

export const etcdEncryptionSchema = yup
  .boolean()
  .optional()
  .meta({
    id: 'etcd_encryption',
    labelKey: 'encryption.etcdEncryptionLabel',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'checkbox',
    showInReview: true,
    reviewLabel: 'Additional etcd encryption',
  } satisfies WizardFieldMeta);

export const etcdKeyArnSchema = yup
  .string()
  .optional()
  .meta({
    id: 'etcd_key_arn',
    labelKey: 'encryption.etcdKeyArnLabel',
    stepId: STEP_IDS.ENCRYPTION,
    fieldType: 'text',
  } satisfies WizardFieldMeta)
  .test('etcd-key-arn', '', validateKmsArn);

export const encryptionFields = {
  encryption_keys: encryptionKeysSchema,
  kms_key_arn: kmsKeyArnSchema,
  etcd_encryption: etcdEncryptionSchema,
  etcd_key_arn: etcdKeyArnSchema,
};
