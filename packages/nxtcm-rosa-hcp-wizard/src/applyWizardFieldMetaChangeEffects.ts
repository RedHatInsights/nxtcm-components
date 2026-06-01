import type { UseFormSetValue } from 'react-hook-form';

import { hasDerivedSyncSourceValue, hasRefetchableStringValue } from './wizardFieldDerivedSyncs';
import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';
import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import { applyWizardFieldDerivedSync } from './wizardFieldDerivedSyncs';
import type { ROSAHCPCluster, ROSAHCPWizardData } from './types';
import {
  getWizardFieldDerivedSyncKeyForSourceField,
  getWizardFieldResetsForSourceField,
  getWizardFieldSyncsForSourceField,
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
}: ApplyWizardFieldMetaChangeEffectsArgs): void {
  if (Object.is(previousValue, currentValue)) {
    return;
  }

  const refetches = getWizardResourceRefetchesForSourceField(sourceField);
  const shouldRefetch =
    refetches.length > 0 &&
    (previousValue === undefined ? hasRefetchableStringValue(currentValue) : true);

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

  const syncs = getWizardFieldSyncsForSourceField(sourceField);
  if (syncs.length > 0) {
    // Resets run before sync when both are declared; sync may also run on initial mount (clear-only).
    syncFieldsOnSourceChange(
      setValue,
      syncs,
      currentValue,
      previousValue === undefined ? { clearOnly: true, shouldDirty: false } : undefined
    );
  }

  const derivedSyncKey = getWizardFieldDerivedSyncKeyForSourceField(sourceField);
  if (derivedSyncKey) {
    const shouldApplyDerived =
      previousValue !== undefined || hasDerivedSyncSourceValue(derivedSyncKey, currentValue);
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
