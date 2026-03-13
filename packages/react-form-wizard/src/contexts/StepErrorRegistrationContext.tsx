/* Copyright Contributors to the Open Cluster Management project */
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSetStepHasValidationError } from './StepValidationProvider';

type RegisterError = (inputKey: string, hasError: boolean) => void;

const StepErrorRegistrationContext = createContext<{
  stepId: string;
  registerError: RegisterError;
} | null>(null);
StepErrorRegistrationContext.displayName = 'StepErrorRegistrationContext';

export const useStepErrorRegistration = () => useContext(StepErrorRegistrationContext);

export function StepErrorRegistrationProvider(props: { stepId: string; children: ReactNode }) {
  const { stepId, children } = props;
  const setStepHasValidationError = useSetStepHasValidationError();
  const [errorMap, setErrorMap] = useState<Record<string, boolean>>({});
  const lastReportedRef = useRef<boolean | null>(null);

  const registerError = useCallback((inputKey: string, hasError: boolean) => {
    setErrorMap((prev) => {
      const next = { ...prev };
      if (hasError) {
        next[inputKey] = true;
      } else {
        delete next[inputKey];
      }
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    const hasError = Object.values(errorMap).some(Boolean);
    if (lastReportedRef.current === hasError) return;
    lastReportedRef.current = hasError;
    setStepHasValidationError(stepId, hasError);
  }, [errorMap, stepId, setStepHasValidationError]);

  const value = useMemo(() => ({ stepId, registerError }), [stepId, registerError]);

  return (
    <StepErrorRegistrationContext.Provider value={value}>
      {children}
    </StepErrorRegistrationContext.Provider>
  );
}
