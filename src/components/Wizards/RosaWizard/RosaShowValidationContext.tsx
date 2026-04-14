import { createContext, useContext } from 'react';

/**
 * When true (e.g. Playwright CT), field errors display without blur/submit — parity with the former
 * react-form-wizard `ShowValidationContext`.
 */
export const RosaShowValidationContext = createContext(false);

export function useRosaShowValidation(): boolean {
  return useContext(RosaShowValidationContext);
}
