import { RosaHcpWizardFormProvider } from './RosaHcpWizardFormProvider';
import { RosaHcpWizardStringsInput } from './stringsProvider/rosaHcpWizardStrings';
import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { RosaHCPWizardProps } from './types';

export type ROSAHCPWrapperProps = RosaHCPWizardProps & {
  /**
   * Partial UI copy and validator messages. Omitted keys use the built-in English defaults.
   * Key catalog: `docs/localizable-strings.md` in this package.
   */
  strings?: RosaHcpWizardStringsInput;
};

export const RosaHCPWizard = ({ strings, ...wizardProps }: ROSAHCPWrapperProps) => (
  <RosaHcpWizardStringsProvider strings={strings}>
    <RosaHcpWizardFormProvider {...wizardProps} />
  </RosaHcpWizardStringsProvider>
);

export default RosaHCPWizard;
