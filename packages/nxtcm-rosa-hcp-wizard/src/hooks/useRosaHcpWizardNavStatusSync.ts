import { useEffect, useMemo, useRef } from 'react';
import { useWizardContext } from '@patternfly/react-core';
import { type FieldPath, useFormContext, useFormState, useWatch } from 'react-hook-form';

import { readWatchedFieldValue } from '../fieldMetaChangeEffects/readWatchedFieldValue';
import { wizardFormFieldValuesEqual } from '../fieldMetaChangeEffects/wizardFormFieldValuesEqual';
import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import { useRosaHcpWizardReviewSections } from '../Steps/Review/ROSAHCPWizardReviewSections';
import type { ROSAHCPCluster } from '../types';
import { listWizardNavUnvisitSourceFields, wizardFieldMetaByPath } from '../yupSchemas';
import type { WizardFormFieldName } from '../yupSchemas/types';

import {
  buildOrderedWizardNavStepIds,
  buildRosaHcpWizardNavStepDisabledByValidation,
} from './rosaHcpWizardNavStepStatus';
import { useRosaHcpWizardNavStepStatuses } from './useRosaHcpWizardNavStepStatuses';

/** Pushes nav status, visit, and validation-disable state onto PatternFly wizard steps. */
export function useRosaHcpWizardNavStatusSync(includeClusterWideProxy: boolean): void {
  const navStepStatuses = useRosaHcpWizardNavStepStatuses(includeClusterWideProxy);
  const reviewSections = useRosaHcpWizardReviewSections();
  const { validationAttemptedStepIds } = useRosaHcpWizardValidation();
  const { getFieldState } = useFormContext<Partial<ROSAHCPCluster>>();
  const formState = useFormState<Partial<ROSAHCPCluster>>();
  const { activeStep, setStep } = useWizardContext();

  const orderedStepIds = useMemo(
    () => buildOrderedWizardNavStepIds(reviewSections, includeClusterWideProxy),
    [includeClusterWideProxy, reviewSections]
  );

  const navStepDisabledByValidation = useMemo(
    () =>
      buildRosaHcpWizardNavStepDisabledByValidation({
        orderedStepIds,
        sections: reviewSections,
        getFieldState: (path, state) =>
          getFieldState(path as FieldPath<Partial<ROSAHCPCluster>>, state ?? formState),
        validationAttemptedStepIds,
      }),
    [formState, getFieldState, orderedStepIds, reviewSections, validationAttemptedStepIds]
  );

  useEffect(() => {
    const stepIds = new Set([
      ...Object.keys(navStepStatuses),
      ...Object.keys(navStepDisabledByValidation),
    ]);

    for (const stepId of stepIds) {
      const status = navStepStatuses[stepId];
      const isDisabled = navStepDisabledByValidation[stepId];
      setStep({
        id: stepId,
        ...(status !== undefined ? { status } : {}),
        ...(isDisabled !== undefined ? { isDisabled } : {}),
      });
    }
  }, [navStepDisabledByValidation, navStepStatuses, setStep]);

  useEffect(() => {
    const activeStepId = String(activeStep.id);
    setStep({ id: activeStepId, isVisited: true });

    const parentStepId = 'parentId' in activeStep ? activeStep.parentId : undefined;
    if (parentStepId !== undefined) {
      setStep({ id: parentStepId, isVisited: true });
    }
  }, [activeStep, setStep]);

  const unvisitSourceFields = useMemo(() => listWizardNavUnvisitSourceFields(), []);
  const watchedUnvisitFieldValues = useWatch({
    name: unvisitSourceFields as FieldPath<Partial<ROSAHCPCluster>>[],
  });
  const previousUnvisitFieldValuesRef = useRef<Partial<Record<WizardFormFieldName, unknown>>>({});
  const hasInitializedUnvisitTrackingRef = useRef(false);

  useEffect(() => {
    const isInitialPass = !hasInitializedUnvisitTrackingRef.current;

    for (const [index, field] of unvisitSourceFields.entries()) {
      const currentValue = readWatchedFieldValue(watchedUnvisitFieldValues, index);
      const previousValue = isInitialPass
        ? undefined
        : previousUnvisitFieldValuesRef.current[field];

      if (!isInitialPass && wizardFormFieldValuesEqual(previousValue, currentValue)) {
        continue;
      }

      if (!isInitialPass) {
        const sourceStepId = wizardFieldMetaByPath(field)?.stepId;
        const sourceStepIndex =
          sourceStepId !== undefined ? orderedStepIds.indexOf(sourceStepId) : -1;

        if (sourceStepIndex >= 0) {
          for (
            let stepIndex = sourceStepIndex + 1;
            stepIndex < orderedStepIds.length;
            stepIndex++
          ) {
            setStep({ id: orderedStepIds[stepIndex], isVisited: false });
          }
        }
      }

      previousUnvisitFieldValuesRef.current[field] = currentValue;
    }

    hasInitializedUnvisitTrackingRef.current = true;
  }, [orderedStepIds, setStep, unvisitSourceFields, watchedUnvisitFieldValues]);
}
