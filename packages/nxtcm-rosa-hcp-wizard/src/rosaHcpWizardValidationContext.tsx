import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { useRosaHcpWizardReviewSections } from './Steps/Review/ROSAHCPWizardReviewSections';

type RosaHcpWizardValidationContextValue = {
  fieldPathToStepId: Readonly<Record<string, string>>;
  validationAttemptedStepIds: ReadonlySet<string>;
  validationAlertStepId: string | null;
  markValidationAttempted: (stepId: string) => void;
  clearValidationAttempted: (stepId: string) => void;
  setValidationAlertStepId: (
    stepId: string | null | ((prev: string | null) => string | null)
  ) => void;
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
  const [validationAlertStepId, setValidationAlertStepIdState] = useState<string | null>(null);
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

  const value = useMemo(
    () => ({
      fieldPathToStepId,
      validationAttemptedStepIds,
      validationAlertStepId,
      markValidationAttempted,
      clearValidationAttempted,
      setValidationAlertStepId,
    }),
    [
      clearValidationAttempted,
      fieldPathToStepId,
      markValidationAttempted,
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

/** True when Next or Skip to review failed validation on the step that owns this field. */
export function useWizStepValidationRevealed(fieldName: string): boolean {
  const context = useContext(RosaHcpWizardValidationContext);
  if (context === null) {
    return false;
  }
  const stepId = context.fieldPathToStepId[fieldName];
  return stepId !== undefined && context.validationAttemptedStepIds.has(stepId);
}
