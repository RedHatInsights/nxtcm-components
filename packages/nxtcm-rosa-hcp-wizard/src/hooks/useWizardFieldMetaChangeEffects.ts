import { useEffect, useMemo, useRef } from 'react';
import { type FieldPath, useFormContext, useWatch } from 'react-hook-form';

import { applyWizardFieldMetaChangeEffects } from '../applyWizardFieldMetaChangeEffects';
import {
  collectWizardFieldDerivedSyncWizardDataDeps,
  reapplyWizardFieldDerivedSyncs,
} from '../wizardFieldDerivedSyncs';
import type { ClusterFormData } from '../../types';
import type { ROSAHCPWizardData } from '../types';
import {
  listWizardFieldDerivedSyncEntries,
  listWizardFieldMetaChangeSourceFields,
} from '../yupSchemas';
import type { WizardFormFieldName } from '../yupSchemas/types';

function readWatchedFieldValue(watchedValues: unknown, fieldIndex: number): unknown {
  return Array.isArray(watchedValues) ? watchedValues[fieldIndex] : watchedValues;
}

/** Merges live `useWatch` values into `getValues()` so refetch args match the field being processed. */
function buildFormValuesForMetaEffects(
  sourceFields: readonly WizardFormFieldName[],
  watchedValues: unknown,
  getValues: () => Partial<ClusterFormData>
): Partial<ClusterFormData> {
  const formValues: Record<string, unknown> = { ...getValues() };
  for (const [index, field] of sourceFields.entries()) {
    const currentValue = readWatchedFieldValue(watchedValues, index);
    if (currentValue !== undefined) {
      formValues[field] = currentValue;
    }
  }
  return formValues as Partial<ClusterFormData>;
}

/**
 * Subscribes to react-hook-form values for every Yup field that declares
 * `resetsFieldsToDefaultOnChange`, `refetchesResourcesOnChange`, `syncsFieldsOnChange`, or
 * `derivedFieldsSyncOnChange` in `.meta()`.
 */
export function useWizardFieldMetaChangeEffects(wizardData: ROSAHCPWizardData): void {
  const { setValue, getValues, control } = useFormContext<Partial<ClusterFormData>>();
  const sourceFields = useMemo(() => listWizardFieldMetaChangeSourceFields(), []);
  const derivedSyncEntries = useMemo(() => listWizardFieldDerivedSyncEntries(), []);
  const derivedSyncWizardDataDepValues = collectWizardFieldDerivedSyncWizardDataDeps(
    derivedSyncEntries,
    wizardData
  );
  const watchedValues = useWatch({
    control,
    name: sourceFields as FieldPath<Partial<ClusterFormData>>[],
  });
  const previousByFieldRef = useRef<Partial<Record<WizardFormFieldName, unknown>>>({});
  const hasInitializedRef = useRef(false);
  const wizardDataRef = useRef(wizardData);
  wizardDataRef.current = wizardData;

  useEffect(() => {
    const formValues = buildFormValuesForMetaEffects(sourceFields, watchedValues, getValues);
    const isInitialPass = !hasInitializedRef.current;

    for (const [index, field] of sourceFields.entries()) {
      const currentValue = readWatchedFieldValue(watchedValues, index);
      const previousValue = isInitialPass ? undefined : previousByFieldRef.current[field];

      applyWizardFieldMetaChangeEffects({
        sourceField: field,
        formValues,
        previousValue,
        currentValue,
        wizardData: wizardDataRef.current,
        setValue,
      });
      previousByFieldRef.current[field] = currentValue;
    }

    hasInitializedRef.current = true;
  }, [getValues, setValue, sourceFields, watchedValues]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      return;
    }

    reapplyWizardFieldDerivedSyncs({
      entries: derivedSyncEntries,
      formValues: getValues(),
      wizardData: wizardDataRef.current,
      setValue,
    });
  }, [derivedSyncEntries, getValues, setValue, ...derivedSyncWizardDataDepValues]);
}
