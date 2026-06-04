import * as yup from 'yup';

import { STEP_IDS } from '../constants';
import type { WizardFieldMeta } from './types';
import { ctx, rosaCommonRequiredNonEmptyTest, validateClusterNameSync } from './helpers';
import { ROSAHCPCluster } from '../types';

export const nameSchema = yup
  .string()
  .default('')
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'name',
    labelKey: 'details.clusterNameLabel',
    placeholderKey: 'details.clusterNamePlaceholder',
    labelHelpKey: 'details.clusterNameHelp',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'text',
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

    const region = (this.parent as Partial<ROSAHCPCluster>).region;
    const error = await checkClusterNameUniqueness(value, region);
    return error ? this.createError({ message: error }) : true;
  });

export const clusterVersionSchema = yup
  .string()
  .default('')
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'cluster_version',
    labelKey: 'details.openShiftVersionLabel',
    placeholderKey: 'details.openShiftVersionPlaceholder',
    labelHelpKey: 'details.openShiftVersionHelp',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
  } satisfies WizardFieldMeta);

export const associatedAwsIdSchema = yup
  .string()
  .default('')
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'associated_aws_id',
    labelKey: 'details.awsInfraLabel',
    labelHelpKey: 'details.awsInfraHelp',
    placeholderKey: 'details.awsInfraPlaceholder',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    noEditAfterSubmit: true,
  } satisfies WizardFieldMeta);

export const billingAccountIdSchema = yup
  .string()
  .default('')
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'billing_account_id',
    labelKey: 'details.billingLabel',
    labelHelpKey: 'details.billingHelp',
    placeholderKey: 'details.billingPlaceholder',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    noEditAfterSubmit: true,
    reviewLabel: 'AWS billing account',
  } satisfies WizardFieldMeta);

export const regionSchema = yup
  .string()
  .default('')
  .test(rosaCommonRequiredNonEmptyTest)
  .required()
  .meta({
    id: 'region',
    labelKey: 'details.regionLabel',
    labelHelpKey: 'details.regionHelp',
    placeholderKey: 'details.regionPlaceholder',
    stepId: STEP_IDS.DETAILS,
    fieldType: 'select',
    noEditAfterSubmit: true,
  } satisfies WizardFieldMeta);

export const detailsFields = {
  name: nameSchema,
  cluster_version: clusterVersionSchema,
  associated_aws_id: associatedAwsIdSchema,
  billing_account_id: billingAccountIdSchema,
  region: regionSchema,
};
