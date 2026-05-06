import { RosaHcpWizardStringsProvider } from './stringsProvider/RosaHcpWizardStringsContext';
import { ROSAHCPWizardBody } from './ROSAHCPWizardBody';

export const RosaHCPWizard = (props: any) => (
  <RosaHcpWizardStringsProvider strings={props.strings}>
    <ROSAHCPWizardBody {...props} />
  </RosaHcpWizardStringsProvider>
);

export default RosaHCPWizard;
