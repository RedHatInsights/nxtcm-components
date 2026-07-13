import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWizardContext } from '@patternfly/react-core';
import { type FieldPath, useFormContext, useFormState } from 'react-hook-form';

import { useRosaHcpWizardValidation } from '../rosaHcpWizardValidationContext';
import { useRosaHcpWizardReviewSections } from '../Steps/Review/ROSAHCPWizardReviewSections';
import type { ROSAHCPCluster } from '../types';

import {
  buildOrderedWizardNavStepIds,
  buildRosaHcpWizardNavStepDisabledByValidation,
} from './rosaHcpWizardNavStepStatus';
import { unvisitWizardNavStepsAfterSourcePfIndex } from './unvisitWizardNavStepsAfterSource';
import { useRosaHcpWizardNavStepStatuses } from './useRosaHcpWizardNavStepStatuses';

/** Pushes nav status, visit, and validation-disable state onto PatternFly wizard steps. */
export function useRosaHcpWizardNavStatusSync(
  includeClusterWideProxy: boolean,
  enableAllWizardNavSteps = false
): void {
  const navStepStatuses = useRosaHcpWizardNavStepStatuses(includeClusterWideProxy);
  const reviewSections = useRosaHcpWizardReviewSections();
  const { validationAttemptedStepIds, asyncValidatingStepIds, registerNavUnvisitApplier } =
    useRosaHcpWizardValidation();
  const { getFieldState } = useFormContext<Partial<ROSAHCPCluster>>();
  const formState = useFormState<Partial<ROSAHCPCluster>>();
  const { activeStep, setStep, steps: wizardSteps } = useWizardContext();
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
  const prevVisitedStepIdsRef = useRef<Set<string>>(new Set());
  const maxVisitedPfStepIndexRef = useRef(0);

  const applyNavUnvisit = useCallback(
    (sourceStepIds: readonly string[]) => {
      if (enableAllWizardNavSteps) {
        return;
      }

      const sourcePfIndices = sourceStepIds
        .map((stepId) => wizardSteps.find((step) => step.id === stepId)?.index ?? -1)
        .filter((index) => index > 0);
      if (sourcePfIndices.length === 0) {
        return;
      }

      const sourcePfIndex = Math.min(...sourcePfIndices);
      maxVisitedPfStepIndexRef.current = sourcePfIndex;
      unvisitWizardNavStepsAfterSourcePfIndex(wizardSteps, sourcePfIndex, (unvisitStepId) => {
        setStep({ id: unvisitStepId, isVisited: false });
        prevVisitedStepIdsRef.current.delete(unvisitStepId);
      });
    },
    [enableAllWizardNavSteps, setStep, wizardSteps]
  );

  useEffect(() => {
    return () => registerNavUnvisitApplier(null);
  }, [registerNavUnvisitApplier]);

  registerNavUnvisitApplier(applyNavUnvisit);

  useEffect(() => {
    const visitedStepIds = [activeStepId, parentStepId].filter(
      (stepId): stepId is string => stepId !== undefined
    );

    for (const stepId of visitedStepIds) {
      const pfIndex = wizardSteps.find((step) => step.id === stepId)?.index ?? -1;
      if (pfIndex > maxVisitedPfStepIndexRef.current) {
        maxVisitedPfStepIndexRef.current = pfIndex;
      }

      if (prevVisitedStepIdsRef.current.has(stepId)) {
        continue;
      }

      prevVisitedStepIdsRef.current.add(stepId);
      setStep({ id: stepId, isVisited: true });
    }
  }, [activeStepId, parentStepId, setStep, wizardSteps]);

  useEffect(() => {
    for (const wizardStep of wizardSteps) {
      const stepId = String(wizardStep.id);

      if (enableAllWizardNavSteps) {
        maxVisitedPfStepIndexRef.current = Math.max(
          maxVisitedPfStepIndexRef.current,
          wizardStep.index
        );
        if (!wizardStep.isVisited) {
          prevVisitedStepIdsRef.current.add(stepId);
          setStep({ id: stepId, isVisited: true });
        }
        continue;
      }

      if (wizardStep.index > maxVisitedPfStepIndexRef.current && wizardStep.isVisited) {
        setStep({ id: stepId, isVisited: false });
        prevVisitedStepIdsRef.current.delete(stepId);
      }
    }

    const stepIds = new Set([
      ...Object.keys(navStepStatuses),
      ...Object.keys(navStepDisabledByValidation),
      ...orderedStepIds,
    ]);

    for (const stepId of stepIds) {
      const status = navStepStatuses[stepId];
      const isDisabled = enableAllWizardNavSteps ? false : navStepDisabledByValidation[stepId];

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
  }, [
    enableAllWizardNavSteps,
    navStepDisabledByValidation,
    navStepStatuses,
    orderedStepIds,
    setStep,
    wizardSteps,
  ]);
}
