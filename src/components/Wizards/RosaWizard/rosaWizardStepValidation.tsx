import { useWizardContext } from '@patternfly/react-core';
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type StepValidationState = {
  /** PatternFly wizard sub-step / step id currently active */
  activeStepId: string;
  /** User clicked Next (or Skip to review) at least once while on that step id */
  shownByStepId: Record<string, boolean>;
};

const defaultState: StepValidationState = { activeStepId: '', shownByStepId: {} };

/** `null` = outside {@link RosaWizardActiveStepIdPublisher} (e.g. isolated FormProvider tests). */
const RosaWizardActiveStepIdContext = createContext<string | null>(null);

/** Wrap PatternFly `Wizard` step content so field hooks read the live active step id on render. */
export function RosaWizardActiveStepIdPublisher({ children }: { children: ReactNode }) {
  const { activeStep } = useWizardContext();
  const stepId = activeStep?.id?.toString() ?? '';
  return (
    <RosaWizardActiveStepIdContext.Provider value={stepId}>{children}</RosaWizardActiveStepIdContext.Provider>
  );
}

const RosaWizardStepValidationContext = createContext<{
  state: StepValidationState;
  setState: Dispatch<SetStateAction<StepValidationState>>;
} | null>(null);

export function RosaWizardStepValidationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StepValidationState>(defaultState);
  const value = useMemo(() => ({ state, setState }), [state]);
  return (
    <RosaWizardStepValidationContext.Provider value={value}>{children}</RosaWizardStepValidationContext.Provider>
  );
}

/**
 * After the user tries to leave the current wizard step (Next / Skip to review), `trigger()` may
 * fail without marking fields touched — show field-level errors when that happens.
 */
export function useRosaShowFieldErrorsAfterStepNav(): boolean {
  const ctx = useContext(RosaWizardStepValidationContext);
  const patternFlyStepId = useContext(RosaWizardActiveStepIdContext);
  if (!ctx) return false;
  const { activeStepId: syncedStepId, shownByStepId } = ctx.state;
  const stepId = patternFlyStepId !== null ? patternFlyStepId : syncedStepId;
  return Boolean(stepId && shownByStepId[stepId]);
}

/** Keep validation context `activeStepId` in sync for {@link useRosaWizardStepValidationState} consumers. */
export function useRosaWizardStepValidationSyncActiveStep(activeStepId: string): void {
  const ctx = useContext(RosaWizardStepValidationContext);
  const setState = ctx?.setState;
  useLayoutEffect(() => {
    if (!setState) return;
    setState((s: StepValidationState) =>
      s.activeStepId === activeStepId ? s : { ...s, activeStepId }
    );
  }, [activeStepId, setState]);
}

export function useRosaWizardStepValidationMarkAttempt(): (stepId: string) => void {
  const ctx = useContext(RosaWizardStepValidationContext);
  return useCallback(
    (stepId: string) => {
      if (!ctx) return;
      ctx.setState((s: StepValidationState) => ({
        ...s,
        activeStepId: stepId,
        shownByStepId: { ...s.shownByStepId, [stepId]: true },
      }));
    },
    [ctx]
  );
}

export function useRosaWizardStepValidationState(): StepValidationState | null {
  return useContext(RosaWizardStepValidationContext)?.state ?? null;
}
