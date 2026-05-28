import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { RosaHcpWizardFormProvider } from './RosaHcpWizardFormProvider';
import { RosaHcpWizardStringsInput } from './stringsProvider/rosaHcpWizardStrings';
import { RosaHCPWizardProps } from './types';

type ROSAHCPWrapperProps = RosaHCPWizardProps & {
  strings?: RosaHcpWizardStringsInput;
};

export const RosaHCPWizard = ({ strings, ...wizardProps }: ROSAHCPWrapperProps) => (
  <RosaHcpWizardStringsProvider strings={strings}>
    <RosaHcpWizardFormProvider {...wizardProps} />
  </RosaHcpWizardStringsProvider>
);

export default RosaHCPWizard;
