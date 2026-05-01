import { createContext } from 'react';

export type RadioGroupContextState = {
  value?: unknown;
  setValue?: (value: unknown) => void;
  readonly?: boolean;
  disabled?: boolean;
  radioGroup?: string;
};

export const RadioGroupContext = createContext<RadioGroupContextState>({});
RadioGroupContext.displayName = 'RadioGroupContext';
