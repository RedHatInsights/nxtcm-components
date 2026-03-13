/* Copyright Contributors to the Open Cluster Management project */
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

const StepSetHasValidationErrorContext = createContext<(id: string, hasError: boolean) => void>(
  () => null
);
StepSetHasValidationErrorContext.displayName = 'StepSetHasValidationErrorContext';
export const useSetStepHasValidationError = () => useContext(StepSetHasValidationErrorContext);

export const StepHasValidationErrorContext = createContext<Record<string, boolean>>({});
StepHasValidationErrorContext.displayName = 'StepHasValidationErrorContext';
export const useStepHasValidationError = () => useContext(StepHasValidationErrorContext);

export function StepValidationProvider(props: { children: ReactNode }) {
  const [hasStepValidationErrors, setHasStepValidationErrorsState] = useState<
    Record<string, boolean>
  >({});

  const setStepHasValidationError = useCallback((id: string, hasError: boolean) => {
    setHasStepValidationErrorsState((state) => {
      if (hasError && state[id] !== true) {
        state = { ...state };
        state[id] = true;
      } else if (!hasError && state[id] !== undefined) {
        state = { ...state };
        delete state[id];
      }
      return state;
    });
  }, []);

  return (
    <StepSetHasValidationErrorContext.Provider value={setStepHasValidationError}>
      <StepHasValidationErrorContext.Provider value={hasStepValidationErrors}>
        {props.children}
      </StepHasValidationErrorContext.Provider>
    </StepSetHasValidationErrorContext.Provider>
  );
}
