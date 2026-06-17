import { useEffect, useMemo, useRef } from 'react';
import { type FieldPath, useFormContext, useWatch } from 'react-hook-form';

import { applyWizardFieldMetaChangeEffects } from './applyWizardFieldMetaChangeEffects';
import { readWatchedFieldValue } from './readWatchedFieldValue';
import { reapplyWizardFieldDerivedSyncs } from './wizardFieldDerivedSyncs';
import { wizardFormFieldValuesEqual } from './wizardFormFieldValuesEqual';
import type { ROSAHCPCluster, ROSAHCPWizardData } from '../types';
import {
  listWizardFieldDerivedSyncEntries,
  listWizardFieldMetaChangeSourceFields,
} from '../yupSchemas';
import type { WizardFormFieldName } from '../yupSchemas/types';

/** Merges live `useWatch` values into `getValues()` so refetch args match the field being processed. */
function buildFormValuesForMetaEffects(
  sourceFields: readonly WizardFormFieldName[],
  watchedValues: unknown,
  getValues: () => Partial<ROSAHCPCluster>
): Partial<ROSAHCPCluster> {
  const formValues: Record<string, unknown> = { ...getValues() };
  for (const [index, field] of sourceFields.entries()) {
    const currentValue = readWatchedFieldValue(watchedValues, index);
    if (currentValue !== undefined) {
      formValues[field] = currentValue;
    }
  }
  return formValues as Partial<ROSAHCPCluster>;
}

/**
 * Subscribes to react-hook-form values for every Yup field that declares
 * `resetsFieldsToDefaultOnChange`, `refetchesResourcesOnChange`, `syncsFieldsOnChange`, or
 * `derivedFieldsSyncOnChange` in `.meta()`.
 *
 * Loop safety: only **source** fields are watched. Change detection uses
 * {@link wizardFormFieldValuesEqual} so array/object reference churn on dependents does not
 * re-run effects; resets skip `setValue` when the form already matches schema defaults.
 */
export function useWizardFieldMetaChangeEffects(wizardData: ROSAHCPWizardData): void {
  const { setValue, getValues, control } = useFormContext<Partial<ROSAHCPCluster>>();
  const sourceFields = useMemo(() => listWizardFieldMetaChangeSourceFields(), []);
  const derivedSyncEntries = useMemo(() => listWizardFieldDerivedSyncEntries(), []);
  const watchedValues = useWatch({
    control,
    name: sourceFields as FieldPath<Partial<ROSAHCPCluster>>[],
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

      if (!isInitialPass && wizardFormFieldValuesEqual(previousValue, currentValue)) {
        continue;
      }

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
  }, [derivedSyncEntries, getValues, setValue, wizardData.roles.data, wizardData.vpcList.data]);
}
