import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { type FieldPath, useFormContext, useFormState, useWatch } from 'react-hook-form';

import type { ROSAHCPCluster } from './types';
import { STEP_IDS } from './constants';
import { trimVisitedStepIdsAfter } from './rosaHcpWizardNav';
import { useRosaHcpWizardReviewSections } from './Steps/Review/ROSAHCPWizardReviewSections';
import {
  isWizardFieldActiveForStepValidation,
  stepOrChildHasFormValidationIssues,
  stepOrChildHasValidationError,
  type RosaHcpWizardChildStepIdsByParent,
} from './rosaHcpWizardStepHierarchy';

function visitedStepSetsEqual(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
  if (left.size !== right.size) {
    return false;
  }
  for (const stepId of left) {
    if (!right.has(stepId)) {
      return false;
    }
  }
  return true;
}

export type RosaHcpWizardStepStatus = 'default' | 'error';

type RosaHcpWizardValidationContextValue = {
  fieldPathToStepId: Readonly<Record<string, string>>;
  validationAttemptedStepIds: ReadonlySet<string>;
  validationAlertStepId: string | null;
  navErrorSuppressedFieldPaths: ReadonlySet<string>;
  asyncValidatingFieldPaths: ReadonlySet<string>;
  setFieldNavErrorSuppressed: (fieldPath: string, suppressed: boolean) => void;
  setFieldAsyncValidationInProgress: (fieldPath: string, inProgress: boolean) => void;
  markValidationAttempted: (stepId: string) => void;
  clearValidationAttempted: (stepId: string) => void;
  setValidationAlertStepId: (
    stepId: string | null | ((prev: string | null) => string | null)
  ) => void;
  activeStepId: string;
  visitedStepIds: ReadonlySet<string>;
  onWizardStepChange: (stepId: string) => void;
  /** Drop visited status for leaf steps after `activeStepId` (e.g. after a reset-source field edit). */
  invalidateForwardVisitedSteps: (activeStepId: string, orderedStepIds: readonly string[]) => void;
};

/** Maps a step to PatternFly nav status from revealed or live field validation. */
export function getRosaHcpWizardStepStatus(
  stepId: string,
  validationAttemptedStepIds: ReadonlySet<string>,
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent,
  hasFormValidationIssues = false
): RosaHcpWizardStepStatus {
  if (
    stepOrChildHasValidationError(stepId, validationAttemptedStepIds, childStepIdsByParent) ||
    hasFormValidationIssues
  ) {
    return 'error';
  }
  return 'default';
}

const RosaHcpWizardValidationContext = createContext<RosaHcpWizardValidationContextValue | null>(
  null
);

