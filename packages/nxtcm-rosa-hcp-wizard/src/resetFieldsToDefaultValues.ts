import type { FieldPathValue, UseFormSetValue } from 'react-hook-form';

import { buildFormSetValueOptions, type FormSetValueOptions } from './formSetValueOptions';
import type { ROSAHCPCluster } from './types';
import { getClusterValidationSchemaDefaultValues } from './yupSchemas';

type FormPath = Extract<keyof ROSAHCPCluster, string>;

export type ResetFieldsToDefaultValuesOptions = FormSetValueOptions;

/** Sets form fields back to {@link getClusterValidationSchemaDefaultValues} (or `undefined` when omitted). */
export function resetFieldsToDefaultValues(
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>,
  fieldNames: readonly FormPath[],
  options: ResetFieldsToDefaultValuesOptions = {}
): void {
  const defaults = getClusterValidationSchemaDefaultValues();
  const setOpts = buildFormSetValueOptions(options);

  for (const name of fieldNames) {
    const value = (defaults as Record<string, unknown>)[name];
    setValue(name, value as FieldPathValue<Partial<ROSAHCPCluster>, typeof name>, setOpts);
  }
}
