import * as yup from 'yup';
import type { FieldPathValue, UseFormSetValue } from 'react-hook-form';

import { buildFormSetValueOptions, type FormSetValueOptions } from '../formSetValueOptions';
import type { ROSAHCPCluster } from '../types';
import { clusterValidationSchema } from '../yupSchemas';
import type { WizardFieldSyncOnChange, WizardFormFieldName } from '../yupSchemas/types';

export type SyncFieldsOnSourceChangeOptions = FormSetValueOptions & {
  /** When true, only `clear` runs — used on initial mount to drop stale inactive fields without overwriting hydrated values. */
  clearOnly?: boolean;
};

function getWizardFieldSchemaDefault(fieldName: WizardFormFieldName): unknown {
  const fieldSchema = yup.reach(clusterValidationSchema, fieldName) as yup.Schema;
  return fieldSchema.getDefault();
}

/** Applies the matching {@link WizardFieldSyncOnChange} branch for the source field's new value. */
export function syncFieldsOnSourceChange(
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>,
  syncRules: readonly WizardFieldSyncOnChange[],
  currentValue: unknown,
  options: SyncFieldsOnSourceChangeOptions = {}
): void {
  const branch = syncRules.find((rule) => rule.when === currentValue);
  if (!branch) {
    return;
  }

  const setOpts = buildFormSetValueOptions(options);

  for (const name of branch.clear ?? []) {
    setValue(name, undefined as FieldPathValue<Partial<ROSAHCPCluster>, typeof name>, setOpts);
  }

  if (options.clearOnly) {
    return;
  }

  for (const name of branch.setDefaults ?? []) {
    const value = getWizardFieldSchemaDefault(name);
    setValue(name, value as FieldPathValue<Partial<ROSAHCPCluster>, typeof name>, setOpts);
  }
}
