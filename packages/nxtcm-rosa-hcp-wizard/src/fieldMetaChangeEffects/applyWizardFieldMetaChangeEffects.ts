import type { UseFormSetValue } from 'react-hook-form';

import { hasDerivedSyncSourceValue, hasRefetchableStringValue } from './wizardFieldDerivedSyncs';
import { resetFieldsToDefaultValues } from './resetFieldsToDefaultValues';
import { syncFieldsOnSourceChange } from './syncFieldsOnSourceChange';
import { applyWizardFieldDerivedSync } from './wizardFieldDerivedSyncs';
import { wizardFormFieldValuesEqual } from './wizardFormFieldValuesEqual';
import type { ROSAHCPCluster, ROSAHCPWizardData } from '../types';
import { resolveSelectedVpc } from '../utilities/helpers';
import {
  getWizardFieldDerivedSyncKeyForSourceField,
  getWizardFieldResetsForSourceField,
  getWizardFieldSyncsForSourceField,
  getWizardResourceRefetchesForSourceField,
} from '../yupSchemas';
import type { WizardFormFieldName, WizardResourceRefetchOnChange } from '../yupSchemas/types';

type ComposedArgResolver = (rawValue: unknown, wizardData: ROSAHCPWizardData) => unknown;

/**
 * Arg-key-specific resolvers that transform raw form field values into the shape
 * expected by a resource's `fetch`. Keys not listed here fall through to the
 * default `hasRefetchableStringValue` string check.
 */
const COMPOSED_REFETCH_ARG_RESOLVERS: Readonly<Record<string, ComposedArgResolver>> = {
  availability_zones: (rawValue, wizardData) => {
    const vpc = resolveSelectedVpc(
      rawValue as ROSAHCPCluster['selected_vpc'],
      wizardData.vpcList.data
    );
    if (!vpc?.aws_subnets?.length) return null;
    return [...new Set(vpc.aws_subnets.map((s) => s.availability_zone))];
  },
};

export type ApplyWizardFieldMetaChangeEffectsArgs = {
  sourceField: WizardFormFieldName;
  formValues: Partial<ROSAHCPCluster>;
  previousValue: unknown;
  currentValue: unknown;
  wizardData: ROSAHCPWizardData;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
};

/**
 * Builds a fetch-args record from multiple form field values.
 * Arg keys with a registered {@link COMPOSED_REFETCH_ARG_RESOLVERS} entry are transformed
 * (e.g. `availability_zones` resolves a VPC value into a `string[]` of AZ identifiers).
 * Returns `null` when any referenced field is empty/missing so the refetch is skipped.
 */
export function buildComposedRefetchArg(
  argsFromFields: Readonly<Record<string, WizardFormFieldName>>,
  formValues: Partial<ROSAHCPCluster>,
  wizardData: ROSAHCPWizardData
): Record<string, unknown> | null {
  const result: Record<string, unknown> = {};
  for (const [key, fieldName] of Object.entries(argsFromFields)) {
    const value = formValues[fieldName];
    const resolver = COMPOSED_REFETCH_ARG_RESOLVERS[key];
    if (resolver) {
      const resolved = resolver(value, wizardData);
      if (resolved == null) return null;
      result[key] = resolved;
    } else {
      if (!hasRefetchableStringValue(value)) return null;
      result[key] = value;
    }
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
    const composed = buildComposedRefetchArg(refetch.argsFromFields, formValues, wizardData);
    if (!composed) {
      return;
    }
    void (fetch as (arg: Record<string, unknown>) => Promise<void>)(composed);
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
