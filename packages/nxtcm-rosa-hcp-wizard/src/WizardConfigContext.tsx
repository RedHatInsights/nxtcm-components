import React, { createContext, useContext } from 'react';
import type { WizardConfig } from './types';

const WizardConfigContext = createContext<WizardConfig>({});
WizardConfigContext.displayName = 'WizardConfigContext';

interface WizardConfigProviderProps {
  config: WizardConfig;
  children: React.ReactNode;
}

export const WizardConfigProvider = ({ config, children }: WizardConfigProviderProps) => (
  <WizardConfigContext.Provider value={config}>{children}</WizardConfigContext.Provider>
);

export const useWizardConfig = (): WizardConfig => useContext(WizardConfigContext);

/** Returns true when the given step ID is present in `config.hiddenSteps`. */
export const useIsStepHidden = (stepId: string): boolean => {
  const { hiddenSteps } = useWizardConfig();
  return hiddenSteps?.some((step) => step === stepId) ?? false;
};
