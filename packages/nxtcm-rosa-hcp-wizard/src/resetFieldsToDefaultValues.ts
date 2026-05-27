import type { FieldPath, FieldPathValue, UseFormSetValue } from 'react-hook-form';

import type { ROSAHCPCluster } from './types';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';

type FormPath = FieldPath<Partial<ROSAHCPCluster>>;

export type ResetFieldsToDefaultValuesOptions = {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
};

/** Sets form fields back to {@link getClusterValidationSchemaDefaultValues} (or `undefined` when omitted). */
export function resetFieldsToDefaultValues(
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>,
  fieldNames: readonly FormPath[],
  options: ResetFieldsToDefaultValuesOptions = {}
): void {
  const defaults = getClusterValidationSchemaDefaultValues();
  const setOpts = {
    shouldDirty: options.shouldDirty ?? true,
    shouldTouch: options.shouldTouch ?? false,
    shouldValidate: options.shouldValidate ?? false,
  };

  for (const name of fieldNames) {
    const value = (defaults as Record<string, unknown>)[name];
    setValue(name, value as FieldPathValue<Partial<ROSAHCPCluster>, typeof name>, setOpts);
  }
}
