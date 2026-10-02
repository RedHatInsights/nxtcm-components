import type { UseFormSetValue } from 'react-hook-form';

import type { WizardFormValues } from '../types';
import {
  buildFormSetValueOptions,
  DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE,
  type FormSetValueOptions,
} from '../utilities/formSetValueOptions';
import { clusterValidationSchema } from '../yupSchemas';
import type { WizardFieldSyncOnChange } from '../yupSchemas/types';

export type SyncFieldsOnSourceChangeOptions = FormSetValueOptions & {
  /** When true, only `clear` runs — used on initial mount to drop stale inactive fields without overwriting hydrated values. */
  clearOnly?: boolean;
};

/** Applies the matching {@link WizardFieldSyncOnChange} branch for the source field's new value. */
export function syncFieldsOnSourceChange(
  setValue: UseFormSetValue<WizardFormValues>,
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
    setValue(name, undefined, setOpts);
  }

  if (options.clearOnly) {
    return;
  }

  const setDefaultsOpts: Required<FormSetValueOptions> = {
    ...setOpts,
    shouldValidate: DEFAULT_FORM_SET_VALUE_OPTS_WITH_VALIDATE.shouldValidate,
  };

  const defaults: WizardFormValues = clusterValidationSchema.getDefault();

  for (const name of branch.setDefaults ?? []) {
    setValue(name, defaults[name], setDefaultsOpts);
  }
}
