import { useEffect, useMemo, useRef } from 'react';
import { type FieldPath, type UseFormSetValue, useFormContext, useWatch } from 'react-hook-form';

import { applyWizardFieldMetaChangeEffects } from './applyWizardFieldMetaChangeEffects';
import { readWatchedFieldValue } from './readWatchedFieldValue';
import { reapplyWizardFieldDerivedSyncs } from './wizardFieldDerivedSyncs';
import { wizardFormFieldValuesEqual } from './wizardFormFieldValuesEqual';
import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import type { ROSAHCPCluster, ROSAHCPWizardData } from '../types';
import {
  getWizardFieldResetsForSourceField,
  listWizardFieldDerivedSyncEntries,
  listWizardFieldMetaChangeSourceFields,
  listWizardNavUnvisitSourceFields,
  wizardFieldMetaByPath,
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

type ProcessSourceFieldMetaChangeArgs = {
  field: WizardFormFieldName;
  currentValue: unknown;
  previousValue: unknown;
  isInitialPass: boolean;
  formValues: Partial<ROSAHCPCluster>;
  setValue: UseFormSetValue<Partial<ROSAHCPCluster>>;
  wizardData: ROSAHCPWizardData;
  unvisitSourceFieldSet: ReadonlySet<WizardFormFieldName>;
  programmaticallyResetFields: Set<WizardFormFieldName>;
  unvisitSourceStepIds: Set<string>;
};

function clearProgrammaticResetWhenFieldUnchanged(
  field: WizardFormFieldName,
  previousValue: unknown,
  currentValue: unknown,
  isInitialPass: boolean,
  programmaticallyResetFields: Set<WizardFormFieldName>
): boolean {
  if (isInitialPass || !wizardFormFieldValuesEqual(previousValue, currentValue)) {
    return false;
  }

  if (programmaticallyResetFields.has(field)) {
    programmaticallyResetFields.delete(field);
  }

  return true;
}

function processSourceFieldMetaChange({
  field,
  currentValue,
  previousValue,
  isInitialPass,
  formValues,
  setValue,
  wizardData,
  unvisitSourceFieldSet,
  programmaticallyResetFields,
  unvisitSourceStepIds,
}: ProcessSourceFieldMetaChangeArgs): void {
  applyWizardFieldMetaChangeEffects({
    sourceField: field,
    formValues,
    previousValue,
    currentValue,
    wizardData,
    setValue,
  });

  if (!isInitialPass) {
    for (const resetTarget of getWizardFieldResetsForSourceField(field)) {
      programmaticallyResetFields.add(resetTarget);
    }
  }

  if (
    !isInitialPass &&
    unvisitSourceFieldSet.has(field) &&
    !programmaticallyResetFields.has(field)
  ) {
    const stepId = wizardFieldMetaByPath(field)?.stepId;
    if (stepId) {
      unvisitSourceStepIds.add(stepId);
    }
  }

  if (programmaticallyResetFields.has(field)) {
    programmaticallyResetFields.delete(field);
  }
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
  const { requestNavUnvisitAfterSteps } = useRosaHcpWizardValidation();
  const sourceFields = useMemo(() => listWizardFieldMetaChangeSourceFields(), []);
  const unvisitSourceFieldSet = useMemo(() => new Set(listWizardNavUnvisitSourceFields()), []);
  const derivedSyncEntries = useMemo(() => listWizardFieldDerivedSyncEntries(), []);
  const watchedValues = useWatch({
    control,
    name: sourceFields as FieldPath<Partial<ROSAHCPCluster>>[],
  });
  const previousByFieldRef = useRef<Partial<Record<WizardFormFieldName, unknown>>>({});
  const programmaticallyResetFieldsRef = useRef<Set<WizardFormFieldName>>(new Set());
  const hasInitializedRef = useRef(false);
  const wizardDataRef = useRef(wizardData);
  wizardDataRef.current = wizardData;

  useEffect(() => {
    const formValues = buildFormValuesForMetaEffects(sourceFields, watchedValues, getValues);
    const isInitialPass = !hasInitializedRef.current;
    const unvisitSourceStepIds = new Set<string>();

    const programmaticallyResetFields = programmaticallyResetFieldsRef.current;

    for (const [index, field] of sourceFields.entries()) {
      const currentValue = readWatchedFieldValue(watchedValues, index);
      const previousValue = isInitialPass ? undefined : previousByFieldRef.current[field];

      if (
        clearProgrammaticResetWhenFieldUnchanged(
          field,
          previousValue,
          currentValue,
          isInitialPass,
          programmaticallyResetFields
        )
      ) {
        continue;
      }

      processSourceFieldMetaChange({
        field,
        currentValue,
        previousValue,
        isInitialPass,
        formValues,
        setValue,
        wizardData: wizardDataRef.current,
        unvisitSourceFieldSet,
        programmaticallyResetFields,
        unvisitSourceStepIds,
      });

      previousByFieldRef.current[field] = currentValue;
    }

    if (unvisitSourceStepIds.size > 0) {
      requestNavUnvisitAfterSteps([...unvisitSourceStepIds]);
    }

    hasInitializedRef.current = true;
  }, [
    getValues,
    requestNavUnvisitAfterSteps,
    setValue,
    sourceFields,
    unvisitSourceFieldSet,
    watchedValues,
  ]);

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