/** Tracks steps where Next or Skip to review failed so field errors can persist across nav. */
export function RosaHcpWizardValidationProvider({
  children,
  initialActiveStepId = STEP_IDS.DETAILS,
  initialVisitedStepIds = [STEP_IDS.DETAILS],
}: {
  children: ReactNode;
  /** Test-only: seed the active step before nav disable logic runs. */
  initialActiveStepId?: string;
  /** Test-only: seed visited steps so forward nav enablement matches a mid-wizard state. */
  initialVisitedStepIds?: readonly string[];
}) {
  const reviewSections = useRosaHcpWizardReviewSections();

  const fieldPathToStepId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const section of reviewSections) {
      for (const path of section.fieldPaths) {
        map[path] = section.id;
      }
    }
    return map;
  }, [reviewSections]);

  const [validationAttemptedStepIds, setValidationAttemptedStepIds] = useState(
    () => new Set<string>()
  );
  const [validationAlertStepId, setValidationAlertStepIdState] = useState<string | null>(null);
  const setValidationAlertStepId = useCallback(
    (stepIdOrFn: string | null | ((prev: string | null) => string | null)) => {
      setValidationAlertStepIdState((prev) =>
        typeof stepIdOrFn === 'function' ? stepIdOrFn(prev) : stepIdOrFn
      );
    },
    []
  );
  const [navErrorSuppressedFieldPaths, setNavErrorSuppressedFieldPathsState] = useState(
    () => new Set<string>()
  );
  const [asyncValidatingFieldPaths, setAsyncValidatingFieldPathsState] = useState(
    () => new Set<string>()
  );
  const [activeStepId, setActiveStepId] = useState(initialActiveStepId);
  const [visitedStepIds, setVisitedStepIds] = useState(() => new Set(initialVisitedStepIds));

  const onWizardStepChange = useCallback((stepId: string) => {
    setActiveStepId(stepId);
    setVisitedStepIds((prev) => {
      if (prev.has(stepId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const markValidationAttempted = useCallback((stepId: string) => {
    setValidationAttemptedStepIds((prev) => {
      if (prev.has(stepId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const clearValidationAttempted = useCallback((stepId: string) => {
    setValidationAttemptedStepIds((prev) => {
      if (!prev.has(stepId)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(stepId);
      return next;
    });
  }, []);

  const setFieldNavErrorSuppressed = useCallback((fieldPath: string, suppressed: boolean) => {
    setNavErrorSuppressedFieldPathsState((prev) => {
      const has = prev.has(fieldPath);
      if (suppressed === has) {
        return prev;
      }
      const next = new Set(prev);
      if (suppressed) {
        next.add(fieldPath);
      } else {
        next.delete(fieldPath);
      }
      return next;
    });
  }, []);

  const setFieldAsyncValidationInProgress = useCallback(
    (fieldPath: string, inProgress: boolean) => {
      setAsyncValidatingFieldPathsState((prev) => {
        const has = prev.has(fieldPath);
        if (inProgress === has) {
          return prev;
        }
        const next = new Set(prev);
        if (inProgress) {
          next.add(fieldPath);
        } else {
          next.delete(fieldPath);
        }
        return next;
      });
    },
    []
  );

  const invalidateForwardVisitedSteps = useCallback(
    (stepId: string, orderedStepIds: readonly string[]) => {
      const activeIdx = orderedStepIds.indexOf(stepId);

      setVisitedStepIds((prev) => {
        const next = trimVisitedStepIdsAfter(prev, stepId, orderedStepIds);
        return visitedStepSetsEqual(prev, next) ? prev : next;
      });

      if (activeIdx === -1) {
        return;
      }

      setValidationAttemptedStepIds((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const attemptedStepId of prev) {
          const stepIdx = orderedStepIds.indexOf(attemptedStepId);
          if (stepIdx > activeIdx) {
            next.delete(attemptedStepId);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      fieldPathToStepId,
      validationAttemptedStepIds,
      validationAlertStepId,
      navErrorSuppressedFieldPaths,
      asyncValidatingFieldPaths,
      setFieldNavErrorSuppressed,
      setFieldAsyncValidationInProgress,
      markValidationAttempted,
      clearValidationAttempted,
      setValidationAlertStepId,
      activeStepId,
      visitedStepIds,
      onWizardStepChange,
      invalidateForwardVisitedSteps,
    }),
    [
      activeStepId,
      clearValidationAttempted,
      fieldPathToStepId,
      asyncValidatingFieldPaths,
      invalidateForwardVisitedSteps,
      markValidationAttempted,
      navErrorSuppressedFieldPaths,
      onWizardStepChange,
      setFieldAsyncValidationInProgress,
      setFieldNavErrorSuppressed,
      setValidationAlertStepId,
      validationAlertStepId,
      validationAttemptedStepIds,
      visitedStepIds,
    ]
  );

  return (
    <RosaHcpWizardValidationContext.Provider value={value}>
      {children}
    </RosaHcpWizardValidationContext.Provider>
  );
}

export function useRosaHcpWizardValidation(): RosaHcpWizardValidationContextValue {
  const context = useContext(RosaHcpWizardValidationContext);
  if (context === null) {
    throw new Error(
      'useRosaHcpWizardValidation must be used within RosaHcpWizardValidationProvider'
    );
  }
  return context;
}

export function useRosaHcpWizardStepStatus(
  stepId: string,
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent
): RosaHcpWizardStepStatus {
  const lookup = useRosaHcpWizardStepStatusLookup(childStepIdsByParent);
  return lookup(stepId);
}

/** Returns a stable lookup for PatternFly `WizardStep` `status` (must be a direct Wizard child). */
export function useRosaHcpWizardStepStatusLookup(
  childStepIdsByParent?: RosaHcpWizardChildStepIdsByParent
): (stepId: string) => RosaHcpWizardStepStatus {
  const { validationAttemptedStepIds, fieldPathToStepId, navErrorSuppressedFieldPaths } =
    useRosaHcpWizardValidation();
  const reviewSections = useRosaHcpWizardReviewSections();
  const formContext = useFormContext<Partial<ROSAHCPCluster>>();
  const watchedFormValues = useWatch<Partial<ROSAHCPCluster>>();
  const allStepFieldPaths = useMemo(
    () => reviewSections.flatMap((section) => section.fieldPaths),
    [reviewSections]
  );
  const { errors, isSubmitted } = useFormState<Partial<ROSAHCPCluster>>({
    control: formContext.control,
    name:
      allStepFieldPaths.length > 0
        ? (allStepFieldPaths as FieldPath<Partial<ROSAHCPCluster>>[])
        : undefined,
  });

  const formValues = (watchedFormValues ?? formContext.getValues()) as Partial<ROSAHCPCluster>;

  const revealedValidationOptions = useMemo(
    () => ({
      validationAttemptedStepIds,
      fieldPathToStepId,
      isSubmitted,
      suppressedFieldPaths: navErrorSuppressedFieldPaths,
      formValues,
      isFieldActive: isWizardFieldActiveForStepValidation,
    }),
    [
      fieldPathToStepId,
      formValues,
      isSubmitted,
      navErrorSuppressedFieldPaths,
      validationAttemptedStepIds,
    ]
  );

  return useCallback(
    (stepId: string) =>
      getRosaHcpWizardStepStatus(
        stepId,
        validationAttemptedStepIds,
        childStepIdsByParent,
        stepOrChildHasFormValidationIssues(
          stepId,
          reviewSections,
          formContext.getFieldState,
          errors,
          revealedValidationOptions,
          childStepIdsByParent
        )
      ),
    [
      childStepIdsByParent,
      errors,
      formContext.getFieldState,
      revealedValidationOptions,
      reviewSections,
      validationAttemptedStepIds,
    ]
  );
}

/** Optional reporter for custom async field checks (e.g. cluster name uniqueness) outside RHF `isValidating`. */
export function useRosaHcpWizardFieldAsyncValidationReporter():
  | ((fieldPath: string, inProgress: boolean) => void)
  | undefined {
  return useContext(RosaHcpWizardValidationContext)?.setFieldAsyncValidationInProgress;
}

/** Suppresses left-nav step error indicators while a field hides its inline error (e.g. open select). */
export function useWizardFieldNavErrorSuppression(fieldPath: string, suppressed: boolean): void {
  const setFieldNavErrorSuppressed = useContext(
    RosaHcpWizardValidationContext
  )?.setFieldNavErrorSuppressed;

  useEffect(() => {
    if (!setFieldNavErrorSuppressed) {
      return undefined;
    }

    setFieldNavErrorSuppressed(fieldPath, suppressed);
    return () => {
      setFieldNavErrorSuppressed(fieldPath, false);
    };
  }, [fieldPath, setFieldNavErrorSuppressed, suppressed]);
}

/** True when Next or Skip to review failed validation on the step that owns this field. */
export function useWizStepValidationRevealed(fieldName: string): boolean {
  const context = useContext(RosaHcpWizardValidationContext);
  if (context === null) {
    return false;
  }
  const stepId = context.fieldPathToStepId[fieldName];
  return stepId !== undefined && context.validationAttemptedStepIds.has(stepId);
}
