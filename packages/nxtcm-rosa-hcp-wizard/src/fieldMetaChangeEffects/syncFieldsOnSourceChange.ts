import * as yup from 'yup';
import type {
  FieldPath,
  FieldPathValue,
  UseFormClearErrors,
  UseFormSetValue,
} from 'react-hook-form';

import {
  buildFormSetValueOptions,
  DEFAULT_FORM_SET_VALUE_OPTS,
  DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE,
  type FormSetValueOptions,
} from '../utilities/formSetValueOptions';
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
  options: SyncFieldsOnSourceChangeOptions = {},
  clearErrors?: UseFormClearErrors<Partial<ROSAHCPCluster>>
): void {
  const branch = syncRules.find((rule) => rule.when === currentValue);
  if (!branch) {
    return;
  }

  const { clearOnly, ...setValueOptions } = options;
  const setOpts = buildFormSetValueOptions(
    setValueOptions,
    clearOnly ? DEFAULT_FORM_SET_VALUE_OPTS : DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE
  );

  const syncedFieldNames: WizardFormFieldName[] = [];

  for (const name of branch.clear ?? []) {
    syncedFieldNames.push(name);
    setValue(name, undefined as FieldPathValue<Partial<ROSAHCPCluster>, typeof name>, setOpts);
  }

  if (clearOnly) {
    return;
  }

  for (const name of branch.setDefaults ?? []) {
    syncedFieldNames.push(name);
    const value = getWizardFieldSchemaDefault(name);
    setValue(name, value as FieldPathValue<Partial<ROSAHCPCluster>, typeof name>, setOpts);
  }

  if (clearErrors && syncedFieldNames.length > 0) {
    clearErrors(syncedFieldNames as FieldPath<Partial<ROSAHCPCluster>>[]);
  }
}
