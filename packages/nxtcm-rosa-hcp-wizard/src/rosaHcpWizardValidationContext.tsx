import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRosaHcpWizardReviewSections } from './Steps/Review/ROSAHCPWizardReviewSections';

/** Applies nav unvisit for the earliest source step among the listed wizard step ids. */
export type RosaHcpNavUnvisitApplier = (sourceStepIds: readonly string[]) => void;

type RosaHcpWizardValidationContextValue = {
  fieldPathToStepId: Readonly<Record<string, string>>;
  validationAttemptedStepIds: ReadonlySet<string>;
  asyncValidatingStepIds: ReadonlySet<string>;
  validationAlertStepId: string | null;
  markValidationAttempted: (stepId: string) => void;
  clearValidationAttempted: (stepId: string) => void;
  setStepAsyncValidating: (stepId: string, isValidating: boolean) => void;
  setValidationAlertStepId: (
    stepId: string | null | ((prev: string | null) => string | null)
  ) => void;
  /** Footer registers the PatternFly wizard `setStep` unvisit handler (Wizard context required). */
  registerNavUnvisitApplier: (applier: RosaHcpNavUnvisitApplier | null) => void;
  /** Unvisit later nav steps after the earliest listed source step id. */
  requestNavUnvisitAfterSteps: (sourceStepIds: readonly string[]) => void;
};

const RosaHcpWizardValidationContext = createContext<RosaHcpWizardValidationContextValue | null>(
  null
);

/** Tracks steps where Next or Skip to review failed so field errors can persist across nav. */
export function RosaHcpWizardValidationProvider({ children }: { children: ReactNode }) {
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
  const [asyncValidatingStepIds, setAsyncValidatingStepIds] = useState(() => new Set<string>());
  const [validationAlertStepId, setValidationAlertStepIdState] = useState<string | null>(null);
  const navUnvisitApplierRef = useRef<RosaHcpNavUnvisitApplier | null>(null);
  const setValidationAlertStepId = useCallback(
    (stepIdOrFn: string | null | ((prev: string | null) => string | null)) => {
      setValidationAlertStepIdState((prev) =>
        typeof stepIdOrFn === 'function' ? stepIdOrFn(prev) : stepIdOrFn
      );
    },
    []
  );

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

  const setStepAsyncValidating = useCallback((stepId: string, isValidating: boolean) => {
    setAsyncValidatingStepIds((prev) => {
      if (isValidating) {
        if (prev.has(stepId)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(stepId);
        return next;
      }

      if (!prev.has(stepId)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(stepId);
      return next;
    });
  }, []);

  const registerNavUnvisitApplier = useCallback((applier: RosaHcpNavUnvisitApplier | null) => {
    navUnvisitApplierRef.current = applier;
  }, []);

  const requestNavUnvisitAfterSteps = useCallback((sourceStepIds: readonly string[]) => {
    if (sourceStepIds.length === 0) {
      return;
    }
    navUnvisitApplierRef.current?.(sourceStepIds);
  }, []);

  const value = useMemo(
    () => ({
      fieldPathToStepId,
      validationAttemptedStepIds,
      asyncValidatingStepIds,
      validationAlertStepId,
      markValidationAttempted,
      clearValidationAttempted,
      setStepAsyncValidating,
      setValidationAlertStepId,
      registerNavUnvisitApplier,
      requestNavUnvisitAfterSteps,
    }),
    [
      asyncValidatingStepIds,
      clearValidationAttempted,
      fieldPathToStepId,
      markValidationAttempted,
      registerNavUnvisitApplier,
      requestNavUnvisitAfterSteps,
      setStepAsyncValidating,
      setValidationAlertStepId,
      validationAlertStepId,
      validationAttemptedStepIds,
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

/**
 * Resolves the wizard step that owns a form field path.
 * Nested RHF paths (e.g. `machine_pools_subnets.0.machine_pool_subnet`) fall back to the nearest
 * registered ancestor path (e.g. `machine_pools_subnets`).
 */
export function resolveWizardFieldPathStepId(
  fieldName: string,
  fieldPathToStepId: Readonly<Record<string, string>>
): string | undefined {
  const parts = fieldName.split('.');
  while (parts.length > 0) {
    const candidate = parts.join('.');
    const stepId = fieldPathToStepId[candidate];
    if (stepId !== undefined) {
      return stepId;
    }
    parts.pop();
  }
  return undefined;
}

/** True when Next or Skip to review failed validation on the step that owns this field. */
export function useWizStepValidationRevealed(fieldName: string): boolean {
  const context = useContext(RosaHcpWizardValidationContext);
  if (context === null) {
    return false;
  }
  const stepId = resolveWizardFieldPathStepId(fieldName, context.fieldPathToStepId);
  return stepId !== undefined && context.validationAttemptedStepIds.has(stepId);
}
