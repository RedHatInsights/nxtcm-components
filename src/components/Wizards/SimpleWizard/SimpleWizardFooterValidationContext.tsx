import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type SimpleWizardFooterValidationContextValue = {
  footerBlockedStepIndex: number | null;
  setFooterBlockedStepIndex: (index: number | null) => void;
};

const SimpleWizardFooterValidationContext =
  createContext<SimpleWizardFooterValidationContextValue | null>(null);

export const SimpleWizardFooterValidationProvider = ({ children }: { children: ReactNode }) => {
  const [footerBlockedStepIndex, setFooterBlockedStepIndex] = useState<number | null>(null);
  const value = useMemo(
    () => ({ footerBlockedStepIndex, setFooterBlockedStepIndex }),
    [footerBlockedStepIndex]
  );
  return (
    <SimpleWizardFooterValidationContext.Provider value={value}>
      {children}
    </SimpleWizardFooterValidationContext.Provider>
  );
};

export const useSimpleWizardFooterValidation = (): SimpleWizardFooterValidationContextValue => {
  const ctx = useContext(SimpleWizardFooterValidationContext);
  if (!ctx) {
    throw new Error(
      'useSimpleWizardFooterValidation must be used within SimpleWizardFooterValidationProvider'
    );
  }
  return ctx;
};
