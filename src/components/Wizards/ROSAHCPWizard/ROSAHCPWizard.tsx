import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';
import { RosaHcpWizardStringsInput } from './stringsProvider/rosaHcpWizardStrings';
import { RosaHCPWizardProps } from './types';

type ROSAHCPWrapperProps = RosaHCPWizardProps & {
  strings: RosaHcpWizardStringsInput;
};

export const RosaHCPWizard = (props: ROSAHCPWrapperProps) => (
  <RosaHcpWizardStringsProvider strings={props.strings}>
    <ROSAHCPWizardBody {...props} />
  </RosaHcpWizardStringsProvider>
);

export default RosaHCPWizard;
