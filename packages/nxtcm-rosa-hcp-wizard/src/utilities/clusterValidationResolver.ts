import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import * as yup from 'yup';

import type { ROSAHCPCluster } from '../types';
import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';
import { clusterValidationSchema } from '../yupSchemas/clusterValidationSchema';
import { buildClusterValidationSchemaContext } from './buildClusterValidationSchemaContext';
import { schemaHasRosaRequiredPresentTest } from './yupFieldRequired';

const clusterYupResolver = yupResolver(clusterValidationSchema) as Resolver<
  Partial<ROSAHCPCluster>
>;

const ABSENT_REQUIRED_COERCIONS: Partial<Record<string, '' | Record<string, never>>> = {};

for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
  if (!schemaHasRosaRequiredPresentTest(fieldSchema as yup.Schema)) {
    continue;
  }
  const { type } = (fieldSchema as yup.Schema).describe();
  if (type === 'string') {
    ABSENT_REQUIRED_COERCIONS[fieldName] = '';
  } else if (type === 'mixed') {
    ABSENT_REQUIRED_COERCIONS[fieldName] = {};
  }
}

/**
 * Coerces untouched top-level required fields before Yup validation.
 *
 * Yup skips `.transform()` when the raw value is `undefined`, so optionality (from `.required()`)
 * runs first and emits default copy. String selects become `''`; object selects (`mixed`) become
 * `{}` so {@link rosaCommonRequiredNonEmptyTest} can return `commonRequired`.
 */
export function coerceAbsentRequiredFieldValues(
  values: Partial<ROSAHCPCluster>
): Partial<ROSAHCPCluster> {
  if (values == null || typeof values !== 'object') {
    return values;
  }

  const next: Partial<ROSAHCPCluster> = { ...values };

  for (const [fieldName, coercedValue] of Object.entries(ABSENT_REQUIRED_COERCIONS)) {
    const key = fieldName as keyof ROSAHCPCluster;
    if (next[key] === undefined) {
      (next as Record<string, unknown>)[fieldName] = coercedValue;
    }
  }

  return next;
}

/** react-hook-form resolver for {@link clusterValidationSchema} with contextual validator strings. */
export function createClusterValidationResolver(
  msgs: RosaHcpWizardValidatorStrings
): Resolver<Partial<ROSAHCPCluster>> {
  return async (values, _rhfContext, options) => {
    const coercedValues = coerceAbsentRequiredFieldValues(values);
    const yupContext = buildClusterValidationSchemaContext(coercedValues, msgs);
    return clusterYupResolver(coercedValues, yupContext, options);
  };
}
