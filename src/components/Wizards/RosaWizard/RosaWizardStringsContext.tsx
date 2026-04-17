import React, { createContext, useContext, useMemo } from 'react';
import {
  buildRosaWizardStringBundles,
  type RosaWizardStrings,
  type RosaWizardStringsInput,
  type RosaWizardValidatorStrings,
} from './rosaWizardStrings';

/** Value held by `RosaWizardStringsContext`: merged UI strings plus validator message bundles. */
export type RosaWizardStringsContextValue = {
  strings: RosaWizardStrings;
  validators: RosaWizardValidatorStrings;
};

const RosaWizardStringsContext = createContext<RosaWizardStringsContextValue | null>(null);

/** Props for `RosaWizardStringsProvider`: optional string overrides merged with English defaults. */
export type RosaWizardStringsProviderProps = {
  children: React.ReactNode;
  /** Partial overrides; omitted keys use built-in English defaults. */
  strings?: RosaWizardStringsInput;
};

/**
 * Supplies merged Rosa wizard UI and validator strings to descendants via React context.
 */
export function RosaWizardStringsProvider({
  children,
  strings: stringsInput,
}: RosaWizardStringsProviderProps) {
  const value = useMemo(
    () => buildRosaWizardStringBundles(stringsInput),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers should memoize `strings` when passing inline objects
    [stringsInput]
  );

  return (
    <RosaWizardStringsContext.Provider value={value}>{children}</RosaWizardStringsContext.Provider>
  );
}

/** Returns wizard UI string bundles; throws if used outside `RosaWizardStringsProvider`. */
export function useRosaWizardStrings(): RosaWizardStrings {
  const ctx = useContext(RosaWizardStringsContext);
  if (!ctx) {
    throw new Error('useRosaWizardStrings must be used within RosaWizardStringsProvider');
  }
  return ctx.strings;
}

/** Returns validator-facing string bundles; throws if used outside `RosaWizardStringsProvider`. */
export function useRosaWizardValidators(): RosaWizardValidatorStrings {
  const ctx = useContext(RosaWizardStringsContext);
  if (!ctx) {
    throw new Error('useRosaWizardValidators must be used within RosaWizardStringsProvider');
  }
  return ctx.validators;
}
