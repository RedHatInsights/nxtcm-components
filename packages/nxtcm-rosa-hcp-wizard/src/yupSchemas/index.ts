import * as yup from 'yup';

import type { WizardFieldMeta } from './types';
import { detailsFields } from './detailsFields';
import { rolesAndPoliciesFields } from './rolesAndPoliciesFields';
import { machinePoolsFields } from './machinePoolsFields';
import { networkingFields } from './networkingFields';
import { clusterWideProxyFields } from './clusterWideProxyFields';
import { encryptionFields } from './encryptionFields';
import { clusterUpdatesFields } from './clusterUpdatesFields';
import { ROSAHCPCluster } from '../types';

/**
 * Composed Yup schema for `ROSAHCPCluster` — built from individual
 * per-field schemas grouped by wizard step.
 *
 * Each field carries its own `.meta()` with a {@link WizardFieldMeta} payload,
 * and runtime validation values come from `this.options.context`
 * ({@link ValidationSchemaContext}).
 *
 * ```ts
 * clusterValidationSchema.validate(formData, { context });
 * ```
 */
export const clusterValidationSchema = yup.object({
  ...detailsFields,
  ...rolesAndPoliciesFields,
  ...machinePoolsFields,
  ...networkingFields,
  ...clusterWideProxyFields,
  ...encryptionFields,
  ...clusterUpdatesFields,
}) as yup.ObjectSchema<Partial<ROSAHCPCluster>>;

export function getClusterValidationSchemaDefaultValues(): Partial<ROSAHCPCluster> {
  const defaults = clusterValidationSchema.getDefault() as Partial<ROSAHCPCluster>;
  // Replica defaults exist on the Yup fields for toggling autoscaling UX; keep them unset until the user enables autoscaling.
  const { min_replicas: _min, max_replicas: _max, ...rest } = defaults;
  return rest;
}

/**
 * Retrieves the {@link WizardFieldMeta} for a given field path in the schema.
 *
 * @example
 * ```ts
 * const meta = wizardFieldMetaByPath('name');
 * // => { id: 'name', labelKey: 'details.clusterNameLabel', stepId: 'details-substep', ... }
 * ```
 */
export function wizardFieldMetaByPath(path: string): WizardFieldMeta | undefined {
  try {
    const fieldSchema = yup.reach(clusterValidationSchema, path) as yup.Schema;
    return fieldSchema.describe().meta as WizardFieldMeta;
  } catch {
    return undefined;
  }
}

// Re-export types
export type { WizardFieldMeta, ValidationSchemaContext, WizardFormFieldName } from './types';

// Re-export individual field schemas for standalone use
export { detailsFields } from './detailsFields';
export { rolesAndPoliciesFields } from './rolesAndPoliciesFields';
export { machinePoolsFields } from './machinePoolsFields';
export { networkingFields } from './networkingFields';
export { clusterWideProxyFields } from './clusterWideProxyFields';
export { encryptionFields } from './encryptionFields';
export { clusterUpdatesFields } from './clusterUpdatesFields';

// Re-export every named field schema for fine-grained imports
export {
  nameSchema,
  clusterVersionSchema,
  associatedAwsIdSchema,
  billingAccountIdSchema,
  regionSchema,
} from './detailsFields';
export {
  installerRoleArnSchema,
  supportRoleArnSchema,
  workerRoleArnSchema,
  byoOidcConfigIdSchema,
  customOperatorRolesPrefixSchema,
} from './rolesAndPoliciesFields';
export {
  selectedVpcSchema,
  machinePoolSubnetEntrySchema,
  machinePoolsSubnetsSchema,
  machineTypeSchema,
  autoscalingSchema,
  nodesComputeSchema,
  minReplicasSchema,
  maxReplicasSchema,
  computeRootVolumeSchema,
  imdsSchema,
  securityGroupsWorkerSchema,
} from './machinePoolsFields';
export {
  clusterPrivacySchema,
  clusterPrivacyPublicSubnetIdSchema,
  cidrDefaultSchema,
  networkMachineCidrSchema,
  networkServiceCidrSchema,
  networkPodCidrSchema,
  networkHostPrefixSchema,
  configureProxySchema,
  multiAzSchema,
  hypershiftSchema,
} from './networkingFields';
export {
  httpProxyUrlSchema,
  httpsProxyUrlSchema,
  noProxyDomainsSchema,
  additionalTrustBundleSchema,
} from './clusterWideProxyFields';
export {
  encryptionKeysSchema,
  kmsKeyArnSchema,
  etcdEncryptionSchema,
  etcdKeyArnSchema,
} from './encryptionFields';
export { upgradePolicySchema, upgradeScheduleSchema } from './clusterUpdatesFields';
