import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { type FieldPath, useFormContext, useFormState, useWatch } from 'react-hook-form';

import type { ROSAHCPCluster } from './types';
import { buildClusterValidationSchemaContext } from './utilities/buildClusterValidationSchemaContext';
import { clusterValidationSchema } from './yupSchemas';
import {
  buildOrderedNavigableStepIds,
  captureRosaHcpStepFieldValueBaseline,
  findEarliestOrderedStepIndexWithValidationIssues,
  isRosaHcpWizardNavStepDisabled,
  latchEngagedRosaHcpResetSourceFields,
  rosaHcpWizardBlockForwardNavigation,
  rosaHcpWizardResetSourceValuesChanged,
} from './rosaHcpWizardNav';
import type { RosaHcpWizardChildStepIdsByParent } from './rosaHcpWizardStepHierarchy';
import { useRosaHcpWizardReviewSections } from './Steps/Review/ROSAHCPWizardReviewSections';
import { useRosaHcpWizardValidators } from './stringsProvider/RosaHcpWizardStringsContext';
import { useRosaHcpWizardValidation } from './rosaHcpWizardValidationContext';

type UseRosaHcpWizardStepNavDisabledLookupOptions = {
  includeClusterWideProxy: boolean;
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent;
};

/** PatternFly `WizardStep` `isDisabled` lookup (must be a direct Wizard child). */
export function useRosaHcpWizardStepNavDisabledLookup({
  includeClusterWideProxy,
  childStepIdsByParent,
}: UseRosaHcpWizardStepNavDisabledLookupOptions): (stepId: string) => boolean {
  const { activeStepId, visitedStepIds, invalidateForwardVisitedSteps, asyncValidatingFieldPaths } =
    useRosaHcpWizardValidation();
  const reviewSections = useRosaHcpWizardReviewSections();
  const validatorStrings = useRosaHcpWizardValidators();
  const { control, getValues, getFieldState } = useFormContext<Partial<ROSAHCPCluster>>();
  const watchedFormValues = useWatch<Partial<ROSAHCPCluster>>();
  const latchedResetSourceFieldsRef = useRef(new Set<string>());
  const latchedForActiveStepIdRef = useRef<string | null>(null);

  const orderedStepIds = useMemo(
    () => buildOrderedNavigableStepIds(includeClusterWideProxy),
    [includeClusterWideProxy]
  );

  const activeStepFieldPaths = useMemo(
    () => reviewSections.find((section) => section.id === activeStepId)?.fieldPaths ?? [],
    [activeStepId, reviewSections]
  );

  const allStepFieldPaths = useMemo(
    () => reviewSections.flatMap((section) => section.fieldPaths),
    [reviewSections]
  );

  // Subscribe to validation state for every wizard step, not only the active one.
  const formState = useFormState<Partial<ROSAHCPCluster>>({
    control,
    name:
      allStepFieldPaths.length > 0
        ? (allStepFieldPaths as FieldPath<Partial<ROSAHCPCluster>>[])
        : undefined,
  });
  const { errors } = formState;

  const getSubscribedFieldState = useCallback(
    (path: string) => getFieldState(path as FieldPath<Partial<ROSAHCPCluster>>, formState),
    [formState, getFieldState]
  );

  const stepFieldValueBaseline = useMemo(
    () => captureRosaHcpStepFieldValueBaseline(activeStepFieldPaths, getValues),
    // Freeze baseline when the user enters a step; omit getValues so edits on the same step are detected.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- activeStepFieldPaths is tied to activeStepId
    [activeStepId]
  );

  const yupDescribeOptions = useMemo(
    () => ({
      context: buildClusterValidationSchemaContext(
        (watchedFormValues ?? getValues()) as Partial<ROSAHCPCluster>,
        validatorStrings
      ),
    }),
    [getValues, validatorStrings, watchedFormValues]
  );

  // Latch runs in layout effect (not render) so reset-source engagement does not mutate during render.
  useLayoutEffect(() => {
    if (latchedForActiveStepIdRef.current !== activeStepId) {
      latchedResetSourceFieldsRef.current = new Set();
      latchedForActiveStepIdRef.current = activeStepId;
    }

    latchEngagedRosaHcpResetSourceFields(
      activeStepFieldPaths,
      getValues,
      getSubscribedFieldState,
      stepFieldValueBaseline,
      latchedResetSourceFieldsRef.current
    );
  }, [
    activeStepFieldPaths,
    activeStepId,
    getSubscribedFieldState,
    getValues,
    stepFieldValueBaseline,
    watchedFormValues,
  ]);

  const resetSourceValuesChanged = rosaHcpWizardResetSourceValuesChanged(
    activeStepFieldPaths,
    getValues,
    getSubscribedFieldState,
    stepFieldValueBaseline,
    latchedResetSourceFieldsRef.current
  );

  const blockForwardNavigation = rosaHcpWizardBlockForwardNavigation({
    activeStepFieldPaths,
    getValues,
    getFieldState: getSubscribedFieldState,
    errors,
    schema: clusterValidationSchema,
    describeOptions: yupDescribeOptions,
    stepDependencyBaseline: stepFieldValueBaseline,
    latchedResetSourceFields: latchedResetSourceFieldsRef.current,
    asyncValidatingFieldPaths,
  });

  const earliestInvalidStepIdx = findEarliestOrderedStepIndexWithValidationIssues({
    reviewSections,
    orderedStepIds,
    getFieldState: getSubscribedFieldState,
    errors,
  });

  useEffect(() => {
    if (!resetSourceValuesChanged) {
      return;
    }
    invalidateForwardVisitedSteps(activeStepId, orderedStepIds);
  }, [activeStepId, invalidateForwardVisitedSteps, orderedStepIds, resetSourceValuesChanged]);

  return useCallback(
    (stepId: string) =>
      isRosaHcpWizardNavStepDisabled({
        targetStepId: stepId,
        activeStepId,
        visitedStepIds,
        blockForwardNavigation,
        orderedStepIds,
        earliestInvalidStepIdx,
        childStepIdsByParent,
      }),
    [
      activeStepId,
      blockForwardNavigation,
      childStepIdsByParent,
      earliestInvalidStepIdx,
      orderedStepIds,
      visitedStepIds,
    ]
  );
}
