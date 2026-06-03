import type { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';

import { hasDerivedSyncSourceValue, hasRefetchableStringValue } from './wizardFieldDerivedSyncs';
import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';
import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import { applyWizardFieldDerivedSync } from './wizardFieldDerivedSyncs';
import { wizardFormFieldValuesEqual } from './wizardFormFieldValuesEqual';
import type { ROSAHCPCluster, ROSAHCPWizardData } from '../types';
import {
  getWizardFieldDerivedSyncKeyForSourceField,
  getWizardFieldResetsForSourceField,
  getWizardFieldSyncsForSourceField,
  getWizardResourceRefetchesForSourceField,
} from '../yupSchemas';
import type { WizardFormFieldName, WizardResourceRefetchOnChange } from '../yupSchemas/types';

export type ApplyWizardFieldMetaChangeEffectsArgs = {
  sourceField: WizardFormFieldName;
  formValues: Partial<ROSAHCPCluster>;
  previousValue: unknown;
  currentValue: unknown;
  wizardData: ROSAHCPWizardData;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
  clearErrors?: UseFormClearErrors<Partial<ROSAHCPCluster>>;
};

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
    if (!hasRefetchableStringValue(arg)) {
      return;
    }
    void fetch(arg);
    return;
  }

  void (fetch as () => Promise<void>)();
}

/** Applies Yup `.meta()` reset, sync, derived sync, and resource refetch rules for a source field change. */
export function applyWizardFieldMetaChangeEffects({
  sourceField,
  formValues,
  previousValue,
  currentValue,
  wizardData,
  setValue,
  clearErrors,
}: ApplyWizardFieldMetaChangeEffectsArgs): void {
  const isInitialChange = previousValue === undefined;
  if (!isInitialChange && wizardFormFieldValuesEqual(previousValue, currentValue)) {
    return;
  }
  const refetches = getWizardResourceRefetchesForSourceField(sourceField);
  const shouldRefetch =
    refetches.length > 0 && (isInitialChange ? hasRefetchableStringValue(currentValue) : true);

  if (shouldRefetch) {
    for (const refetch of refetches) {
      refetchWizardResource(wizardData, refetch, formValues);
    }
  }

  if (!isInitialChange) {
    const resets = getWizardFieldResetsForSourceField(sourceField);
    if (resets.length > 0) {
      resetFieldsToDefaultValues(setValue, resets, {}, formValues);
    }
  }

  const syncs = getWizardFieldSyncsForSourceField(sourceField);
  if (syncs.length > 0) {
    // Resets run before sync when both are declared; sync may also run on initial mount (clear-only).
    syncFieldsOnSourceChange(
      setValue,
      syncs,
      currentValue,
      isInitialChange ? { clearOnly: true, shouldDirty: false } : undefined,
      clearErrors
    );
  }

  const derivedSyncKey = getWizardFieldDerivedSyncKeyForSourceField(sourceField);
  if (derivedSyncKey) {
    const shouldApplyDerived =
      !isInitialChange || hasDerivedSyncSourceValue(derivedSyncKey, currentValue);
    if (shouldApplyDerived) {
      applyWizardFieldDerivedSync({
        syncKey: derivedSyncKey,
        currentValue,
        formValues,
        wizardData,
        setValue,
      });
    }
  }
}
