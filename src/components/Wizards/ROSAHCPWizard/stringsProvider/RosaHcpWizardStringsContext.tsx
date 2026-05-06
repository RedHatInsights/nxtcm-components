import React, { createContext, useContext, useMemo } from 'react';
import {
  buildRosaHcpWizardStringBundles,
  type RosaHcpWizardStrings,
  type RosaHcpWizardStringsInput,
  type RosaHcpWizardValidatorStrings,
} from './rosaHcpWizardStrings';

export type RosaHcpWizardStringsContextValue = {
  strings: RosaHcpWizardStrings;
  validators: RosaHcpWizardValidatorStrings;
};

const RosaWizardStringsContext = createContext<RosaHcpWizardStringsContextValue | null>(null);

export type RosaHcpWizardStringsProviderProps = {
  children: React.ReactNode;
  /** Partial overrides; omitted keys use built-in English defaults. */
  strings?: RosaHcpWizardStringsInput;
};

export function RosaHcpWizardStringsProvider({
  children,
  strings: stringsInput,
}: RosaHcpWizardStringsProviderProps) {
  const value = useMemo(
    () => buildRosaHcpWizardStringBundles(stringsInput),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers should memoize `strings` when passing inline objects
    [stringsInput]
  );

  return (
    <RosaWizardStringsContext.Provider value={value}>{children}</RosaWizardStringsContext.Provider>
  );
}

export function useRosaHcpWizardStrings(): RosaHcpWizardStrings {
  const ctx = useContext(RosaWizardStringsContext);
  if (!ctx) {
    throw new Error('useRosaWizardStrings must be used within RosaWizardStringsProvider');
  }
  return ctx.strings;
}

export function useRosaHcpWizardValidators(): RosaHcpWizardValidatorStrings {
  const ctx = useContext(RosaWizardStringsContext);
  if (!ctx) {
    throw new Error('useRosaHcpWizardValidators must be used within RosaHcpWizardStringsProvider');
  }
  return ctx.validators;
}
