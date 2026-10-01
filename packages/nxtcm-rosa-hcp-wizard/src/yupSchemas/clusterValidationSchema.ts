import * as yup from 'yup';

import { ROSAHCPCluster } from '../types';
import { clusterUpdatesFields } from './clusterUpdatesFields';
import { clusterWideProxyFields } from './clusterWideProxyFields';
import { detailsFields } from './detailsFields';
import { encryptionFields } from './encryptionFields';
import { machinePoolsFields } from './machinePoolsFields';
import { networkingFields } from './networkingFields';
import { rolesAndPoliciesFields } from './rolesAndPoliciesFields';
import { ValidationSchemaContext } from './types';

/**
 * Composed Yup schema for `ROSAHCPCluster` — built from individual
 * per-field schemas grouped by wizard step.
 *
 * Kept in a dedicated module so {@link wizardFieldMetaChangeRegistry} can import
 * it without circular imports through `index.ts`.
 */

const fields = {
  ...detailsFields,
  ...rolesAndPoliciesFields,
  ...machinePoolsFields,
  ...networkingFields,
  ...clusterWideProxyFields,
  ...encryptionFields,
  ...clusterUpdatesFields,
};

const schema = yup.object<ValidationSchemaContext, typeof fields>(fields);

export const clusterValidationSchema = schema as yup.ObjectSchema<
  Partial<ROSAHCPCluster>,
  ValidationSchemaContext,
  ReturnType<typeof schema.getDefault>
>;
