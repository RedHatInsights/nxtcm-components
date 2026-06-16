import type { UseFormSetValue } from 'react-hook-form';

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
};

/**
 * Builds a `Record<string, string>` from multiple form field values.
 * Returns `null` when any referenced field is empty/missing so the refetch is skipped.
 */
export function buildComposedRefetchArg(
  argsFromFields: Readonly<Record<string, WizardFormFieldName>>,
  formValues: Partial<ROSAHCPCluster>
): Record<string, string> | null {
  const result: Record<string, string> = {};
  for (const [key, fieldName] of Object.entries(argsFromFields)) {
    const value = formValues[fieldName];
    if (!hasRefetchableStringValue(value)) {
      return null;
    }
    result[key] = value;
  }
  return result;
}

function refetchWizardResource(
  wizardData: ROSAHCPWizardData,
  refetch: WizardResourceRefetchOnChange,
  formValues: Partial<ROSAHCPCluster>
): void {
  const resourceKey = refetch.resource;
  if (!resourceKey) {
    return;
  }
  const resource = wizardData[resourceKey as keyof ROSAHCPWizardData];
  if (resource == null || typeof resource !== 'object' || !('fetch' in resource)) {
    return;
  }
  const fetch = (resource as { fetch?: (...args: unknown[]) => Promise<void> }).fetch;
  if (!fetch) {
    return;
  }

  if ('argsFromFields' in refetch) {
    const composed = buildComposedRefetchArg(refetch.argsFromFields, formValues);
    if (!composed) {
      return;
    }
    void (fetch as (arg: Record<string, string>) => Promise<void>)(composed);
    return;
  }

  if ('argFromField' in refetch && refetch.argFromField) {
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
      isInitialChange ? { clearOnly: true, shouldDirty: false } : undefined
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
