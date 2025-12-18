/* Copyright Contributors to the Open Cluster Management project */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { useItem } from './ItemContext';

const StepSetHasTouchedValidationErrorContext = createContext<
  (id: string, hasError: boolean) => void
>(() => null);
StepSetHasTouchedValidationErrorContext.displayName = 'StepSetHasTouchedValidationErrorContext';
export const useSetStepHasTouchedValidationError = () =>
  useContext(StepSetHasTouchedValidationErrorContext);

export const StepHasTouchedValidationErrorContext = createContext<Record<string, boolean>>({});
StepHasTouchedValidationErrorContext.displayName = 'StepHasTouchedValidationErrorContext';
export const useStepHasTouchedValidationError = () =>
  useContext(StepHasTouchedValidationErrorContext);

export function StepTouchedValidationProvider(props: { children: ReactNode }) {
  const item = useItem();
  const [hasTouchedErrors, setHasTouchedErrorsState] = useState<Record<string, boolean>>({});

  const [setHasTouchedError, setHasTouchedErrorFunction] = useState<
    (id: string, hasError: boolean) => void
  >(() => () => null);

  const resetTouchedErrors = useCallback(() => {
    setHasTouchedErrorsState({});
    setHasTouchedErrorFunction(() => (id: string, hasError: boolean) => {
      setHasTouchedErrorsState((state) => {
        if (hasError && !state[id]) {
          return { ...state, [id]: true };
        } else if (!hasError && state[id]) {
          const newState = { ...state };
          delete newState[id];
          return newState;
        }
        return state;
      });
    });
  }, []);

  useLayoutEffect(() => {
    resetTouchedErrors();
  }, [item, resetTouchedErrors]);

  return (
    <StepSetHasTouchedValidationErrorContext.Provider value={setHasTouchedError}>
      <StepHasTouchedValidationErrorContext.Provider value={hasTouchedErrors}>
        {props.children}
      </StepHasTouchedValidationErrorContext.Provider>
    </StepSetHasTouchedValidationErrorContext.Provider>
  );
}
