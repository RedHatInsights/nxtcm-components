import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import type { ClusterFormData } from '../../types';
import type { WizardFieldMeta } from './types';
import { ctx, validateClusterNameSync } from './helpers';

export const nameSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'name',
    labelKey: 'details.clusterNameLabel',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'text',
    noEditAfterSubmit: true,
    showInReview: true,
  } satisfies WizardFieldMeta)
  .test('cluster-name-sync', '', function (value) {
    if (!value) return true;
    const { msgs } = ctx(this);
    const error = validateClusterNameSync(value, msgs.clusterName);
    return error ? this.createError({ message: error }) : true;
  })
  .test('cluster-name-unique', '', async function (value) {
    if (!value) return true;
    const { msgs, checkClusterNameUniqueness } = ctx(this);
    if (!checkClusterNameUniqueness) return true;
    if (validateClusterNameSync(value, msgs.clusterName)) return true;

    const region = (this.parent as Partial<ClusterFormData>).region;
    const error = await checkClusterNameUniqueness(value, region);
    return error ? this.createError({ message: error }) : true;
  });

export const clusterVersionSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'cluster_version',
    labelKey: 'details.openShiftVersionLabel',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    noEditAfterSubmit: true,
    showInReview: true,
  } satisfies WizardFieldMeta);

export const associatedAwsIdSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'associated_aws_id',
    labelKey: 'details.awsInfraLabel',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    noEditAfterSubmit: true,
    showInReview: true,
  } satisfies WizardFieldMeta);

export const billingAccountIdSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'billing_account_id',
    labelKey: 'details.billingLabel',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    showInReview: true,
    reviewLabel: 'AWS billing account',
  } satisfies WizardFieldMeta);

export const regionSchema = yup
  .string()
  .default('')
  .required()
  .meta({
    id: 'region',
    labelKey: 'details.regionLabel',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    noEditAfterSubmit: true,
    showInReview: true,
  } satisfies WizardFieldMeta);

export const detailsFields = {
  name: nameSchema,
  cluster_version: clusterVersionSchema,
  associated_aws_id: associatedAwsIdSchema,
  billing_account_id: billingAccountIdSchema,
  region: regionSchema,
};
