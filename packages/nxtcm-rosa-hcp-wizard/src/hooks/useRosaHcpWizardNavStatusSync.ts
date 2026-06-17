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
  const { validationAttemptedStepIds, asyncValidatingStepIds } = useRosaHcpWizardValidation();
  const { getFieldState } = useFormContext<Partial<ROSAHCPCluster>>();
  const formState = useFormState<Partial<ROSAHCPCluster>>();
  const { activeStep, setStep } = useWizardContext();
  const activeStepId = String(activeStep.id);
  const parentStepId = 'parentId' in activeStep ? activeStep.parentId : undefined;

  const activeStepSection = reviewSections.find((section) => section.id === activeStepId);
  const isActiveStepValidating =
    activeStepSection?.fieldPaths.some(
      (path) => getFieldState(path as FieldPath<Partial<ROSAHCPCluster>>, formState).isValidating
    ) ?? false;
  const isActiveStepAsyncValidating = asyncValidatingStepIds.has(activeStepId);

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
        activeStepId,
        asyncValidatingStepIds,
      }),
    // isActiveStepValidating/isActiveStepAsyncValidating: RHF formState proxy may keep a stable reference while validation toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bust memo when active-step async validation runs
    [
      activeStepId,
      asyncValidatingStepIds,
      formState,
      getFieldState,
      isActiveStepAsyncValidating,
      isActiveStepValidating,
      orderedStepIds,
      reviewSections,
      validationAttemptedStepIds,
    ]
  );

  const prevNavSyncRef = useRef<{
    statuses: Record<string, string | undefined>;
    disabled: Record<string, boolean | undefined>;
  }>({ statuses: {}, disabled: {} });

  useEffect(() => {
    const stepIds = new Set([
      ...Object.keys(navStepStatuses),
      ...Object.keys(navStepDisabledByValidation),
    ]);

    for (const stepId of stepIds) {
      const status = navStepStatuses[stepId];
      const isDisabled = navStepDisabledByValidation[stepId];

      if (
        prevNavSyncRef.current.statuses[stepId] === status &&
        prevNavSyncRef.current.disabled[stepId] === isDisabled
      ) {
        continue;
      }

      prevNavSyncRef.current.statuses[stepId] = status;
      prevNavSyncRef.current.disabled[stepId] = isDisabled;

      setStep({
        id: stepId,
        ...(status !== undefined ? { status } : {}),
        ...(isDisabled !== undefined ? { isDisabled } : {}),
      });
    }
  }, [navStepDisabledByValidation, navStepStatuses, setStep]);

  const prevVisitedStepIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const visitedStepIds = [activeStepId, parentStepId].filter(
      (stepId): stepId is string => stepId !== undefined
    );

    for (const stepId of visitedStepIds) {
      if (prevVisitedStepIdsRef.current.has(stepId)) {
        continue;
      }

      prevVisitedStepIdsRef.current.add(stepId);
      setStep({ id: stepId, isVisited: true });
    }
  }, [activeStepId, parentStepId, setStep]);

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
            prevVisitedStepIdsRef.current.delete(orderedStepIds[stepIndex]);
          }
        }
      }

      previousUnvisitFieldValuesRef.current[field] = currentValue;
    }

    hasInitializedUnvisitTrackingRef.current = true;
  }, [orderedStepIds, setStep, unvisitSourceFields, watchedUnvisitFieldValues]);
}
