import type { UseFormSetValue } from 'react-hook-form';

import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';
import type { ROSAHCPCluster, ROSAHCPWizardData } from './types';
import {
  getWizardFieldResetsForSourceField,
  getWizardResourceRefetchesForSourceField,
} from './yupSchemas';
import type { WizardFormFieldName, WizardResourceRefetchOnChange } from './yupSchemas/types';

export type ApplyWizardFieldMetaChangeEffectsArgs = {
  sourceField: WizardFormFieldName;
  formValues: Partial<ROSAHCPCluster>;
  previousValue: unknown;
  currentValue: unknown;
  wizardData: ROSAHCPWizardData;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
};

function hasRefetchableValue(value: unknown): value is string {
  return typeof value === 'string' && value !== '';
}

function refetchWizardResource(
  wizardData: ROSAHCPWizardData,
  refetch: WizardResourceRefetchOnChange,
  formValues: Partial<ROSAHCPCluster>
): void {
  const resource = wizardData[refetch.resource];
  const fetch = resource.fetch;
  if (!fetch) {
    return;
  }

  if (refetch.argFromField) {
    const arg = formValues[refetch.argFromField];
    if (!hasRefetchableValue(arg)) {
      return;
    }
    void fetch(arg);
    return;
  }

  void (fetch as () => Promise<void>)();
}

/** Applies Yup `.meta()` reset and resource refetch rules for a single source field change. */
export function applyWizardFieldMetaChangeEffects({
  sourceField,
  formValues,
  previousValue,
  currentValue,
  wizardData,
  setValue,
}: ApplyWizardFieldMetaChangeEffectsArgs): void {
  if (Object.is(previousValue, currentValue)) {
    return;
  }

  const refetches = getWizardResourceRefetchesForSourceField(sourceField);
  const shouldRefetch =
    refetches.length > 0 &&
    (previousValue === undefined ? hasRefetchableValue(currentValue) : true);

  if (shouldRefetch) {
    for (const refetch of refetches) {
      refetchWizardResource(wizardData, refetch, formValues);
    }
  }

  if (previousValue !== undefined) {
    const resets = getWizardFieldResetsForSourceField(sourceField);
    if (resets.length > 0) {
      resetFieldsToDefaultValues(setValue, resets);
    }
  }
}
