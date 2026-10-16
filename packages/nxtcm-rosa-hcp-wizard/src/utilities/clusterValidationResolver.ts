import { yupResolver } from '@hookform/resolvers/yup';
import type { Resolver } from 'react-hook-form';
import * as yup from 'yup';

import type { RosaHcpWizardValidatorStrings } from '../stringsProvider/rosaHcpWizardStrings';
import type { ROSAHCPCluster } from '../types';
import { clusterValidationSchema } from '../yupSchemas/clusterValidationSchema';
import { buildClusterValidationSchemaContext } from './buildClusterValidationSchemaContext';
import { schemaHasRosaRequiredPresentTest } from './yupFieldRequired';

const clusterYupResolver = yupResolver(clusterValidationSchema);

/** Sentinel value injected for untouched required fields before Yup validation. */
type AbsentRequiredValue = '' | Record<string, never>;

/**
 * Pre-validation shape: each field may hold its domain value *or* a sentinel placeholder.
 * Downstream code must not access domain-specific properties (e.g. `aws_subnets`) on sentinels.
 */
export type PreValidationCluster = {
  [K in keyof ROSAHCPCluster]?: ROSAHCPCluster[K] | AbsentRequiredValue;
};

const ABSENT_REQUIRED_COERCIONS: Partial<Record<keyof ROSAHCPCluster, AbsentRequiredValue>> = {};

for (const [fieldName, fieldSchema] of Object.entries(clusterValidationSchema.fields)) {
  if (!schemaHasRosaRequiredPresentTest(fieldSchema as yup.Schema)) {
    continue;
  }
  const { type } = (fieldSchema as yup.Schema).describe();
  if (type === 'string') {
    ABSENT_REQUIRED_COERCIONS[fieldName as keyof ROSAHCPCluster] = '';
  } else if (type === 'mixed') {
    ABSENT_REQUIRED_COERCIONS[fieldName as keyof ROSAHCPCluster] = {};
  }
}

/**
 * Coerces untouched top-level required fields before Yup validation.
 *
 * Yup skips `.transform()` when the raw value is `undefined`, so optionality (from `.required()`)
 * runs first and emits default copy. String selects become `''`; object selects (`mixed`) become
 * `{}` so {@link rosaCommonRequiredNonEmptyTest} can return `commonRequired`.
 *
 * Returns {@link PreValidationCluster} — callers must not treat sentinels as domain values.
 */
export function coerceAbsentRequiredFieldValues(
  values: Partial<ROSAHCPCluster>
): PreValidationCluster {
  if (values == null || typeof values !== 'object') {
    return values;
  }

  const next: PreValidationCluster = { ...values };

  for (const key of Object.keys(ABSENT_REQUIRED_COERCIONS) as (keyof ROSAHCPCluster)[]) {
    if (next[key] === undefined) {
      next[key] = ABSENT_REQUIRED_COERCIONS[key];
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
    // Context is built from the original form values — sentinels must not
    // reach helpers that assume domain shapes (e.g. constructSelectedSubnets).
    const yupContext = buildClusterValidationSchemaContext(values, msgs);
    // Yup's resolver expects the schema output type. The sentinels intentionally
    // fail the schema and never reach validated code paths.
    return clusterYupResolver(coercedValues as Partial<ROSAHCPCluster>, yupContext, options);
  };
}
