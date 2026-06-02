import * as yup from 'yup';

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
 * Kept in a dedicated module so {@link wizardFieldMetaChangeRegistry} can import
 * it without circular imports through `index.ts`.
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
