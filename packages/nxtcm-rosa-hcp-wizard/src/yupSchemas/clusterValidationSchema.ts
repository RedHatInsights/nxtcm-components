import * as yup from 'yup';

import { ROSAHCPCluster } from '../types';
import { clusterUpdatesFields } from './clusterUpdatesFields';
import { clusterWideProxyFields } from './clusterWideProxyFields';
import { detailsFields } from './detailsFields';
import { encryptionFields } from './encryptionFields';
import { machinePoolsFields } from './machinePoolsFields';
import { networkingFields } from './networkingFields';
import { rolesAndPoliciesFields } from './rolesAndPoliciesFields';
import type { WizardFormFieldName } from './types';

const composedFields = {
  ...detailsFields,
  ...rolesAndPoliciesFields,
  ...machinePoolsFields,
  ...networkingFields,
  ...clusterWideProxyFields,
  ...encryptionFields,
  ...clusterUpdatesFields,
};

/** Shared field definitions, checked for missing and extra top-level wizard keys. */
export const clusterValidationFields = composedFields satisfies Record<
  WizardFormFieldName,
  yup.ISchema<unknown>
> &
  Record<Exclude<keyof typeof composedFields, WizardFormFieldName>, never>;

/**
 * Composed Yup schema for `ROSAHCPCluster` — built from individual
 * per-field schemas grouped by wizard step.
 *
 * Kept in a dedicated module so {@link wizardFieldMetaChangeRegistry} can import
 * it without circular imports through `index.ts`.
 */
export const clusterValidationSchema = yup.object(clusterValidationFields) as yup.ObjectSchema<
  Partial<ROSAHCPCluster>
>;
